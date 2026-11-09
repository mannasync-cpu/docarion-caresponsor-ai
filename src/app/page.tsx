'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Wallet,
  Building2,
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
  HeartHandshake,
  UserPlus,
  CreditCard,
  Settings,
  FileText,
  Mail,
  Activity,
  Receipt,
  Check,
  Copy,
  ExternalLink,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { BrandLogoMark } from '@/components/BrandLogo';
import { PayPalCheckoutModal } from '@/components/PayPalCheckoutModal';
import {
  BillCategory,
  CareDependent,
  CareSponsor,
  DiasporaCurrency,
  MedicalBillInvoice,
  PatientVisitRecord,
  PayPalTelemetryEvent,
  WalletTransaction,
} from '@/lib/types';
import {
  CURRENCY_RATES_FROM_USD,
  DEFAULT_FX_NGN_PER_USD,
  INITIAL_DEPENDENTS,
  INITIAL_INVOICES,
  INITIAL_TELEMETRY_EVENTS,
  INITIAL_VISIT_RECORDS,
  INITIAL_WALLET_TRANSACTIONS,
} from '@/lib/initial-data';

type JourneyPage =
  | '1_patient_dashboard'
  | '2_sponsor_invitation'
  | '3_sponsor_bills'
  | '4_sponsor_wallet'
  | '5_sponsor_visit_records'
  | '6_sponsor_transactions';

export default function DocarionCareSponsorApp() {
  const [currentPage, setCurrentPage] = useState<JourneyPage>('1_patient_dashboard');
  const [selectedCurrency, setSelectedCurrency] = useState<DiasporaCurrency>('USD');
  const [activeDependentId, setActiveDependentId] = useState<string>('dep-mama-ngozi');

  const [dependents, setDependents] = useState<CareDependent[]>(INITIAL_DEPENDENTS);
  const [invoices, setInvoices] = useState<MedicalBillInvoice[]>(INITIAL_INVOICES);
  const [visitRecords, setVisitRecords] = useState<PatientVisitRecord[]>(INITIAL_VISIT_RECORDS);
  const [walletTxs, setWalletTxs] = useState<WalletTransaction[]>(INITIAL_WALLET_TRANSACTIONS);
  const [telemetry, setTelemetry] = useState<PayPalTelemetryEvent[]>(INITIAL_TELEMETRY_EVENTS);

  const [auditingInvoiceId, setAuditingInvoiceId] = useState<string | null>(null);
  const [customPayPalClientId, setCustomPayPalClientId] = useState<string>('');
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Page 1 (Patient View): Invite Family Member Abroad Form
  const [inviteName, setInviteName] = useState<string>('Adaeze Okafor-Williams');
  const [inviteEmail, setInviteEmail] = useState<string>('adaeze.williams@uk-family.co.uk');
  const [invitePhone, setInvitePhone] = useState<string>('+44 7700 900412');
  const [inviteRelationship, setInviteRelationship] = useState<string>('Daughter');
  const [inviteLocation, setInviteLocation] = useState<string>('London, United Kingdom');
  const [inviteCurrency, setInviteCurrency] = useState<DiasporaCurrency>('GBP');
  const [permRecords, setPermRecords] = useState<boolean>(true);
  const [permWallet, setPermWallet] = useState<boolean>(true);
  const [permBills, setPermBills] = useState<boolean>(true);
  const [activeInviteSponsor, setActiveInviteSponsor] = useState<CareSponsor | null>(null);

  // Page 1 (Patient View): Create & Send Detailed Bill to Sponsor Abroad
  const [newBillDiagnosis, setNewBillDiagnosis] = useState<string>(
    'Routine Diabetes & Hypertension Checkup + 30-Day Medication Refill'
  );
  const [newBillNoteToSponsor, setNewBillNoteToSponsor] = useState<string>(
    'Hello my dear, I just finished my checkup at Lagos Lagoon Hospital. Here is the itemized list of my consultation, blood sugar test, and monthly medications.'
  );
  const [newBillItems, setNewBillItems] = useState<
    { name: string; category: BillCategory; spec: string; priceNgn: number }[]
  >([
    {
      name: 'Outpatient Doctor Consultation',
      category: 'consultation',
      spec: 'Internal Medicine Follow-Up Visit',
      priceNgn: 15000,
    },
    {
      name: 'Fasting Blood Glucose & HbA1c Lab Panel',
      category: 'laboratory',
      spec: 'Diabetes Glycemic Control Check',
      priceNgn: 12000,
    },
    {
      name: 'Metformin XR 1000mg + Amlodipine 10mg (30-Day Pack)',
      category: 'medication',
      spec: '60 Tablets Metformin + 30 Tablets Amlodipine',
      priceNgn: 18500,
    },
  ]);
  const [customItemName, setCustomItemName] = useState<string>('');
  const [customItemCategory, setCustomItemCategory] = useState<BillCategory>('medication');
  const [customItemSpec, setCustomItemSpec] = useState<string>('');
  const [customItemPriceNgn, setCustomItemPriceNgn] = useState<string>('');
  const [billSentBanner, setBillSentBanner] = useState<string | null>(null);

  // Page 4 (Wallet Funding): Amount Selection
  const [walletTopupAmountUsd, setWalletTopupAmountUsd] = useState<number>(50);

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

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const savedInvoices = localStorage.getItem('docarion_cs_invoices_v2');
      const savedDeps = localStorage.getItem('docarion_cs_deps_v2');
      const savedTxs = localStorage.getItem('docarion_cs_txs_v2');
      if (savedInvoices) setInvoices(JSON.parse(savedInvoices));
      if (savedDeps) setDependents(JSON.parse(savedDeps));
      if (savedTxs) setWalletTxs(JSON.parse(savedTxs));
    } catch {
      // Ignore storage errors
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('docarion_cs_invoices_v2', JSON.stringify(invoices));
      localStorage.setItem('docarion_cs_deps_v2', JSON.stringify(dependents));
      localStorage.setItem('docarion_cs_txs_v2', JSON.stringify(walletTxs));
    } catch {
      // Ignore storage errors
    }
  }, [invoices, dependents, walletTxs]);

  const activeDependent =
    dependents.find((d) => d.id === activeDependentId) || dependents[0];

  const pendingSponsorInvite =
    activeInviteSponsor ||
    activeDependent.sponsors.find((s) => s.invitationStatus === 'pending_acceptance') ||
    activeDependent.sponsors[0];

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
    setVisitRecords(INITIAL_VISIT_RECORDS);
    setWalletTxs(INITIAL_WALLET_TRANSACTIONS);
    setTelemetry(INITIAL_TELEMETRY_EVENTS);
    localStorage.removeItem('docarion_cs_invoices_v2');
    localStorage.removeItem('docarion_cs_deps_v2');
    localStorage.removeItem('docarion_cs_txs_v2');
  }

  // Page 1 Action: Patient invites a family member abroad
  function handleSendSponsorInvitation(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const token = `INV-${inviteName
      .trim()
      .split(' ')[0]
      .toUpperCase()}-${Math.floor(1000 + Math.random() * 8999)}`;

    const newSponsor: CareSponsor = {
      id: `spon-${Date.now()}`,
      inviteToken: token,
      fullName: inviteName.trim(),
      email: inviteEmail.trim(),
      phoneOrWhatsapp: invitePhone.trim(),
      relationship: inviteRelationship.trim() || 'Family Member',
      diasporaLocation: inviteLocation.trim() || 'Diaspora',
      preferredCurrency: inviteCurrency,
      paypalPayerEmail: inviteEmail.trim(),
      invitationStatus: 'pending_acceptance',
      permissions: {
        viewVisitRecordsAndPrescriptions: permRecords,
        fundCareWallet: permWallet,
        autoReceiveBills: permBills,
      },
      addedAt: new Date().toISOString().slice(0, 10),
      isPrimaryGuarantor: false,
    };

    setDependents((prev) =>
      prev.map((d) =>
        d.id === activeDependent.id
          ? {
              ...d,
              sponsors: [
                ...d.sponsors.filter((s) => s.email !== newSponsor.email),
                newSponsor,
              ],
            }
          : d
      )
    );

    setActiveInviteSponsor(newSponsor);
  }

  // Page 2 Action: Family member abroad accepts the Care Sponsor invitation
  function handleAcceptSponsorInvitation(sponsorId: string) {
    const sponsor = activeDependent.sponsors.find((s) => s.id === sponsorId);
    if (sponsor) {
      setSelectedCurrency(sponsor.preferredCurrency);
    }
    setDependents((prev) =>
      prev.map((d) => ({
        ...d,
        sponsors: d.sponsors.map((s) =>
          s.id === sponsorId
            ? {
                ...s,
                invitationStatus: 'accepted_active',
                acceptedAt: new Date().toISOString().slice(0, 10),
              }
            : s
        ),
      }))
    );
    if (activeInviteSponsor && activeInviteSponsor.id === sponsorId) {
      setActiveInviteSponsor({
        ...activeInviteSponsor,
        invitationStatus: 'accepted_active',
        acceptedAt: new Date().toISOString().slice(0, 10),
      });
    }
    setCurrentPage('3_sponsor_bills');
  }

  // Page 1 Action: Add a line item to the patient's bill builder
  function handleAddLineItemToDraft() {
    const price = Number(customItemPriceNgn);
    if (!customItemName.trim() || !price || price <= 0) return;
    setNewBillItems((prev) => [
      ...prev,
      {
        name: customItemName.trim(),
        category: customItemCategory,
        spec: customItemSpec.trim() || 'Standard Care Item',
        priceNgn: price,
      },
    ]);
    setCustomItemName('');
    setCustomItemSpec('');
    setCustomItemPriceNgn('');
  }

  // Page 1 Action: Patient sends the detailed itemized bill to their Care Sponsor abroad
  function handlePatientSendDetailedBill() {
    if (newBillItems.length === 0) return;
    const totalNgn = newBillItems.reduce((sum, i) => sum + i.priceNgn, 0);
    const totalUsd = Number((totalNgn / DEFAULT_FX_NGN_PER_USD).toFixed(2));
    const invoiceNum = `DOC-INV-2026-${Math.floor(9100 + Math.random() * 899)}`;
    const primarySponsor =
      activeDependent.sponsors.find((s) => s.invitationStatus === 'accepted_active') ||
      activeDependent.sponsors[0];

    const createdInvoice: MedicalBillInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: invoiceNum,
      dependentId: activeDependent.id,
      dependentName: activeDependent.fullName,
      docarionPatientId: activeDependent.docarionPatientId,
      facilityName: activeDependent.primaryFacilityName,
      facilityType: 'Hospital',
      city: activeDependent.city,
      attendingClinician: 'Dr. Tunde Adeyemi (Attending Physician)',
      icd10Code: 'I10 / E11.9',
      diagnosisTitle: newBillDiagnosis,
      clinicalNotes:
        'Detailed patient & hospital bill routed directly to the linked Diaspora Care Sponsor with 100% line-item transparency.',
      workflowGate: 'pharmacy_dispense_gate',
      gateStatus: 'locked_awaiting_sponsor',
      sentToSponsor: true,
      sentToSponsorName: primarySponsor
        ? `${primarySponsor.fullName} (${primarySponsor.diasporaLocation})`
        : 'Diaspora Family Sponsor',
      patientMessageToSponsor: newBillNoteToSponsor,
      originalTotalNgn: totalNgn,
      activePayableNgn: totalNgn,
      appliedAiFairAdjustment: false,
      fxRateNgnPerUsd: DEFAULT_FX_NGN_PER_USD,
      payableUsd: totalUsd,
      status: 'pending_audit',
      createdAt: new Date().toISOString(),
      lineItems: newBillItems.map((item, idx) => ({
        id: `li-cust-${Date.now()}-${idx}`,
        code: `DOC-${item.category.slice(0, 3).toUpperCase()}-0${idx + 1}`,
        name: item.name,
        category: item.category,
        dosageOrSpec: item.spec,
        quantity: 1,
        unitPriceNgn: item.priceNgn,
        totalNgn: item.priceNgn,
        benchmarkFairMaxUnitNgn: Math.round(item.priceNgn * 1.05),
        clinicallyIndicatedForIcd10: ['I10', 'E11.9', 'B50.9'],
      })),
    };

    setInvoices((prev) => [createdInvoice, ...prev]);
    setBillSentBanner(
      `Bill ${invoiceNum} (₦${totalNgn.toLocaleString()} / $${totalUsd.toFixed(
        2
      )} USD) has been sent to ${createdInvoice.sentToSponsorName}!`
    );
  }

  // Page 3 Action: Run AI Clinical & Fair-Price Audit
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
          prev.map((inv) =>
            inv.id === invoice.id
              ? {
                  ...inv,
                  status: inv.status === 'paid_settled' ? 'paid_settled' : 'audited_ready',
                  aiAuditReport: report,
                }
              : inv
          )
        );
      }
    } finally {
      setAuditingInvoiceId(null);
    }
  }

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

  function openInvoicePayPalModal(invoice: MedicalBillInvoice) {
    const savingsUsd =
      invoice.appliedAiFairAdjustment && invoice.aiAuditReport
        ? invoice.aiAuditReport.savingsUsd
        : 0;
    setPaypalModal({
      isOpen: true,
      mode: 'invoice_settlement',
      title: invoice.diagnosisTitle,
      subtitle: `${invoice.invoiceNumber} • Direct Settlement to ${invoice.facilityName}`,
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

    // Also update linked visit prescription dispense status
    setVisitRecords((prev) =>
      prev.map((vis) =>
        vis.linkedInvoiceNumber === invoice.invoiceNumber
          ? {
              ...vis,
              prescriptionsIssued: vis.prescriptionsIssued.map((rx) => ({
                ...rx,
                dispenseStatus: 'Dispensed (Paid via Sponsor)',
              })),
            }
          : vis
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
        facilityOrRecipient: invoice.facilityName,
        description: `Paid ${invoice.invoiceNumber} (${invoice.diagnosisTitle}) from Care Wallet`,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

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

      setVisitRecords((prev) =>
        prev.map((vis) =>
          vis.linkedInvoiceNumber === paypalModal.referenceId
            ? {
                ...vis,
                prescriptionsIssued: vis.prescriptionsIssued.map((rx) => ({
                  ...rx,
                  dispenseStatus: 'Dispensed (Paid via Sponsor)',
                })),
              }
            : vis
        )
      );

      setWalletTxs((prev) => [
        {
          id: `wtx-${Date.now()}`,
          dependentId: paypalModal.dependentId,
          dependentName: paypalModal.dependentName,
          type: 'paypal_direct_bill',
          amountUsd: paypalModal.amountUsd,
          amountNgn: paypalModal.amountNgn,
          paypalReferenceId: `${result.orderId} (${result.voucherCode})`,
          facilityOrRecipient: paypalModal.facilityName,
          description: `PayPal Direct Bill Settlement — ${paypalModal.title}`,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
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
          facilityOrRecipient: `${paypalModal.dependentName} Care Wallet`,
          description: `PayPal International Care Wallet Top-Up (${result.voucherCode})`,
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

      setWalletTxs((prev) => [
        {
          id: `wtx-${Date.now()}`,
          dependentId: paypalModal.dependentId,
          dependentName: paypalModal.dependentName,
          type: 'paypal_auto_reload',
          amountUsd: paypalModal.amountUsd,
          amountNgn: paypalModal.amountNgn,
          paypalReferenceId: `I-PAYPAL-SUB-${result.orderId.slice(-6)}`,
          facilityOrRecipient: `${paypalModal.dependentName} Care Wallet`,
          description: `Activated Monthly PayPal Auto-Reload Subscription`,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
  }

  const pendingBillsCount = invoices.filter((i) => i.status !== 'paid_settled').length;

  const journeyPages: {
    id: JourneyPage;
    stepNum: string;
    roleBadge: 'PATIENT IN AFRICA' | 'FAMILY SPONSOR ABROAD';
    title: string;
    subtitle: string;
  }[] = [
    {
      id: '1_patient_dashboard',
      stepNum: 'Page 1',
      roleBadge: 'PATIENT IN AFRICA',
      title: 'Patient Dashboard: Invite Sponsor & Send Bill',
      subtitle: 'Add family abroad & forward itemized bills',
    },
    {
      id: '2_sponsor_invitation',
      stepNum: 'Page 2',
      roleBadge: 'FAMILY SPONSOR ABROAD',
      title: 'Sponsor Invitation & Acceptance',
      subtitle: 'What the family member abroad receives & accepts',
    },
    {
      id: '3_sponsor_bills',
      stepNum: 'Page 3',
      roleBadge: 'FAMILY SPONSOR ABROAD',
      title: 'Detailed Bills & PayPal Checkout',
      subtitle: `${pendingBillsCount} itemized bill(s) • 0% hidden fees`,
    },
    {
      id: '4_sponsor_wallet',
      stepNum: 'Page 4',
      roleBadge: 'FAMILY SPONSOR ABROAD',
      title: 'Fund Care Wallet (PayPal)',
      subtitle: 'Top up medication & consultation wallet',
    },
    {
      id: '5_sponsor_visit_records',
      stepNum: 'Page 5',
      roleBadge: 'FAMILY SPONSOR ABROAD',
      title: 'Patient Visit Records & Rx',
      subtitle: 'Doctor notes, vitals, labs & prescriptions',
    },
    {
      id: '6_sponsor_transactions',
      stepNum: 'Page 6',
      roleBadge: 'FAMILY SPONSOR ABROAD',
      title: 'Transactions & Receipts',
      subtitle: 'Full PayPal & wallet settlement history',
    },
  ];

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
                  Docarion <span className="text-emerald-400">CareSponsor</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#FFC439]/15 text-[#FFC439] border border-[#FFC439]/30">
                  Powered by PayPal + Clinical AI
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Connect Family Abroad to African Healthcare • 100% Transparent Bills, Visit Records & Instant PayPal Care Wallet
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Active Patient Selector */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1">
              <span className="text-[11px] text-slate-400">Patient:</span>
              <select
                value={activeDependentId}
                onChange={(e) => setActiveDependentId(e.target.value)}
                className="bg-transparent text-xs font-bold text-emerald-400 focus:outline-none"
              >
                {dependents.map((d) => (
                  <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                    {d.fullName} ({d.city})
                  </option>
                ))}
              </select>
            </div>

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

            {/* PayPal Sandbox Keys Drawer Button */}
            <button
              onClick={() => setShowSettingsDrawer(!showSettingsDrawer)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition"
            >
              <Settings className="w-3.5 h-3.5 text-[#FFC439]" />
              <span>PayPal Keys</span>
            </button>

            <button
              onClick={resetDemoState}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-400 hover:text-white transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Collapsible PayPal Sandbox Credentials Drawer */}
        {showSettingsDrawer && (
          <div className="border-t border-slate-800 bg-slate-950 px-4 sm:px-6 py-3">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-300">
                <strong className="text-[#FFC439]">PayPal Developer Sandbox Key:</strong> Paste
                your <code className="text-emerald-400">Client ID</code> from{' '}
                <a
                  href="https://developer.paypal.com/dashboard/applications/sandbox"
                  target="_blank"
                  rel="noreferrer"
                  className="underline text-blue-400 hover:text-blue-300"
                >
                  developer.paypal.com/dashboard/applications/sandbox
                </a>{' '}
                (or leave blank to use built-in Sandbox mode).
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Paste PayPal Sandbox Client ID..."
                  value={customPayPalClientId}
                  onChange={(e) => setCustomPayPalClientId(e.target.value)}
                  className="w-full sm:w-80 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-white"
                />
                <button
                  onClick={() => setShowSettingsDrawer(false)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white"
                >
                  Apply Key
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================================
          STEP-BY-STEP PAGE NAVIGATION BAR (6 CLEAR PAGES)
         ===================================================================== */}
      <div className="bg-slate-950/90 border-b border-slate-800/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Interactive Page-by-Page Walkthrough (Click Any Page Below to See What Each Person Sees):
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Patient in Africa (Page 1) → Family Sponsor Abroad (Pages 2–6)
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {journeyPages.map((p) => {
              const isActive = currentPage === p.id;
              const isPatientPage = p.roleBadge === 'PATIENT IN AFRICA';
              return (
                <button
                  key={p.id}
                  onClick={() => setCurrentPage(p.id)}
                  className={`text-left rounded-xl p-2.5 border transition flex flex-col justify-between ${
                    isActive
                      ? isPatientPage
                        ? 'bg-emerald-950/80 border-emerald-400 shadow-lg shadow-emerald-950/50'
                        : 'bg-[#003087]/80 border-[#FFC439] shadow-lg shadow-blue-950/50'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-white text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {p.stepNum}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        isPatientPage
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-blue-500/20 text-blue-300'
                      }`}
                    >
                      {isPatientPage ? '🇳🇬 Patient' : '🌍 Sponsor'}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-snug">
                      {p.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {p.subtitle}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Page View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* =====================================================================
            PAGE 1: PATIENT DASHBOARD IN AFRICA (INVITE SPONSOR & SEND BILL)
           ===================================================================== */}
        {currentPage === '1_patient_dashboard' && (
          <div className="space-y-6">
            {/* Page 1 Role Banner */}
            <div className="rounded-2xl bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 border border-emerald-500/40 p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  🇳🇬 Page 1 • Patient View in Africa (Docarion Patient App)
                </span>
                <h2 className="text-xl font-extrabold text-white">
                  Welcome, {activeDependent.fullName} ({activeDependent.docarionPatientId})
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Primary Hospital: <strong>{activeDependent.primaryFacilityName}</strong> ({activeDependent.city}) •
                  Care Wallet Balance:{' '}
                  <strong className="text-emerald-400">
                    ₦{activeDependent.healthLockedWalletNgn.toLocaleString()} NGN
                  </strong>
                </p>
              </div>
              <button
                onClick={() => setCurrentPage('2_sponsor_invitation')}
                className="px-4 py-2.5 rounded-xl bg-[#FFC439] hover:bg-[#f4b829] text-[#003087] font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-lg transition"
              >
                <span>Next: See What Family Member Abroad Receives (Page 2)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* LEFT COLUMN: Add / Invite Family Member Abroad as Care Sponsor */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <UserPlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      1. Invite a Family Member Abroad as Your Care Sponsor
                    </h3>
                    <p className="text-xs text-slate-400">
                      Link your son, daughter, sibling, or relative in the diaspora so they can
                      fund your Care Wallet or pay your hospital & pharmacy bills via PayPal.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSendSponsorInvitation} className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Family Member&apos;s Full Name
                      </label>
                      <input
                        type="text"
                        value={inviteName}
                        onChange={(e) => setInviteName(e.target.value)}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Relationship to You
                      </label>
                      <input
                        type="text"
                        value={inviteRelationship}
                        onChange={(e) => setInviteRelationship(e.target.value)}
                        placeholder="e.g. Son, Daughter, Brother, Sister"
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Email Address (For Invite & PayPal)
                      </label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        WhatsApp / International Phone
                      </label>
                      <input
                        type="text"
                        value={invitePhone}
                        onChange={(e) => setInvitePhone(e.target.value)}
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-300 font-semibold mb-1">
                        City & Country Abroad
                      </label>
                      <input
                        type="text"
                        value={inviteLocation}
                        onChange={(e) => setInviteLocation(e.target.value)}
                        placeholder="e.g. Houston, TX / London, UK / Toronto, CA"
                        className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">
                        Their Currency
                      </label>
                      <select
                        value={inviteCurrency}
                        onChange={(e) =>
                          setInviteCurrency(e.target.value as DiasporaCurrency)
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

                  {/* Sponsor Permissions Checkboxes */}
                  <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      What Can This Family Sponsor See & Do?
                    </span>
                    <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permBills}
                        onChange={(e) => setPermBills(e.target.checked)}
                        className="rounded text-emerald-500"
                      />
                      <span>
                        Receive my itemized hospital, laboratory & pharmacy bills automatically
                      </span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permWallet}
                        onChange={(e) => setPermWallet(e.target.checked)}
                        className="rounded text-emerald-500"
                      />
                      <span>
                        Fund my Docarion Care Wallet via PayPal for medications & visits
                      </span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={permRecords}
                        onChange={(e) => setPermRecords(e.target.checked)}
                        className="rounded text-emerald-500"
                      />
                      <span>
                        View my doctor visit summaries, diagnoses, and active prescriptions
                      </span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <Mail className="w-4 h-4" />
                    <span>Send Care Sponsor Invitation to Family Member Abroad</span>
                  </button>
                </form>

                {/* Current Linked Sponsors List */}
                <div className="pt-3 border-t border-slate-800 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                    Your Linked Family Care Sponsors ({activeDependent.sponsors.length}):
                  </span>
                  {activeDependent.sponsors.map((sp) => (
                    <div
                      key={sp.id}
                      className="rounded-xl bg-slate-950 border border-slate-800 p-3 flex flex-wrap items-center justify-between gap-2 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{sp.fullName}</span>
                          <span className="text-emerald-400 font-medium">
                            ({sp.relationship})
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sp.invitationStatus === 'accepted_active'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {sp.invitationStatus === 'accepted_active'
                              ? '✅ Active Sponsor'
                              : '⏳ Invite Sent (Pending Acceptance)'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {sp.diasporaLocation} • {sp.email} • Invite Code:{' '}
                          <code className="text-slate-300">{sp.inviteToken}</code>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText(
                              `${window.location.origin}/?invite=${sp.inviteToken}`
                            );
                            setCopiedToken(sp.inviteToken);
                            setTimeout(() => setCopiedToken(null), 2500);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold flex items-center gap-1"
                        >
                          {copiedToken === sp.inviteToken ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setActiveInviteSponsor(sp);
                            setCurrentPage('2_sponsor_invitation');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#0070BA] hover:bg-[#005ea6] text-white text-[11px] font-bold flex items-center gap-1"
                        >
                          <span>View Invite Page</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* RIGHT COLUMN: Patient Detailed Bill Builder & Forwarder */}
              <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-white">
                      2. Send a Detailed Medical Bill to Your Sponsor Abroad
                    </h3>
                    <p className="text-xs text-slate-400">
                      Every consultation, lab test, and medication is itemized transparently so
                      your family member abroad sees zero hidden charges.
                    </p>
                  </div>
                </div>

                {billSentBanner && (
                  <div className="rounded-xl bg-emerald-500/20 border border-emerald-500/40 p-3 text-xs text-emerald-200 font-semibold flex items-center justify-between gap-2">
                    <span>{billSentBanner}</span>
                    <button
                      onClick={() => setCurrentPage('3_sponsor_bills')}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-extrabold shrink-0"
                    >
                      See Bill in Sponsor View (Page 3) →
                    </button>
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Visit Reason / Diagnosis Title
                    </label>
                    <input
                      type="text"
                      value={newBillDiagnosis}
                      onChange={(e) => setNewBillDiagnosis(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Personal Note to Your Family Sponsor Abroad
                    </label>
                    <textarea
                      rows={2}
                      value={newBillNoteToSponsor}
                      onChange={(e) => setNewBillNoteToSponsor(e.target.value)}
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2 text-white"
                    />
                  </div>

                  {/* Itemized Line Items in Bill */}
                  <div className="rounded-xl bg-slate-950 border border-slate-800 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Itemized Hospital, Lab & Medication Charges:
                      </span>
                      <span className="text-xs font-bold text-emerald-400">
                        Total: ₦
                        {newBillItems
                          .reduce((s, i) => s + i.priceNgn, 0)
                          .toLocaleString()}{' '}
                        NGN (≈{' '}
                        {formatDiasporaCurrency(
                          newBillItems.reduce((s, i) => s + i.priceNgn, 0) /
                            DEFAULT_FX_NGN_PER_USD
                        )}
                        )
                      </span>
                    </div>

                    <div className="divide-y divide-slate-800/80">
                      {newBillItems.map((item, index) => (
                        <div
                          key={index}
                          className="py-2 flex items-center justify-between gap-2"
                        >
                          <div>
                            <span className="font-bold text-white">{item.name}</span>
                            <span className="ml-2 text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {item.category}
                            </span>
                            <p className="text-[11px] text-slate-400">{item.spec}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-slate-200">
                              ₦{item.priceNgn.toLocaleString()}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                setNewBillItems((prev) =>
                                  prev.filter((_, i) => i !== index)
                                )
                              }
                              className="text-slate-500 hover:text-rose-400 text-xs px-1"
                              title="Remove item"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Another Custom Item Row */}
                    <div className="pt-2 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-12 gap-2">
                      <input
                        type="text"
                        placeholder="Add medication, lab test, or service..."
                        value={customItemName}
                        onChange={(e) => setCustomItemName(e.target.value)}
                        className="sm:col-span-5 rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-white text-xs"
                      />
                      <select
                        value={customItemCategory}
                        onChange={(e) =>
                          setCustomItemCategory(e.target.value as BillCategory)
                        }
                        className="sm:col-span-3 rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-white text-xs"
                      >
                        <option value="medication">Medication</option>
                        <option value="laboratory">Lab Test</option>
                        <option value="consultation">Consultation</option>
                      </select>
                      <input
                        type="number"
                        placeholder="₦ NGN"
                        value={customItemPriceNgn}
                        onChange={(e) => setCustomItemPriceNgn(e.target.value)}
                        className="sm:col-span-2 rounded-lg bg-slate-900 border border-slate-700 px-2 py-1.5 text-white text-xs font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddLineItemToDraft}
                        className="sm:col-span-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-xs py-1.5"
                      >
                        + Add
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handlePatientSendDetailedBill}
                    className="w-full py-3 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    <Send className="w-4 h-4" />
                    <span>
                      Send Detailed Itemized Bill to My Care Sponsor Abroad
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            PAGE 2: WHAT THE FAMILY MEMBER ABROAD SEES — INVITATION & ACCEPTANCE
           ===================================================================== */}
        {currentPage === '2_sponsor_invitation' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/80 shadow-2xl overflow-hidden">
              {/* Top Invitation Header */}
              <div className="bg-gradient-to-r from-[#003087] via-emerald-950 to-slate-950 p-6 sm:p-8 border-b border-slate-800">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-white/10 text-emerald-300 border border-emerald-400/30">
                    ✉️ Page 2 • What the Family Member Abroad Sees
                  </span>
                  <span className="text-xs font-mono text-blue-200">
                    Invite Token: {pendingSponsorInvite?.inviteToken || 'INV-DAUGHTER-9021'}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {activeDependent.fullName} has invited you to be her{' '}
                  <span className="text-[#FFC439]">Healthcare Sponsor</span> on Docarion
                </h2>
                <p className="text-sm text-blue-100 mt-2">
                  Invited Sponsor:{' '}
                  <strong className="text-white">
                    {pendingSponsorInvite?.fullName} ({pendingSponsorInvite?.relationship} •{' '}
                    {pendingSponsorInvite?.diasporaLocation})
                  </strong>
                </p>
              </div>

              {/* Invitation Details Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* Patient & Hospital Card */}
                <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block">Patient in Africa</span>
                    <strong className="text-white text-sm block mt-0.5">
                      {activeDependent.fullName} ({activeDependent.age} yrs)
                    </strong>
                    <span className="text-emerald-400 font-mono">
                      ID: {activeDependent.docarionPatientId}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Registered Hospital & Pharmacy</span>
                    <strong className="text-white text-sm block mt-0.5">
                      {activeDependent.primaryFacilityName}
                    </strong>
                    <span className="text-slate-400">{activeDependent.city}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Ongoing Care Conditions</span>
                    <strong className="text-white text-xs block mt-0.5">
                      {activeDependent.chronicConditions.join(' • ')}
                    </strong>
                  </div>
                </div>

                {/* Why This Matters: 3 Clear Promises to the Diaspora Sponsor */}
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300">
                    What Accepting This Invitation Allows You to Do:
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-2">
                      <div className="h-9 w-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-white text-sm">
                        1. Zero Hidden Prices
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        See every consultation, lab test, and medication itemized line-by-line
                        from the hospital, verified by Docarion Clinical AI against overbilling.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-2">
                      <div className="h-9 w-9 rounded-xl bg-[#FFC439]/15 text-[#FFC439] flex items-center justify-center">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-white text-sm">
                        2. Pay or Fund via PayPal
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Pay specific hospital/pharmacy bills or fund her health-locked Care
                        Wallet in {pendingSponsorInvite?.preferredCurrency || 'USD'} using PayPal.
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-2">
                      <div className="h-9 w-9 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
                        <Stethoscope className="w-5 h-5" />
                      </div>
                      <h4 className="font-bold text-white text-sm">
                        3. Full Visit & Rx Records
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Follow her doctor visits, blood pressure & blood sugar readings, lab
                        results, and monthly medication refills in real time.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Transparent FX & Fee Disclosure Box */}
                <div className="rounded-2xl bg-emerald-950/30 border border-emerald-500/30 p-4 flex items-start gap-3 text-xs">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-slate-200">
                    <strong className="text-white block">
                      Docarion Transparent Pricing & Health-Lock Guarantee:
                    </strong>
                    <span>
                      You always see the exact local Nigerian Naira (₦ NGN) hospital tariff
                      alongside your PayPal currency ({selectedCurrency}) at the guaranteed rate
                      of <strong>$1.00 USD = ₦1,620 NGN</strong> with <strong>$0 hidden markups</strong>.
                      Funds go 100% toward verified healthcare and medications.
                    </span>
                  </div>
                </div>

                {/* Accept Invitation Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    onClick={() => setCurrentPage('1_patient_dashboard')}
                    className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                  >
                    ← Back to Patient View (Page 1)
                  </button>

                  <button
                    onClick={() =>
                      handleAcceptSponsorInvitation(
                        pendingSponsorInvite?.id || 'spon-2'
                      )
                    }
                    className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#FFC439] hover:bg-[#f4b829] text-[#003087] font-black text-sm flex items-center justify-center gap-2 shadow-xl transition"
                  >
                    <UserCheck className="w-5 h-5" />
                    <span>
                      Accept Care Sponsor Invitation & Open Sponsor Portal (Page 3) →
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            PAGE 3: FAMILY SPONSOR VIEW — DETAILED BILLS & PAYPAL CHECKOUT
           ===================================================================== */}
        {currentPage === '3_sponsor_bills' && (
          <div className="space-y-6">
            {/* Sponsor Bills Header */}
            <div className="rounded-2xl bg-gradient-to-r from-[#003087]/80 via-slate-900 to-slate-900 border border-blue-500/40 p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFC439]/20 text-[#FFC439] border border-[#FFC439]/30">
                  🌍 Page 3 • Family Member Abroad View (Detailed Bills & Transparent PayPal Payment)
                </span>
                <h2 className="text-xl font-extrabold text-white">
                  Itemized Medical Bills & Prescriptions for Your Family
                </h2>
                <p className="text-xs sm:text-sm text-blue-100">
                  Every charge is itemized line-by-line directly from the Docarion hospital or
                  pharmacy. Run the <strong>AI Fair-Price Check</strong> before paying with PayPal.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage('4_sponsor_wallet')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Go to Page 4: Fund Care Wallet →</span>
                </button>
              </div>
            </div>

            {/* Detailed Bills List */}
            <div className="space-y-6">
              {invoices.map((inv) => {
                const dependent = dependents.find((d) => d.id === inv.dependentId);
                const isPaid = inv.status === 'paid_settled';
                const audit = inv.aiAuditReport;

                return (
                  <div
                    key={inv.id}
                    className={`rounded-2xl border transition overflow-hidden ${
                      isPaid
                        ? 'bg-slate-900/50 border-emerald-500/40'
                        : 'bg-slate-900 border-slate-700 shadow-xl'
                    }`}
                  >
                    {/* Top Bill Header */}
                    <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            Bill #{inv.invoiceNumber}
                          </span>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            Diagnosis Code: {inv.icd10Code}
                          </span>
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <Unlock className="w-3.5 h-3.5" />
                              Paid & Released for Patient ({inv.docarionVoucherCode})
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              <Lock className="w-3.5 h-3.5" />
                              Awaiting Sponsor Payment to Release Medications / Care
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-extrabold text-white">
                          {inv.dependentName} — {inv.diagnosisTitle}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Hospital / Provider:{' '}
                          <strong className="text-slate-200">
                            {inv.facilityName} ({inv.city})
                          </strong>{' '}
                          • Doctor: {inv.attendingClinician}
                        </p>
                      </div>

                      <div className="text-right">
                        {inv.appliedAiFairAdjustment && (
                          <p className="text-xs text-slate-500 line-through font-mono">
                            Billed before AI Audit: ₦{inv.originalTotalNgn.toLocaleString()} (
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
                          Exact Facility Amount: ₦{inv.activePayableNgn.toLocaleString()} NGN
                        </p>
                      </div>
                    </div>

                    <div className="p-6 space-y-5">
                      {/* Patient's Personal Message to Sponsor */}
                      {inv.patientMessageToSponsor && (
                        <div className="rounded-xl bg-emerald-950/30 border border-emerald-500/30 p-3.5 text-xs text-emerald-100 flex items-start gap-3">
                          <HeartHandshake className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-emerald-300 block mb-0.5">
                              Message from {inv.dependentName} to {inv.sentToSponsorName}:
                            </strong>
                            &ldquo;{inv.patientMessageToSponsor}&rdquo;
                          </div>
                        </div>
                      )}

                      {/* Full Itemized Table (No Hidden Prices) */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300">
                            100% Transparent Line-by-Line Bill Breakdown:
                          </span>
                          <span className="text-xs text-slate-400">
                            Rate: $1 USD = ₦{inv.fxRateNgnPerUsd.toLocaleString()} NGN (0% Hidden Markup)
                          </span>
                        </div>

                        <div className="overflow-x-auto rounded-xl border border-slate-800">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                                <th className="py-2.5 px-3 font-semibold">Item / Medication / Test</th>
                                <th className="py-2.5 px-3 font-semibold">Category</th>
                                <th className="py-2.5 px-3 font-semibold text-right">
                                  Hospital Price (NGN)
                                </th>
                                <th className="py-2.5 px-3 font-semibold text-right">
                                  In {selectedCurrency}
                                </th>
                                <th className="py-2.5 px-3 font-semibold">
                                  AI Fair-Price & Clinical Verification
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/70">
                              {inv.lineItems.map((item) => {
                                const finding = audit?.lineFindings.find(
                                  (f) => f.itemId === item.id
                                );
                                const itemUsd = item.totalNgn / inv.fxRateNgnPerUsd;
                                return (
                                  <tr key={item.id} className="hover:bg-slate-800/30">
                                    <td className="py-3 px-3">
                                      <div className="font-bold text-white">{item.name}</div>
                                      <div className="text-[11px] text-slate-400">
                                        {item.dosageOrSpec}
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
                                    <td className="py-3 px-3 text-right font-mono text-[#FFC439] font-bold">
                                      {formatDiasporaCurrency(itemUsd)}
                                    </td>
                                    <td className="py-3 px-3">
                                      {!finding ? (
                                        <span className="text-slate-400">
                                          Fair Benchmark: ≤ ₦
                                          {(
                                            item.benchmarkFairMaxUnitNgn * item.quantity
                                          ).toLocaleString()}
                                        </span>
                                      ) : finding.flag === 'verified' ? (
                                        <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                                          <CheckCircle2 className="w-3.5 h-3.5" />
                                          Verified Fair & Medically Appropriate
                                        </span>
                                      ) : (
                                        <div className="space-y-0.5">
                                          <span className="inline-flex items-center gap-1 text-amber-400 font-bold">
                                            <AlertTriangle className="w-3.5 h-3.5" />
                                            {finding.flag === 'overpriced'
                                              ? `Overpriced — Fair Price is ₦${finding.recommendedFairNgn.toLocaleString()}`
                                              : 'Not Needed for This Diagnosis (Removed: ₦0)'}
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
                      </div>

                      {/* AI Audit Explanation Box */}
                      {audit && (
                        <div className="rounded-2xl bg-purple-950/30 border border-purple-500/40 p-4 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-extrabold text-purple-300 flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4 text-purple-400" />
                              AI Plain-English Explanation for Family Sponsor:
                            </span>
                            <span className="text-xs font-bold text-emerald-400">
                              Trust Score: {audit.overallTrustScore}/100
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                            {audit.plainEnglishFamilySummary}
                          </p>
                          {audit.savingsNgn > 0 && !inv.appliedAiFairAdjustment && !isPaid && (
                            <button
                              onClick={() => handleApplyAiFairAdjustment(inv.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition"
                            >
                              <Sparkles className="w-4 h-4" />
                              <span>
                                Apply AI Verified Fair Price (Save{' '}
                                {formatDiasporaCurrency(audit.savingsUsd)} — Pay Only{' '}
                                {formatDiasporaCurrency(
                                  audit.verifiedFairTotalNgn / inv.fxRateNgnPerUsd
                                )}
                                )
                              </span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* Payment Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleRunAiAudit(inv)}
                            disabled={auditingInvoiceId === inv.id}
                            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow transition"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>
                              {auditingInvoiceId === inv.id
                                ? 'Checking Prices & Diagnosis...'
                                : audit
                                ? 'Re-Verify Prices with AI'
                                : '1. Verify Bill Prices & Diagnosis with AI'}
                            </span>
                          </button>

                          <button
                            onClick={() => setCurrentPage('5_sponsor_visit_records')}
                            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-1.5 transition"
                          >
                            <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                            <span>See Doctor&apos;s Visit Record (Page 5)</span>
                          </button>
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
                                    (₦{dependent.healthLockedWalletNgn.toLocaleString()})
                                  </span>
                                </button>
                              )}

                            <button
                              onClick={() => openInvoicePayPalModal(inv)}
                              className="px-6 py-3 rounded-xl bg-[#FFC439] hover:bg-[#f4b829] text-[#003087] font-black text-sm flex items-center gap-2 shadow-xl transition"
                            >
                              <span>
                                2. Pay {formatDiasporaCurrency(inv.payableUsd)} with PayPal
                              </span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>
                              Paid & Settled! Care Voucher: {inv.docarionVoucherCode}
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
            PAGE 4: FAMILY SPONSOR VIEW — FUND PATIENT'S CARE WALLET VIA PAYPAL
           ===================================================================== */}
        {currentPage === '4_sponsor_wallet' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-[#003087]/80 via-slate-900 to-slate-900 border border-blue-500/40 p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFC439]/20 text-[#FFC439] border border-[#FFC439]/30">
                  💳 Page 4 • Family Member Abroad View (Fund Care Wallet via PayPal)
                </span>
                <h2 className="text-xl font-extrabold text-white">
                  Fund {activeDependent.fullName}&apos;s Health-Locked Care Wallet
                </h2>
                <p className="text-xs sm:text-sm text-blue-100">
                  Pre-fund her wallet in {selectedCurrency} using PayPal so she can walk into any
                  Docarion hospital, clinic, or pharmacy and pick up her medications without delay.
                </p>
              </div>
              <button
                onClick={() => setCurrentPage('5_sponsor_visit_records')}
                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition"
              >
                <span>Next: View Patient Visit Records (Page 5) →</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left 7 Cols: Wallet Balance, Guardrails & Monthly Auto-Reload */}
              <div className="lg:col-span-7 rounded-2xl bg-slate-900 border border-slate-800 p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs text-slate-400 uppercase font-bold">
                      Patient Care Wallet Beneficiary
                    </span>
                    <h3 className="text-xl font-black text-white mt-0.5">
                      {activeDependent.fullName}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {activeDependent.primaryFacilityName} • {activeDependent.city}
                    </p>
                  </div>
                  <div className="text-right bg-slate-950 border border-emerald-500/40 rounded-2xl px-5 py-3">
                    <span className="text-xs text-slate-400 block">
                      Available Health-Locked Balance
                    </span>
                    <span className="text-2xl font-black text-emerald-400">
                      ₦{activeDependent.healthLockedWalletNgn.toLocaleString()} NGN
                    </span>
                    <span className="block text-xs text-[#FFC439] font-bold">
                      ≈ {formatDiasporaCurrency(activeDependent.healthLockedWalletUsdEquivalent)}
                    </span>
                  </div>
                </div>

                {/* Chronic Medications Covered by Wallet */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Routine Medications & Care Covered by This Wallet:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeDependent.activeMedications.map((med) => (
                      <span
                        key={med}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-emerald-300 font-semibold flex items-center gap-1.5"
                      >
                        <Pill className="w-3.5 h-3.5 text-emerald-400" />
                        {med}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Category Guardrails */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                    Sponsor Spending Rules (Health-Locked Guarantee):
                  </span>
                  <p className="text-xs text-slate-400">
                    Choose what {activeDependent.fullName} can pay for using this wallet. Cash
                    withdrawals are permanently blocked so funds are 100% protected for healthcare.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    {(
                      [
                        ['prescriptionsAndChronicMeds', '💊 Pharmacy Prescriptions & Refills'],
                        ['consultationsAndTelehealth', '🩺 Doctor Consultations & Telehealth'],
                        ['diagnosticLabsAndImaging', '🧪 Lab Tests, Ultrasound & ECG'],
                        ['inpatientAndEmergencyAdmissions', '🏥 Hospital Admissions & Emergency'],
                      ] as const
                    ).map(([key, label]) => {
                      const enabled = activeDependent.guardrails[key];
                      return (
                        <button
                          key={key}
                          onClick={() =>
                            setDependents((prev) =>
                              prev.map((d) =>
                                d.id === activeDependent.id
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
                          className={`p-3 rounded-xl text-left text-xs font-bold border transition flex items-center justify-between ${
                            enabled
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                              : 'bg-slate-950 border-slate-800 text-slate-500 line-through'
                          }`}
                        >
                          <span>{label}</span>
                          <span>{enabled ? '✅ Allowed' : 'Off'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Monthly PayPal Auto-Reload */}
                <div className="rounded-2xl bg-[#003087]/30 border border-blue-500/30 p-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-1 text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-[#FFC439]" />
                      PayPal Monthly Chronic-Medication Auto-Reload:
                    </span>
                    <p className="text-blue-200">
                      {activeDependent.autoReloadPlan.active
                        ? `Active (${activeDependent.autoReloadPlan.subscriptionId}) — Automatically adds ${formatDiasporaCurrency(
                            activeDependent.autoReloadPlan.amountUsd
                          )} every month on ${activeDependent.autoReloadPlan.nextBillingDate}`
                        : 'Set up automatic monthly funding so she never runs out of blood pressure or diabetes tablets.'}
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setPaypalModal({
                        isOpen: true,
                        mode: 'auto_reload_subscription',
                        title: `Monthly PayPal Auto-Reload (${activeDependent.fullName})`,
                        subtitle: 'Recurring monthly chronic medication & checkup reserve',
                        referenceId: `SUB-${activeDependent.docarionPatientId}`,
                        dependentId: activeDependent.id,
                        dependentName: activeDependent.fullName,
                        facilityName: activeDependent.primaryFacilityName,
                        amountUsd: 45,
                        amountNgn: 45 * DEFAULT_FX_NGN_PER_USD,
                      })
                    }
                    className="px-4 py-2 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-bold text-xs transition"
                  >
                    {activeDependent.autoReloadPlan.active
                      ? 'Run Monthly Reload Now ($45)'
                      : 'Activate $45/mo Auto-Reload'}
                  </button>
                </div>
              </div>

              {/* Right 5 Cols: Top Up with PayPal Box */}
              <div className="lg:col-span-5 rounded-2xl bg-gradient-to-b from-[#003087]/70 to-slate-900 border border-[#FFC439]/40 p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-2xl bg-[#FFC439] text-[#003087] font-black flex items-center justify-center text-xl shadow">
                    P
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">
                      Add Funds with PayPal
                    </h3>
                    <p className="text-xs text-blue-200">
                      Instant credit to {activeDependent.fullName}&apos;s Docarion Care Wallet
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                    Choose Amount to Add (USD Equivalent):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[25, 50, 100, 200].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setWalletTopupAmountUsd(amt)}
                        className={`py-3 rounded-xl text-sm font-black border transition ${
                          walletTopupAmountUsd === amt
                            ? 'bg-[#FFC439] text-[#003087] border-[#FFC439] shadow-lg'
                            : 'bg-slate-950 text-slate-200 border-slate-700 hover:border-slate-500'
                        }`}
                      >
                        ${amt}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="block text-xs text-slate-400 mb-1">
                      Or Enter Custom Amount (USD):
                    </label>
                    <input
                      type="number"
                      min={5}
                      value={walletTopupAmountUsd}
                      onChange={(e) =>
                        setWalletTopupAmountUsd(Math.max(1, Number(e.target.value)))
                      }
                      className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm font-mono text-white font-bold"
                    />
                  </div>
                </div>

                {/* Transparent Breakdown */}
                <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">You Pay via PayPal:</span>
                    <span className="font-bold text-[#FFC439] text-sm">
                      {formatDiasporaCurrency(walletTopupAmountUsd)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Exchange Rate:</span>
                    <span className="font-mono text-slate-300">
                      $1.00 USD = ₦{DEFAULT_FX_NGN_PER_USD.toLocaleString()} NGN
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Hidden Fees / Markup:</span>
                    <span className="font-bold text-emerald-400">$0.00 (0%)</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-slate-800">
                    <span className="text-white font-bold">
                      Credited to {activeDependent.fullName}&apos;s Wallet:
                    </span>
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      +₦{(walletTopupAmountUsd * DEFAULT_FX_NGN_PER_USD).toLocaleString()} NGN
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setPaypalModal({
                      isOpen: true,
                      mode: 'wallet_topup',
                      title: `Top Up ${activeDependent.fullName}'s Care Wallet`,
                      subtitle: `100% Health-Locked at ${activeDependent.primaryFacilityName}`,
                      referenceId: `TOPUP-${activeDependent.docarionPatientId}-${Date.now()
                        .toString()
                        .slice(-4)}`,
                      dependentId: activeDependent.id,
                      dependentName: activeDependent.fullName,
                      facilityName: activeDependent.primaryFacilityName,
                      amountUsd: walletTopupAmountUsd,
                      amountNgn: walletTopupAmountUsd * DEFAULT_FX_NGN_PER_USD,
                    })
                  }
                  className="w-full py-3.5 rounded-xl bg-[#FFC439] hover:bg-[#f4b829] text-[#003087] font-black text-sm flex items-center justify-center gap-2 shadow-xl transition"
                >
                  <span>
                    Fund {formatDiasporaCurrency(walletTopupAmountUsd)} with PayPal Now
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            PAGE 5: FAMILY SPONSOR VIEW — PATIENT VISIT RECORDS, LABS & RX
           ===================================================================== */}
        {currentPage === '5_sponsor_visit_records' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border border-emerald-500/40 p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  🩺 Page 5 • Family Member Abroad View (Visit Records, Vitals, Labs & Prescriptions)
                </span>
                <h2 className="text-xl font-extrabold text-white">
                  Clinical Visit Records & Prescriptions for Your Family
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  See exactly when your family member visited the hospital, which doctor treated
                  them, their vital signs, lab results, and prescribed medications.
                </p>
              </div>
              <button
                onClick={() => setCurrentPage('6_sponsor_transactions')}
                className="px-4 py-2.5 rounded-xl bg-[#FFC439] hover:bg-[#f4b829] text-[#003087] font-extrabold text-xs flex items-center gap-1.5 shadow-lg transition"
              >
                <span>Next: View Transactions & Receipts (Page 6) →</span>
              </button>
            </div>

            <div className="space-y-5">
              {visitRecords.map((vis) => (
                <div
                  key={vis.id}
                  className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-lg"
                >
                  {/* Visit Top Bar */}
                  <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                          {vis.visitNumber}
                        </span>
                        <span className="text-xs text-slate-300 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-blue-400" />
                          {vis.visitDate}
                        </span>
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-500/15 text-blue-300">
                          ICD-10: {vis.icd10Code}
                        </span>
                      </div>
                      <h3 className="text-lg font-extrabold text-white mt-1">
                        {vis.dependentName} — {vis.diagnosisTitle}
                      </h3>
                      <p className="text-xs text-slate-400">
                        Facility: <strong className="text-white">{vis.facilityName}</strong> (
                        {vis.facilityCity}) • Department: {vis.department} • Attending:{' '}
                        <strong className="text-slate-200">{vis.attendingDoctor}</strong>
                      </p>
                    </div>

                    {vis.linkedInvoiceNumber && (
                      <button
                        onClick={() => setCurrentPage('3_sponsor_bills')}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-[#FFC439] flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Linked Bill: {vis.linkedInvoiceNumber}</span>
                      </button>
                    )}
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Vitals Strip */}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Recorded Patient Vital Signs:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                          <span className="text-[11px] text-slate-400 block">Blood Pressure</span>
                          <span className="text-sm font-extrabold text-white">
                            {vis.vitals.bloodPressure}
                          </span>
                        </div>
                        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                          <span className="text-[11px] text-slate-400 block">Heart Rate</span>
                          <span className="text-sm font-extrabold text-emerald-400">
                            {vis.vitals.heartRate}
                          </span>
                        </div>
                        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                          <span className="text-[11px] text-slate-400 block">Temperature</span>
                          <span className="text-sm font-extrabold text-amber-400">
                            {vis.vitals.temperature}
                          </span>
                        </div>
                        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                          <span className="text-[11px] text-slate-400 block">Blood Glucose</span>
                          <span className="text-sm font-extrabold text-blue-400">
                            {vis.vitals.bloodGlucose}
                          </span>
                        </div>
                        <div className="rounded-xl bg-slate-950 border border-slate-800 p-3">
                          <span className="text-[11px] text-slate-400 block">Weight</span>
                          <span className="text-sm font-extrabold text-white">
                            {vis.vitals.weight}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Plain-English Clinical Summary for the Family */}
                    <div className="rounded-xl bg-emerald-950/25 border border-emerald-500/30 p-4 text-xs sm:text-sm text-slate-200 leading-relaxed">
                      <strong className="text-emerald-400 block mb-1 flex items-center gap-1.5">
                        <Activity className="w-4 h-4" />
                        Plain-English Doctor&apos;s Update for Family Sponsor:
                      </strong>
                      {vis.clinicalSummaryPlainEnglish}
                    </div>

                    {/* Two-Column Prescriptions & Lab Results */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Prescriptions Issued */}
                      <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                          <Pill className="w-4 h-4" />
                          Prescribed Medications ({vis.prescriptionsIssued.length})
                        </span>
                        <div className="space-y-2">
                          {vis.prescriptionsIssued.map((rx, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <strong className="text-white">{rx.medicationName}</strong>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    rx.dispenseStatus.startsWith('Dispensed')
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : 'bg-amber-500/20 text-amber-300'
                                  }`}
                                >
                                  {rx.dispenseStatus}
                                </span>
                              </div>
                              <p className="text-slate-400">
                                Dosage: {rx.dosageInstruction} • Duration: {rx.duration}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Lab Results */}
                      <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                          <FlaskConical className="w-4 h-4" />
                          Laboratory & Diagnostic Results ({vis.labResultsSummary.length})
                        </span>
                        <div className="space-y-2">
                          {vis.labResultsSummary.map((lab, idx) => (
                            <div
                              key={idx}
                              className="rounded-lg bg-slate-900 border border-slate-800 p-3 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <strong className="text-white">{lab.testName}</strong>
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    lab.status === 'Normal'
                                      ? 'bg-emerald-500/20 text-emerald-300'
                                      : 'bg-blue-500/20 text-blue-300'
                                  }`}
                                >
                                  {lab.status}
                                </span>
                              </div>
                              <p className="text-slate-300">{lab.resultValue}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =====================================================================
            PAGE 6: FAMILY SPONSOR VIEW — FULL TRANSACTIONS & RECEIPTS LEDGER
           ===================================================================== */}
        {currentPage === '6_sponsor_transactions' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950/60 to-slate-900 border border-blue-500/40 p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  📜 Page 6 • Family Member Abroad View (Transactions, Receipts & PayPal API Log)
                </span>
                <h2 className="text-xl font-extrabold text-white">
                  Complete PayPal & Care Wallet Transaction History
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Every dollar, pound, or euro you send via PayPal is tracked down to the exact
                  Nigerian Naira (₦ NGN) settled at the hospital or pharmacy.
                </p>
              </div>
              <button
                onClick={() => setCurrentPage('1_patient_dashboard')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
              >
                ← Return to Page 1 (Patient Dashboard)
              </button>
            </div>

            {/* Full Transactions Table */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
              <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">
                  Verified Healthcare Settlement & Wallet Ledger ({walletTxs.length} Transactions)
                </h3>
                <span className="text-xs text-emerald-400 font-semibold">
                  100% Audit-Verified • 0% Cash Diversion
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-950/70 text-slate-400 border-b border-slate-800">
                      <th className="py-3 px-4 font-semibold">Date & Time</th>
                      <th className="py-3 px-4 font-semibold">Patient</th>
                      <th className="py-3 px-4 font-semibold">Transaction Type & Description</th>
                      <th className="py-3 px-4 font-semibold">Hospital / Wallet Recipient</th>
                      <th className="py-3 px-4 font-semibold">PayPal / Voucher Ref</th>
                      <th className="py-3 px-4 font-semibold text-right">Sponsor Paid</th>
                      <th className="py-3 px-4 font-semibold text-right">Local NGN Settled</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {walletTxs.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/30">
                        <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                          {new Date(tx.createdAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-white">{tx.dependentName}</td>
                        <td className="py-3.5 px-4 text-slate-200">{tx.description}</td>
                        <td className="py-3.5 px-4 text-slate-300">{tx.facilityOrRecipient}</td>
                        <td className="py-3.5 px-4 font-mono text-emerald-400">
                          {tx.paypalReferenceId}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-[#FFC439]">
                          {formatDiasporaCurrency(tx.amountUsd)}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-white">
                          ₦{tx.amountNgn.toLocaleString()} NGN
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live PayPal Orders v2 JSON Telemetry Log */}
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-white">
                  PayPal Orders v2 & AI Audit API Telemetry Log
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  {telemetry.length} API calls recorded
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {telemetry.slice(0, 6).map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <code className="text-blue-300 font-bold">{ev.endpoint}</code>
                      <span className="text-emerald-400 font-mono">HTTP {ev.status}</span>
                    </div>
                    <p className="text-slate-300">{ev.summary}</p>
                    <details className="text-[11px] text-slate-400">
                      <summary className="cursor-pointer hover:text-white">
                        View JSON Payload
                      </summary>
                      <pre className="mt-2 p-2 rounded bg-black/70 overflow-x-auto text-[10px] text-emerald-300">
                        {JSON.stringify(
                          { request: ev.requestPayload, response: ev.responsePayload },
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
              <strong>Docarion CareSponsor</strong> • Built with PayPal Orders v2 SDK,
              Health-Locked Care Wallets & Clinical AI Price Transparency
            </span>
          </div>
          <div>
            <span>100% Itemized Hospital & Pharmacy Pricing • Zero Hidden Fees</span>
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
