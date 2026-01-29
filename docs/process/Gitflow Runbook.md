# Gitflow Runbook

## Flow
1) Open PR to develop
2) CI runs on PR
3) Merge to develop
4) Dev deploy runs
5) Run release automation workflow
6) Release PR to main (CI runs)
7) QA signoff
8) Merge release PR to main
9) Prod deploy runs on v* tag
10) Back-merge main -> develop

## Inputs
- Conventional commits for versioning
- Release automation workflow
- Back-merge workflow

## Outputs
- Release branch
- Release commit + tag
- Release PR into main
- Back-merge PR into develop
