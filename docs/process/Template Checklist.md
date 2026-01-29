# Template Checklist

Use this when starting a new project from this template.

## Docs
- Complete Blueprint initialization (Layer 00)
- Complete Step 2: Project Seed

## CI
- Copy CI template to .github/workflows/ci.yml
- Confirm CI runs on PRs

## CD (choose one)
- Vercel: cd-vercel-gitflow.yml
- Docker: cd-docker-gitflow.yml
- npm: cd-npm-gitflow.yml

## Release Automation (optional)
- release-automation.yml
- backmerge-main-to-develop.yml

## Repo Settings
- Set default branch to develop
- Add branch protections for develop and main
