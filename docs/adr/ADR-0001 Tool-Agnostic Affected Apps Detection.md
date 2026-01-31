# Architecture Decision Record

Title: ADR-0001 — Tool-Agnostic Affected Apps Detection  
Status: Accepted

Proposed Date: 2026-01-31  
Accepted Date: 2026-01-31

Owner: Cory Morrissey  
Approver(s): Cory Morrissey

---

## Context

This monorepo is intentionally app-centric: each app owns its own tooling, CI gates, and lifecycle.
We need CI to run only for affected apps while still catching shared/tooling changes.

Constraints:

- Keep the repo template tool-agnostic and low-dependency.
- Allow per-app CI gates to vary without global coupling.
- Support shared package changes triggering dependent app CI.

---

## Decision

We will maintain a small, custom affected-apps script that:

- detects changed files via git
- treats shared paths as global invalidation
- detects app changes by path
- expands to dependent apps when shared packages change

We will not adopt a full monorepo orchestration tool (Nx/Turborepo) at this stage.

---

## Rationale

This approach keeps the template lightweight and readable while still meeting the core CI
requirement (run only what changed). It preserves per-app autonomy and avoids coupling the
template to a specific tool ecosystem.

Tradeoffs accepted:

- Some custom logic to maintain
- Less out-of-the-box graph analysis than monorepo tools
- Edge cases require explicit handling in script logic

---

## Alternatives Considered

1. Nx or Turborepo  
   Rejected for now due to extra tooling surface area, config overhead, and template lock-in.

2. Changesets + dependency graph tooling  
   Rejected because it introduces release tooling we do not need yet, and still adds coupling.

3. GitHub Actions path filters only  
   Rejected because they do not resolve package dependency graphs (only direct path changes).

---

## Consequences

- We own and maintain the affected-apps logic.
- Package names must be consistent for graph detection.
- If the repo grows, we may revisit tooling adoption with a new ADR.

---

## Notes

- Implemented in `scripts/affected-apps.mjs`.
