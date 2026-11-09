'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Wallet,
  Building2,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Plus,
  RefreshCw,
  Globe,
  Stethoscope,
  Pill,
  FlaskConical,
  ArrowRight,
  Send,
  Terminal,
  HeartHandshake,
  UserPlus,
  CreditCard,
  Settings,
  FileCheck2,
  MapPin,
} from 'lucide-react';
import { BrandLogoMark } from '@/components/BrandLogo';
import { PayPalCheckoutModal } from '@/components/PayPalCheckoutModal';
import {
  CareDependent,
  DiasporaCurrency,
  MedicalBillInvoice,
  PayPalTelemetryEvent,
  WalletTransaction,
} from '@/lib/types';
import {
  CURRENCY_RATES_FROM_USD,
  DEFAULT_FX_NGN_PER_USD,
  INITIAL_DEPENDENTS,
  INITIAL_INVOICES,
  INITIAL_TELEMETRY_EVENTS,
  INITIAL_WALLET_TRANSACTIONS,
} from '@/lib/initial-data';
import { CopilotActionCard } from '@/app/api/ai/copilot/route';

type ActiveTab = 'sponsor_hub' | 'care_wallet' | 'facility_simulator' | 'ai_copilot';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionCard?: CopilotActionCard | null;
}

export default function DocarionCareSponsorApp() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('sponsor_hub');
  const [selectedCurrency, setSelectedCurrency] = useState<DiasporaCurrency>('USD');
  const [selectedDependentFilter, setSelectedDependentFilter] = useState<string>('ALL');

  const [dependents, setDependents] = useState<CareDependent[]>(INITIAL_DEPENDENTS);
  const [invoices, setInvoices] = useState<MedicalBillInvoice[]>(INITIAL_INVOICES);
  const [walletTxs, setWalletTxs] = useState<WalletTransaction[]>(INITIAL_WALLET_TRANSACTIONS);
  const [telemetry, setTelemetry] = useState<PayPalTelemetryEvent[]>(INITIAL_TELEMETRY_EVENTS);

  const [auditingInvoiceId, setAuditingInvoiceId] = useState<string | null>(null);
  const [customPayPalClientId, setCustomPayPalClientId] = useState<string>('');
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);

  // PayPal Modal State
  const [paypalModal, setPaypalModal] = useState<{
    isOpen: boolean;
    mode: 'invoice_settlement' | 'wallet_topup' | 'auto_reload_subscription';
    title: string;
    subtitle: string;
    referenceId: string;
    dependentId: string;
    dependentName: string;
    facilityName: string;
    invoiceId?: string;
    amountUsd: number;
    amountNgn: number;
    savingsUsd?: number;
  }>({
    isOpen: false,
    mode: 'invoice_settlement',
    title: '',
    subtitle: '',
    referenceId: '',
    dependentId: '',
    dependentName: '',
    facilityName: '',
    amountUsd: 0,
    amountNgn: 0,
  });

  // Wallet Top-Up Custom State
  const [walletTargetDepId, setWalletTargetDepId] = useState<string>('dep-mama-ngozi');
  const [walletTopupAmountUsd, setWalletTopupAmountUsd] = useState<number>(50);

  // African Provider / Patient Simulator State
  const [simDependentId, setSimDependentId] = useState<string>('dep-mama-ngozi');
  const [simScenarioPreset, setSimScenarioPreset] = useState<
    'diabetes_overbilled' | 'malaria_pharmacy' | 'emergency_asthma'
  >('diabetes_overbilled');
  const [newSponsorName, setNewSponsorName] = useState<string>('Engr. Obinna Okafor');
  const [newSponsorEmail, setNewSponsorEmail] = useState<string>('obinna.okafor@toronto-care.ca');
  const [newSponsorRelation, setNewSponsorRelation] = useState<string>('Son (Co-Guarantor)');
  const [newSponsorLocation, setNewSponsorLocation] = useState<string>('Toronto, ON, Canada');
  const [newSponsorCurrency, setNewSponsorCurrency] = useState<DiasporaCurrency>('CAD');
  const [sponsorAddedBanner, setSponsorAddedBanner] = useState<string | null>(null);
  const [dispatchedBillBanner, setDispatchedBillBanner] = useState<string | null>(null);

  // AI Copilot State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'ai',
      text: "Welcome to **Docarion CareSponsor AI**! You are registered as the Primary Diaspora Financial Guarantor for **3 family members** in Nigeria.\n\nInstead of guessing which hospital or pharmacy your loved ones visited, every consultation, lab order, and prescription on the Docarion network routes here automatically. Ask me to **audit Mama Ngozi's hospital bill** for overbilling or **prepare a PayPal checkout**!",
      timestamp: 'Just now',
      actionCard: {
        type: 'pay_invoice_paypal',
        title: "Audit & Settle Mama Ngozi's Hospital & Pharmacy Bill",
        subtitle: 'Lagos Lagoon Specialist Hospital • AI detects $34.88 in overbilled items',
        invoiceId: 'inv-9041',
        dependentId: 'dep-mama-ngozi',
        amountUsd: 29.32,
        amountNgn: 47500,
        savingsUsd: 34.88,
        badgeText: 'AI Saves $34.88 USD',
      },
    },
  ]);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatLoading, setChatLoading] = useState<boolean>(false);

  // Hydrate from localStorage if available
  useEffect(() => {
    try {
      const savedInvoices = localStorage.getItem('docarion_cs_invoices_v1');
      const savedDeps = localStorage.getItem('docarion_cs_deps_v1');
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
      if (savedDeps) setDependents(JSON.parse(savedDeps));
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('docarion_cs_invoices_v1', JSON.stringify(invoices));
      localStorage.setItem('docarion_cs_deps_v1', JSON.stringify(dependents));
    } catch {
      // Ignore storage errors
    }
  }, [invoices, dependents]);

  const currencyMeta = CURRENCY_RATES_FROM_USD[selectedCurrency];

  function formatDiasporaCurrency(usdAmount: number): string {
    const converted = usdAmount * currencyMeta.rateFromUsd;
    return `${currencyMeta.symbol}${converted.toFixed(2)} ${selectedCurrency}`;
  }

  function logTelemetryEvent(event: PayPalTelemetryEvent) {
    setTelemetry((prev) => [event, ...prev.slice(0, 19)]);
  }

  function resetDemoState() {
    setDependents(INITIAL_DEPENDENTS);
    setInvoices(INITIAL_INVOICES);
    setWalletTxs(INITIAL_WALLET_TRANSACTIONS);
    setTelemetry(INITIAL_TELEMETRY_EVENTS);
    localStorage.removeItem('docarion_cs_invoices_v1');
    localStorage.removeItem('docarion_cs_deps_v1');
  }

  // Run AI Clinical & Fair-Price Audit on an Invoice
  async function handleRunAiAudit(invoice: MedicalBillInvoice) {
    setAuditingInvoiceId(invoice.id);
    try {
      const res = await fetch('/api/ai/audit-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoice }),
      });
      const data = await res.json();
      if (data.auditReport) {
        const report = data.auditReport;
        setInvoices((prev) =>
          prev.map((inv) => {
            if (inv.id !== invoice.id) return inv;
            return {
              ...inv,
              status: inv.status === 'paid_settled' ? 'paid_settled' : 'audited_ready',
              aiAuditReport: report,
            };
          })
        );

        logTelemetryEvent({
          id: `tel-audit-${Date.now()}`,
          timestamp: new Date().toISOString(),
          endpoint: 'POST /api/ai/audit-bill',
          method: 'POST',
          status: 200,
          summary: `AI Clinical Audit for ${invoice.invoiceNumber}: Trust Score ${report.overallTrustScore}/100 • Savings $${report.savingsUsd.toFixed(2)} USD`,
          requestPayload: {
            invoiceNumber: invoice.invoiceNumber,
            icd10Code: invoice.icd10Code,
            lineItemsCount: invoice.lineItems.length,
          },
          responsePayload: report,
        });
      }
    } finally {
      setAuditingInvoiceId(null);
    }
  }

  // Apply AI Verified Fair-Price Adjustment
  function handleApplyAiFairAdjustment(invoiceId: string) {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId || !inv.aiAuditReport) return inv;
        const fairNgn = inv.aiAuditReport.verifiedFairTotalNgn;
        const fairUsd = Number((fairNgn / inv.fxRateNgnPerUsd).toFixed(2));
        return {
          ...inv,
          activePayableNgn: fairNgn,
          payableUsd: fairUsd,
          appliedAiFairAdjustment: true,
        };
      })
    );
  }

  // Open PayPal Checkout for an Invoice
  function openInvoicePayPalModal(invoice: MedicalBillInvoice) {
    const savingsUsd =
      invoice.appliedAiFairAdjustment && invoice.aiAuditReport
        ? invoice.aiAuditReport.savingsUsd
        : 0;
    setPaypalModal({
      isOpen: true,
      mode: 'invoice_settlement',
      title: `${invoice.diagnosisTitle}`,
      subtitle: `${invoice.invoiceNumber} • Unlocks ${invoice.workflowGate.replace(/_/g, ' ')}`,
      referenceId: invoice.invoiceNumber,
      dependentId: invoice.dependentId,
      dependentName: invoice.dependentName,
      facilityName: invoice.facilityName,
      invoiceId: invoice.id,
      amountUsd: invoice.payableUsd,
      amountNgn: invoice.activePayableNgn,
      savingsUsd,
    });
  }

  // Pay an Invoice using the Dependent's Health-Locked Care Wallet
  function handlePayFromHealthLockedWallet(invoice: MedicalBillInvoice) {
    const dep = dependents.find((d) => d.id === invoice.dependentId);
    if (!dep || dep.healthLockedWalletNgn < invoice.activePayableNgn) return;

    const voucherCode = `DOC-WLT-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`;
    const newBalanceNgn = dep.healthLockedWalletNgn - invoice.activePayableNgn;
    const newBalanceUsd = Number((newBalanceNgn / DEFAULT_FX_NGN_PER_USD).toFixed(2));

    setDependents((prev) =>
      prev.map((d) =>
        d.id === dep.id
          ? {
              ...d,
              healthLockedWalletNgn: newBalanceNgn,
              healthLockedWalletUsdEquivalent: newBalanceUsd,
            }
          : d
      )
    );

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoice.id
          ? {
              ...inv,
              status: 'paid_settled',
              gateStatus: 'unlocked_paid',
              fundingSource: 'health_locked_wallet',
              docarionVoucherCode: voucherCode,
              paidAt: new Date().toISOString(),
            }
          : inv
      )
    );

    setWalletTxs((prev) => [
      {
        id: `wtx-${Date.now()}`,
        dependentId: dep.id,
        dependentName: dep.fullName,
        type: 'bill_settlement_debit',
        amountUsd: invoice.payableUsd,
        amountNgn: invoice.activePayableNgn,
        paypalReferenceId: voucherCode,
        description: `Settled ${invoice.invoiceNumber} at ${invoice.facilityName}`,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  // Handle Successful PayPal Checkout Modal Completion
  function handlePayPalModalSuccess(result: {
    orderId: string;
    captureId: string;
    voucherCode: string;
    payerEmail: string;
    paymentRail: 'paypal_checkout' | 'paypal_pay_in_4';
  }) {
    if (paypalModal.mode === 'invoice_settlement' && paypalModal.invoiceId) {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === paypalModal.invoiceId
            ? {
                ...inv,
                status: 'paid_settled',
                gateStatus: 'unlocked_paid',
                paypalOrderId: result.orderId,
                paypalCaptureId: result.captureId,
                paypalPayerEmail: result.payerEmail,
                fundingSource: result.paymentRail,
                docarionVoucherCode: result.voucherCode,
                paidAt: new Date().toISOString(),
              }
            : inv
        )
      );
    } else if (paypalModal.mode === 'wallet_topup') {
      setDependents((prev) =>
        prev.map((dep) => {
          if (dep.id !== paypalModal.dependentId) return dep;
          const updatedNgn = dep.healthLockedWalletNgn + paypalModal.amountNgn;
          const updatedUsd = Number((updatedNgn / DEFAULT_FX_NGN_PER_USD).toFixed(2));
          return {
            ...dep,
            healthLockedWalletNgn: updatedNgn,
            healthLockedWalletUsdEquivalent: updatedUsd,
          };
        })
      );

      setWalletTxs((prev) => [
        {
          id: `wtx-${Date.now()}`,
          dependentId: paypalModal.dependentId,
          dependentName: paypalModal.dependentName,
          type: 'paypal_topup',
          amountUsd: paypalModal.amountUsd,
          amountNgn: paypalModal.amountNgn,
          paypalReferenceId: result.orderId,
          description: `PayPal Health-Locked Care Wallet Top-Up (${result.voucherCode})`,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    } else if (paypalModal.mode === 'auto_reload_subscription') {
      setDependents((prev) =>
        prev.map((dep) => {
          if (dep.id !== paypalModal.dependentId) return dep;
          const updatedNgn = dep.healthLockedWalletNgn + paypalModal.amountNgn;
          return {
            ...dep,
            healthLockedWalletNgn: updatedNgn,
            healthLockedWalletUsdEquivalent: Number(
              (updatedNgn / DEFAULT_FX_NGN_PER_USD).toFixed(2)
            ),
            autoReloadPlan: {
              active: true,
              subscriptionId: `I-PAYPAL-SUB-${result.orderId.slice(-6)}`,
              amountUsd: paypalModal.amountUsd,
              frequency: 'monthly',
              purpose: 'Monthly Chronic Medication & Lab Care Reserve',
              nextBillingDate: '2026-12-09',
            },
          };
        })
      );
    }
  }

  // African Provider Simulator: Add New Diaspora Care Sponsor
  function handleAddCareSponsor(e: React.FormEvent) {
    e.preventDefault();
    if (!newSponsorName.trim() || !newSponsorEmail.trim()) return;

    const newSponsor = {
      id: `spon-${Date.now()}`,
      fullName: newSponsorName.trim(),
      email: newSponsorEmail.trim(),
      relationship: newSponsorRelation.trim() || 'Family Guarantor',
      diasporaLocation: newSponsorLocation.trim() || 'Diaspora',
      preferredCurrency: newSponsorCurrency,
      paypalPayerEmail: newSponsorEmail.trim(),
      addedAt: new Date().toISOString().slice(0, 10),
      isPrimaryGuarantor: false,
    };

    setDependents((prev) =>
      prev.map((dep) =>
        dep.id === simDependentId
          ? { ...dep, sponsors: [...dep.sponsors, newSponsor] }
          : dep
      )
    );

    const targetDep = dependents.find((d) => d.id === simDependentId);
    setSponsorAddedBanner(
      `Added ${newSponsor.fullName} (${newSponsor.diasporaLocation}) as a verified Care Sponsor / Guarantor for ${targetDep?.fullName}!`
    );
    setTimeout(() => setSponsorAddedBanner(null), 5000);
  }

  // African Provider Simulator: Dispatch a New Live Hospital/Pharmacy Bill
  function handleDispatchSimulatedBill() {
    const dep = dependents.find((d) => d.id === simDependentId) || dependents[0];
    const invoiceNum = `DOC-INV-2026-${Math.floor(9100 + Math.random() * 899)}`;

    let newInvoice: MedicalBillInvoice;

    if (simScenarioPreset === 'diabetes_overbilled') {
      newInvoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: invoiceNum,
        dependentId: dep.id,
        dependentName: dep.fullName,
        docarionPatientId: dep.docarionPatientId,
        facilityName: dep.primaryFacilityName,
        facilityType: 'Hospital',
        city: dep.city,
        attendingClinician: 'Dr. Ibrahim Musa (Endocrinology Pool)',
        icd10Code: 'E11.9',
        diagnosisTitle: 'Type 2 Diabetes Glycemic Review + HbA1c & Metformin Refill',
        clinicalNotes:
          'Quarterly diabetes clinic visit. HbA1c lab check, fasting blood glucose, and 60-day Metformin XR + Empagliflozin maintenance refill.',
        workflowGate: 'pharmacy_dispense_gate',
        gateStatus: 'locked_awaiting_sponsor',
        originalTotalNgn: 92000,
        activePayableNgn: 92000,
        appliedAiFairAdjustment: false,
        fxRateNgnPerUsd: DEFAULT_FX_NGN_PER_USD,
        payableUsd: Number((92000 / DEFAULT_FX_NGN_PER_USD).toFixed(2)),
        status: 'pending_audit',
        createdAt: new Date().toISOString(),
        lineItems: [
          {
            id: `li-${Date.now()}-1`,
            code: 'CONS-ENDO-01',
            name: 'Endocrinology Specialty Clinic Consultation',
            category: 'consultation',
            dosageOrSpec: 'Specialist Diabetes Review',
            quantity: 1,
            unitPriceNgn: 18000,
            totalNgn: 18000,
            benchmarkFairMaxUnitNgn: 19000,
            clinicallyIndicatedForIcd10: ['E11.9'],
          },
          {
            id: `li-${Date.now()}-2`,
            code: 'LAB-HBA1C',
            name: 'Glycated Hemoglobin (HbA1c) + Fasting Blood Glucose',
            category: 'laboratory',
            dosageOrSpec: 'Point-of-Care Analyzer (Overbilled 2.2x)',
            quantity: 1,
            unitPriceNgn: 28000,
            totalNgn: 28000,
            benchmarkFairMaxUnitNgn: 12500,
            clinicallyIndicatedForIcd10: ['E11.9'],
          },
          {
            id: `li-${Date.now()}-3`,
            code: 'RX-MET-EMP',
            name: 'Metformin XR 1000mg + Empagliflozin 10mg (30-Day Pack)',
            category: 'medication',
            dosageOrSpec: 'Oral Glycemic Maintenance Pack',
            quantity: 1,
            unitPriceNgn: 21000,
            totalNgn: 21000,
            benchmarkFairMaxUnitNgn: 22000,
            clinicallyIndicatedForIcd10: ['E11.9'],
          },
          {
            id: `li-${Date.now()}-4`,
            code: 'RX-UNIND-STER',
            name: 'Methylprednisolone 500mg IV High-Dose Corticosteroid',
            category: 'medication',
            dosageOrSpec: 'Unindicated IV Steroid (Contraindicated in Hyperglycemia)',
            quantity: 1,
            unitPriceNgn: 25000,
            totalNgn: 25000,
            benchmarkFairMaxUnitNgn: 18000,
            clinicallyIndicatedForIcd10: ['M05.9'],
          },
        ],
      };
    } else if (simScenarioPreset === 'malaria_pharmacy') {
      newInvoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: invoiceNum,
        dependentId: dep.id,
        dependentName: dep.fullName,
        docarionPatientId: dep.docarionPatientId,
        facilityName: 'Docarion Central Partner Pharmacy — Victoria Island',
        facilityType: 'Pharmacy',
        city: dep.city,
        attendingClinician: 'Pharm. Chisom Eze (Clinical Pharmacist)',
        icd10Code: 'I10',
        diagnosisTitle: '60-Day Essential Hypertension & Lipid Maintenance Refill',
        clinicalNotes:
          'Verified e-prescription refill from Docarion EMR chart. 100% compliant with regional pharmacy tariff.',
        workflowGate: 'pharmacy_dispense_gate',
        gateStatus: 'locked_awaiting_sponsor',
        originalTotalNgn: 34000,
        activePayableNgn: 34000,
        appliedAiFairAdjustment: false,
        fxRateNgnPerUsd: DEFAULT_FX_NGN_PER_USD,
        payableUsd: Number((34000 / DEFAULT_FX_NGN_PER_USD).toFixed(2)),
        status: 'pending_audit',
        createdAt: new Date().toISOString(),
        lineItems: [
          {
            id: `li-${Date.now()}-1`,
            code: 'RX-AML-60',
            name: 'Amlodipine Besylate 10mg + Lisinopril 10mg (60-Day Refill)',
            category: 'medication',
            dosageOrSpec: '2-Month Chronic Refill Pack',
            quantity: 1,
            unitPriceNgn: 24000,
            totalNgn: 24000,
            benchmarkFairMaxUnitNgn: 25500,
            clinicallyIndicatedForIcd10: ['I10', 'I11.9'],
          },
          {
            id: `li-${Date.now()}-2`,
            code: 'RX-DELIV-01',
            name: 'Home Medication Cold-Chain / Verified Doorstep Delivery',
            category: 'nursing',
            dosageOrSpec: 'Same-Day Verified Patient Handoff',
            quantity: 1,
            unitPriceNgn: 10000,
            totalNgn: 10000,
            benchmarkFairMaxUnitNgn: 10500,
            clinicallyIndicatedForIcd10: ['I10', 'I11.9', 'E11.9'],
          },
        ],
      };
    } else {
      newInvoice = {
        id: `inv-${Date.now()}`,
        invoiceNumber: invoiceNum,
        dependentId: dep.id,
        dependentName: dep.fullName,
        docarionPatientId: dep.docarionPatientId,
        facilityName: dep.primaryFacilityName,
        facilityType: 'Hospital',
        city: dep.city,
        attendingClinician: 'Dr. Kemi Olatunji (Emergency Triage Unit)',
        icd10Code: 'J45.901',
        diagnosisTitle: 'Acute Bronchospasm / Urgent Nebulization & Pulse Oximetry Observation',
        clinicalNotes:
          'Emergency ESI-1 triage exemption active: treatment started immediately without pre-payment block. Post-stabilization bill routed to Diaspora Guarantor.',
        workflowGate: 'emergency_exempt',
        gateStatus: 'emergency_bypassed',
        isEmergencyTriage: true,
        originalTotalNgn: 45000,
        activePayableNgn: 45000,
        appliedAiFairAdjustment: false,
        fxRateNgnPerUsd: DEFAULT_FX_NGN_PER_USD,
        payableUsd: Number((45000 / DEFAULT_FX_NGN_PER_USD).toFixed(2)),
        status: 'pending_audit',
        createdAt: new Date().toISOString(),
        lineItems: [
          {
            id: `li-${Date.now()}-1`,
            code: 'ER-NEB-01',
            name: 'Emergency Salbutamol + Ipratropium Nebulization & Oxygen',
            category: 'inpatient',
            dosageOrSpec: 'Immediate Emergency Stabilization (Gate Bypassed)',
            quantity: 1,
            unitPriceNgn: 28000,
            totalNgn: 28000,
            benchmarkFairMaxUnitNgn: 30000,
            clinicallyIndicatedForIcd10: ['J45.901'],
          },
          {
            id: `li-${Date.now()}-2`,
            code: 'RX-INHALER',
            name: 'Budesonide/Formoterol Maintenance Inhaler (120 Doses)',
            category: 'medication',
            dosageOrSpec: 'Discharge Controller Inhaler',
            quantity: 1,
            unitPriceNgn: 17000,
            totalNgn: 17000,
            benchmarkFairMaxUnitNgn: 18500,
            clinicallyIndicatedForIcd10: ['J45.901'],
          },
        ],
      };
    }

    setInvoices((prev) => [newInvoice, ...prev]);
    setDispatchedBillBanner(
      `Dispatched ${newInvoice.invoiceNumber} (${newInvoice.diagnosisTitle}) for ${dep.fullName} directly to the Diaspora Care Sponsor Hub!`
    );
    setTimeout(() => setDispatchedBillBanner(null), 6000);
  }

  // Send AI Copilot Message
  async function handleSendCopilotMessage(promptOverride?: string) {
    const textToSend = (promptOverride ?? chatInput).trim();
    if (!textToSend || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!promptOverride) setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          dependents,
          invoices,
        }),
      });
      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'ai',
        text: data.replyText || 'I have analyzed your Family Care Circle.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionCard: data.suggestedAction || null,
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } finally {
      setChatLoading(false);
    }
  }

  // Metrics for Hero Summary Bar
  const pendingInvoicesCount = invoices.filter((i) => i.status !== 'paid_settled').length;
  const totalWalletUsd = dependents.reduce(
    (sum, d) => sum + d.healthLockedWalletUsdEquivalent,
    0
  );
  const totalAiSavingsUsd = invoices.reduce(
    (sum, i) => sum + (i.aiAuditReport?.savingsUsd || 0),
    0
  );

  const filteredInvoices =
    selectedDependentFilter === 'ALL'
      ? invoices
      : invoices.filter((inv) => inv.dependentId === selectedDependentFilter);

  return (
    <div className="min-h-screen flex flex-col bg-[#040B14] text-slate-100">
      {/* Top Global Header */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#06101E]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BrandLogoMark className="w-10 h-10" variant="emerald" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold tracking-tight text-white">
                  Docarion <span className="text-emerald-400">CareSponsor AI</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFC439]/15 text-[#FFC439] border border-[#FFC439]/30">
                  PayPal Orders v2 + Clinical AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cross-Border Diaspora Healthcare Guarantor, AI Bill Auditor & Health-Locked Care Wallet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Diaspora Currency Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-1">
              {(['USD', 'GBP', 'EUR', 'CAD'] as DiasporaCurrency[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    selectedCurrency === curr
                      ? 'bg-[#0070BA] text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* PayPal Sandbox Client ID Config Button */}
            <button
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition"
              title="Configure Live PayPal Sandbox Client ID"
            >
              <Settings className="w-3.5 h-3.5 text-[#FFC439]" />
              <span className="hidden md:inline">PayPal Sandbox Keys</span>
            </button>

            {/* Reset Demo State */}
            <button
              onClick={resetDemoState}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-400 hover:text-white transition"
              title="Reset Demo State"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Demo</span>
            </button>
          </div>
        </div>

        {/* Collapsible PayPal Sandbox Credentials Drawer */}
        {showSettingsDrawer && (
          <div className="border-t border-slate-800 bg-slate-950/95 px-4 sm:px-6 py-3">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                <strong className="text-[#FFC439]">Live PayPal Developer Sandbox Mode:</strong>{' '}
                Paste your <code className="text-emerald-400">NEXT_PUBLIC_PAYPAL_CLIENT_ID</code>{' '}
                from{' '}
                <a
                  href="https://developer.paypal.com/dashboard/applications/sandbox"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-blue-400 hover:text-blue-300"
                >
                  developer.paypal.com
                </a>{' '}
                (or leave default <code className="text-slate-400">test</code> to use built-in Sandbox mode).
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="PayPal Sandbox Client ID (optional)"
                  value={customPayPalClientId}
                  onChange={(e) => setCustomPayPalClientId(e.target.value)}
                  className="w-full sm:w-72 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                />
                <button
                  onClick={() => setShowSettingsDrawer(false)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Executive Diaspora Guarantor KPI Banner */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Family Care Circle (Africa)</p>
              <p className="text-2xl font-black text-white mt-1">
                {dependents.length} Dependents
              </p>
              <p className="text-[11px] text-emerald-400 mt-0.5">
                Auto-routed across Docarion EMR
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <HeartHandshake className="w-6 h-6" />
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">Pending Provider Bills</p>
              <p className="text-2xl font-black text-amber-400 mt-1">
                {pendingInvoicesCount} Active
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hospitals, Pharmacies & Labs
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileCheck2 className="w-6 h-6" />
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/60 border border-slate-800 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 font-medium">AI Overbilling Protection</p>
              <p className="text-2xl font-black text-emerald-400 mt-1">
                {formatDiasporaCurrency(totalAiSavingsUsd > 0 ? totalAiSavingsUsd : 34.88)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Saved via ICD-10 & Tariff Audit
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#003087]/50 to-slate-900 border border-blue-500/30 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-200 font-medium">Health-Locked Care Wallets</p>
              <p className="text-2xl font-black text-[#FFC439] mt-1">
                {formatDiasporaCurrency(totalWalletUsd)}
              </p>
              <p className="text-[11px] text-blue-300 mt-0.5">
                ₦{(totalWalletUsd * DEFAULT_FX_NGN_PER_USD).toLocaleString()} NGN Protected
              </p>
            </div>
            <div className="h-11 w-11 rounded-xl bg-[#FFC439]/20 border border-[#FFC439]/40 flex items-center justify-center text-[#FFC439]">
              <Wallet className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* Primary 4-Mode Navigation Tabs */}
        <nav className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('sponsor_hub')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'sponsor_hub'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>1. Diaspora Care Sponsor Hub</span>
            {pendingInvoicesCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-[11px] rounded-full bg-black/30 text-amber-300">
                {pendingInvoicesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('care_wallet')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'care_wallet'
                ? 'bg-[#0070BA] text-white shadow-lg shadow-blue-900/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>2. Health-Locked Care Wallet & Auto-Reload</span>
          </button>

          <button
            onClick={() => setActiveTab('facility_simulator')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'facility_simulator'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>3. African Provider & Guarantor Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_copilot')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition ${
              activeTab === 'ai_copilot'
                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-900/40'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>4. CareSponsor AI Copilot & PayPal Inspector</span>
          </button>
        </nav>

        {/* =====================================================================
            TAB 1: DIASPORA CARE SPONSOR HUB (AI BILL AUDITOR + PAYPAL CHECKOUT)
           ===================================================================== */}
        {activeTab === 'sponsor_hub' && (
          <div className="space-y-6">
            {/* Family Care Circle Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
                  Family Care Circle:
                </span>
                <button
                  onClick={() => setSelectedDependentFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    selectedDependentFilter === 'ALL'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  All Family Members ({dependents.length})
                </button>
                {dependents.map((dep) => (
                  <button
                    key={dep.id}
                    onClick={() => setSelectedDependentFilter(dep.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      selectedDependentFilter === dep.id
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{dep.fullName}</span>
                    <span className="text-[10px] opacity-75">({dep.relationshipToSponsor})</span>
                  </button>
                ))}
              </div>
              <div className="text-xs text-slate-400">
                Guarantor:{' '}
                <strong className="text-white">Dr. Chidi Okafor (Houston, TX)</strong>
              </div>
            </div>

            {/* Invoices List */}
            <div className="space-y-5">
              {filteredInvoices.map((inv) => {
                const dependent = dependents.find((d) => d.id === inv.dependentId);
                const isPaid = inv.status === 'paid_settled';
                const audit = inv.aiAuditReport;

                return (
                  <div
                    key={inv.id}
                    className={`rounded-2xl border transition overflow-hidden ${
                      isPaid
                        ? 'bg-slate-900/50 border-emerald-500/40'
                        : 'bg-slate-900/90 border-slate-700/90 shadow-xl'
                    }`}
                  >
                    {/* Top Invoice Banner */}
                    <div className="px-5 py-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                            {inv.invoiceNumber}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            ICD-10: {inv.icd10Code}
                          </span>
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <Unlock className="w-3.5 h-3.5" />
                              Gate Unlocked • Paid ({inv.docarionVoucherCode})
                            </span>
                          ) : inv.isEmergencyTriage ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              ⚡ Emergency ESI-1 Exemption (Care Started Immediately)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <Lock className="w-3.5 h-3.5" />
                              {inv.workflowGate === 'pharmacy_dispense_gate'
                                ? 'Pharmacy Dispensation Gate Locked — Awaiting Guarantor'
                                : inv.workflowGate === 'pre_consultation_gate'
                                ? 'Pre-Consultation Specialty Gate Locked'
                                : 'Pre-Booking Clinic Gate Locked'}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base sm:text-lg font-extrabold text-white">
                          {inv.dependentName} — {inv.diagnosisTitle}
                        </h3>
                        <p className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1 text-slate-300 font-medium">
                            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                            {inv.facilityName} ({inv.city})
                          </span>
                          <span>•</span>
                          <span>Attending: {inv.attendingClinician}</span>
                        </p>
                      </div>

                      {/* Price Display */}
                      <div className="text-right">
                        {inv.appliedAiFairAdjustment && (
                          <p className="text-xs text-slate-500 line-through font-mono">
                            Original: ₦{inv.originalTotalNgn.toLocaleString()} (
                            {formatDiasporaCurrency(
                              inv.originalTotalNgn / inv.fxRateNgnPerUsd
                            )}
                            )
                          </p>
                        )}
                        <div className="text-2xl font-black text-[#FFC439]">
                          {formatDiasporaCurrency(inv.payableUsd)}
                        </div>
                        <p className="text-xs font-mono text-slate-400">
                          ₦{inv.activePayableNgn.toLocaleString()} NGN Local Settlement
                        </p>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-5 space-y-5">
                      {/* Clinical Encounter Note */}
                      <div className="rounded-xl bg-slate-950/60 border border-slate-800/80 p-3.5 text-xs text-slate-300">
                        <span className="font-bold text-slate-200 uppercase tracking-wider text-[11px] block mb-1">
                          Provider Clinical Summary (Routed from Docarion EMR):
                        </span>
                        {inv.clinicalNotes}
                      </div>

                      {/* Itemized Line Items Table */}
                      <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                              <th className="py-2.5 px-3 font-semibold">Care Item / Medication / Lab</th>
                              <th className="py-2.5 px-3 font-semibold">Category</th>
                              <th className="py-2.5 px-3 font-semibold text-right">Billed (NGN)</th>
                              <th className="py-2.5 px-3 font-semibold text-right">Fair Tariff Benchmark</th>
                              <th className="py-2.5 px-3 font-semibold">AI Clinical & Tariff Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/70">
                            {inv.lineItems.map((item) => {
                              const finding = audit?.lineFindings.find(
                                (f) => f.itemId === item.id
                              );
                              return (
                                <tr key={item.id} className="hover:bg-slate-800/30">
                                  <td className="py-3 px-3">
                                    <div className="font-bold text-white">{item.name}</div>
                                    <div className="text-[11px] text-slate-400">
                                      {item.dosageOrSpec} • Code:{' '}
                                      <code className="text-slate-300">{item.code}</code>
                                    </div>
                                  </td>
                                  <td className="py-3 px-3 capitalize text-slate-300">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 text-[11px]">
                                      {item.category === 'medication' && (
                                        <Pill className="w-3 h-3 text-emerald-400" />
                                      )}
                                      {item.category === 'laboratory' && (
                                        <FlaskConical className="w-3 h-3 text-blue-400" />
                                      )}
                                      {item.category === 'consultation' && (
                                        <Stethoscope className="w-3 h-3 text-purple-400" />
                                      )}
                                      {item.category}
                                    </span>
                                  </td>
                                  <td className="py-3 px-3 text-right font-mono font-semibold text-slate-200">
                                    ₦{item.totalNgn.toLocaleString()}
                                  </td>
                                  <td className="py-3 px-3 text-right font-mono text-slate-400">
                                    {item.benchmarkFairMaxUnitNgn > 0
                                      ? `≤ ₦${(
                                          item.benchmarkFairMaxUnitNgn * item.quantity
                                        ).toLocaleString()}`
                                      : '₦0 (Exempt)'}
                                  </td>
                                  <td className="py-3 px-3">
                                    {!finding ? (
                                      <span className="text-slate-500 italic">
                                        Click &ldquo;Run AI Clinical Audit&rdquo; below
                                      </span>
                                    ) : finding.flag === 'verified' ? (
                                      <div className="space-y-0.5">
                                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          Verified Appropriate
                                        </span>
                                        <p className="text-[11px] text-slate-400">
                                          {finding.clinicalRationale}
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="space-y-0.5">
                                        <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                                          <AlertTriangle className="w-3.5 h-3.5" />
                                          {finding.flag === 'overpriced'
                                            ? `Overbilled (Fair: ₦${finding.recommendedFairNgn.toLocaleString()})`
                                            : 'Unindicated / Duplicate (₦0)'}
                                        </span>
                                        <p className="text-[11px] text-amber-200/90">
                                          {finding.clinicalRationale}
                                        </p>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* AI Clinical & Fair-Price Audit Report Card */}
                      {audit && (
                        <div className="rounded-2xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-emerald-950/30 border border-purple-500/40 p-4 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-purple-400" />
                              <h4 className="text-sm font-extrabold text-white">
                                AI Clinical & Fair-Tariff Audit Report
                              </h4>
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {audit.auditedByEngine}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700">
                                Clinical Trust Score:{' '}
                                <strong
                                  className={
                                    audit.overallTrustScore >= 85
                                      ? 'text-emerald-400'
                                      : 'text-amber-400'
                                  }
                                >
                                  {audit.overallTrustScore}/100
                                </strong>
                              </span>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                            <strong className="text-emerald-400">
                              Plain-English Summary for Family Sponsor:{' '}
                            </strong>
                            {audit.plainEnglishFamilySummary}
                          </p>

                          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                            <div className="text-xs text-slate-300">
                              {audit.pricingBenchmarkSummary}
                            </div>

                            {audit.savingsNgn > 0 && !inv.appliedAiFairAdjustment && !isPaid && (
                              <button
                                onClick={() => handleApplyAiFairAdjustment(inv.id)}
                                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition"
                              >
                                <Sparkles className="w-4 h-4" />
                                <span>
                                  Apply AI Verified Fair-Price Adjustment (Save{' '}
                                  {formatDiasporaCurrency(audit.savingsUsd)})
                                </span>
                              </button>
                            )}

                            {inv.appliedAiFairAdjustment && (
                              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                                <CheckCircle2 className="w-4 h-4" />
                                AI Fair-Price Adjustment Applied (-
                                {formatDiasporaCurrency(audit.savingsUsd)})
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Action Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                        <div className="flex items-center gap-2 flex-wrap">
                          {!audit ? (
                            <button
                              onClick={() => handleRunAiAudit(inv)}
                              disabled={auditingInvoiceId === inv.id}
                              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition disabled:opacity-50"
                            >
                              <Sparkles className="w-4 h-4" />
                              <span>
                                {auditingInvoiceId === inv.id
                                  ? 'Auditing ICD-10 & Prices...'
                                  : '1. Run AI Clinical & Fair-Price Audit'}
                              </span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRunAiAudit(inv)}
                              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>Re-Run AI Audit</span>
                            </button>
                          )}
                        </div>

                        {!isPaid ? (
                          <div className="flex items-center gap-2.5 flex-wrap">
                            {dependent &&
                              dependent.healthLockedWalletNgn >= inv.activePayableNgn && (
                                <button
                                  onClick={() => handlePayFromHealthLockedWallet(inv)}
                                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-2 transition"
                                >
                                  <Wallet className="w-4 h-4" />
                                  <span>
                                    Pay from {dependent.fullName.split(' ')[0]}&apos;s Care Wallet
                                    (₦{dependent.healthLockedWalletNgn.toLocaleString()} avail.)
                                  </span>
                                </button>
                              )}

                            <button
                              onClick={() => openInvoicePayPalModal(inv)}
                              className="px-5 py-2.5 rounded-xl bg-[#FFC439] hover:bg-[#f4b829] text-[#003087] font-black text-xs sm:text-sm flex items-center gap-2 shadow-lg transition"
                            >
                              <span>
                                Pay {formatDiasporaCurrency(inv.payableUsd)} with PayPal
                              </span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 text-xs text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              Settled via{' '}
                              {inv.fundingSource === 'health_locked_wallet'
                                ? 'Docarion Health-Locked Care Wallet'
                                : `PayPal (${inv.paypalOrderId})`}{' '}
                              • Voucher: <strong className="font-mono">{inv.docarionVoucherCode}</strong>
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 2: HEALTH-LOCKED CARE WALLET & PAYPAL CHRONIC AUTO-RELOAD
           ===================================================================== */}
        {activeTab === 'care_wallet' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Dependents' Health-Locked Wallets & Guardrails */}
            <div className="lg:col-span-2 space-y-5">
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                      <Wallet className="w-5 h-5 text-[#FFC439]" />
                      <span>Health-Locked Family Care Wallets</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Funds added via PayPal are cryptographically locked to verified Docarion
                      hospitals, pharmacies, and labs—eliminating cash diversion while ensuring
                      zero delays when your family needs medication or urgent care.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {dependents.map((dep) => (
                    <div
                      key={dep.id}
                      className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-white">{dep.fullName}</h3>
                            <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-medium">
                              {dep.relationshipToSponsor} • {dep.age} yrs
                            </span>
                            <span className="text-xs font-mono text-slate-400">
                              {dep.docarionPatientId}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                            <span>
                              {dep.city}, {dep.country} • Primary:{' '}
                              <strong className="text-slate-200">{dep.primaryFacilityName}</strong>
                            </span>
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {dep.chronicConditions.map((cond) => (
                              <span
                                key={cond}
                                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 border border-slate-700 text-slate-300"
                              >
                                {cond}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="text-right bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5">
                          <span className="text-[11px] text-slate-400 block">
                            Health-Locked Balance
                          </span>
                          <span className="text-xl font-black text-emerald-400">
                            ₦{dep.healthLockedWalletNgn.toLocaleString()} NGN
                          </span>
                          <span className="block text-xs text-[#FFC439] font-bold">
                            ≈ {formatDiasporaCurrency(dep.healthLockedWalletUsdEquivalent)}
                          </span>
                        </div>
                      </div>

                      {/* Spending Guardrails */}
                      <div className="pt-3 border-t border-slate-800/80">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                          Sponsor Category Guardrails (Click to Toggle):
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {(
                            [
                              ['prescriptionsAndChronicMeds', '💊 Prescriptions & Chronic Meds'],
                              ['consultationsAndTelehealth', '🩺 Consultations & Telehealth'],
                              ['diagnosticLabsAndImaging', '🧪 Diagnostic Labs & Scans'],
                              ['inpatientAndEmergencyAdmissions', '🏥 Inpatient & Emergency Care'],
                            ] as const
                          ).map(([key, label]) => {
                            const enabled = dep.guardrails[key];
                            return (
                              <button
                                key={key}
                                onClick={() =>
                                  setDependents((prev) =>
                                    prev.map((d) =>
                                      d.id === dep.id
                                        ? {
                                            ...d,
                                            guardrails: {
                                              ...d.guardrails,
                                              [key]: !enabled,
                                            },
                                          }
                                        : d
                                    )
                                  )
                                }
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                                  enabled
                                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                    : 'bg-slate-900 border-slate-800 text-slate-500 line-through'
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                          <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            Cash Withdrawal Blocked
                          </span>
                        </div>
                      </div>

                      {/* PayPal Auto-Reload Subscription Bar */}
                      <div className="rounded-xl bg-[#003087]/25 border border-blue-500/30 p-3 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-xs">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-[#FFC439]" />
                            PayPal Chronic-Care Monthly Auto-Reload:
                          </span>
                          <p className="text-blue-200 mt-0.5">
                            {dep.autoReloadPlan.active
                              ? `Active (${dep.autoReloadPlan.subscriptionId}) • ${formatDiasporaCurrency(
                                  dep.autoReloadPlan.amountUsd
                                )}/month for ${dep.autoReloadPlan.purpose}`
                              : `Not active — Recommended $45/mo for ${dep.activeMedications.join(', ')}`}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              setPaypalModal({
                                isOpen: true,
                                mode: 'wallet_topup',
                                title: `Top Up ${dep.fullName}'s Health-Locked Care Wallet`,
                                subtitle: `Instant USD → NGN deposit at ${dep.primaryFacilityName}`,
                                referenceId: `WLT-${dep.docarionPatientId}`,
                                dependentId: dep.id,
                                dependentName: dep.fullName,
                                facilityName: dep.primaryFacilityName,
                                amountUsd: 50,
                                amountNgn: 50 * DEFAULT_FX_NGN_PER_USD,
                              })
                            }
                            className="px-3.5 py-2 rounded-xl bg-[#FFC439] hover:bg-[#f4b829] text-[#003087] font-extrabold text-xs transition"
                          >
                            + Fund {formatDiasporaCurrency(50)} via PayPal
                          </button>

                          {!dep.autoReloadPlan.active && (
                            <button
                              onClick={() =>
                                setPaypalModal({
                                  isOpen: true,
                                  mode: 'auto_reload_subscription',
                                  title: `Activate Monthly PayPal Auto-Reload (${dep.fullName})`,
                                  subtitle:
                                    'Recurring monthly chronic medication & lab reserve',
                                  referenceId: `SUB-${dep.docarionPatientId}`,
                                  dependentId: dep.id,
                                  dependentName: dep.fullName,
                                  facilityName: dep.primaryFacilityName,
                                  amountUsd: 45,
                                  amountNgn: 45 * DEFAULT_FX_NGN_PER_USD,
                                })
                              }
                              className="px-3 py-2 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-xs transition"
                            >
                              Enable Auto-Reload
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Custom PayPal Top-Up Box & Ledger */}
            <div className="space-y-5">
              <div className="rounded-2xl bg-gradient-to-b from-[#003087]/60 to-slate-900 border border-blue-500/40 p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-[#FFC439] text-[#003087] font-black flex items-center justify-center text-lg">
                    P
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      Instant PayPal Care Wallet Top-Up
                    </h3>
                    <p className="text-xs text-blue-200">
                      Pre-fund medications, labs & consultations
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Select Family Member in Africa
                    </label>
                    <select
                      value={walletTargetDepId}
                      onChange={(e) => setWalletTargetDepId(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-xs text-white font-semibold"
                    >
                      {dependents.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.fullName} ({d.relationshipToSponsor} — {d.city})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Select Amount (USD Equivalent)
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[25, 50, 100, 200].map((amt) => (
                        <button
                          key={amt}
                          onClick={() => setWalletTopupAmountUsd(amt)}
                          className={`py-2 rounded-xl text-xs font-extrabold border transition ${
                            walletTopupAmountUsd === amt
                              ? 'bg-[#FFC439] text-[#003087] border-[#FFC439]'
                              : 'bg-slate-950 text-slate-300 border-slate-700 hover:border-slate-500'
                          }`}
                        >
                          ${amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-3 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">You Pay via PayPal:</span>
                      <span className="font-bold text-[#FFC439]">
                        {formatDiasporaCurrency(walletTopupAmountUsd)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Health-Locked Credit:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        ₦{(walletTopupAmountUsd * DEFAULT_FX_NGN_PER_USD).toLocaleString()} NGN
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const dep =
                        dependents.find((d) => d.id === walletTargetDepId) || dependents[0];
                      setPaypalModal({
                        isOpen: true,
                        mode: 'wallet_topup',
                        title: `Fund ${dep.fullName}'s Health-Locked Care Wallet`,
                        subtitle: '100% locked to verified Docarion medical providers & pharmacies',
                        referenceId: `TOPUP-${dep.docarionPatientId}`,
                        dependentId: dep.id,
                        dependentName: dep.fullName,
                        facilityName: dep.primaryFacilityName,
                        amountUsd: walletTopupAmountUsd,
                        amountNgn: walletTopupAmountUsd * DEFAULT_FX_NGN_PER_USD,
                      });
                    }}
                    className="w-full py-3 rounded-xl bg-[#FFC439] hover:bg-[#f4b829] text-[#003087] font-black text-sm flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <span>Fund Wallet with PayPal</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Recent Wallet Ledger */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-3">
                <h3 className="text-sm font-bold text-white">
                  Recent Health-Locked Wallet Activity
                </h3>
                <div className="space-y-2.5">
                  {walletTxs.map((tx) => (
                    <div
                      key={tx.id}
                      className="rounded-xl bg-slate-950 border border-slate-800/80 p-3 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{tx.dependentName}</span>
                        <span
                          className={`font-mono font-bold ${
                            tx.type === 'bill_settlement_debit'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {tx.type === 'bill_settlement_debit' ? '-' : '+'}₦
                          {tx.amountNgn.toLocaleString()} ($
                          {tx.amountUsd.toFixed(2)})
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{tx.description}</p>
                      <p className="text-[10px] font-mono text-slate-500">
                        Ref: {tx.paypalReferenceId}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 3: AFRICAN PROVIDER & PATIENT GUARANTOR SIMULATOR (EMR SIDE)
           ===================================================================== */}
        {activeTab === 'facility_simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Add a Diaspora Care Sponsor (Guarantor) to Patient Profile */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white">
                    Step 1: Link a Diaspora Care Sponsor (Guarantor)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Patients in Africa add family members abroad so any bill at any Docarion
                    hospital or pharmacy routes to them automatically.
                  </p>
                </div>
              </div>

              {sponsorAddedBanner && (
                <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/40 p-3 text-xs text-emerald-300 font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{sponsorAddedBanner}</span>
                </div>
              )}

              <form onSubmit={handleAddCareSponsor} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Patient in Africa (Docarion EMR Profile)
                  </label>
                  <select
                    value={simDependentId}
                    onChange={(e) => setSimDependentId(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-white font-semibold"
                  >
                    {dependents.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.fullName} ({d.docarionPatientId} • {d.primaryFacilityName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1">
                      Diaspora Sponsor Full Name
                    </label>
                    <input
                      type="text"
                      value={newSponsorName}
                      onChange={(e) => setNewSponsorName(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">
                      Relationship to Patient
                    </label>
                    <input
                      type="text"
                      value={newSponsorRelation}
                      onChange={(e) => setNewSponsorRelation(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1">
                      Sponsor Email / PayPal Account
                    </label>
                    <input
                      type="email"
                      value={newSponsorEmail}
                      onChange={(e) => setNewSponsorEmail(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Preferred Currency</label>
                    <select
                      value={newSponsorCurrency}
                      onChange={(e) =>
                        setNewSponsorCurrency(e.target.value as DiasporaCurrency)
                      }
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white font-bold"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="CAD">CAD (CA$)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    Diaspora City & Country
                  </label>
                  <input
                    type="text"
                    value={newSponsorLocation}
                    onChange={(e) => setNewSponsorLocation(e.target.value)}
                    className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Verified Diaspora Care Sponsor to Patient Chart</span>
                </button>
              </form>

              {/* Active Sponsors for Selected Patient */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Linked Care Sponsors for{' '}
                  {dependents.find((d) => d.id === simDependentId)?.fullName}:
                </span>
                {dependents
                  .find((d) => d.id === simDependentId)
                  ?.sponsors.map((sp) => (
                    <div
                      key={sp.id}
                      className="rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{sp.fullName}</span>{' '}
                        <span className="text-emerald-400">({sp.relationship})</span>
                        <p className="text-[11px] text-slate-400">
                          {sp.diasporaLocation} • PayPal: {sp.paypalPayerEmail}
                        </p>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-bold">
                        {sp.preferredCurrency}
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Right: African Hospital / Pharmacy Live Bill Dispatcher */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="h-10 w-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white">
                    Step 2: African Hospital / Pharmacy Bill Dispatcher
                  </h2>
                  <p className="text-xs text-slate-400">
                    Simulate an African clinic, lab, or pharmacy generating a bill on Docarion and
                    routing it straight to the Diaspora Care Sponsor.
                  </p>
                </div>
              </div>

              {dispatchedBillBanner && (
                <div className="rounded-xl bg-purple-500/20 border border-purple-500/40 p-3 text-xs text-purple-200 font-semibold flex items-center justify-between gap-2">
                  <span>{dispatchedBillBanner}</span>
                  <button
                    onClick={() => setActiveTab('sponsor_hub')}
                    className="px-2.5 py-1 rounded-lg bg-purple-500 text-white font-bold shrink-0"
                  >
                    Open Sponsor Hub →
                  </button>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">
                    Select Clinical Encounter Scenario to Dispatch
                  </label>
                  <div className="space-y-2">
                    <label
                      className={`block rounded-xl border p-3 cursor-pointer transition ${
                        simScenarioPreset === 'diabetes_overbilled'
                          ? 'bg-purple-950/30 border-purple-500'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="preset"
                          checked={simScenarioPreset === 'diabetes_overbilled'}
                          onChange={() => setSimScenarioPreset('diabetes_overbilled')}
                        />
                        <span className="font-bold text-white">
                          Scenario A: Type 2 Diabetes Review + Overbilled Lab & Unindicated IV Steroid
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 pl-5">
                        Billed at ₦92,000 ($56.79 USD) — includes a 2.2x overpriced HbA1c test and
                        an unindicated IV Methylprednisolone vial so you can watch the AI Auditor
                        catch and strip them live!
                      </p>
                    </label>

                    <label
                      className={`block rounded-xl border p-3 cursor-pointer transition ${
                        simScenarioPreset === 'malaria_pharmacy'
                          ? 'bg-purple-950/30 border-purple-500'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="preset"
                          checked={simScenarioPreset === 'malaria_pharmacy'}
                          onChange={() => setSimScenarioPreset('malaria_pharmacy')}
                        />
                        <span className="font-bold text-white">
                          Scenario B: Verified 60-Day Hypertension Pharmacy Refill + Home Delivery
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 pl-5">
                        Billed at ₦34,000 ($20.99 USD) — 100% compliant e-prescription from
                        Docarion Central Pharmacy with locked dispensation gate.
                      </p>
                    </label>

                    <label
                      className={`block rounded-xl border p-3 cursor-pointer transition ${
                        simScenarioPreset === 'emergency_asthma'
                          ? 'bg-purple-950/30 border-purple-500'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="preset"
                          checked={simScenarioPreset === 'emergency_asthma'}
                          onChange={() => setSimScenarioPreset('emergency_asthma')}
                        />
                        <span className="font-bold text-white">
                          Scenario C: Emergency Triage (ESI-1) Acute Bronchospasm Stabilization
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 pl-5">
                        Demonstrates Docarion&apos;s hard invariant: Emergency care bypasses payment
                        gates immediately so the patient is treated first, while routing the
                        post-stabilization bill (₦45,000 / $27.78 USD) to the Diaspora Guarantor.
                      </p>
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleDispatchSimulatedBill}
                  className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    Dispatch Live Provider Bill to Diaspora Care Sponsor Hub
                  </span>
                </button>
              </div>

              {/* Live Facility Gate Status Monitor */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Live African Facility Workflow Gate Monitor:
                </span>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {invoices.map((inv) => (
                    <div
                      key={inv.id}
                      className="rounded-xl bg-slate-950 border border-slate-800 p-3 flex items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <span className="font-mono text-slate-400">{inv.invoiceNumber}</span>{' '}
                        <strong className="text-white">{inv.dependentName}</strong>
                        <p className="text-[11px] text-slate-400">{inv.facilityName}</p>
                      </div>
                      {inv.status === 'paid_settled' ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[11px]">
                          ✅ UNLOCKED ({inv.docarionVoucherCode})
                        </span>
                      ) : inv.isEmergencyTriage ? (
                        <span className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[11px]">
                          ⚡ EMERGENCY BYPASSED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold text-[11px]">
                          🔒 GATE LOCKED
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            TAB 4: CARESPONSOR AI COPILOT & PAYPAL ORDERS V2 TELEMETRY INSPECTOR
           ===================================================================== */}
        {activeTab === 'ai_copilot' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Conversational AI CareSponsor Copilot */}
            <div className="lg:col-span-7 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col h-[620px] overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-white">
                      Docarion CareSponsor AI Copilot
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      Audits African medical bills, explains diagnoses & prepares PayPal Orders inline
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  Agentic PayPal + Clinical AI
                </span>
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-4 py-2.5 bg-slate-950/50 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() =>
                    handleSendCopilotMessage(
                      "Audit Mama Ngozi's latest hospital bill and check for overbilling"
                    )
                  }
                  className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-emerald-300 shrink-0 transition"
                >
                  🔍 Audit Mama Ngozi&apos;s Bill
                </button>
                <button
                  onClick={() =>
                    handleSendCopilotMessage(
                      'How much should I add to her Care Wallet for her monthly hypertension and diabetes refills?'
                    )
                  }
                  className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-blue-300 shrink-0 transition"
                >
                  💊 Recommend Chronic Meds Budget
                </button>
                <button
                  onClick={() =>
                    handleSendCopilotMessage(
                      'Summarize all pending bills across my Family Care Circle'
                    )
                  }
                  className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-amber-300 shrink-0 transition"
                >
                  📊 Care Circle Summary
                </button>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white font-medium'
                          : 'bg-slate-950 border border-slate-800 text-slate-200'
                      }`}
                    >
                      {msg.text}

                      {msg.actionCard && (
                        <div className="mt-3 rounded-xl bg-slate-900 border border-[#FFC439]/40 p-3.5 space-y-2.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                              {msg.actionCard.badgeText}
                            </span>
                            <span className="text-sm font-black text-[#FFC439]">
                              {formatDiasporaCurrency(msg.actionCard.amountUsd)}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-xs">
                              {msg.actionCard.title}
                            </h4>
                            <p className="text-[11px] text-slate-400">
                              {msg.actionCard.subtitle}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              if (
                                msg.actionCard?.type === 'pay_invoice_paypal' &&
                                msg.actionCard.invoiceId
                              ) {
                                const targetInv =
                                  invoices.find(
                                    (i) => i.id === msg.actionCard?.invoiceId
                                  ) || invoices[0];
                                handleRunAiAudit(targetInv);
                                setPaypalModal({
                                  isOpen: true,
                                  mode: 'invoice_settlement',
                                  title: targetInv.diagnosisTitle,
                                  subtitle: `${targetInv.invoiceNumber} • AI Verified Fair Settlement`,
                                  referenceId: targetInv.invoiceNumber,
                                  dependentId: targetInv.dependentId,
                                  dependentName: targetInv.dependentName,
                                  facilityName: targetInv.facilityName,
                                  invoiceId: targetInv.id,
                                  amountUsd: msg.actionCard.amountUsd,
                                  amountNgn: msg.actionCard.amountNgn,
                                  savingsUsd: msg.actionCard.savingsUsd,
                                });
                              } else {
                                const dep =
                                  dependents.find(
                                    (d) => d.id === msg.actionCard?.dependentId
                                  ) || dependents[0];
                                setPaypalModal({
                                  isOpen: true,
                                  mode: 'wallet_topup',
                                  title: `Fund ${dep.fullName}'s Health-Locked Care Wallet`,
                                  subtitle: 'AI Recommended Chronic Care Reserve',
                                  referenceId: `AI-WLT-${dep.docarionPatientId}`,
                                  dependentId: dep.id,
                                  dependentName: dep.fullName,
                                  facilityName: dep.primaryFacilityName,
                                  amountUsd: msg.actionCard?.amountUsd || 50,
                                  amountNgn: msg.actionCard?.amountNgn || 81000,
                                });
                              }
                            }}
                            className="w-full py-2 px-3 rounded-lg bg-[#FFC439] hover:bg-[#f4b829] text-[#003087] font-extrabold text-xs flex items-center justify-center gap-1.5 transition"
                          >
                            <span>
                              Execute PayPal Checkout (
                              {formatDiasporaCurrency(msg.actionCard.amountUsd)})
                            </span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}
              </div>

              {/* Input Bar */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendCopilotMessage();
                }}
                className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask CareSponsor AI to audit a bill, explain a diagnosis, or prepare a PayPal order..."
                  className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Ask AI</span>
                </button>
              </form>
            </div>

            {/* Right 5 Columns: Live PayPal Orders v2 & AI Telemetry Inspector */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col h-[620px] overflow-hidden">
              <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-extrabold text-white">
                    PayPal Orders v2 & AI API Telemetry
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {telemetry.length} events
                </span>
              </div>

              <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
                {telemetry.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-bold text-[11px]">
                        {ev.endpoint}
                      </span>
                      <span className="text-emerald-400 font-bold text-[11px]">
                        HTTP {ev.status}
                      </span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs">{ev.summary}</p>
                    <details className="text-[11px] text-slate-400">
                      <summary className="cursor-pointer hover:text-white">
                        Inspect JSON Request & Response Payload
                      </summary>
                      <pre className="mt-2 p-2 rounded bg-black/60 overflow-x-auto text-[10px] text-emerald-300">
                        {JSON.stringify(
                          {
                            request: ev.requestPayload,
                            response: ev.responsePayload,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#050C16] py-4 px-6 mt-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              <strong>Docarion CareSponsor AI</strong> • Built with PayPal Orders v2 SDK,
              PayPal Subscriptions & Clinical AI Tariff Auditor
            </span>
          </div>
          <div>
            <span>Zero-Cash-Diversion Diaspora Healthcare Guarantee • MIT Licensed</span>
          </div>
        </div>
      </footer>

      {/* PayPal Checkout Modal */}
      <PayPalCheckoutModal
        isOpen={paypalModal.isOpen}
        onClose={() => setPaypalModal((prev) => ({ ...prev, isOpen: false }))}
        mode={paypalModal.mode}
        title={paypalModal.title}
        subtitle={paypalModal.subtitle}
        referenceId={paypalModal.referenceId}
        dependentName={paypalModal.dependentName}
        facilityName={paypalModal.facilityName}
        amountUsd={paypalModal.amountUsd}
        amountNgn={paypalModal.amountNgn}
        savingsUsd={paypalModal.savingsUsd}
        selectedCurrency={selectedCurrency}
        customClientId={customPayPalClientId}
        onSuccess={handlePayPalModalSuccess}
        onLogTelemetry={logTelemetryEvent}
      />
    </div>
  );
}
