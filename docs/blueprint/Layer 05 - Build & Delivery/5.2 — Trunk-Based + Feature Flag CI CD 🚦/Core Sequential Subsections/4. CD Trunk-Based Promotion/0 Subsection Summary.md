# 0. Section Summary

CD rebuilds per environment using trunk-based triggers and deterministic inputs.

Triggers:

- main → dev deploy
- v\* tag → production deploy

Rule: rebuild per environment with deterministic inputs.

## Goal

Promote code safely using trunk-based triggers without drift.

## Verification

- Merge to `main` triggers dev deploy.
- `v*` tag triggers prod deploy.
