# Architecture Decision Record

Title: ADR-0006 — Per-App Build Artifacts (No Root Dist)  
Status: Accepted

Proposed Date: 2026-01-31  
Accepted Date: 2026-01-31

Owner: Cory Morrissey  
Approver(s): Cory Morrissey

---

## Context

The project root acts as an orchestrator for multiple apps. Each app should be
deployable independently and own its own build output.

Constraints:

- The root should not produce a shared build artifact.
- Each app must control its build process and output directory.

---

## Decision

Build outputs are owned and produced by each app, not the root project.
There is no root-level `dist/` or shared build artifact.

---

## Rationale

This keeps app lifecycles independent and avoids coupling releases to a global build.
It also simplifies deployment per app.

---

## Alternatives Considered

1) Single root build output  
Rejected because it forces a global build for changes in any app.

2) Shared build step + app-specific deploy  
Rejected because it still couples app delivery to root build logic.

---

## Consequences

- Each app owns its build config and output paths.
- CD workflows must build per app when that app changes.

---

## Notes

- Root remains orchestration-only for CI/CD.
