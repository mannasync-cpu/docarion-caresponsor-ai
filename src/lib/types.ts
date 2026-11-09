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
  blockCashWithdrawal: true;
}

export interface AutonomousPayPalMandate {
  enabledWhileSleeping: boolean;
  maxAutoSettleUsd: number;
  minAiTrustScoreRequired: number;
  autoStripOverbilledItems: boolean;
  stagedLabProofEscrowEnabled: boolean;
  multiSiblingSplitEnabled: boolean;
}

export interface StagedTrancheState {
  active: boolean;
  stage1LabConsultNgn: number;
  stage1LabConsultUsd: number;
  stage1Status: 'pending' | 'captured_unlocked';
  stage1PayPalOrderId?: string;
  stage2PharmacyNgn: number;
  stage2PharmacyUsd: number;
  stage2Status: 'awaiting_lab_result' | 'captured_positive_lab' | 'voided_negative_lab';
  stage2PayPalOrderId?: string;
  labProofNote?: string;
}

export interface SiblingSplitShare {
  sponsorId: string;
  sponsorName: string;
  relationship: string;
  location: string;
  currency: DiasporaCurrency;
  percentage: number;
  shareUsd: number;
  shareLocalCurrencyAmount: number;
  shareNgn: number;
  status: 'pending' | 'captured';
  paypalOrderId?: string;
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
  inviteToken: string;
  fullName: string;
  email: string;
  phoneOrWhatsapp?: string;
  relationship: string;
  diasporaLocation: string;
  preferredCurrency: DiasporaCurrency;
  splitSharePercent: number;
  paypalPayerEmail: string;
  invitationStatus: 'pending_acceptance' | 'accepted_active';
  permissions: {
    viewVisitRecordsAndPrescriptions: boolean;
    fundCareWallet: boolean;
    autoReceiveBills: boolean;
  };
  addedAt: string;
  acceptedAt?: string;
  isPrimaryGuarantor: boolean;
}

export interface PatientVisitRecord {
  id: string;
  visitNumber: string;
  dependentId: string;
  dependentName: string;
  visitDate: string;
  facilityName: string;
  facilityCity: string;
  department: string;
  attendingDoctor: string;
  chiefComplaint: string;
  diagnosisTitle: string;
  icd10Code: string;
  vitals: {
    bloodPressure: string;
    heartRate: string;
    temperature: string;
    bloodGlucose: string;
    weight: string;
  };
  clinicalSummaryPlainEnglish: string;
  prescriptionsIssued: {
    medicationName: string;
    dosageInstruction: string;
    duration: string;
    dispenseStatus:
      | 'Dispensed (Paid via Sponsor)'
      | 'Ready at Pharmacy (Awaiting Sponsor Payment)'
      | 'Auto-Voided (Lab Result Negative)';
  }[];
  labResultsSummary: {
    testName: string;
    resultValue: string;
    status: 'Normal' | 'Positive — Treated' | 'Monitoring';
  }[];
  linkedInvoiceNumber?: string;
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
  aiMandate: AutonomousPayPalMandate;
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
  overallTrustScore: number;
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
  gateStatus: 'locked_awaiting_sponsor' | 'unlocked_paid' | 'emergency_bypassed' | 'stage1_lab_unlocked';
  isEmergencyTriage?: boolean;
  sentToSponsor: boolean;
  sentToSponsorName?: string;
  patientMessageToSponsor?: string;
  lineItems: BillLineItem[];
  originalTotalNgn: number;
  activePayableNgn: number;
  appliedAiFairAdjustment: boolean;
  fxRateNgnPerUsd: number;
  payableUsd: number;
  status: 'pending_audit' | 'audited_ready' | 'staged_escrow_in_progress' | 'paid_settled';
  createdAt: string;
  aiAuditReport?: AIAuditReport;
  stagedTranche?: StagedTrancheState;
  siblingSplitShares?: SiblingSplitShare[];
  settledViaMode?:
    | 'manual_paypal'
    | 'autonomous_3am_ai_mandate'
    | 'staged_clinical_proof_escrow'
    | 'multi_sibling_pool_split'
    | 'health_locked_wallet';
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
  type:
    | 'paypal_topup'
    | 'paypal_auto_reload'
    | 'bill_settlement_debit'
    | 'paypal_direct_bill'
    | 'ai_autonomous_mandate'
    | 'staged_clinical_escrow'
    | 'multi_sibling_split';
  amountUsd: number;
  amountNgn: number;
  paypalReferenceId: string;
  facilityOrRecipient: string;
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
