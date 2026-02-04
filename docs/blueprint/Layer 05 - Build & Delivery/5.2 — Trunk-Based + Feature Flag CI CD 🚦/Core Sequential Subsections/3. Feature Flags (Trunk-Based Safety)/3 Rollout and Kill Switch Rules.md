# 3. Rollout and Kill Switch Rules

## Goal

Enable safe rollout and instant rollback without reverting code.

- Use staged rollouts (internal → percent → full).
- Every high-risk flag must include a kill switch.
- Roll back by disabling the flag before code revert.

## Verification

- A kill switch exists for high-risk flags.
- Rollbacks are executed by flag disable, not code revert.
