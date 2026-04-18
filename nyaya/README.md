# Nyāya: AI-Assisted Case Analysis for Consumer Disputes

![Nyāya Platform](https://raw.githubusercontent.com/Nipunjaiswal442/ai.judge/main/assets/nyaya-hero.webp)

> **ADVISORY ONLY — NOT LEGAL ADVICE**
>
> *Nyāya produces structured analysis to assist human review. It does not render verdicts, replace legal counsel, or substitute for judicial reasoning. This is an independent academic project.*

## Overview

Consumer district commissions in India face immense backlogs. A core bottleneck is unstructured party submissions causing slow manual synthesis by judges. **Nyāya** is a neutral case-structuring layer: it guides counsel on both sides through a standardized Q&A, then synthesizes an objective, highly structured analysis brief for the judge.

### The Problem
- **Unstructured Submissions:** Each party files material in a different format.
- **Cognitive Load:** Judges spend precious time identifying the points of friction and applicable precedents.

### The Solution
- **For Lawyers:** Guided question flows aligned directly to the Consumer Protection Act (CPA) 2019 to ensure nothing is missed.
- **For Judges:** An 8-part advisory brief highlighting agreed facts, disputed claims, and legal mapping, entirely traceable to source inputs. 

## Key Features

1. **Role-Based Workspaces**: Distinct interfaces for `Lawyer` and `Judge`.
2. **Dynamic Legal Scaffolding**: Hardcoded CPA case categories mapped to required evidentiary questions.
3. **Traceability**: Every AI claim in the judge's brief traces back to the raw lawyer submission or a certified, curated precedent.
4. **Advisory Posture**: Explicit, un-hideable caveats. Low confidence flags. Zero autonomous decision-making. No verdict generation whatsoever.

## Technology Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **Database & Realtime**: [Convex](https://convex.dev/) (with builtin vector search)
- **LLM Orchestration**: NVIDIA NIM ([DeepSeek-v3.2](https://build.nvidia.com/deepseek-ai/deepseek-v3.2)) enforced JSON modeling.
- **Authentication**: [NextAuth (Auth.js v5 beta)](https://authjs.dev/) with Google OAuth + Credentials.
- **UI/UX**: [Tailwind CSS v4](https://tailwindcss.com/) & [shadcn/ui](https://ui.shadcn.com/)

---

## Local Development Guide

### Prerequisites
- Node.js >= 18.17 
- `pnpm` (recommended)
- Access to [NVIDIA API Keys for DeepSeek](https://build.nvidia.com/)
- Access to [Convex](https://dashboard.convex.dev)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/Nipunjaiswal442/ai.judge.git
cd ai.judge/nyaya
pnpm install
```

### 2. Environment Variables
Copy the local environment template and populate it:
```bash
cp .env.example .env.local
```
Ensure the following variables are present in your `.env.local`:
```bash
# Convex Deployment
NEXT_PUBLIC_CONVEX_URL="https://your-convex-url.convex.cloud"

# Auth.js
AUTH_SECRET="generate-a-secure-random-string-here"
# Add your Google Client details if evaluating OAuth
AUTH_GOOGLE_ID="your_google_id"
AUTH_GOOGLE_SECRET="your_google_secret"

# NVIDIA AI
NVIDIA_API_KEY="nvapi-your-key-here"
```

### 3. Initialize Database (Convex)
In a separate terminal, run Convex to sync your database schema and push serverless functions:
```bash
npx convex dev
```
*(On your first run, you will be prompted to log in to Convex and select a project.)*

### 4. Run the Development Server
```bash
# Uses Turbopack for near-instant HMR
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment to Vercel

1. Connect your GitHub repository to Vercel.
2. **IMPORTANT: Set the "Root Directory" to `nyaya`**. Since the Next.js application is inside a subfolder, Vercel will throw a `404 NOT_FOUND` error if you skip this step.
3. In Vercel Project Settings, add all the environment variables listed above.
4. Modify your build command in Vercel to sync Convex schema prior to next build:
   - **Build Command**: `npx convex deploy && next build`
5. Deploy!

### Contributing
This is an open academic repository. For suggestions or bug reports, please navigate to the [Issues](https://github.com/Nipunjaiswal442/ai.judge/issues) tab.
