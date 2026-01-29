# Environment Trigger Matrix

## Dev
- Branch: develop
- Purpose: integration testing and early validation
- Output: dev deploy or dev publish

## Staging
- Branch: release/*
- Purpose: pre-prod hardening and QA
- Output: staging deploy or rc tag/publish

## Production
- Tag: v*
- Purpose: final promotion and release audit trail
- Output: prod deploy or latest publish

Rule: prod only from tags, never from branches.
