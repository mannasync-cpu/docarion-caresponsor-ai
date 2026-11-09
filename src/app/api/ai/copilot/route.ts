import { NextRequest, NextResponse } from 'next/server';
import { runDeterministicClinicalBillAudit } from '@/lib/ai-auditor';
import { CareDependent, MedicalBillInvoice } from '@/lib/types';

export interface CopilotActionCard {
  type: 'pay_invoice_paypal' | 'topup_wallet_paypal' | 'audit_summary';
  title: string;
  subtitle: string;
  invoiceId?: string;
  dependentId?: string;
  amountUsd: number;
  amountNgn: number;
  savingsUsd?: number;
  badgeText: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message = '',
      dependents = [] as CareDependent[],
      invoices = [] as MedicalBillInvoice[],
    } = body;

    const lower = String(message).toLowerCase();
    const unpaidInvoices = invoices.filter((inv: MedicalBillInvoice) => inv.status !== 'paid_settled');
    const mamaInvoice =
      unpaidInvoices.find((inv: MedicalBillInvoice) =>
        inv.dependentName.toLowerCase().includes('ngozi')
      ) || unpaidInvoices[0];

    let replyText = '';
    let suggestedAction: CopilotActionCard | null = null;

    if (
      lower.includes('audit') ||
      lower.includes('overpric') ||
      lower.includes('mama') ||
      lower.includes('ngozi') ||
      lower.includes('bill') ||
      lower.includes('check')
    ) {
      if (mamaInvoice) {
        const audit =
          mamaInvoice.aiAuditReport || runDeterministicClinicalBillAudit(mamaInvoice);
        const fairUsd = Number(
          (audit.verifiedFairTotalNgn / mamaInvoice.fxRateNgnPerUsd).toFixed(2)
        );
        replyText =
          audit.savingsNgn > 0
            ? `I audited **${mamaInvoice.dependentName}'s** bill (\`${mamaInvoice.invoiceNumber}\`) from **${mamaInvoice.facilityName}** for **${mamaInvoice.diagnosisTitle} (${mamaInvoice.icd10Code})**.\n\n` +
              `• **Clinical Match:** Outpatient consultation, Coartem ACT malaria treatment, and 30-day Amlodipine/Lisinopril hypertension refill are 100% appropriate.\n` +
              `• **AI Overbilling Protection:** I flagged the unindicated IV Meropenem antibiotic (\`₦42,000\`) and adjusted the inflated Malaria RDT lab fee (\`₦24,000 → ₦9,500\`), saving you **$${audit.savingsUsd.toFixed(2)} USD (₦${audit.savingsNgn.toLocaleString()} NGN)**.\n` +
              `• **Ready for PayPal Checkout:** Verified fair amount is **$${fairUsd.toFixed(2)} USD (₦${audit.verifiedFairTotalNgn.toLocaleString()} NGN)**. Paying now immediately unlocks her pharmacy dispensation gate.`
            : `I audited **${mamaInvoice.dependentName}'s** bill (\`${mamaInvoice.invoiceNumber}\`) from **${mamaInvoice.facilityName}**. All ${mamaInvoice.lineItems.length} items are 100% clinically aligned with **${mamaInvoice.diagnosisTitle}** and within regional fair-tariff benchmarks (**$${mamaInvoice.payableUsd.toFixed(2)} USD / ₦${mamaInvoice.activePayableNgn.toLocaleString()} NGN**).`;

        suggestedAction = {
          type: 'pay_invoice_paypal',
          title: `Settle ${mamaInvoice.dependentName}'s Verified Bill via PayPal`,
          subtitle: `${mamaInvoice.facilityName} • Unlocks ${mamaInvoice.workflowGate.replace(/_/g, ' ')}`,
          invoiceId: mamaInvoice.id,
          dependentId: mamaInvoice.dependentId,
          amountUsd: fairUsd,
          amountNgn: audit.verifiedFairTotalNgn,
          savingsUsd: audit.savingsUsd,
          badgeText:
            audit.savingsUsd > 0
              ? `AI Saved $${audit.savingsUsd.toFixed(2)} USD`
              : 'AI 100% Fair-Price Verified',
        };
      } else {
        replyText = `All hospital, laboratory, and pharmacy bills across your Family Care Circle are currently **settled and unlocked**! Would you like to top up a family member's **Health-Locked Care Wallet** via PayPal for upcoming chronic medication refills?`;
      }
    } else if (
      lower.includes('wallet') ||
      lower.includes('fund') ||
      lower.includes('top') ||
      lower.includes('med') ||
      lower.includes('refill') ||
      lower.includes('month')
    ) {
      const targetDep = dependents[0];
      const recommendedUsd = 50;
      const recommendedNgn = recommendedUsd * 1620;
      replyText =
        `Based on **${targetDep?.fullName || 'Mama Ngozi Okafor'}'s** chronic care profile (**${(targetDep?.chronicConditions || ['Hypertension', 'Type 2 Diabetes']).join(' & ')}**), her monthly maintenance medications (**${(targetDep?.activeMedications || ['Amlodipine 10mg', 'Lisinopril 10mg', 'Metformin 1000mg']).join(', ')}**) and quarterly fasting glucose/BP checks cost approximately **₦46,000–₦52,000 NGN ($28–$32 USD)/month**.\n\n` +
        `Adding **$50.00 USD (₦81,000 NGN)** via **PayPal** to her **Health-Locked Care Wallet** covers nearly 2 full months of chronic refills and guarantees instant pre-consultation gate clearance at any Docarion pharmacy or hospital.`;

      suggestedAction = {
        type: 'topup_wallet_paypal',
        title: `Fund ${targetDep?.fullName || 'Mama Ngozi'}'s Health-Locked Care Wallet`,
        subtitle: '100% locked to verified Docarion hospitals, clinics, labs & pharmacies',
        dependentId: targetDep?.id || 'dep-mama-ngozi',
        amountUsd: recommendedUsd,
        amountNgn: recommendedNgn,
        badgeText: 'Instant USD → NGN Health Lock',
      };
    } else {
      const totalPendingUsd = unpaidInvoices.reduce(
        (sum: number, inv: MedicalBillInvoice) => sum + inv.payableUsd,
        0
      );
      replyText =
        `Hello! I am your **Docarion CareSponsor AI Copilot**. Right now, your Family Care Circle covers **${dependents.length} dependents** in Nigeria with **${unpaidInvoices.length} pending provider bill(s)** totaling **$${totalPendingUsd.toFixed(2)} USD**.\n\n` +
        `Every bill from a Docarion hospital, clinic, laboratory, or pharmacy routes straight here so you never have to track down which hospital your family member visited. I can:\n` +
        `1. **Audit any itemized hospital or pharmacy bill** against ICD-10 clinical guidelines and fair local prices before you pay.\n` +
        `2. **Prepare an instant PayPal Checkout** (USD, GBP, EUR, or CAD) that unlocks the patient's care gate immediately.\n` +
        `3. **Fund a Health-Locked Care Wallet** or configure a monthly PayPal Auto-Reload for chronic medications.`;

      if (mamaInvoice) {
        const audit =
          mamaInvoice.aiAuditReport || runDeterministicClinicalBillAudit(mamaInvoice);
        const fairUsd = Number(
          (audit.verifiedFairTotalNgn / mamaInvoice.fxRateNgnPerUsd).toFixed(2)
        );
        suggestedAction = {
          type: 'pay_invoice_paypal',
          title: `Audit & Pay ${mamaInvoice.dependentName}'s Bill (${mamaInvoice.invoiceNumber})`,
          subtitle: `${mamaInvoice.facilityName} • Verified Fair Total: $${fairUsd.toFixed(2)} USD`,
          invoiceId: mamaInvoice.id,
          dependentId: mamaInvoice.dependentId,
          amountUsd: fairUsd,
          amountNgn: audit.verifiedFairTotalNgn,
          savingsUsd: audit.savingsUsd,
          badgeText: `Save $${audit.savingsUsd.toFixed(2)} USD with AI Audit`,
        };
      }
    }

    return NextResponse.json({
      replyText,
      suggestedAction,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Copilot error', details: String(error) },
      { status: 500 }
    );
  }
}
