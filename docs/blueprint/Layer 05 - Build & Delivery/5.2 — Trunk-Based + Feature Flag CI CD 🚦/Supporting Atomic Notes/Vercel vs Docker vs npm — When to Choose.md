# Vercel vs Docker vs npm — When to Choose

## Goal

Choose one deploy path based on the deployable unit.

## Vercel

- Frontend web apps
- Preview deployments on PRs
- Fast static + serverless deployments

## Docker

- APIs, background workers, services
- Environments that need full OS-level control
- Centralized container registry flow

## npm

- Shared libraries or SDKs
- Consumers install via package manager
- Release driven by version tags

## Decision rule

- Web app → Vercel
- Service/runtime → Docker
- Library/package → npm
