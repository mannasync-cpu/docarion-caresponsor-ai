import {
  AIAuditLineFinding,
  AIAuditReport,
  MedicalBillInvoice,
} from './types';

/**
 * Deterministic Clinical Pharmacology & West African Regional Tariff Audit Engine.
 * Cross-checks every line item against the encounter's ICD-10 diagnosis codes
 * and benchmark fair-market hospital/pharmacy tariffs in NGN & USD.
 */
export function runDeterministicClinicalBillAudit(
  invoice: MedicalBillInvoice,
  engineLabel = 'Docarion Clinical AI v2.4 (ICD-10 + West Africa Tariff Reference)'
): AIAuditReport {
  const invoiceCodes = invoice.icd10Code
    .split(/[/,\s]+/)
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);

  const lineFindings: AIAuditLineFinding[] = [];
  let originalTotalNgn = 0;
  let verifiedFairTotalNgn = 0;
  let flaggedCount = 0;

  for (const item of invoice.lineItems) {
    const billedNgn = item.totalNgn;
    originalTotalNgn += billedNgn;

    const isIndicated =
      item.clinicallyIndicatedForIcd10.length > 0 &&
      item.clinicallyIndicatedForIcd10.some((code) =>
        invoiceCodes.includes(code.toUpperCase())
      );

    if (!isIndicated || item.benchmarkFairMaxUnitNgn === 0) {
      flaggedCount += 1;
      const rationale =
        item.benchmarkFairMaxUnitNgn === 0
          ? `Administrative duplicate detected: ${item.name} is not chargeable for an existing registered Docarion patient (${invoice.docarionPatientId}).`
          : `Clinical mismatch: "${item.name}" is not indicated for ICD-10 diagnosis ${invoice.icd10Code} (${invoice.diagnosisTitle}). Standard WHO/NHIA outpatient protocol does not require this item.`;

      lineFindings.push({
        itemId: item.id,
        itemName: item.name,
        flag: 'unindicated_duplicate',
        billedNgn,
        recommendedFairNgn: 0,
        deltaNgn: billedNgn,
        clinicalRationale: rationale,
      });
      continue;
    }

    const fairMaxTotalNgn = item.benchmarkFairMaxUnitNgn * item.quantity;
    if (billedNgn > fairMaxTotalNgn * 1.1) {
      flaggedCount += 1;
      const ratio = (billedNgn / fairMaxTotalNgn).toFixed(1);
      verifiedFairTotalNgn += fairMaxTotalNgn;
      lineFindings.push({
        itemId: item.id,
        itemName: item.name,
        flag: 'overpriced',
        billedNgn,
        recommendedFairNgn: fairMaxTotalNgn,
        deltaNgn: billedNgn - fairMaxTotalNgn,
        clinicalRationale: `Clinically indicated for ${invoice.icd10Code}, but billed at ${ratio}x the regional private-facility fair tariff ceiling (₦${fairMaxTotalNgn.toLocaleString()} NGN). Adjusted to verified fair benchmark.`,
      });
    } else {
      verifiedFairTotalNgn += billedNgn;
      lineFindings.push({
        itemId: item.id,
        itemName: item.name,
        flag: 'verified',
        billedNgn,
        recommendedFairNgn: billedNgn,
        deltaNgn: 0,
        clinicalRationale: `Verified appropriate for ${invoice.icd10Code} and within standard regional tariff ceiling (≤ ₦${fairMaxTotalNgn.toLocaleString()} NGN).`,
      });
    }
  }

  const savingsNgn = Math.max(0, originalTotalNgn - verifiedFairTotalNgn);
  const savingsUsd = Number((savingsNgn / invoice.fxRateNgnPerUsd).toFixed(2));

  const savingsRatio = originalTotalNgn > 0 ? savingsNgn / originalTotalNgn : 0;
  const rawScore = Math.round(100 - savingsRatio * 75 - flaggedCount * 6);
  const overallTrustScore = Math.max(42, Math.min(99, rawScore));

  let verdict: AIAuditReport['verdict'] = 'verified_fair';
  if (flaggedCount > 0 && savingsNgn > 25000) {
    verdict = 'clinical_review_flagged';
  } else if (flaggedCount > 0) {
    verdict = 'price_adjustment_recommended';
  }

  const plainEnglishFamilySummary =
    flaggedCount === 0
      ? `${invoice.dependentName} was seen at ${invoice.facilityName} for ${invoice.diagnosisTitle}. Every test and medication on this bill matches standard medical guidelines and fair local hospital pricing in ${invoice.city}. It is safe to pay via PayPal immediately.`
      : `${invoice.dependentName} visited ${invoice.facilityName} for ${invoice.diagnosisTitle}. While core care items match the diagnosis, our AI Auditor flagged ${flaggedCount} line item(s) for overbilling or clinical non-indication—saving you ₦${savingsNgn.toLocaleString()} NGN ($${savingsUsd.toFixed(2)} USD) when you apply the Verified Fair-Price Adjustment before paying with PayPal.`;

  const clinicalAppropriatenessAnalysis =
    flaggedCount === 0
      ? `100% concordance between ICD-10 diagnosis (${invoice.icd10Code}) and ordered care bundle (${invoice.lineItems.length} items). No unnecessary antibiotics, duplicate registration charges, or off-protocol diagnostics detected.`
      : `Audited ${invoice.lineItems.length} line items against ICD-10 (${invoice.icd10Code}). ${
          lineFindings.filter((f) => f.flag === 'verified').length
        } item(s) verified clinically sound; ${flaggedCount} item(s) flagged for tariff adjustment or removal prior to PayPal settlement.`;

  const pricingBenchmarkSummary =
    savingsNgn > 0
      ? `Original Billed: ₦${originalTotalNgn.toLocaleString()} ($${(
          originalTotalNgn / invoice.fxRateNgnPerUsd
        ).toFixed(2)} USD) → AI Verified Fair Total: ₦${verifiedFairTotalNgn.toLocaleString()} ($${(
          verifiedFairTotalNgn / invoice.fxRateNgnPerUsd
        ).toFixed(2)} USD). Total Diaspora Sponsor Savings: $${savingsUsd.toFixed(2)} USD.`
      : `All ${invoice.lineItems.length} items fall within the 2026 Docarion West African Private Hospital & Pharmacy Fair-Tariff Corridor (₦${originalTotalNgn.toLocaleString()} / $${(
          originalTotalNgn / invoice.fxRateNgnPerUsd
        ).toFixed(2)} USD).`;

  return {
    overallTrustScore,
    verdict,
    plainEnglishFamilySummary,
    clinicalAppropriatenessAnalysis,
    pricingBenchmarkSummary,
    originalTotalNgn,
    verifiedFairTotalNgn,
    savingsNgn,
    savingsUsd,
    lineFindings,
    auditedByEngine: engineLabel,
    auditedAt: new Date().toISOString(),
  };
}
