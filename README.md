<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Convex-DB-FF6F00?style=for-the-badge" alt="Convex" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase Auth" />
  <img src="https://img.shields.io/badge/DeepSeek--v3.2-NVIDIA_NIM-76B900?style=for-the-badge&logo=nvidia" alt="NVIDIA NIM" />
  <img src="https://img.shields.io/badge/UI-Brutalism-6FA8FF?style=for-the-badge" alt="Brutalist UI" />
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel" alt="Vercel" />
</p>

<h1 align="center">न्याय · Nyāya</h1>
<p align="center"><strong>AI-Assisted Case Analysis for Indian Consumer Disputes</strong></p>
<p align="center"><em>Clarity for the bench. Structure for the bar.</em></p>

---

> **⚠️ ADVISORY ONLY — NOT LEGAL ADVICE**
>
> Nyāya produces structured analysis to assist human review. It does **not** render verdicts, replace legal counsel, or substitute for judicial reasoning. This is an independent academic project; it is not affiliated with any court, bar council, or government body.

---

## 📋 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Key Features](#-key-features)
- [UI Design System — Brutalism](#-ui-design-system--brutalism)
- [System Architecture](#-system-architecture)
- [Authentication Flow](#-authentication-flow)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [API Routes](#-api-routes)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Firebase Console Setup](#-firebase-console-setup)
- [Deployment to Vercel](#-deployment-to-vercel)
- [Troubleshooting](#-troubleshooting)
- [Case Categories](#-case-categories)
- [How It Works](#-how-it-works)
- [Design Principles](#-design-principles)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔍 The Problem

Consumer district commissions in India face immense backlogs:

| Challenge | Impact |
|-----------|--------|
| **Unstructured submissions** | Each party files material in a different format — no enforced schema ensures both sides address the same core questions |
| **Cognitive load on judges** | Judges spend significant time manually synthesizing scattered arguments, identifying disputed facts, and locating applicable precedents |
| **Slow disposal times** | The CPA 2019 targets timely disposal, but many commissions struggle to meet statutory timelines |

No neutral structuring layer exists between lawyers and judges.

---

## 💡 The Solution

**Nyāya** is a neutral case-structuring layer that sits between counsel and the bench:

- **For Lawyers** → Guided question flows aligned to the Consumer Protection Act (CPA) 2019 ensure nothing is missed in submissions
- **For Judges** → An 8-part advisory brief highlighting agreed facts, disputed claims, applicable law, and relevant precedents — entirely traceable to source inputs
- **For the System** → Zero autonomous decision-making. No verdict generation. Explicit caveats on every output.

### Three User Roles

| Role | Registration | What they do |
|---|---|---|
| **Judge** | Own selector card at sign-up | Reviews the AI analysis brief, clicks through to sources, asks the Bench Assistant questions, acknowledges cases |
| **Complainant Counsel** | Own selector card at sign-up | Files cases through the 4-step wizard, answers guided Q&A, attaches documents |
| **Opposing Counsel** | Own selector card at sign-up | Joins invited cases, answers the same structured Q&A for the defence |

Both counsel types map to the `LAWYER` role in the database (complainant vs. opposing is a per-case relationship); judges map to `JUDGE`. **An existing account always keeps its original role** — selecting a different role card at sign-in never mutates a stored account.

---

## ✨ Key Features

### Role-Based Workspaces
- **Lawyer Dashboard** — Stat tiles, case table with progress bars, filter/search, file new cases, track matter status
- **Judge Dashboard** — Assigned case queue with priority card, bench assistant chat, brief review workflow

### Dynamic Legal Scaffolding
- 6 CPA case categories (Defective Goods, Deficient Services, Unfair Trade Practices, E-commerce, Misleading Ads, Medical Negligence)
- Each category maps to 6+6 curated evidentiary questions for both parties

### AI Analysis Brief (8 Sections)
1. **Case Summary** — Neutral overview of the dispute
2. **Agreed Facts** — Points both sides concur on
3. **Disputed Facts** — Side-by-side comparison of each party's position
4. **Applicable Law** — Relevant statutes and sections from CPA 2019
5. **Cited Precedents** — From a curated, verified set (no hallucinated citations)
6. **Procedural Flags** — Limitation, jurisdiction, or procedural issues
7. **Evidentiary Gaps** — Missing evidence or unanswered questions
8. **Caveats & Confidence** — Explicit disclaimers and model confidence scoring

### 3-Pane Q&A Interface
- **Left**: question navigator grouped by side (Complainant / Opposing), completion badges, overall progress bar
- **Center**: active question with editable answer area (auto-save on blur) or locked submitted view, AI follow-up notes
- **Right**: parties panel, case details, Nyāya assistant hint

### 3-Pane Brief Viewer
- **Left TOC**: numbered section list with confidence dots, confidence ring display, bench action buttons (Acknowledge / Flag / Export PDF)
- **Center**: section body with section-type-aware rendering (prose, checklist, side-by-side, law clauses, precedent cards, procedural flags grid), private judge notes
- **Right Source Viewer**: model trace, statute text, or cited precedent with key paragraph

### 4-Step New Case Wizard
- **Step 0** — Category selection (6 cards with icon + name + desc), Q&A template preview
- **Step 1** — Parties & metadata (2-col grid: names, addresses, jurisdiction, claim, relief)
- **Step 2** — Invite opposing counsel (email, Bar ID, deadline, email preview panel)
- **Step 3** — Review & confirm (summary grid, advisory acknowledgment, file CTA)

### Judge Bench Assistant
- Interactive Q&A powered by DeepSeek v3.2 for case-specific synthesis
- Grounded only in submitted material — never fabricates

---

## 🎨 UI Design System — Brutalism

Nyāya's interface is a fully custom, hand-written **brutalist** CSS design system. No component-library skin, no gradients, no blur, no rounded corners.

### The Rules

| Rule | Implementation |
|------|----------------|
| **Zero border-radius** | `--radius: 0` — every corner in the app is square, including dialogs, badges, and inputs |
| **Hard black borders** | 2 px solid `#0a0a0a` on all structural elements; 3 px on dialogs and page headers |
| **Offset block shadows** | `4px 4px 0 #0a0a0a` — pure offset, zero blur; large surfaces get `8px 8px 0` |
| **Flat colors only** | No gradients anywhere; every fill is a single flat value |
| **Loud accent** | Electric blue `#6fa8ff` for the brand block, active nav, table headers, selection highlights |
| **Heavy type** | Uppercase 800-weight labels, buttons, and table headers; monospace case IDs |
| **Physical buttons** | `:active` translates the button into its own shadow (`translate(2px, 2px)` + shadow removed) — buttons visibly "press down" |

### Design Tokens

```css
/* Raw paper base */
--paper:   #f5f1e6;   --paper-2: #ece7d8;
--ink-900: #0a0a0a;   --surface: #ffffff;

/* Structure */
--border:  #0a0a0a;               /* everything gets a black border */
--radius:  0;                     /* nothing is rounded */
--shadow:      4px 4px 0 #0a0a0a; /* hard offset, no blur */
--shadow-xl:  10px 10px 0 #0a0a0a;

/* Accent + semantics (flat + loud) */
--accent:   #6fa8ff;  /* electric blue */
--green-bg: #7dffb3;  --red-bg: #ffb3b3;
--amber-bg: #ffd23e;  --blue-bg: #a3c2ff;

/* Typography */
--serif: 'Fraunces', Georgia, serif;   /* display */
--sans:  'Inter', system-ui;           /* UI */
--mono:  'JetBrains Mono', monospace;  /* data */
```

### App Shell

```
┌─ Topbar (56px, 2px black bottom border) ─────────────────────┐
│  [BLUE BLOCK: Chakra + Nyāya]  │  BREADCRUMB  │  User chip   │
├─ Sidebar (240px) ───────┬────────────────────────────────────┤
│  Role-based nav links   │   Content area (scrollable)        │
│  (active = blue block   │   .page or .qa-shell / .brief-     │
│   with hard shadow)     │   shell (full-height 3-pane)       │
│  Advisory pill footer   │                                    │
└─────────────────────────┴────────────────────────────────────┘
```

### Key CSS Classes

| Class | Description |
|-------|-------------|
| `.app` | Root grid: `56px 1fr` rows, `100vh` height |
| `.main` | Sidebar + content grid: `240px 1fr` |
| `.qa-shell` | 3-pane Q&A: `280px 1fr 320px` |
| `.brief-shell` | 3-pane brief: `320px 1fr 1fr` |
| `.signin` | Split auth: `1.1fr 1fr`, black art panel with 4px blue divider |
| `.page` | Padded content container with `max-width: 1400px` |
| `.card`, `.stat` | White cards with 2px border + hard shadow |
| `.tbl` | Data table — blue header band, 2px row separators |
| `.badge` | Square status chips, uppercase, 2px border |
| `.btn` | Button system (primary / ghost / danger / sm / lg) with press-down active state |
| `.stepper`, `.pip-num` | Square step pips, mono numerals |
| `.cat-grid`, `.cat-card` | Role/category selection cards (selected = blue fill) |
| `.bar` | Bordered progress bar, flat fill |

### Ashoka Chakra Brand Mark

A reusable `<Chakra />` SVG component (`components/ui/chakra.tsx`) renders a 24-spoke Ashoka Chakra at configurable size and stroke weight. Used in the topbar brand block, sign-in art panel, and as decorative watermarks.

---

## 🏗 System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        Client (Browser)                        │
│   Next.js 15 App Router · React 19 · Brutalist CSS System      │
│   Firebase client SDK (popup OAuth) · Convex React SDK         │
└────────────┬──────────────────────────────┬────────────────────┘
             │ ID token                     │ realtime queries
             ▼                              ▼
┌────────────────────────┐    ┌────────────────────────────────┐
│    Firebase Auth        │    │        Convex (BaaS)           │
│  ┌───────────────────┐  │    │  ┌──────────────────────────┐  │
│  │ Email / password  │  │    │  │ Realtime Database        │  │
│  │ Google (popup)    │  │    │  │ Serverless Functions     │  │
│  └───────────────────┘  │    │  │ Vector Search (768-dim)  │  │
└────────────┬────────────┘    │  │ File Storage             │  │
             │                 │  └────────────┬─────────────┘  │
             ▼                 └───────────────┼────────────────┘
┌────────────────────────┐                     │ "use node" action
│  Next.js API routes     │                    ▼
│  (Vercel functions)     │        ┌─────────────────────┐
│  /api/auth/session ─────┤        │   NVIDIA NIM API    │
│    firebase-admin       │        │   DeepSeek v3.2     │
│    verifies ID token,   │        │   (JSON-enforced)   │
│    mints 14-day         │        └─────────────────────┘
│    httpOnly __session   │
│  /api/auth/register ────┤
│    creates Convex user  │
└────────────────────────┘
```

**Division of labor across the three clouds:**

| Cloud | Responsibility |
|---|---|
| **Firebase** | Identity only — passwords, Google OAuth, ID tokens, session cookie minting/verification |
| **Convex** | All application data — users, cases, Q&A, documents, briefs, precedents, audit log — plus the LLM actions |
| **Vercel** | Hosting, serverless API routes, edge middleware, server-side rendering |

---

## 🔐 Authentication Flow

### Getting in (email/password or Google)

```
1. Client: Firebase SDK authenticates
     · signInWithEmailAndPassword / createUserWithEmailAndPassword
     · signInWithPopup(GoogleAuthProvider)  ← popup, no redirect dance
2. Client → POST /api/auth/session { idToken }
     · firebase-admin verifies the ID token
     · mints a 14-day session cookie
     · sets it as httpOnly, Secure, SameSite=Lax  →  "__session"
3. Client → POST /api/auth/register { name, role }
     · verifies the session cookie
     · creates the Convex user record (idempotent)
     · existing accounts keep their stored role
     · responds with the correct dashboard URL for the account's role
4. Client: router.replace(dashboardUrl)
```

### Per-request protection

```
Edge middleware  →  fast __session cookie-presence check
                    (public: /, /sign-in, /sign-up, /api/auth/*)
Server layouts   →  lib/serverUser.ts
                    · cryptographically verifies the session cookie
                    · resolves Firebase UID → Convex user (React cache()
                      dedupes across components in one request)
                    · lazy-creates the Convex record for OAuth first-logins
Role guards      →  /judge/* requires JUDGE; /lawyer/* requires LAWYER;
                    wrong role = redirect to your own dashboard
```

### Getting out

```
SignOutButton → DELETE /api/auth/session   (clears the httpOnly cookie)
             → firebase signOut()          (clears client SDK state)
             → router.replace("/")         (lands on the homepage)
```

Server state is cleared **before** client state, so there is no window where the UI looks signed-out but the server still accepts the cookie.

---

## 🛠 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router + Turbopack) | Server components, API routes, SSR |
| **UI** | [React 19](https://react.dev/) | Component rendering |
| **Styling** | Custom brutalist CSS design system (+ Tailwind v4 compat layer) | Square, bordered, hard-shadow aesthetic |
| **Auth** | [Firebase Authentication](https://firebase.google.com/products/auth) + [firebase-admin](https://firebase.google.com/docs/admin/setup) | Email/password + Google popup; server-side session cookies |
| **Database** | [Convex](https://convex.dev/) | Realtime DB, serverless functions, vector search, file storage |
| **LLM** | [NVIDIA NIM](https://build.nvidia.com/) (DeepSeek v3.2) | Brief generation, judge synthesis, JSON-enforced outputs |
| **Validation** | [Zod](https://zod.dev/) | Runtime type checking |
| **Hosting** | [Vercel](https://vercel.com/) | App + API routes + edge middleware |

---

## 📁 Project Structure

```
ai.judge/
├── README.md
└── nyaya/                      ← Main Next.js application
    ├── middleware.ts            ← Cookie-presence gate for protected routes
    ├── next.config.ts           ← outputFileTracingRoot pinned (Vercel bundling)
    ├── app/
    │   ├── globals.css          ← Full brutalist design system (tokens + classes)
    │   ├── layout.tsx           ← Root layout (fonts + ConvexClientProvider)
    │   ├── error.tsx            ← Brutalist error boundary w/ session reset
    │   ├── (marketing)/         ← Brutalist landing page
    │   ├── (auth)/
    │   │   ├── sign-in/         ← Split-panel: 3 role cards + email/Google
    │   │   └── sign-up/         ← Split-panel: 3 role cards + registration
    │   ├── (app)/
    │   │   ├── layout.tsx       ← App shell: topbar + sidebar (force-dynamic)
    │   │   ├── lawyer/
    │   │   │   ├── layout.tsx   ← LAWYER role guard
    │   │   │   ├── dashboard/   ← Stats + case table + activity feed
    │   │   │   └── cases/
    │   │   │       ├── new/     ← 4-step case filing wizard
    │   │   │       └── [caseId]/← 3-pane Q&A interface
    │   │   └── judge/
    │   │       ├── layout.tsx   ← JUDGE role guard
    │   │       ├── dashboard/   ← Stats + queue + priority + bench assistant
    │   │       └── cases/
    │   │           └── [caseId]/← 3-pane analysis brief viewer
    │   └── api/
    │       ├── auth/session/    ← POST: idToken → session cookie · DELETE: sign out
    │       ├── auth/register/   ← POST: create Convex user (idempotent, role-safe)
    │       ├── ping/            ← Zero-dependency runtime liveness probe
    │       └── diag/            ← Env/config health report (no secrets leaked)
    ├── components/ui/
    │   ├── chakra.tsx           ← Ashoka Chakra SVG brand mark (24 spokes)
    │   └── SignOutButton.tsx    ← Cookie + Firebase sign-out
    ├── convex/                  ← Convex backend
    │   ├── schema.ts            ← Database schema (8 tables, authId index)
    │   ├── users.ts             ← getUserByAuthId / createUser
    │   ├── cases.ts             ← Case CRUD
    │   ├── qa.ts                ← Q&A session management
    │   ├── analysis.ts          ← "use node" LLM actions (brief + synthesis)
    │   ├── analysisData.ts      ← Queries/mutations used by the actions
    │   ├── judge.ts             ← Judge-specific queries
    │   ├── precedents.ts        ← Precedent management & vector search
    │   ├── documents.ts         ← File upload/storage
    │   └── audit.ts             ← Audit logging
    └── lib/
        ├── firebaseClient.ts    ← Browser SDK init (popup Google provider)
        ├── firebaseAdmin.ts     ← Admin SDK init + private-key normalization
        ├── serverUser.ts        ← Session cookie → Convex user bridge (cached)
        ├── authRoles.ts         ← Role normalization + dashboard routing
        ├── llm.ts               ← NVIDIA NIM / DeepSeek integration (lazy client)
        ├── caseCategories.ts    ← CPA categories & Q&A question templates
        └── prompts/             ← LLM system prompts
```

---

## 🗄 Database Schema

Eight Convex tables, fully typed:

| Table | Key fields | Purpose |
|---|---|---|
| `users` | `authId` (Firebase UID, indexed), `email`, `name`, `role` | Account records bridged from Firebase |
| `cases` | `humanId`, `category`, `status` (6-state machine), party ids, `claimAmount`, `deadline` | Case lifecycle |
| `qaSessions` | `caseId`, `side` (COMPLAINANT/OPPOSING), `status` | One guided Q&A per side |
| `qaEntries` | `sessionId`, `questionText`, `answerText`, `attachmentIds`, AI follow-up flags | Individual answers |
| `documents` | `caseId`, `storageId`, `filename`, `mimeType` | Evidence files in Convex storage |
| `analysisBriefs` | 8 structured sections, `confidenceScore`, `caveats`, `judgeAcknowledged`, `judgeNotes` | The generated advisory brief |
| `precedents` | `citation`, `summary`, `cpaSections`, 768-dim `embedding` (vector index) | Curated closed-set precedent library |
| `auditLogs` | `userId`, `action`, `entityType`, `entityId`, `timestamp` | Every mutation, reconstructable |

**Case status machine:** `DRAFT → AWAITING_OPPOSING → OPPOSING_IN_PROGRESS → READY_FOR_BRIEF → BRIEF_GENERATED → JUDGE_REVIEWED`

---

## 🔌 API Routes

| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/auth/session` | POST | Firebase ID token | Verifies the token, mints a 14-day httpOnly `__session` cookie |
| `/api/auth/session` | DELETE | — | Clears the session cookie (sign-out) |
| `/api/auth/register` | POST | Session cookie | Creates the Convex user (idempotent); returns the role-correct dashboard URL |
| `/api/ping` | GET | Public | Zero-dependency liveness probe (`node` version + timestamp) |
| `/api/diag` | GET | Public | Config health: env-var presence flags, firebase-admin import check, service-account key parse check, Convex client check — **no secret values are returned** |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.17
- **pnpm** (recommended) or npm
- A [Firebase project](https://console.firebase.google.com) (free Spark plan is fine)
- A [Convex account](https://dashboard.convex.dev)
- An [NVIDIA API Key](https://build.nvidia.com/) for DeepSeek v3.2

### 1. Clone & Install

```bash
git clone https://github.com/Nipunjaiswal442/ai.judge.git
cd ai.judge/nyaya
pnpm install
```

### 2. Initialize Convex

In a **separate terminal**, start the Convex dev server to sync your database schema and push serverless functions:

```bash
npx convex dev
```

> On first run, you'll be prompted to log in to Convex and select/create a project. Copy the deployment URL it prints.

Set the LLM key on the **Convex** deployment (actions run on Convex servers, not Vercel):

```bash
npx convex env set NVIDIA_API_KEY "nvapi-..."
```

### 3. Configure Environment

Create `nyaya/.env.local` and populate it (see [Environment Variables](#-environment-variables)).

### 4. Run the Dev Server

```bash
pnpm dev    # Turbopack, near-instant HMR
```

Open [http://localhost:3000](http://localhost:3000). `localhost` is pre-authorized in Firebase, so Google sign-in works immediately.

---

## 🔐 Environment Variables

Create a `.env.local` file in the `nyaya/` directory:

```bash
# ── Convex ──
NEXT_PUBLIC_CONVEX_URL="https://your-deployment.convex.cloud"

# ── Firebase client (Console → Project settings → Your apps → Web app) ──
NEXT_PUBLIC_FIREBASE_API_KEY="AIza..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project"
NEXT_PUBLIC_FIREBASE_APP_ID="1:1234567890:web:abc123"

# ── Firebase admin (Console → Project settings → Service accounts →
#    Generate new private key → values from the downloaded JSON) ──
FIREBASE_PROJECT_ID="your-project"                       # json: project_id
FIREBASE_CLIENT_EMAIL="firebase-adminsdk-...@....iam.gserviceaccount.com"  # json: client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"  # json: private_key

# ── NVIDIA AI (DeepSeek v3.2 via NIM) — also set on Convex! ──
NVIDIA_API_KEY="nvapi-..."
```

> 🔒 `.env.local` is git-ignored. Never commit keys.
>
> 📝 The private key can be pasted **with or without** surrounding quotes and with either literal `\n` sequences or real newlines — `lib/firebaseAdmin.ts` normalizes all common paste formats automatically.

---

## 🔥 Firebase Console Setup

1. **Create a project** at [console.firebase.google.com](https://console.firebase.google.com)
2. **Enable providers**: Build → Authentication → Sign-in method →
   - ✅ **Email/Password**
   - ✅ **Google**
3. **Register a Web app**: Project settings → Your apps → `</>` — this gives you the four `NEXT_PUBLIC_FIREBASE_*` values
4. **Generate a service account key**: Project settings → Service accounts → **Generate new private key** — this gives you the three server values
5. **Authorize your domains**: Authentication → Settings → Authorized domains → add your Vercel domain (e.g. `your-app.vercel.app`). `localhost` is pre-authorized.

---

## 🌐 Deployment to Vercel

1. **Connect** the GitHub repository to [Vercel](https://vercel.com)
2. **Set Root Directory** to `nyaya` (critical — the Next.js app is inside a subfolder)
3. **Add all environment variables** from the table above in Project Settings → Environment Variables (Production + Preview + Development)
   - For `FIREBASE_PRIVATE_KEY`, paste the full value in one line — the code tolerates quotes and `\n` sequences
4. **Deploy** — every push to `main` builds automatically
5. **Keep Convex in sync** — run `npx convex dev` (dev) or `npx convex deploy` (prod) after changing anything in `convex/`

> ⚠️ Env-var changes only take effect on the **next deployment** — redeploy after adding them.

---

## 🩺 Troubleshooting

| Symptom | Diagnosis | Fix |
|---|---|---|
| `auth/auth-domain-config-required` on Google sign-in | `NEXT_PUBLIC_FIREBASE_*` vars missing at build/start time | Restart the dev server; on Vercel, add the vars and redeploy |
| "Server is missing environment variables: FIREBASE_…" | Admin vars absent on the server | Add them in Vercel for the right environment, redeploy |
| "Session failed: Failed to parse private key" | `FIREBASE_PRIVATE_KEY` malformed | Re-paste from the service-account JSON (normalization handles quotes/`\n`) |
| Every API route returns an HTML 500 page | Serverless bundling broken (workspace-root misdetection) | Already pinned via `outputFileTracingRoot` in `next.config.ts` |
| `Could not find public function for 'users:…'` | Convex deployment out of sync with `convex/` code | Run `npx convex dev` (or `deploy`) |
| Google popup closes with no error | Domain not authorized | Firebase Console → Authentication → Settings → Authorized domains |

**First stops:** `https://<your-app>/api/ping` (is the runtime alive?) and `https://<your-app>/api/diag` (which env var or config step is broken?). Neither endpoint exposes secret values.

---

## 📂 Case Categories

Nyāya supports 6 consumer dispute categories under the CPA 2019, each with curated questions for both sides:

| Category | Complainant Questions | Opposing Questions |
|----------|:--------------------:|:------------------:|
| Defective Goods | 6 | 6 |
| Deficient Services | 6 | 6 |
| Unfair Trade Practices | 6 | 6 |
| E-commerce Disputes | 6 | 6 |
| Misleading Advertisements | 6 | 6 |
| Medical Negligence (Consumer) | 6 | 6 |

---

## ⚙️ How It Works

### Stage 1 — File the case *(Complainant Counsel)*
Select the dispute category, enter party details and relief sought through the 4-step wizard. The system generates a human-readable case ID (`CPA-2026-DCDRC-…`) and invites opposing counsel by email.

### Stage 2 — Structured Q&A *(Both counsel, independently)*
Each side answers category-specific questions in the 3-pane interface. Answers auto-save; documents attach per question. The AI flags vague or incomplete answers with follow-up notes. Neither side sees the other's draft.

### Stage 3 — Brief generation *(System)*
Once both sides submit, a Convex `"use node"` action calls DeepSeek v3.2 via NVIDIA NIM with a JSON-enforced prompt. Precedents come **only** from the curated vector-indexed library — if nothing matches, the brief says so. The result is validated, defaulted, and stored.

### Stage 4 — Judicial review *(Judge)*
The judge reads the 8-section brief in the 3-pane viewer, clicks any claim through to its source, asks the Bench Assistant free-form questions grounded in the record, adds private notes, and acknowledges the case. **The judicial order remains entirely the judge's.**

---

## 🧭 Design Principles

- **No verdict generation** — the word "verdict" appears nowhere in the product UI
- **Closed-set precedents** — the AI may only cite from a curated, manually reviewed database; no fabrication
- **Every claim traceable** — brief sections link back to lawyer submissions and precedent records, one click away
- **Confidence surfaced** — the model's self-reported uncertainty is a first-class UI element, not fine print
- **Human-in-the-loop** — no case advances without explicit human acknowledgment at each stage
- **Audit-first** — every mutation is logged with user, timestamp, and entity; full case history is reconstructable
- **Role integrity** — roles are stored server-side and never mutated by sign-in-time selections

---

## 🤝 Contributing

This is an academic/portfolio MVP. Issues and pull requests are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit with clear messages
4. Open a PR describing **what** changed and **why**

Please keep the design principles intact — especially the no-verdict rule and closed-set precedent citation.

---

## 📄 License

Academic / portfolio project by a VIT-AP student. Not licensed for production legal use without formal legal review. Not affiliated with any court, bar council, or government body.

---

<p align="center">
  <sub>Built with Next.js · Firebase · Convex · Vercel · NVIDIA NIM — styled in unapologetic brutalism</sub>
</p>
