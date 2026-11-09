# Devpost Submission Kit & 2.5-Minute YouTube Video Script

Use this guide to copy-paste your submission directly into the **PayPal AI Hackathon** portal on Devpost before **Thursday, November 12, 2026 at 3:00 PM EST (12:00 PM PST)**.

---

## 1. Ready-to-Paste Devpost Form Fields

### **Project Name**
`Docarion CareSponsor AI`

### **Elevator Pitch / Tagline (Under 200 characters)**
`Agentic PayPal + Clinical AI engine for cross-border diaspora healthcare: autonomous 3AM bill auditing & settlement, lab-triggered staged PayPal escrow, and multi-sibling USD/GBP/CAD pool splits.`

### **Built With (Tags to Select on Devpost)**
`paypal`, `paypal-orders-api`, `react-paypal-js`, `google-gemini`, `agentic-ai`, `nextjs`, `typescript`, `tailwindcss`, `react`, `node.js`, `healthcare`, `fintech`

### **Full Project Description (Copy & Paste into Devpost)**

#### **Inspiration**
Across the African diaspora in the US, UK, Canada, and Europe, millions of people pay for the healthcare of aging parents and relatives back home. Yet a standard "click a button to pay" checkout fails in real clinical emergencies for **four reasons**:
1. **The 3:00 AM Time-Zone Trap:** When Mama arrives at a clinic in Lagos at **9:15 AM WAT**, her son in Houston or California is asleep at **2:15 AM**. She sits on a hospital bench for 5 hours waiting for him to wake up and approve a `$29` pharmacy bill.
2. **Medical Overbilling & Unindicated Drugs:** Without clinical training or local price benchmarks, family members abroad routinely pay bills inflated 2–3x with clinically unindicated IV antibiotics or duplicate fees.
3. **Upfront Drug Billing Before Lab Results:** Clinics often charge for both diagnostic lab tests and expensive medications upfront before knowing if the lab result is even positive.
4. **Single-Sponsor Diaspora Burden:** One sibling abroad usually gets stuck paying 100% of every medical bill because splitting payments across siblings in the US (`USD`), UK (`GBP`), and Canada (`CAD`) on WhatsApp is chaotic.

#### **What It Does — 3 Agentic PayPal + AI Breakthroughs**
Instead of using PayPal as a passive checkout button, **Docarion CareSponsor AI** turns **PayPal Orders v2** into an **autonomous, clinically governed programmable payment engine** where the AI Agent controls *when*, *how much*, and *under what clinical proof* PayPal moves money:

1. **🌙 Autonomous "3:00 AM While You Sleep" AI PayPal Mandate (Zero-Click Agentic Settlement):**
   - Diaspora sponsors set a **Programmable AI PayPal Mandate**: *"Auto-settle bills up to `$60 USD` via PayPal while I'm asleep **only if** the AI Clinical Auditor confirms `≥ 90%` ICD-10 diagnosis-to-drug match and strips any overbilled items."*
   - When a doctor in Lagos signs the chart at 9:15 AM WAT (2:15 AM Houston), the AI Agent autonomously audits the bill against **ICD-10 guidelines**, strips unindicated drugs (`₦42,000` IV Meropenem removed) and caps overpriced labs (`₦24,000 → ₦9,500`), reducing the bill from **`$64.20` to `$29.32 USD`** (a **54% savings**).
   - Because `$29.32 ≤ $60.00`, the AI Agent autonomously executes `POST /v2/checkout/orders` and `/capture` against the **live PayPal Sandbox API** in 2 seconds—unlocking Mama's medication immediately while her sponsor sleeps!

2. **🧪 Clinical-Proof Staged Release (Lab-Result-Triggered PayPal Escrow):**
   - Instead of paying for both lab tests and medications blindly upfront, the AI splits the PayPal settlement into **2 Clinical-Proof Tranches**:
     - **Tranche 1 (Consultation + Lab Gate — `$15.12 USD`):** AI immediately creates & captures **PayPal Order #1 (`$15.12 USD`)** to unlock the Lab Gate for the Malaria RDT blood test.
     - **Tranche 2 (Pharmacy Medications — `$14.20 USD` Held in Escrow):** Held until the EMR lab result is posted. If the Malaria RDT posts **`Positive (+)`**, the AI automatically executes **PayPal Order #2 (`$14.20 USD`)** to release the medications. If **`Negative (-)`**, the AI automatically **voids Tranche 2**, saving the sponsor `$14.20 USD`!

3. **👨‍👩‍👧‍👦 AI Multi-Sibling Diaspora Pool Split (`USD` + `GBP` + `CAD` → `100% NGN`):**
   - The AI Agent automatically splits verified medical bills across siblings in their own local currencies and dispatches **3 parallel live PayPal Sandbox Orders** (`Chidi in US: 50% in USD`, `Adaeze in UK: 30% in GBP`, `Obinna in Canada: 20% in CAD`), aggregating them into a single instant `₦47,500 NGN` hospital settlement voucher (`DOC-POOL-XXXX`).

#### **How We Built It**
- **Full-Stack Framework:** Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS.
- **Live PayPal Developer Sandbox Integration:** Integrated `@paypal/react-paypal-js` alongside backend API routes (`/api/paypal/create-order` and `/api/paypal/capture-order`) authenticating via OAuth2 (`POST https://api-m.sandbox.paypal.com/v1/oauth2/token`) and creating/capturing live orders via `POST /v2/checkout/orders` across `USD`, `GBP`, `EUR`, and `CAD`.
- **Clinical AI & Tariff Engine:** Built `/api/ai/audit-bill` combining Google Gemini (`gemini-2.5-flash`) with a deterministic **ICD-10 Clinical Pharmacology & West African Hospital Fair-Tariff Engine**.

---

## 2. 🎬 2-Minute 30-Second YouTube Demo Video Script

Record your screen at **`http://localhost:3095`** following these crisp beats:

- **0:00 – 0:25 | The Hook & Why Passive Checkout isn't Enough:**
  *"Hi, I'm Dr. Godswill, founder of Docarion. Millions of diaspora families pay for healthcare back home in Africa. But when Mama arrives at a clinic in Lagos at 9 AM, her son in Houston is asleep at 2 AM—and hospital bills are frequently inflated 2x with unnecessary drugs. Instead of just adding a standard PayPal checkout button, we built **Docarion CareSponsor AI**—an **Agentic PayPal + Clinical AI engine** where AI governs when, how much, and under what clinical proof PayPal moves money."*
- **0:25 – 0:50 | Pages 1 & 2 — Patient Invites Sponsor & Dispatches a Detailed Bill:**
  - Click **Page 1 (Patient Dashboard)**: show how Mama Ngozi in Lagos invites her son Chidi in Houston as her Care Sponsor and sends an itemized hospital & pharmacy bill (`DOC-INV-2026-9041`, originally `$64.20 USD / ₦104,000 NGN`).
  - Click **Page 2 (Sponsor Invitation)**: show how Chidi sees and accepts the Care Sponsor invitation.
- **0:50 – 1:55 | Page 3 — The 3 Agentic PayPal + AI Innovations (The Star of the Demo!):**
  - Open **Page 3 (Agentic PayPal & Bills)** and point to the **Agentic PayPal + Clinical AI Command Center**:
  - **Mode 1 (`🌙 3:00 AM Autonomous AI Mandate`):** Click **"Simulate 3:00 AM Lagos Bill Arrival & Autonomous PayPal Settlement"**. Watch the 4-step live pipeline: AI audits the ICD-10 diagnosis, strips the unindicated `₦42,000` IV antibiotic and caps the overpriced Malaria test (cutting the bill from `$64.20` to `$29.32 USD`), verifies it's under Chidi's `$60` sleep ceiling, and autonomously executes a live **PayPal Sandbox Order** (`mode: paypal_sandbox_live_api`)—unlocking Mama's medication while Chidi sleeps!
  - **Mode 2 (`🧪 Clinical-Proof Staged Release`):** Switch to Mode 2. Click **"Execute Stage 1 PayPal Order ($15.12 USD — Consult + Lab)"** to unlock the Lab Gate while keeping `$14.20 USD` for drugs held in escrow. Then click either **"Simulate Lab Result: POSITIVE (+)"** (watch AI auto-capture Tranche 2 via PayPal) or **"Simulate Lab Result: NEGATIVE (-)"** (watch AI auto-void Tranche 2 so the sponsor pays `$0` for unneeded drugs).
  - **Mode 3 (`👨‍👩‍👧‍👦 Multi-Sibling Diaspora Split`):** Switch to Mode 3 and click **"Execute 3-Sibling Multi-Currency PayPal Pool Split"**. Watch it create **3 live PayPal Sandbox Orders** in `USD` (`$14.66`), `GBP` (`£6.95`), and `CAD` (`CA$7.98`) and settle `100% NGN` to the hospital!
- **1:55 – 2:30 | Pages 4, 5 & 6 — Health-Locked Wallet, Visit Records & Live PayPal Telemetry:**
  - Click through **Page 4 (Fund Care Wallet)**, **Page 5 (Patient Visit Records & Rx)**, and **Page 6 (Transactions & Live PayPal API Log)**—pointing to the real PayPal Sandbox Order IDs from `api-m.sandbox.paypal.com`.
