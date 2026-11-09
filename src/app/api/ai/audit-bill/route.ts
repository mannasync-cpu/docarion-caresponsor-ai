import { NextRequest, NextResponse } from 'next/server';
import { runDeterministicClinicalBillAudit } from '@/lib/ai-auditor';
import { MedicalBillInvoice } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const invoice = body.invoice as MedicalBillInvoice;

    if (!invoice || !Array.isArray(invoice.lineItems)) {
      return NextResponse.json(
        { error: 'Valid MedicalBillInvoice with lineItems is required' },
        { status: 400 }
      );
    }

    const baseAudit = runDeterministicClinicalBillAudit(invoice);

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

    if (geminiApiKey) {
      try {
        const prompt = `You are Docarion CareSponsor AI, an expert clinical pharmacologist and African hospital tariff auditor assisting a family member in the diaspora who is paying for their relative's medical bill via PayPal.
Patient: ${invoice.dependentName}
Facility: ${invoice.facilityName} (${invoice.city})
ICD-10 Diagnosis: ${invoice.icd10Code} — ${invoice.diagnosisTitle}
Clinical Notes: ${invoice.clinicalNotes}
Original Bill: NGN ${baseAudit.originalTotalNgn.toLocaleString()}
Verified Fair Bill: NGN ${baseAudit.verifiedFairTotalNgn.toLocaleString()} (Savings: USD $${baseAudit.savingsUsd.toFixed(2)})
Line Findings: ${JSON.stringify(baseAudit.lineFindings)}

Write a concise, reassuring 2-sentence plain-English explanation for the diaspora family sponsor explaining what the patient is being treated for, whether the medications/tests match the diagnosis, and why any flagged items were adjusted before PayPal checkout.`;

        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.2, maxOutputTokens: 220 },
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const generatedText =
            geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (generatedText) {
            baseAudit.plainEnglishFamilySummary = generatedText;
            baseAudit.auditedByEngine = `Google Gemini (${geminiModel}) + Docarion ICD-10 Tariff Engine`;
          }
        }
      } catch {
        // Keep deterministic clinical audit summary on network error
      }
    }

    return NextResponse.json({
      auditReport: baseAudit,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to audit medical bill', details: String(error) },
      { status: 500 }
    );
  }
}
