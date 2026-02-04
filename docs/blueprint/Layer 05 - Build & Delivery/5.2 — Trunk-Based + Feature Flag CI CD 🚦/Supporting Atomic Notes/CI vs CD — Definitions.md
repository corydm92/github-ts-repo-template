# CI vs CD — Definitions

## Goal

Keep CI (quality enforcement) and CD (promotion) clearly separated.

## CI (Continuous Integration)

- Validates every change before merge
- Enforces formatting, lint, types, and tests
- Validates the inputs required for deterministic builds

## CD (Continuous Delivery)

- Rebuilds per environment using the same inputs and rules
- Uses trunk-based triggers to control where releases go
- Enforces deterministic build settings to avoid drift

## Verification

- CI runs on PRs.
- CD runs only on `main` merge or `v*` tags.
