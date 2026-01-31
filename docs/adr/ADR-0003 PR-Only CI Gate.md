# Architecture Decision Record

Title: ADR-0003 — PR-Only CI Gate  
Status: Accepted

Proposed Date: 2026-01-31  
Accepted Date: 2026-01-31

Owner: Cory Morrissey  
Approver(s): Cory Morrissey

---

## Context

We need a deterministic CI gate that enforces quality without redundant runs.
Running CI on every push and PR duplicates work and increases queue time.

Constraints:

- CI must be the authoritative quality gate.
- PRs are the moment of review and merge decisions.

---

## Decision

CI runs on pull requests only, not on every push to branches.

---

## Rationale

PR-only CI avoids duplicate runs while preserving a consistent gate before merge.
It also aligns with branch protection requirements and review workflows.

---

## Alternatives Considered

1. CI on push + PR  
   Rejected due to redundant executions and longer feedback cycles.

2. CI on push only  
   Rejected because PR gates are the enforcement point for reviews and merges.

---

## Consequences

- Branch protection must require the PR CI check.
- Developers rely on local pre-commit gates for early feedback.

---

## Notes

- CI workflow: `.github/workflows/ci.yml`.
