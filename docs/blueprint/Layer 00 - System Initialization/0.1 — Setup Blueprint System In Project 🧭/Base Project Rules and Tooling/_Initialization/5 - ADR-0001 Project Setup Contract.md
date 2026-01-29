# 5 — ADR-0001 Project Setup Contract

## 🎯 Goal

Create the project’s first governed architectural decision: **the initial tools and baseline** the repo will follow.

By Step 4, we already have:

- Step 3: a human-readable **Project Stack Summary** (`/docs/__project/stack-summary.md`) describing the current stack truth
- Step 4: the **ADR Template** (`/docs/process/adr-template.md`) defining how decisions must be recorded and governed

Now we convert that stack truth into an enforceable contract by writing **ADR-0001**.

This prevents the baseline from drifting via “silent defaults” or “tribal memory.”

## 📦 What This Step Produces

This step produces **one artifact**:

- `docs/adr/ADR-0001 — Project Setup Contract.md`

No implementation steps are performed here  
No code or tooling changes happen in this step  
This step formalizes and locks the baseline already described in Step 3

## 🧠 Mental Model

Think of ADR-0001 as the project’s **constitution**.

- The Stack Summary describes what the project looks like today
- ADR-0001 turns that description into a **binding contract**
- From this point on, the baseline only changes through explicit, reviewable decisions

This step freezes the starting line:

- No more “default choices”
- No more “I thought we were using…”
- Every foundational change must justify itself against this contract

Result: the project has a clear, enforceable baseline that future changes must consciously evolve from.

## 🧩 Inputs

ADR-0001 should be derived directly from:

- Step 3: `/docs/__project/stack-summary.md` (the current stack truth)
- Step 4: `/docs/process/adr-template.md` (the enforced ADR structure)

The ADR should link to the Stack Summary as supporting context, but the ADR remains the authoritative decision record.

## 🧪 ADR-0001 — Project Setup Contract Example

<details>
<summary><strong>ADR-0001 — Project Setup Contract (Synct) (click to expand)</strong></summary>

```

# Architecture Decision Record

Title: ADR-0001 — Project Setup Contract (Synct v0.2)
Status: Accepted

Proposed Date: 2025-10-28
Accepted Date: 2025-10-28

Owner: Cory Morrissey
Approver(s): Cory Morrissey

---

## Context

Synct needs a consistent, enforceable baseline for all new development so the repo is predictable across local development, CI, and deployment.
Prior iterations allowed drift in runtime versions, package manager behavior, and build defaults, which created avoidable failures and onboarding friction.
This ADR defines the Layer 0 foundation (framework, language, runtime, tooling) so future changes can be reviewed as intentional decisions.

---

## Decision

Adopt the following baseline for Synct v0.2:

- Framework: Next.js 16 (App Router)
- React: 19
- Language: TypeScript 5.6 (strict)
- Runtime: Node (Active LTS at time of acceptance; pinned via version manager and enforced in CI)
- Package Manager: pnpm 10+
- Build System: Next.js default build system (explicitly define dev vs prod behavior)
- Unit/Integration Testing: Vitest + React Testing Library
- E2E Testing: Playwright Test
- Linting/Formatting: ESLint + Prettier
- CI/CD: GitHub Actions + Vercel
- Documentation: `/docs` structure with `/docs/__project`, `/docs/adr`, `/docs/blueprint`, `/docs/process`, `/docs/references`

Explicitly not chosen:

- Next.js 15 baseline
- Cypress for E2E

---

## Rationale

- Next.js 16 + React 19 provide a modern foundation for hybrid rendering and future-facing patterns without custom infrastructure.
- An LTS Node runtime with explicit pinning reduces environment drift over time.
- TypeScript strict mode enforces correctness and prevents long-term type debt.
- pnpm improves install determinism and supports workspace scaling if the repo grows.
- Vitest + React Testing Library provide fast feedback while aligning tests with user-visible behavior.
- Playwright provides stable browser-level confidence for critical journeys.
- GitHub Actions + Vercel standardize validation, preview, and deployment workflows.

---

## Alternatives Considered

- Next.js 15 — rejected due to older baseline.
- npm / yarn — rejected due to slower installs and weaker workspace ergonomics.
- Jest — viable, but rejected in favor of Vitest performance and DX.
- Cypress — rejected in favor of Playwright’s cross-browser coverage.

---

## Consequences

Positive:

- Predictable local, CI, and production environments
- Clear enforcement of baseline correctness
- Reduced onboarding and operational friction

Tradeoffs / Risks:

- Major upgrades require explicit ADRs
- Some async server-rendered behavior is validated primarily via E2E tests
- Tooling changes become intentionally process-driven

---

## Supersedes

None

---

## Notes

Review cadence:

- Quarterly review of framework/runtime/tooling baseline
- New ADR required for major upgrades

```

</details>

## 🛠 Setup Steps

1. Create the ADR file  
   Create: `docs/adr/ADR-0001 — Project Setup Contract.md`

2. Populate it using the ADR Template  
   Copy the structure from `/docs/process/adr-template.md`.

3. Derive content from the Stack Summary  
   Use `/docs/__project/stack-summary.md` as the source of truth for tools and versions.

4. Review and approve  
   Confirm Owner and Approver(s), then move status to `Accepted`.

5. Lock the baseline  
   Once accepted, do not edit this ADR.  
   Any future baseline change requires a new ADR.

## ✅ Verification

- `docs/adr/ADR-0001 — Project Setup Contract.md` exists
- Status is `Accepted` once approved
- Proposed and Accepted dates are present
- Owner and Approver(s) are present
- ADR-0001 aligns with `/docs/__project/stack-summary.md`
- Future baseline changes require a new ADR
