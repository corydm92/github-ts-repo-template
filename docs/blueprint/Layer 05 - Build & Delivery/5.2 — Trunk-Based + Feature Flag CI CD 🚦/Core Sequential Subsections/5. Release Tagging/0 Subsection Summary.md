# 0. Section Summary

Release tags are the production gate.

Rules:

- Tags must point at the exact release commit
- Tag format is v\* (v1.2.3)
- Tagging is owned by release automation (standard-version)

## Goal

Make production promotions auditable and repeatable.

## Verification

- Release workflow creates a tag on `main`.
