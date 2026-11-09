import { describe, it, expect } from 'vitest';
import { runDeterministicClinicalBillAudit } from '../lib/ai-auditor';
import { INITIAL_INVOICES } from '../lib/initial-data';

describe('Docarion CareSponsor AI — Clinical & Fair-Price Bill Auditor', () => {
  it('flags overpriced malaria lab RDT and unindicated IV Meropenem on Mama Ngozi invoice (DOC-INV-2026-9041)', () => {
    const mamaInvoice = INITIAL_INVOICES[0];
    const report = runDeterministicClinicalBillAudit(mamaInvoice);

    expect(report.originalTotalNgn).toBe(104000);
    // Fair total: Consultation (15,000) + Malaria RDT capped at fair ceiling (9,500) + Coartem ACT (8,500) + HTN meds (14,500) + Meropenem (0) = 47,500 NGN
    expect(report.verifiedFairTotalNgn).toBe(47500);
    expect(report.savingsNgn).toBe(56500);
    expect(report.savingsUsd).toBe(34.88);
    expect(report.verdict).toBe('clinical_review_flagged');

    const meropenemFinding = report.lineFindings.find((f) => f.itemId === 'li-5');
    expect(meropenemFinding?.flag).toBe('unindicated_duplicate');
    expect(meropenemFinding?.recommendedFairNgn).toBe(0);

    const rdtFinding = report.lineFindings.find((f) => f.itemId === 'li-2');
    expect(rdtFinding?.flag).toBe('overpriced');
    expect(rdtFinding?.recommendedFairNgn).toBe(9500);
  });

  it('verifies 100% compliant Cardiology invoice (DOC-INV-2026-9048) with zero false positives', () => {
    const papaInvoice = INITIAL_INVOICES[1];
    const report = runDeterministicClinicalBillAudit(papaInvoice);

    expect(report.originalTotalNgn).toBe(58000);
    expect(report.verifiedFairTotalNgn).toBe(58000);
    expect(report.savingsNgn).toBe(0);
    expect(report.verdict).toBe('verified_fair');
    expect(report.overallTrustScore).toBeGreaterThanOrEqual(95);
  });

  it('flags duplicate patient registration card fee on antenatal invoice (DOC-INV-2026-9052)', () => {
    const amaraInvoice = INITIAL_INVOICES[2];
    const report = runDeterministicClinicalBillAudit(amaraInvoice);

    expect(report.originalTotalNgn).toBe(65000);
    expect(report.verifiedFairTotalNgn).toBe(52000);
    expect(report.savingsNgn).toBe(13000);
  });
});
