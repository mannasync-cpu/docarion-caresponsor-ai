export type DiasporaCurrency = 'USD' | 'GBP' | 'EUR' | 'CAD';

export type BillCategory =
  | 'consultation'
  | 'medication'
  | 'laboratory'
  | 'inpatient'
  | 'nursing';

export type WorkflowGateType =
  | 'pre_booking_gate'
  | 'pre_consultation_gate'
  | 'pharmacy_dispense_gate'
  | 'inpatient_admission_gate'
  | 'emergency_exempt';

export interface SpendingGuardrails {
  consultationsAndTelehealth: boolean;
  prescriptionsAndChronicMeds: boolean;
  diagnosticLabsAndImaging: boolean;
  inpatientAndEmergencyAdmissions: boolean;
  blockCashWithdrawal: true; // Always true: health-locked funds cannot be cashed out
}

export interface AutoReloadSubscription {
  active: boolean;
  subscriptionId: string;
  amountUsd: number;
  frequency: 'monthly' | 'biweekly';
  purpose: string;
  nextBillingDate: string;
}

export interface CareSponsor {
  id: string;
  fullName: string;
  email: string;
  relationship: string;
  diasporaLocation: string;
  preferredCurrency: DiasporaCurrency;
  paypalPayerEmail: string;
  addedAt: string;
  isPrimaryGuarantor: boolean;
}

export interface CareDependent {
  id: string;
  docarionPatientId: string;
  fullName: string;
  age: number;
  gender: 'Female' | 'Male';
  relationshipToSponsor: string;
  city: string;
  country: string;
  primaryFacilityName: string;
  primaryFacilityType: 'Hospital' | 'Multi-Specialty Clinic' | 'Community Pharmacy' | 'Diagnostic Center';
  chronicConditions: string[];
  activeMedications: string[];
  healthLockedWalletNgn: number;
  healthLockedWalletUsdEquivalent: number;
  guardrails: SpendingGuardrails;
  autoReloadPlan: AutoReloadSubscription;
  sponsors: CareSponsor[];
}

export interface BillLineItem {
  id: string;
  code: string;
  name: string;
  category: BillCategory;
  dosageOrSpec?: string;
  quantity: number;
  unitPriceNgn: number;
  totalNgn: number;
  benchmarkFairMaxUnitNgn: number;
  clinicallyIndicatedForIcd10: string[];
  aiFlag?: 'verified' | 'overpriced' | 'unindicated_duplicate';
  aiFindingNote?: string;
  recommendedFairTotalNgn?: number;
}

export interface AIAuditLineFinding {
  itemId: string;
  itemName: string;
  flag: 'verified' | 'overpriced' | 'unindicated_duplicate';
  billedNgn: number;
  recommendedFairNgn: number;
  deltaNgn: number;
  clinicalRationale: string;
}

export interface AIAuditReport {
  overallTrustScore: number; // 0 to 100
  verdict: 'verified_fair' | 'price_adjustment_recommended' | 'clinical_review_flagged';
  plainEnglishFamilySummary: string;
  clinicalAppropriatenessAnalysis: string;
  pricingBenchmarkSummary: string;
  originalTotalNgn: number;
  verifiedFairTotalNgn: number;
  savingsNgn: number;
  savingsUsd: number;
  lineFindings: AIAuditLineFinding[];
  auditedByEngine: string;
  auditedAt: string;
}

export interface MedicalBillInvoice {
  id: string;
  invoiceNumber: string;
  dependentId: string;
  dependentName: string;
  docarionPatientId: string;
  facilityName: string;
  facilityType: 'Hospital' | 'Pharmacy' | 'Laboratory' | 'Telehealth Central';
  city: string;
  attendingClinician: string;
  icd10Code: string;
  diagnosisTitle: string;
  clinicalNotes: string;
  workflowGate: WorkflowGateType;
  gateStatus: 'locked_awaiting_sponsor' | 'unlocked_paid' | 'emergency_bypassed';
  isEmergencyTriage?: boolean;
  lineItems: BillLineItem[];
  originalTotalNgn: number;
  activePayableNgn: number;
  appliedAiFairAdjustment: boolean;
  fxRateNgnPerUsd: number;
  payableUsd: number;
  status: 'pending_audit' | 'audited_ready' | 'paid_settled';
  createdAt: string;
  aiAuditReport?: AIAuditReport;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  paypalPayerEmail?: string;
  fundingSource?: 'paypal_checkout' | 'paypal_pay_in_4' | 'health_locked_wallet';
  docarionVoucherCode?: string;
  paidAt?: string;
}

export interface WalletTransaction {
  id: string;
  dependentId: string;
  dependentName: string;
  type: 'paypal_topup' | 'paypal_auto_reload' | 'bill_settlement_debit';
  amountUsd: number;
  amountNgn: number;
  paypalReferenceId: string;
  description: string;
  createdAt: string;
}

export interface PayPalTelemetryEvent {
  id: string;
  timestamp: string;
  endpoint: string;
  method: 'POST' | 'GET';
  status: number;
  summary: string;
  requestPayload: Record<string, unknown>;
  responsePayload: Record<string, unknown>;
}
