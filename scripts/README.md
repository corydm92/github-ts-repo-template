# Scripts Overview

This directory contains the CI orchestration and workspace contract logic used by the repo.
It is intentionally tool-agnostic and driven by simple Node scripts.

---

## Entry points

- `run-ci.mjs` — main CI runner (project + affected packages + affected apps)
- `affected-apps.mjs` — change detection + dependency impact graph
- `workspace-contract.mjs` — validates required scripts + CI contract
- `rename.mjs` — repo rename helper

---

## Core flow (CI)

1. `run-ci.mjs` runs the **project gate** (root checks).
2. `run-ci.mjs` calls `affected-apps.mjs` to detect changes.
3. `run-ci.mjs` runs package/app CI based on the detected changes.
4. `workspace-contract.mjs` validates each workspace before CI runs.

---

## Change detection (affected-apps.mjs)

Inputs (controlled by env):

- `AFFECTED_MODE=staged` — local pre-commit (staged files only)
- `AFFECTED_MODE=pr` — PR diff (base vs head)
- `AFFECTED_MODE=range` — push/merge diff (before SHA vs after SHA)

Required env values:

- `BASE_REF` and `HEAD_SHA` for PR mode
- `BASE_SHA` and `HEAD_SHA` for range mode

Output contract (JSON):

- `changedFiles` — list of changed file paths
- `changedApps` — apps directly changed
- `changedPackages` — packages directly changed
- `packageImpacts` — dependency impacts (package -> dependent apps)
- `allApps` / `allPackages` — all workspaces
- `changedSystems` — true when shared config changes require full rebuild

---

## CI task contract (workspace-contract.mjs)

Each workspace must define:

- `scripts.ci`
- `ciTasks` (array)

Validation rules:

- `ciTasks` must exist and be an array.
- Each `ciTasks` entry must exist in `scripts`.
- `scripts.ci` must be a plain `pnpm run <task> && ...` chain.
- `ciTasks` must match `scripts.ci` in order and contents.

This keeps CI consistent and ensures the runner output matches the real CI steps.

---

## CI runner output (run-ci.mjs)

- Project tasks always run.
- Packages and apps run based on change detection.
- Labels reflect the trigger source:
  - Triggered From System Files Change
  - Triggered From Dependency Change
  - Detected Change
  - No Change Detected

---

## Common commands

From repo root:

- `pnpm run ci` — full gate (project + affected apps/packages)
- `pnpm run ci:project` — root-only gate
- `pnpm run ci:apps` — affected apps only
- `pnpm run ci:packages` — affected packages only

---

## Debug tips

- `affected-apps.mjs` must print valid JSON to stdout.
- Use `console.error(...)` for debug logs to avoid breaking JSON parsing.
- When in doubt, run with `AFFECTED_MODE=staged` to confirm local behavior.
