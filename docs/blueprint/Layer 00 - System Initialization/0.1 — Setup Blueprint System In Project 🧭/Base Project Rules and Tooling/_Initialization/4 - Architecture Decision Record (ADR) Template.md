# 4 — Architecture Decision Record (ADR) Template

## 🎯 Goal

Establish a single, enforceable template for recording **all architectural and foundational decisions** in the project, before any decisions are made.

This ensures decisions are explicit, reviewable, and historically traceable instead of living in PR comments, Slack threads, or tribal memory.

## 📦 What This Step Produces

This step produces **one artifact**:

- An ADR template that will be copied and filled in for every architectural decision going forward

No decisions are recorded yet  
No tools are chosen yet  
This step only defines the structure that decisions must follow

## 🧠 Mental Model

An ADR is the project’s **memory of why** a foundational decision was made.

- Code shows **what** we built
- Project Stack Summary shows **what exists now**
- ADRs record **why we chose this path**, including tradeoffs and rejected alternatives

Workflow:

- Draft + edit while `Proposed`
- Once `Accepted` or `Rejected`, it’s immutable
- If the decision changes later, write a new ADR and mark the old one `Superseded`

Result: architecture changes stay intentional, reviewable, and traceable

## 🔍 ADR Scope

ADRs are **required** for:

- framework changes
- adding / removing dependencies
- build system changes
- language or runtime changes
- dependency major upgrades
- large state or data-layer changes
- testing strategy changes
- CI/CD or deployment model changes
- security or authentication/authorization model changes
- observability stack changes

ADRs are **not required** for:

- normal feature development
- refactors with no architectural impact
- dependency patch or minor upgrades
- internal implementation details

## 📜 ADR Rules

- Status must be one of: `Proposed`, `Accepted`, `Rejected`, `Superseded`
- ADRs may be edited while `Proposed` (until accepted or rejected)
- Once `Accepted`, the decision is immutable (no decision changes in-place)
- A decision change requires a new ADR; the old ADR becomes `Superseded`
- `Superseded` ADRs must explicitly reference the ADR that replaces them
- When moving to `Accepted` or `Rejected`, record the final approval context (PR, issue, or date) in Notes
- Filenames must not track status
  - ADRs are referenced by filename in PRs, issues, and documentation
  - Renaming files on status changes creates broken links and noisy history
  - Status is lifecycle metadata, not part of an ADR’s identity

## 🧩 ADR Template

<details>
<summary><strong>ADR Template (click to expand)</strong></summary>

```md
# Architecture Decision Record

Title: ADR-XXXX — Short, Descriptive Title  
Status: Proposed | Accepted | Rejected | Superseded

Proposed Date: YYYY-MM-DD  
Accepted Date: YYYY-MM-DD (if applicable)

Owner: Person or Team responsible for the decision  
Approver(s): Person or group granting final sign-off

---

## Context

Describe the problem or situation that requires a decision.

Include:

- what triggered this decision
- relevant constraints (technical, organizational, timing)
- why this decision needs to exist now

This section explains why a decision is required, not what the decision is.

---

## Decision

State the decision clearly and unambiguously.

Include:

- what is being chosen
- what is explicitly not being chosen

This section should stand alone as the authoritative statement of intent.

---

## Rationale

Explain why this decision was selected.

Include:

- key tradeoffs considered
- benefits gained
- downsides or risks that are being accepted

The goal is future clarity, not persuasion.

---

## Alternatives Considered

List realistic alternatives and why they were not chosen.

Each alternative should include:

- brief description
- primary reason for rejection

If no viable alternatives existed, state that explicitly.

---

## Consequences

Describe the impact of this decision.

Include:

- immediate effects
- long-term implications
- areas that may require migration or review later

This section answers: what does this decision force us to live with?

---

## Supersedes

Only include if applicable.

- ADR-XXXX — Title of superseded decision

---

## Notes

Optional clarifications, approval context, follow-ups, or review signals.

Examples:

- Link to discussion PR or RFC
- Reason for rejection
- Planned review window
```

</details>

## 🧪 ADR Example

<details> <summary><strong>ADR-0007 — Add TanStack Query for Server/Client Data Fetching (click to expand)</strong></summary>

```md
# Architecture Decision Record

Title: ADR-0007 — Add TanStack Query for Server/Client Data Fetching
Status: Accepted

Proposed Date: 2025-11-02  
Accepted Date: 2025-11-03

Owner: Cory Morrissey  
Approver(s): Cory Morrissey

---

## Context

Synct needs a single, consistent data-fetching + caching layer for client-interactive screens.

Right now, async data behavior is fragmented:

- ad-hoc `fetch()` calls live in components
- cache behavior is inconsistent (duplicate requests, stale UI, manual loading/error wiring)
- mutations don’t have a reliable invalidation story, causing correctness issues after writes

We need a standard library that:

- centralizes caching, deduplication, retries, and background refresh
- provides a predictable mutation → invalidation pattern
- supports Next.js App Router patterns (server components for initial fetch + client cache hydration where needed)

This is a foundational dependency decision, so it requires an ADR.

---

## Decision

Adopt **TanStack Query** as Synct’s primary client-side async data layer.

We will:

- use TanStack Query in client components for cache + mutations
- hydrate initial server-fetched data into the client cache where it improves UX
- define query key conventions and invalidation rules as part of the data contract

Explicitly not chosen:

- Redux Toolkit as the primary async cache layer (RTK Query)
- “plain fetch everywhere” as the long-term pattern

---

## Rationale

- TanStack Query gives us **standardized caching + request dedupe** without custom infra.
- It provides a **first-class mutation model** with invalidation, optimistic updates, and error rollback patterns.
- It reduces boilerplate: loading/error states and refetch logic become consistent and reusable.
- It scales across feature teams: query key conventions + shared fetchers enable predictable extension.

---

## Alternatives Considered

- RTK Query  
  Rejected: viable, but tighter coupling to Redux. We want Redux reserved for cross-cutting UI/app state, not as the default async cache for every feature.

- Plain `fetch()` + handcrafted caching  
  Rejected: reinvents cache policy, invalidation rules, retries, and dedupe. High drift risk and inconsistent UX.

- SWR  
  Rejected: good for revalidation-driven reads, but TanStack Query provides stronger mutation workflows and more explicit cache control for complex CRUD flows.

---

## Consequences

Positive:

- Consistent data loading, caching, and mutation patterns across the app
- Fewer duplicate requests and less UI thrash from inconsistent async state
- Clear invalidation rules improve post-mutation correctness
- Shared conventions make onboarding and reviews faster

Tradeoffs / Risks:

- Adds a foundational dependency that must be governed (major upgrades require ADR)
- Requires discipline around query keys, cache boundaries, and invalidation strategy
- Some server-component-only flows may not need it; avoid cargo-cult usage

---

## Supersedes

None

---

## Notes

Approval context:

- Accepted as the standard client async data layer for Synct v0.2

Follow-ups:

- Update `/docs/__project/stack-summary.md` to reflect TanStack Query under “Data Fetching”
- Add query key conventions + invalidation rules under `02 State & Framework/2.2 State Management/` (Base Project Rules and Tooling)
```

</details>

## 🛠 Setup Steps

1. Create the ADR template file  
   Create: `docs/process/adr-template.md`

2. Paste the ADR template into the file  
   Use the template defined in this step verbatim.

3. Share the rules with the team  
   Confirm that all architectural and foundational decisions must use this template.

4. Enforce usage going forward  
   New tools, major changes, and foundational decisions require an ADR before implementation.

## ✅ Verification

- `docs/process/adr-template.md` exists
- The template matches the structure above
- Team agrees this is the required format for architectural decisions
