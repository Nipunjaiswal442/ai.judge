# Nyaya PRD Assessment (v1)

Source reviewed: `PRD Nyaya.pdf` (12 pages)

## Executive Summary
- The current build aligns well with the PRD core thesis: structured lawyer intake plus judge-facing advisory brief.
- Core MVP flows exist end-to-end for role-based auth, case creation, guided Q&A, brief generation, and judge acknowledgment.
- Key gaps remain in traceability depth (section-level source links), document handling maturity, strict role-based data isolation, and compliance guardrails expected for real legal pilots.
- This update adds a **judge dashboard Bench Assistant chatbot** grounded in lawyer-submitted case data and advisory brief content, as requested.

## PRD Coverage Matrix

| PRD Area | Expected in PRD | Current Status | Notes |
|---|---|---|---|
| Product posture | Advisory only, no verdict generation | Implemented | Advisory language appears across auth/marketing/brief UI. |
| Roles | `JUDGE`, `LAWYER`, `ADMIN` | Implemented (MVP) | Role model exists in schema/auth. Admin flows are minimal/simulated. |
| Auth | Email/password + Google OAuth | Implemented | Credentials + Google provider are wired. This patch makes Google optional-safe in deployment. |
| Case creation | Category + metadata + generated human case ID | Implemented | Human ID format and metadata capture are present. |
| Structured Q&A | Category-specific question tracks for both sides | Implemented | Template-driven sessions with completeness follow-up heuristic. |
| Side submission lifecycle | Complainant/opposing statuses and transitions | Implemented | Session and case status transitions are in place. |
| Judge brief generation | 8-section advisory brief | Implemented | Case summary, agreed/disputed facts, law, precedents, procedural flags, gaps, confidence, caveats. |
| Judge dashboard | Case list + per-case review | Implemented | Dashboard + case brief page + acknowledgment exists. |
| Judge private notes | Private note storage | Implemented | Notes are stored on acknowledgment. |
| Lawyer dashboard | Case list + case workspace | Implemented | Present and role-routed. |
| Precedent retrieval | Curated-set citations only | Partially implemented | Precedent table and citation mapping exist; strict retrieval/grounding quality controls can be improved. |
| Source traceability | View-source per brief section | Partially implemented | PRD expects section-level source drill-down. Current UI is informative but not full sentence/claim traceability. |
| Document uploads | Attach documents per answer | Partially implemented | Schema supports docs; user-facing per-answer upload workflows are limited for full PRD parity. |
| Audit/compliance | Audit logging, data governance, transparency | Partially implemented | Audit table exists; broader compliance and governance workflows remain MVP-light. |
| Prompt-injection safety | Treat submissions as data, not instructions | Partially implemented | System prompts enforce posture; stronger structured sanitization/isolation can be expanded. |

## Gaps To Prioritize Next (PRD-Consistent)

1. **Claim-level traceability**: Attach per-brief-point source anchors to exact Q&A entries and precedent excerpts.
2. **Document-grounded synthesis**: Include uploaded document metadata/excerpts in brief and assistant context.
3. **Access controls by assignment**: Enforce judge/lawyer visibility strictly by assigned case relationships for non-demo mode.
4. **Procedural compliance telemetry**: Expand audit log actions (view/download/generate/export) with stronger review tooling.
5. **Closed-set citation enforcement**: Add explicit runtime checks preventing any non-curated precedent references.

## Changes Added In This Update

- Judge dashboard now includes a **Bench Assistant** chat panel for case-specific synthesis.
- New backend action synthesizes:
  - lawyer-submitted Q&A content from both sides,
  - case metadata,
  - generated advisory brief,
  - cited precedents.
- Assistant prompt explicitly forbids verdict suggestions and enforces advisory output structure.
- Vercel reliability hardening:
  - Optional-safe Google provider config,
  - safer auth/registration handling when Convex URL is missing,
  - improved Google sign-in error handling in UI,
  - stable production build script (`next build`).

