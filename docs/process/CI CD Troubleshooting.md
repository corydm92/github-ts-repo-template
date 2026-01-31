# CI/CD Troubleshooting

## CI failures

- pnpm not found: ensure Corepack enable + prepare from packageManager
- eslint max-warnings: use "pnpm lint --max-warnings=0"
- lockfile mismatch: ensure pnpm-lock.yaml is committed

## CD failures

- Missing secrets: verify workflow secrets in repo settings
- Missing build script: add or update build step
- Tag not pushed: prod deploy will not trigger

## Release automation failures

- No conventional commits: standard-version cannot compute next version
- GH CLI not available: use gh in workflow or replace with API calls
- Permissions: ensure contents + pull-requests write permissions
