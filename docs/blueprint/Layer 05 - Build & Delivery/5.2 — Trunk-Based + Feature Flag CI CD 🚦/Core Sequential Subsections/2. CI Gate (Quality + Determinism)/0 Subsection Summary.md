# 0. Section Summary

The CI gate is the non-negotiable quality checkpoint.

Required order:

1. format:check
2. lint (no warnings)
3. type-check
4. test

If any step fails, deployment must not proceed.

## Goal

Ensure every change is validated before merge or release.

## Verification

- CI runs on every PR.
- Any failing step blocks merge.
