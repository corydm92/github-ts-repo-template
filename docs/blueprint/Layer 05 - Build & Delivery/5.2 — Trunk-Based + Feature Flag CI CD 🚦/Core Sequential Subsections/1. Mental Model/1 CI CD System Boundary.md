# CI/CD System Boundary

## Goal

Define the hard line between **quality enforcement (CI)** and **promotion (CD)** so behavior is predictable.

## CI (quality gate)

- Runs on `pull_request` (all branches).
- Validates format, lint, type-check, test.
- Validates build inputs used later in CD.

## CD (promotion engine)

- Rebuilds per environment using the same inputs and rules.
- Uses trunk-based triggers (`main`, `v*` tags).
- Enforces deterministic settings to avoid drift.

## Boundary rules

- If a step **changes build inputs**, it belongs in CI.
- If a step **changes the deployment target**, it belongs in CD.
- CI blocks merges; CD blocks promotion.

## Verification

- Open a PR and confirm CI runs all gates.
- Merge to `main` and confirm the expected CD target triggers.
