# Tagging Rules

## Goal

Ensure production promotions are auditable and repeatable.

## Required

- Use conventional commits for changelog generation
- Generate tags through a release command (no manual tags)
- Tags must be pushed to the remote to trigger prod

## Avoid

- Tagging unreviewed commits
- Moving tags after deploy
- Creating tags from local-only commits

## Verification

- Run the release workflow and confirm a `v*` tag is created on `main`.
- Confirm prod deploy triggers from the tag.
