# Architecture Decision Record

Title: ADR-0009 — CI Task Declaration via ciTasks  
Status: Accepted

Proposed Date: 2026-02-02  
Accepted Date: 2026-02-02

Owner: Cory Morrissey  
Approver(s): Cory Morrissey

---

## Context

The CI runner needs a consistent, readable task list for apps and packages.
Parsing the `scripts.ci` string is brittle, and running `ci` alone hides
which tasks are supposed to run.

Constraints:

- Each workspace owns its CI gates.
- Output must be predictable and human-readable.
- The runner should not guess task ordering.

---

## Decision

Each workspace defines a `ciTasks` array in `package.json`.

- `ciTasks` is the authoritative list of tasks.
- `scripts.ci` must be a `pnpm run <task> && ...` chain that matches `ciTasks`.
- The CI runner uses `ciTasks` for display and execution.
- `workspace-contract.mjs` enforces the 1:1 match.

---

## Rationale

This keeps the CI runner tool-agnostic and deterministic:

- No brittle string parsing.
- Each workspace controls its own gates.
- Output is consistent across apps and packages.

---

## Alternatives Considered

1. Parse `scripts.ci` and infer tasks  
   Rejected due to brittle parsing and error-prone formatting.

2. Run only `scripts.ci` and hide task list  
   Rejected because it reduces visibility and makes debugging harder.

3. Adopt a monorepo tool (Nx/Turbo)  
   Rejected to keep tooling minimal and framework-agnostic.

---

## Consequences

- Each workspace must maintain `ciTasks` in sync with `scripts.ci`.
- CI validation fails if the contract drifts.
- The runner output is stable and clear.

---

## Notes

- Enforced in `scripts/workspace-contract.mjs`.
