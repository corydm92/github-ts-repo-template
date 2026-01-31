# Architecture Decision Record

Title: ADR-0002 — Trunk-Based Workflow with Feature Flags  
Status: Accepted

Proposed Date: 2026-01-31  
Accepted Date: 2026-01-31

Owner: Cory Morrissey  
Approver(s): Cory Morrissey

---

## Context

The project template needs a default branching model that keeps delivery simple and scalable
for solo developers and small teams. Gitflow introduced long-lived branches and extra
promotion steps that do not align with a trunk-first workflow.

Constraints:

- Main should be the single source of truth.
- Releases should be automated and predictable.
- Feature rollout should not require long-lived release branches.

---

## Decision

Adopt trunk-based development with feature flags:

- Work merges into `main`.
- Feature flags control exposure and rollout.
- Long-lived branches (e.g., `develop`, `release/*`) are not part of the standard flow.

---

## Rationale

Trunk-based development reduces branch complexity, shortens feedback loops, and fits
continuous delivery. Feature flags preserve safety and allow staged rollouts without
branch proliferation.

---

## Alternatives Considered

1) Gitflow  
Rejected due to long-lived branches, higher coordination overhead, and slower delivery.

2) GitHub Flow with release branches  
Rejected because release branches reintroduce the long-lived branch problem.

---

## Consequences

- All changes converge on `main`.
- Feature flags become the primary mechanism for staged delivery.
- CI/CD must be aligned to PR → main → deploy.

---

## Notes

- Feature flags policy lives in `/docs/process/Feature Flags Policy.md`.
