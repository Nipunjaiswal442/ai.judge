<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js 15" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Convex-DB-FF6F00?style=for-the-badge" alt="Convex" />
  <img src="https://img.shields.io/badge/Firebase-Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase Auth" />
  <img src="https://img.shields.io/badge/DeepSeek--v3.2-NVIDIA_NIM-76B900?style=for-the-badge&logo=nvidia" alt="NVIDIA NIM" />
  <img src="https://img.shields.io/badge/UI-Brutalism-6FA8FF?style=for-the-badge" alt="Brutalist UI" />
</p>

<h1 align="center">न्याय · Nyāya</h1>
<p align="center"><strong>AI-Assisted Case Analysis for Indian Consumer Disputes</strong></p>
<p align="center"><em>Clarity for the bench. Structure for the bar.</em></p>

---

> **⚠️ ADVISORY ONLY — NOT LEGAL ADVICE**
>
> Nyāya produces structured analysis to assist human review. It does **not** render verdicts, replace legal counsel, or substitute for judicial reasoning. This is an independent academic project; it is not affiliated with any court, bar council, or government body.

---

## The Problem

District Consumer Commissions (DCDRCs) under the Consumer Protection Act, 2019 are flooded. Lawyers file unstructured pleadings; judges spend meaningful time synthesizing scattered arguments before they can decide. No neutral structuring layer exists between the two sides and the bench.

## The Solution

Nyāya is a neutral case-structuring platform with three user roles:

| Role | What they do |
|---|---|
| **Judge** | Reviews the AI analysis brief, clicks through to sources, asks the Bench Assistant questions, acknowledges the case |
| **Complainant Counsel** | Files the case, answers a guided category-specific Q&A, attaches documents |
| **Opposing Counsel** | Joins invited cases, answers the same structured Q&A for the defence |

Once both sides submit, the system generates an **eight-section advisory brief**: case summary, agreed facts, disputed facts, applicable law, cited precedents (closed set — no fabrication), procedural flags, evidentiary gaps, and confidence + caveats.

## UI — Brutalist Design System

The interface is a custom **brutalist** design system, hand-written in CSS (no component library skin):

- **Zero border-radius** — every corner is square
- **Hard 2–3 px solid black borders** on all structural elements
- **Offset block shadows** (`4px 4px 0 #0a0a0a`) — no blur, no gradients
- **Flat raw-paper background** (`#f5f1e6`) with an **electric blue accent** (`#6fa8ff`)
- **Heavy uppercase labels**, monospace case IDs, buttons that physically "press down" on click
- Serif display type (Fraunces) for headlines, Inter for UI, JetBrains Mono for data

## Architecture

```
Browser (React 19 / Next.js 15 App Router)
  │
  ├── Firebase Auth (client SDK) ── email/password + Google popup
  │        │  ID token
  │        ▼
  ├── /api/auth/session ── firebase-admin verifies, sets httpOnly __session cookie (14d)
  ├── /api/auth/register ── creates the Convex user record (idempotent, role-safe)
  │
  ├── Server Components ── lib/serverUser.ts verifies the cookie per request
  │        │
  │        ▼
  ├── Convex ── users, cases, Q&A sessions, documents, briefs, precedents, audit log
  │        │
  │        ▼
  └── Convex actions ── DeepSeek-v3.2 via NVIDIA NIM for brief generation
                        and the judge's Bench Assistant
```

**Auth flow (getting in):** Firebase authenticates → the ID token is exchanged for a secure httpOnly session cookie → the Convex account is created/fetched (an existing account always keeps its original role) → role-based redirect to the right dashboard. Google sign-in uses a **popup**, so there is no redirect/callback dance.

**Auth flow (getting out):** sign-out clears the server cookie first, then Firebase client state, then lands on the homepage.

**Route protection:** edge middleware does a fast cookie-presence check; real cryptographic verification happens server-side in layouts on every request. Role guards redirect judges and lawyers to their own sections.

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Auth | Firebase Authentication (email/password + Google), firebase-admin session cookies |
| Database | Convex (real-time, typed schema) |
| LLM | DeepSeek-v3.2 via NVIDIA NIM (OpenAI-compatible API) |
| Styling | Custom brutalist CSS design system + Tailwind v4 compat layer |
| Hosting | Vercel (app) + Convex Cloud (data/functions) + Firebase (identity) |

## Project Structure

```
nyaya/
├── app/
│   ├── (marketing)/page.tsx        # Brutalist landing page
│   ├── (auth)/sign-in, sign-up     # Split-panel auth with 3-role selector
│   ├── (app)/judge/…               # Judge dashboard, brief viewer, bench assistant
│   ├── (app)/lawyer/…              # Lawyer dashboard, case wizard, guided Q&A
│   └── api/auth/session, register  # Session cookie + account provisioning
├── convex/                         # Schema, queries, mutations, LLM actions
├── lib/
│   ├── firebaseClient.ts           # Browser SDK (popup Google, email/password)
│   ├── firebaseAdmin.ts            # Server SDK (session cookie verification)
│   ├── serverUser.ts               # Cookie → Firebase UID → Convex user bridge
│   ├── authRoles.ts                # Role normalization + dashboard routing
│   └── llm.ts                      # DeepSeek brief + synthesis prompts
└── middleware.ts                   # Cookie-presence gate for protected routes
```

## Getting Started

```bash
cd nyaya
pnpm install

# 1. Convex — pushes schema + functions, prints your deployment URL
npx convex dev

# 2. Fill nyaya/.env.local (see table below)

# 3. Run
pnpm dev
```

## Environment Variables

| Variable | Where to get it | Where it's needed |
|---|---|---|
| `NEXT_PUBLIC_CONVEX_URL` | Convex dashboard | Vercel + local |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase Console → Project settings → Web app | Vercel + local |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | 〃 | Vercel + local |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | 〃 | Vercel + local |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | 〃 | Vercel + local |
| `FIREBASE_PROJECT_ID` | Service-account JSON (`project_id`) | Vercel + local |
| `FIREBASE_CLIENT_EMAIL` | Service-account JSON (`client_email`) | Vercel + local |
| `FIREBASE_PRIVATE_KEY` | Service-account JSON (`private_key`) — keep the `\n` sequences | Vercel + local |
| `NVIDIA_API_KEY` | build.nvidia.com | **Convex** (`npx convex env set`) |

> 🔒 `.env.local` is git-ignored. Never commit keys.

**Firebase console setup:** enable **Email/Password** and **Google** under Authentication → Sign-in method, and add your Vercel domain under Authentication → Settings → Authorized domains.

## Deployment (firebase-convex-vercel)

1. Push to `main` — Vercel builds `nyaya/` automatically
2. Add all the env vars above in Vercel → Settings → Environment Variables (all environments), then redeploy
3. `npx convex dev` (or `npx convex deploy` for prod) keeps the Convex deployment in sync
4. `/api/ping` and `/api/diag` report runtime + configuration health of a deployment

## Design Principles

- **No verdict generation** — the word "verdict" appears nowhere in the product
- **Closed-set precedents** — the AI cites only from a curated database; if nothing matches, it says so
- **Every claim traceable** — brief sections link back to submissions and precedent records
- **Confidence surfaced** — the model's uncertainty is a first-class UI element
- **Human-in-the-loop** — no case advances without explicit human acknowledgment
- **Audit-first** — every mutation is logged with user, timestamp, and entity

## License

Academic / portfolio project. Not licensed for production legal use.
