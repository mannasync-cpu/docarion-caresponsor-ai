import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Docarion CareSponsor AI — Diaspora Healthcare Guarantor & PayPal AI Billing Hub',
  description:
    'Cross-border diaspora healthcare guarantor portal, AI clinical bill & prescription auditor, and health-locked Care Wallet powered by PayPal Orders v2 & AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#040B14] text-slate-100 antialiased selection:bg-emerald-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
