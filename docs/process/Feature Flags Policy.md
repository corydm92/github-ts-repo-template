# Feature Flags Policy

## Purpose
Feature flags allow trunk-based delivery by decoupling deployment from release.

## Rules
- Default to **off** for new flags
- Every flag must have:
  - Owner
  - Purpose
  - Rollout plan
  - Cleanup date

## Naming
Use clear, scoped names:
- `ff_<area>_<capability>`
- Example: `ff_billing_invoice_export`

## Lifecycle
1) Create flag (off)
2) Merge to main behind flag
3) Gradual rollout
4) Remove flag once stable

## Cleanup
- Remove flags within 2 release cycles
- If a flag persists, update the cleanup date and justify

## Documentation
- Record flags in a central registry (file or service)
- Link to the PR or issue that introduced the flag
