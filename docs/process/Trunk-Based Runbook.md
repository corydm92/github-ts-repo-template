# Trunk-Based Runbook

## Flow

1. Open PR to main
2. CI runs on PR
3. Merge to main
4. Dev deploy runs
5. Run release automation workflow
6. QA signoff (if required)
7. Prod deploy runs on v\* tag

## Inputs

- Conventional commits for versioning
- Release automation workflow

## Outputs

- Release commit + tag
- Release notes (changelog)
