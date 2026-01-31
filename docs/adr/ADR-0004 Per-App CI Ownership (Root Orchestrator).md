# Architecture Decision Record

Title: ADR-0004 — Per-App CI Ownership (Root Orchestrator)  
Status: Accepted

Proposed Date: 2026-01-31  
Accepted Date: 2026-01-31

Owner: Cory Morrissey  
Approver(s): Cory Morrissey

---

## Context

Each app in this monorepo is treated like its own service with independent tooling
and standards. A single global CI gate would force apps into shared rules that
do not always apply (e.g., TypeScript for infra/db tooling).

Constraints:

- App teams should own their CI scripts.
- Root should orchestrate, not enforce app-specific rules.
- CI should run only for affected apps.

---

## Decision

Each app defines its own CI gate (`pnpm run ci` within the app).
The root project orchestrates which apps run, but does not dictate per-app rules.

---

## Rationale

This preserves separation of concerns and prevents cross-app coupling.
It also allows each app to evolve its tooling without changing the root.

---

## Alternatives Considered

1) Single root CI rules for all apps  
Rejected because not all apps share the same language or tooling.

2) Separate repos per app  
Rejected to keep shared tooling and documentation centralized.

---

## Consequences

- Each app must maintain a reliable `ci` script.
- Root CI must correctly detect affected apps.

---

## Notes

- Orchestration handled by `scripts/run-affected.mjs`.
