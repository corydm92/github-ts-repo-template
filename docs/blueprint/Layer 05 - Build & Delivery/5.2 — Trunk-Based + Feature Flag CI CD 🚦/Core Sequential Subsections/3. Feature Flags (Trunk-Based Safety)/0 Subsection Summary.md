# 0. Section Summary

Feature flags are required in trunk-based delivery.

Purpose:

- Decouple merge from release.
- Limit blast radius.
- Allow fast rollback without reverts.

Rule: production-impacting changes ship behind a flag until validated.

## Goal

Make trunk-based merges safe without slowing delivery.

## Verification

- New functionality is gated by a flag.
- Rollback is possible by disabling the flag.
