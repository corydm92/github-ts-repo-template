# my-project

A lightweight starter to jumpstart a TypeScript application with structured docs, local quality gates, and flexible CI/CD patterns.

## 🚀 Where to Start

1. **Initialize the Blueprint docs system** 🧭  
   Follow the Blueprint setup in `/docs/blueprint/Layer 00 - System Initialization`.

2. **Complete Step 2: Project Seed** 🧱  
   The docs are wired but not fully configured until you finish the Project Seed step.

3. **Choose CI/CD for your project type** ⚙️  
   See Layer 5.2: `/docs/blueprint/Layer 05 - Build & Delivery/5.2 — CI CD with Docker Vercel and NPM 🚦`

## ⚡ Quick Start (for a new dev)

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

## ✅ Quality Gates

- **Husky pre-commit hooks** run locally before pushes
- **CI runs on pull requests** and enforces:
  - project gate (root checks)
  - app gate (only affected apps run their own `ci` scripts)

## 🛠 Repo Maintenance

- File-based labels and PR size labels run automatically on pull requests
- CODEOWNERS is set to enforce review ownership
- Branch protection checklist: `docs/process/__Initialization/1. Branch Protection Checklist.md`

## 📘 Blueprint Docs (What it is)

The Blueprint is the documentation system under `/docs`.  
It provides step-by-step setup, rules, and reference notes to keep projects consistent as they scale.

## ⚖️ License

ISC — see `LICENSE`.
