'use client';

import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import {
  CheckCircle2,
  ShieldCheck,
  Lock,
  Sparkles,
  ArrowRight,
  Globe,
  X,
  Loader2,
  CreditCard,
  Building2,
} from 'lucide-react';
import { DiasporaCurrency, PayPalTelemetryEvent } from '@/lib/types';
import { CURRENCY_RATES_FROM_USD } from '@/lib/initial-data';

export interface PayPalCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'invoice_settlement' | 'wallet_topup' | 'auto_reload_subscription';
  title: string;
  subtitle: string;
  referenceId: string;
  dependentName: string;
  facilityName: string;
  amountUsd: number;
  amountNgn: number;
  savingsUsd?: number;
  selectedCurrency: DiasporaCurrency;
  customClientId?: string;
  onSuccess: (result: {
    orderId: string;
    captureId: string;
    voucherCode: string;
    payerEmail: string;
    paymentRail: 'paypal_checkout' | 'paypal_pay_in_4';
  }) => void;
  onLogTelemetry: (event: PayPalTelemetryEvent) => void;
}

export function PayPalCheckoutModal({
  isOpen,
  onClose,
  mode,
  title,
  subtitle,
  referenceId,
  dependentName,
  facilityName,
  amountUsd,
  amountNgn,
  savingsUsd = 0,
  selectedCurrency,
  customClientId,
  onSuccess,
  onLogTelemetry,
}: PayPalCheckoutModalProps) {
  const [step, setStep] = useState<'review' | 'processing' | 'completed'>('review');
  const [selectedRail, setSelectedRail] = useState<'paypal_checkout' | 'paypal_pay_in_4'>('paypal_checkout');
  const [payerEmail, setPayerEmail] = useState('chidi.okafor.sandbox@paypal.com');
  const [receipt, setReceipt] = useState<{
    orderId: string;
    captureId: string;
    voucherCode: string;
  } | null>(null);

  if (!isOpen) return null;

  const currencyMeta = CURRENCY_RATES_FROM_USD[selectedCurrency] || CURRENCY_RATES_FROM_USD.USD;
  const convertedAmount = Number((amountUsd * currencyMeta.rateFromUsd).toFixed(2));
  const payIn4Installment = Number((convertedAmount / 4).toFixed(2));

  const effectiveClientId =
    customClientId?.trim() ||
    process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ||
    'test';

  async function executePayPalOrdersV2Flow(rail: 'paypal_checkout' | 'paypal_pay_in_4') {
    setSelectedRail(rail);
    setStep('processing');

    try {
      // Step 1: Create PayPal Order (POST /api/paypal/create-order -> /v2/checkout/orders)
      const createReqBody = {
        amountUsd: convertedAmount,
        currency: selectedCurrency,
        referenceId,
        description: title,
        dependentName,
        facilityName,
      };

      const createRes = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createReqBody),
      });
      const createData = await createRes.json();

      onLogTelemetry({
        id: `tel-create-${Date.now()}`,
        timestamp: new Date().toISOString(),
        endpoint: 'POST /v2/checkout/orders',
        method: 'POST',
        status: createRes.status,
        summary: `Created PayPal Order ${createData.orderId} for ${currencyMeta.symbol}${convertedAmount.toFixed(2)} ${selectedCurrency} (${dependentName})`,
        requestPayload: createData.requestPayload || createReqBody,
        responsePayload: createData.paypalResponse || createData,
      });

      await new Promise((r) => setTimeout(r, 650));

      // Step 2: Capture PayPal Order (POST /api/paypal/capture-order -> /v2/checkout/orders/{id}/capture)
      const captureReqBody = {
        orderId: createData.orderId,
        referenceId,
        amountUsd,
        amountNgn,
        currency: selectedCurrency,
        payerEmail,
        payerName: 'Dr. Chidi Okafor',
        paymentRail: rail,
      };

      const captureRes = await fetch('/api/paypal/capture-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(captureReqBody),
      });
      const captureData = await captureRes.json();

      onLogTelemetry({
        id: `tel-capture-${Date.now()}`,
        timestamp: new Date().toISOString(),
        endpoint: `POST /v2/checkout/orders/${createData.orderId}/capture`,
        method: 'POST',
        status: captureRes.status,
        summary: `Captured PayPal Order ${createData.orderId} → Minted Docarion Care Voucher ${captureData.docarionVoucherCode}`,
        requestPayload: captureReqBody,
        responsePayload: captureData.paypalResponse || captureData,
      });

      setReceipt({
        orderId: captureData.orderId,
        captureId: captureData.captureId,
        voucherCode: captureData.docarionVoucherCode,
      });
      setStep('completed');

      onSuccess({
        orderId: captureData.orderId,
        captureId: captureData.captureId,
        voucherCode: captureData.docarionVoucherCode,
        payerEmail,
        paymentRail: rail,
      });
    } catch {
      setStep('review');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden text-slate-100">
        {/* Top PayPal + Docarion Co-Branded Header */}
        <div className="bg-gradient-to-r from-[#003087] via-[#00457C] to-emerald-950 px-6 py-4 flex items-center justify-between border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#FFC439] flex items-center justify-center font-black text-[#003087] text-lg shadow">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white tracking-tight">
                  PayPal Cross-Border Care Checkout
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Orders v2 Sandbox
                </span>
              </div>
              <p className="text-xs text-blue-200">
                Docarion Diaspora CareSponsor • Instant Health-Locked Settlement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-300 hover:text-white hover:bg-white/10 transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {step === 'review' && (
            <>
              {/* Care Recipient & Facility Summary */}
              <div className="rounded-xl bg-slate-800/70 border border-slate-700 p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">
                      {mode === 'invoice_settlement'
                        ? 'Direct Provider Bill Settlement'
                        : mode === 'wallet_topup'
                        ? 'Health-Locked Care Wallet Top-Up'
                        : 'Chronic-Care Monthly Auto-Reload'}
                    </span>
                    <h3 className="text-base font-bold text-white mt-0.5">{title}</h3>
                    <p className="text-xs text-slate-400">{subtitle}</p>
                  </div>
                  <span className="text-xs font-mono bg-slate-900 px-2.5 py-1 rounded-md text-slate-300 border border-slate-700">
                    {referenceId}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/70 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      Patient: <strong className="text-white">{dependentName}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span className="truncate">{facilityName}</span>
                  </div>
                </div>
              </div>

              {/* Currency Conversion & AI Savings Breakdown */}
              <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 space-y-2">
                {savingsUsd > 0 && (
                  <div className="flex items-center justify-between text-xs bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2 text-emerald-300 mb-2">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      AI Fair-Price Audit Protection Applied
                    </span>
                    <span className="font-bold">You saved ${savingsUsd.toFixed(2)} USD</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Local African Care Settlement (NGN)</span>
                  <span className="font-mono text-slate-200 font-semibold">
                    ₦{amountNgn.toLocaleString()} NGN
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Guaranteed Diaspora Corridor FX</span>
                  <span className="font-mono text-slate-300">$1 USD = ₦1,620 NGN (0% Docarion Fee)</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-sm font-semibold text-white">Total PayPal Charge</span>
                  <div className="text-right">
                    <span className="text-xl font-black text-[#FFC439]">
                      {currencyMeta.symbol}
                      {convertedAmount.toFixed(2)} {selectedCurrency}
                    </span>
                    {selectedCurrency !== 'USD' && (
                      <p className="text-[11px] text-slate-400">(${amountUsd.toFixed(2)} USD equiv.)</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Sandbox Payer Account Input */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  PayPal Sandbox Buyer Account (Diaspora Guarantor)
                </label>
                <input
                  type="email"
                  value={payerEmail}
                  onChange={(e) => setPayerEmail(e.target.value)}
                  className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Express Sandbox Action Buttons (Works 100% deterministically in demos + triggers real /api/paypal/create-order & /capture-order) */}
              <div className="space-y-2.5">
                <button
                  onClick={() => executePayPalOrdersV2Flow('paypal_checkout')}
                  className="w-full py-3 px-4 rounded-xl bg-[#FFC439] hover:bg-[#f4b829] text-[#003087] font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition transform active:scale-[0.99]"
                >
                  <span>Pay {currencyMeta.symbol}{convertedAmount.toFixed(2)} {selectedCurrency} with PayPal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {convertedAmount >= 25 && (
                  <button
                    onClick={() => executePayPalOrdersV2Flow('paypal_pay_in_4')}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#0070BA] hover:bg-[#005ea6] text-white font-semibold text-xs flex items-center justify-center gap-2 transition"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>
                      PayPal Pay in 4: 4 interest-free payments of {currencyMeta.symbol}
                      {payIn4Installment.toFixed(2)}
                    </span>
                  </button>
                )}
              </div>

              {/* Embedded Official @paypal/react-paypal-js Smart Buttons */}
              <div className="pt-2 border-t border-slate-800">
                <p className="text-[11px] text-slate-400 mb-2 text-center">
                  Or use Live PayPal JS SDK Smart Buttons (`@paypal/react-paypal-js` • Client ID:{' '}
                  <code className="text-slate-300">
                    {effectiveClientId === 'test'
                      ? 'sandbox-test'
                      : `${effectiveClientId.slice(0, 10)}...`}
                  </code>
                  ):
                </p>
                <div className="bg-white rounded-xl p-2.5">
                  <PayPalScriptProvider
                    options={{
                      clientId: effectiveClientId,
                      currency: selectedCurrency,
                      intent: 'capture',
                    }}
                  >
                    <PayPalButtons
                      style={{ layout: 'horizontal', height: 38, tagline: false }}
                      createOrder={async () => {
                        const res = await fetch('/api/paypal/create-order', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            amountUsd: convertedAmount,
                            currency: selectedCurrency,
                            referenceId,
                            description: title,
                            dependentName,
                            facilityName,
                          }),
                        });
                        const data = await res.json();
                        return data.orderId;
                      }}
                      onApprove={async (data) => {
                        await executePayPalOrdersV2Flow('paypal_checkout');
                        return Promise.resolve();
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  100% Health-Locked Escrow: Funds settle directly to {facilityName} on Docarion
                </span>
              </div>
            </>
          )}

          {step === 'processing' && (
            <div className="py-10 text-center space-y-4">
              <Loader2 className="w-12 h-12 text-[#FFC439] animate-spin mx-auto" />
              <div>
                <h4 className="text-base font-bold text-white">
                  Executing PayPal Orders v2 Settlement...
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Capturing {currencyMeta.symbol}
                  {convertedAmount.toFixed(2)} {selectedCurrency} → Settling ₦
                  {amountNgn.toLocaleString()} NGN to {facilityName}
                </p>
              </div>
            </div>
          )}

          {step === 'completed' && receipt && (
            <div className="space-y-4 py-2">
              <div className="rounded-xl bg-emerald-500/15 border border-emerald-500/40 p-4 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">
                  PayPal Order Captured • Gate Unlocked
                </span>
                <h4 className="text-lg font-extrabold text-white">
                  Healthcare Settlement Complete!
                </h4>
                <p className="text-xs text-slate-300">
                  <strong>{dependentName}</strong> is immediately cleared at{' '}
                  <strong>{facilityName}</strong>.
                </p>
              </div>

              <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Docarion Care Voucher:</span>
                  <span className="text-emerald-400 font-bold">{receipt.voucherCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">PayPal Order ID:</span>
                  <span className="text-slate-200">{receipt.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">PayPal Capture ID:</span>
                  <span className="text-slate-200">{receipt.captureId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Payment Method:</span>
                  <span className="text-[#FFC439]">
                    {selectedRail === 'paypal_pay_in_4'
                      ? 'PayPal Pay in 4 (Installments)'
                      : 'PayPal Instant Checkout'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Facility Settlement:</span>
                  <span className="text-white font-bold">
                    ₦{amountNgn.toLocaleString()} NGN ({currencyMeta.symbol}
                    {convertedAmount.toFixed(2)} {selectedCurrency})
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  setStep('review');
                  setReceipt(null);
                  onClose();
                }}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 transition"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Done — View Unlocked Care Status</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
