# Agent Workflow Guide

This document is the single source of truth for how agents should operate in this repo.
It is intentionally verbose and links to examples where possible.

## 1) Core Rules

- Follow Gitflow: feature/bug branches -> PR into develop -> release PR into main -> back-merge main -> develop.
- CI runs on pull requests only (no push triggers).
- CD workflows are template-only unless explicitly copied into `.github/workflows`.
- Only one CD path should be active per project (Vercel OR Docker OR npm).
- Prefer deterministic workflows over manual steps.

## 2) Branching & PR Flow

### Standard flow
1) Create branch from `develop`
2) Open PR into `develop`
3) CI runs on PR
4) Merge to `develop` after CI passes
5) Dev deploy runs (if CD path is installed)

### Release flow
1) Run release automation workflow
2) `release/vX.Y.Z` branch created + PR opened into `main`
3) CI runs on release PR
4) QA signoff
5) Merge release PR into `main`
6) Prod deploy runs (tag-based)
7) Back-merge `main` -> `develop` (auto PR)

References:
- `docs/process/Gitflow Runbook.md`
- `docs/process/Template Checklist.md`

## 3) CI/CD Behavior

- CI is PR-only.
- CD is branch/tag-driven once installed.

CD paths:
- Vercel: `cd-vercel-gitflow.yml`
- Docker: `cd-docker-gitflow.yml`
- npm: `cd-npm-gitflow.yml`

Release automation:
- `release-automation.yml`
- `backmerge-main-to-develop.yml`

References:
- `docs/blueprint/Layer 05 - Build & Delivery/5.2 — CI CD with Docker Vercel and NPM 🚦/Base Project Rules and Tooling/__Initialization/workflows/`
- `docs/blueprint/Layer 05 - Build & Delivery/5.2 — CI CD with Docker Vercel and NPM 🚦/Supporting Atomic Notes/Release Automation Behavior.md`

## 4) Documentation Standards

- Use Jira-style tickets for work items.
- Prefer short, structured docs (Summary, Goals, Scope, Acceptance Criteria).
- Keep Blueprint changes aligned with actual workflows.

Examples:
- `.github/ISSUE_TEMPLATE/*.md`
- `docs/blueprint/Layer 05 - Build & Delivery/5.2 — CI CD with Docker Vercel and NPM 🚦/Base Project Rules and Tooling/CI CD with Docker Vercel and NPM - Gitflow Deployment Flow.md`

## 5) Agent Expectations

- Ask once when blocked; otherwise proceed.
- Keep changes scoped and grouped into clean commits.
- Prefer deterministic automation over manual steps.
- If conflicting instructions exist, clarify before changing.

## 6) Troubleshooting

- CI failures: see `docs/process/CI CD Troubleshooting.md`
- Missing secrets: verify repo settings
- Tag not pushed: prod deploy will not trigger

## 7) Quick Links

- Gitflow Runbook: `docs/process/Gitflow Runbook.md`
- Template Checklist: `docs/process/Template Checklist.md`
- CI/CD Troubleshooting: `docs/process/CI CD Troubleshooting.md`
- Release Automation Behavior: `docs/blueprint/Layer 05 - Build & Delivery/5.2 — CI CD with Docker Vercel and NPM 🚦/Supporting Atomic Notes/Release Automation Behavior.md`
