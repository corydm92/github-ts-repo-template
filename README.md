# TypeScript Monorepo Template

A lightweight starter to jumpstart a TypeScript application with structured docs, local quality gates, and flexible CI/CD patterns.

## 🚀 Where to Start

1. **Initialize the Blueprint docs system** 🧭  
   Follow the Blueprint setup in `/docs/blueprint/Layer 00 - System Initialization`.

2. **Start Step 2: Project Seed** 🧱  
   This template ships with the Blueprint system pre-configured, but it still requires project-specific setup.  
   Continue the Blueprint initialization starting at Step 2 and complete all steps before coding.  
   Start here: `/docs/blueprint/Layer 00 - System Initialization/0.2 — Project Seed`

3. **Choose CI/CD for your project type** ⚙️  
   See Layer 5.2: `/docs/blueprint/Layer 05 - Build & Delivery/5.2 — CI CD with Docker Vercel and NPM 🚦`

4. **Check out Process Docs** 🧭  
   See how the project is configured and run: `/docs/process/README.md`

## 📦 Install dependencies

```sh
corepack enable
corepack use pnpm@10.28.2
pnpm install
```

## 🏷 Rename this template

Use the rename script to update project identity safely:

```sh
node scripts/rename.mjs --name "my-project" --repo "yourname/my-project"
```

Dry run:

```sh
node scripts/rename.mjs --name "my-project" --repo "yourname/my-project" --dry-run
```

## 🧱 Project Structure

- `apps/` is the home for project applications:
  - `apps/frontend/`
  - `apps/backend/`
  - `apps/db/`
  - `apps/infra/`
- `packages/` is reserved for shared libraries and tooling (can be empty).
- `docs/` contains the Blueprint system and process references.
- `.husky/` stores local git hooks (pre-commit checks).
- `.github/workflows/` contains CI/CD workflows.
- `scripts/` holds project helper scripts (CI orchestration, rename).

## ✅ Quality Gates

- **Local pre-commit (Husky)** runs `pnpm run ci` before every commit.
- **ci:project** runs repo-level checks (lint + test) for shared config/tooling.
- **ci:apps** detects changed apps under `/apps` and runs each app’s own `ci` script.
- **CI on PRs** runs the same flow: project gate first, then affected app gates.
- **Merge to main** triggers CD for the affected app only (when CD is configured).
- **CD (IN PROGRESS)**: on merge, only the changed app is deployed (build image or provider deploy). Each app owns its dist output and is treated as a deployable entity.

## 🛠 Repo Maintenance

- File-based labels and PR size labels run automatically on pull requests
- CODEOWNERS is set to enforce review ownership
- Branch protection checklist: `docs/process/__Initialization/1. Branch Protection Checklist.md`

## 📘 Blueprint Docs (What it is)

The Blueprint is the documentation system under `/docs`.  
It provides step-by-step setup, rules, and reference notes to keep projects consistent as they scale.

## ⚖️ License

ISC — see `LICENSE`.
