# Devpost Submission Kit & 2.5-Minute YouTube Video Script

Use this guide to copy-paste your submission directly into the **PayPal AI Hackathon** portal on Devpost before **Thursday, November 12, 2026 at 3:00 PM EST (12:00 PM PST)**.

---

## 1. Ready-to-Paste Devpost Form Fields

### **Project Name**
`Docarion CareSponsor AI`

### **Elevator Pitch / Tagline (Under 200 characters)**
`Diaspora healthcare guarantor & AI medical bill auditor that verifies African hospital/pharmacy bills against ICD-10 guidelines and settles care instantly via PayPal Orders v2 & Health-Locked Wallets.`

### **Built With (Tags to Select on Devpost)**
`paypal`, `paypal-orders-api`, `react-paypal-js`, `google-gemini`, `ai`, `nextjs`, `typescript`, `tailwindcss`, `react`, `node.js`, `healthcare`, `fintech`

### **Full Project Description (Copy & Paste into Devpost)**

#### **Inspiration**
Across the African diaspora in the US, UK, Canada, and Europe, millions of professionals support the healthcare of aging parents and family members back home. Yet every medical episode starts the same way: a frantic WhatsApp message saying *"Mama is at a clinic—send money for lab tests and drugs."*
The family member abroad faces three painful problems:
1. **No Provider Visibility:** They don't know which hospital, pharmacy, or lab the patient visited, or how to pay that provider directly.
2. **Medical Overbilling & Unindicated Prescriptions:** Without clinical training or local price transparency, diaspora sponsors frequently pay bills inflated 2–3x with unnecessary IV antibiotics or duplicate administrative charges.
3. **Cross-Border Payment Friction & Cash Diversion:** International cards routinely fail on domestic African gateways, while cash remittances carry high fees and zero guarantee that funds are actually spent on chronic medications.

#### **What It Does**
**Docarion CareSponsor AI** introduces the **Diaspora Care Sponsor (Financial Guarantor)** role across the Docarion healthcare network, uniting **Clinical AI** and **PayPal Cross-Border Checkout**:
- **Automatic Care Circle Bill Routing:** Patients in Africa link family members abroad as their **Care Sponsor / Guarantor**. Any consultation, lab order, inpatient admission, or prescription generated at a connected provider routes automatically to the Sponsor's dashboard.
- **AI Clinical & Fair-Price Bill Auditor:** Before the Sponsor clicks **Pay with PayPal**, our AI engine audits every line item against **ICD-10 clinical indications** and **West African private hospital/pharmacy fair-tariff ceilings**. It strips unindicated medications (such as reserve IV carbapenems billed on an outpatient malaria visit), adjusts overpriced diagnostics to fair regional benchmarks, and writes a clear **Plain-English Family Summary**.
- **Instant PayPal Orders v2 & Pay in 4 Settlement (`USD`/`GBP`/`EUR`/`CAD` → `NGN`):** Sponsors pay in their local currency via PayPal. Capturing the PayPal order mints a cryptographic **Docarion Care Voucher (`DOC-PP-XXXX`)** that immediately unlocks the patient's pre-consultation or pharmacy dispensation gate at the facility in Africa.
- **Health-Locked Care Wallet & PayPal Chronic Auto-Reload:** Sponsors can pre-fund a family member's **Health-Locked Care Wallet** via PayPal (with category guardrails and recurring monthly PayPal auto-reload for chronic hypertension and diabetes refills). Funds are strictly locked to verified healthcare and cannot be cashed out.
- **CareSponsor AI Copilot:** A conversational AI agent that audits bills, estimates monthly chronic medication budgets, and prepares inline **PayPal Checkout** buttons directly in chat.

#### **How We Built It**
- **Frontend & Full-Stack Framework:** Next.js 14 (App Router), React 18, TypeScript, and Tailwind CSS.
- **PayPal Integration:** Integrated `@paypal/react-paypal-js` Smart Payment Buttons alongside backend Next.js API routes (`/api/paypal/create-order` and `/api/paypal/capture-order`) interfacing with PayPal's `/v2/checkout/orders` REST API, multi-currency conversion (`USD`, `GBP`, `EUR`, `CAD`), PayPal Pay in 4 installment support, and recurring chronic-care wallet auto-reloads.
- **AI Clinical & Tariff Engine:** Built `/api/ai/audit-bill` and `/api/ai/copilot` combining Google Gemini (`gemini-2.5-flash`) with a deterministic **ICD-10 Clinical Pharmacology & Regional Tariff Reference Engine** that evaluates diagnostic concordance and calculates exact line-item savings.

---

## 2. 🎬 2-Minute 30-Second YouTube Demo Video Script

Record your screen showing `http://localhost:3095` (or your deployed URL) following these 4 quick beats:

- **0:00 – 0:25 | The Hook & Problem:**
  *"Hi, I'm Dr. Godswill, founder of Docarion. Millions of people in the diaspora pay for their parents' and relatives' healthcare in Africa, but today they have to guess which hospital their family member went to, can't tell if a medical bill is inflated, and struggle with failed international card payments. We built **Docarion CareSponsor AI**—powered by **PayPal** and **Clinical AI**—to turn diaspora family members into verified Healthcare Financial Guarantors."*
- **0:25 – 1:15 | Live AI Clinical Bill Audit + PayPal Orders v2 Checkout (Tab 1):**
  - Show **Tab 1 (Diaspora Care Sponsor Hub)** and point to **Mama Ngozi Okafor's** live bill (`DOC-INV-2026-9041`) from *Lagos Lagoon Specialist Hospital* for `$64.20 USD (₦104,000 NGN)` with her **Pharmacy Dispensation Gate Locked**.
  - Click **"1. Run AI Clinical & Fair-Price Audit"**.
  - Point out how the AI verifies her malaria and blood pressure meds, but flags an unindicated IV Meropenem antibiotic (`₦42,000`) and a 2.5x overpriced Malaria RDT (`₦24,000 → ₦9,500`).
  - Click **"Apply AI Verified Fair-Price Adjustment (Save $34.88 USD)"**—dropping the bill from `$64.20` to `$29.32 USD`.
  - Click **"Pay $29.32 USD with PayPal"**, complete the PayPal Sandbox checkout in the modal, and show the minted **Docarion Care Voucher (`DOC-PP-XXXX`)** and the status flipping to **Gate Unlocked • Paid**!
- **1:15 – 1:50 | Health-Locked Care Wallet & Currency Switcher (Tab 2):**
  - Switch the top currency toggle from `USD` to `GBP` or `CAD` to show multi-currency diaspora support.
  - Open **Tab 2 (Health-Locked Care Wallet & Auto-Reload)**: show how Sponsors can toggle category spending guardrails (`Prescriptions`, `Consultations`, `Labs`—with `Cash Withdrawal Blocked`) and top up the wallet or enable monthly **PayPal Auto-Reload** for chronic hypertension and diabetes medications.
- **1:50 – 2:30 | African Provider Simulator & AI Copilot + PayPal Telemetry (Tabs 3 & 4):**
  - Open **Tab 3 (African Provider Simulator)**: click **"Dispatch Live Provider Bill"** to send a new Endocrinology bill from Africa to the Sponsor Hub.
  - Open **Tab 4 (CareSponsor AI Copilot & PayPal Inspector)**: click **"Audit Mama Ngozi's Bill"** in the AI Copilot chat, show the inline **Execute PayPal Checkout** card inside the AI response, and expand the **PayPal Orders v2 JSON Telemetry Inspector** on the right to prove live `/v2/checkout/orders` and `/capture` payloads.

---

## 3. How to Create Your Free PayPal Sandbox Client ID (60 Seconds)

1. Go to [https://developer.paypal.com/dashboard/applications/sandbox](https://developer.paypal.com/dashboard/applications/sandbox) and log in with your PayPal account.
2. Click the **"Default Application"** (or click **Create App** → name it `Docarion CareSponsor AI`).
3. Copy the **Client ID** and **Secret**.
4. Either paste the **Client ID** directly into the **"PayPal Sandbox Keys"** button in the top-right header of the web app, OR add both to `.env.local`:
   ```env
   NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_sandbox_client_id
   PAYPAL_CLIENT_ID=your_sandbox_client_id
   PAYPAL_CLIENT_SECRET=your_sandbox_secret
   ```
