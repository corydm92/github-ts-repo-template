# Architecture Decision Record

Title: ADR-0008 — Release Automation via Workflow Only  
Status: Accepted

Proposed Date: 2026-01-31  
Accepted Date: 2026-01-31

Owner: Cory Morrissey  
Approver(s): Cory Morrissey

---

## Context

Manual release tagging leads to inconsistent versions and breaks the expected
SemVer contract. A consistent, automated workflow is needed for releases.

Constraints:

- Releases must be deterministic and repeatable.
- Versioning should derive from conventional commits.

---

## Decision

All releases are created via a dedicated workflow.
Manual tagging is not part of the release process.

---

## Rationale

Workflow-driven releases reduce human error and keep versioning consistent.
They also provide a single source of truth for tags and changelogs.

---

## Alternatives Considered

1) Manual tagging  
Rejected due to inconsistency and high risk of version drift.

2) Ad-hoc release scripts  
Rejected because the workflow is the required enforcement point.

---

## Consequences

- Release workflow must remain stable and documented.
- Contributors must not tag releases manually.

---

## Notes

- Versioning derived from conventional commits.
