# 6 — Adding or Changing Tools via ADRs

## 🎯 Goal

Define a **clear, repeatable process** for introducing, changing, or removing foundational tools in the project.

This ensures:

- tool changes are intentional, reviewed, and traceable
- architectural decisions don’t live in PR comments or Slack
- the **Project Stack Summary always reflects current reality**, not decision history

ADRs govern _decisions_.  
The Project Stack Summary reflects the _current state_ after those decisions are accepted.

## 📦 What This Step Produces

This process produces **two artifacts over time**:

1. A new **Architecture Decision Record (ADR)** proposing the tool change
2. An **updated Project Stack Summary** reflecting the accepted decision

Rules:

- The Project Stack Summary **always exists** and reflects current reality
- A proposed ADR may exist temporarily while a decision is under review
- Once accepted, the ADR becomes immutable and the Stack Summary is updated to match

## 🧠 Mental Model

- **ADR** = decision history and governance
- **Project Stack Summary** = current state and onboarding clarity

ADRs answer: “Why did we decide this?”  
The Stack Summary answers: “What are we using right now?”

Both are required. Neither replaces the other.

## 🧭 Required Context Before Starting

Before proposing a tool change, the following must already exist:

- `/docs/process/adr-template.md`  
  The enforced structure for all architectural decisions

- `/docs/project/stack-summary.md`  
  The current, human-readable description of the project’s tools

- A clear understanding of:
  - what problem the new tool solves
  - what it replaces or changes (if anything)
  - why this change matters now

If the change is not architectural or foundational, **do not write an ADR**.

## 🧱 What Counts as a Foundational Tool Change

A change **requires an ADR** if it affects any of the following baselines:

- runtime or package manager (Node, pnpm, etc.)
- framework or rendering model (Next, React, SSR/CSR strategy)
- state or data layer (Redux, TanStack Query, server data model)
- testing strategy or primary runners (Vitest, Jest, Playwright, Cypress)
- build tooling or bundling strategy
- CI/CD gates or deployment platform
- observability or security enforcement (logging, CSP, scanning, RUM)

If it does **not** change one of these, it’s a normal PR — not an ADR.

## 🔁 Standard Flow for Adding or Changing Tools

### 1 — Propose a New ADR

Create a new ADR in `/docs/adr/` using the ADR template.

- Status: `Proposed`
- Clearly state:
  - what tool is being added, changed, or removed
  - what is explicitly **not** being chosen
- Link to the current Project Stack Summary in the Context section

At this stage:

- the ADR **may be edited**
- the Project Stack Summary **must not change yet**

The proposal is under discussion, not law.

### 2 — Review and Accept the ADR

Once the decision is agreed upon:

- Update ADR status to `Accepted`
- Record:
  - Accepted Date
  - Approver(s)
  - Approval context (PR, issue, meeting, etc.)

From this point forward:

- the ADR is **immutable**
- any future change requires a **new ADR**

Enforcement:

- The PR that implements the change **must link the ADR**
- The Stack Summary update must be included in the same PR or immediately after
- If the Stack Summary is not updated, the change is considered incomplete

### 3 — Update the Project Stack Summary

After the ADR is accepted:

- Update `/docs/project/stack-summary.md` to reflect the new reality
- Describe:
  - the new tool
  - what problem it solves
  - how it fits into the system

Rules:

- Do **not** copy ADR language (status, alternatives, approvals)
- Write as present truth, not historical narrative

The Stack Summary should read as:

“This is how the project is built today.”

### 4 — Supersede an Existing ADR (If Needed)

If the new decision replaces a prior one:

- Create a new ADR
- Mark the old ADR as `Superseded`
- Explicitly reference the new ADR in the old one

Never edit an accepted ADR to “update” it.

## 🛠 When These Steps Are Used

This process is **not required during initial project setup**.

It is followed later, whenever a foundational tool or baseline needs to change.

## ✅ Verification Checklist

When a tool change is complete:

- A new ADR exists in `/docs/adr/`
- ADR status is `Accepted`
- Owner and Approver(s) are recorded
- `/docs/project/stack-summary.md` reflects the new tool
- The Stack Summary contains no ADR-specific language
- A new engineer can understand the current stack without reading the ADR
