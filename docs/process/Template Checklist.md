# Template Checklist

Use this when starting a new project from this template.

## Docs
- Complete Blueprint initialization (Layer 00)
- Complete Step 2: Project Seed

## CI
- Copy CI template to .github/workflows/ci.yml
- Confirm CI runs on PRs

## CD (choose one)
- Vercel: cd-vercel-gitflow.yml (adjust for trunk)
- Docker: cd-docker-gitflow.yml (adjust for trunk)
- npm: cd-npm-gitflow.yml (adjust for trunk)

## Release Automation (optional)
- release-automation.yml

## Feature Flags
- Add Feature Flags Policy: `docs/process/Feature Flags Policy.md`
- Add a flag registry (file or service)

## Repo Settings
- Set default branch to main
- Add branch protections for main
