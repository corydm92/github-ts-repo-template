# Architecture Decision Record

Title: ADR-0005 — Root CI Contract (Project + Apps)  
Status: Accepted

Proposed Date: 2026-01-31  
Accepted Date: 2026-01-31

Owner: Cory Morrissey  
Approver(s): Cory Morrissey

---

## Context

The root project must enforce global quality gates (linting, formatting, scripts)
while delegating app-specific checks to each app.

Constraints:

- Root CI should be stable and predictable.
- App CI should run only when affected.
- Root should avoid app-specific logic.

---

## Decision

Root CI runs two gates:

- `ci:project` for root-level checks.
- `ci:apps` for affected app checks.

The combined `ci` script runs both.

---

## Rationale

This preserves a clear contract: root validates its own surface area, and apps
validate themselves when impacted.

---

## Alternatives Considered

1) Only app CI  
Rejected because root tooling and configs can break without a root gate.

2) Only root CI  
Rejected because app-specific rules would be lost or watered down.

---

## Consequences

- Root scripts must remain stable and minimal.
- App CI remains decentralized and flexible.

---

## Notes

- Root scripts live in `package.json`.
