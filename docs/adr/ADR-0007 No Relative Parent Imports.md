# Architecture Decision Record

Title: ADR-0007 — No Relative Parent Imports  
Status: Accepted

Proposed Date: 2026-01-31  
Accepted Date: 2026-01-31

Owner: Cory Morrissey  
Approver(s): Cory Morrissey

---

## Context

Deep relative imports (`../../..`) make code fragile during refactors and obscure
the ownership boundaries between app and shared code.

Constraints:

- Enforce consistent, readable imports.
- Reduce refactor churn in a multi-app repo.

---

## Decision

Disallow relative parent imports and require absolute imports for shared
and cross-boundary modules.

---

## Rationale

Absolute imports improve clarity and reduce path churn when files move.
The rule also prevents accidental cross-app boundary coupling.

---

## Alternatives Considered

1. Allow relative imports everywhere  
   Rejected due to fragility and readability issues.

2. Lint-only guidance without enforcement  
   Rejected because the rule must be consistent across contributors.

---

## Consequences

- Path aliases must be maintained in TS/ESLint configs.
- Some imports will be updated when adding new boundaries.

---

## Notes

- Enforcement via ESLint rule `import/no-relative-parent-imports`.
