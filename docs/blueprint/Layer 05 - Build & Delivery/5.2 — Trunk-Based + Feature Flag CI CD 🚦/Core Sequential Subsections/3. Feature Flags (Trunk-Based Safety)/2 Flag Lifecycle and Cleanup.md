# 2. Flag Lifecycle and Cleanup

## Goal

Prevent permanent flags and long-lived drift in production.

Lifecycle:

1. Create flag
2. Dark launch
3. Partial rollout
4. Full rollout
5. Remove flag

Rules:

- Every flag has a removal ticket.
- Delete flags after full rollout to avoid drift.

## Verification

- Each flag has an owner and cleanup date.
- Flags removed after full rollout.
