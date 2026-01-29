# 2 — Generate Blueprint Project Guide (Seed)

## 🎯 Goal

Create the **Blueprint Project Guide** — an editable, project-owned baseline that defines the conventions and standards this project will apply through the Blueprint System.

This step converts guidance into project intent.  
Until this exists, the Blueprint System is installed but **not yet ready to fill in**.

## 📦 What This Step Produces

This step produces **one artifact**:

- `docs/blueprint/Blueprint Project Guide.md`

This document:

- Is owned by the project
- Starts from one upstream Guide (Public, Team, or Master)
- Defines baseline conventions (principles + layer intent + standards outline)
- Becomes the starting point for all deeper Blueprint System artifacts

No layer docs are expanded yet  
No tooling is configured yet  
No ADRs are created yet

This step establishes the **baseline**, not the full system.

## 🧠 Mental Model

The Blueprint Project Guide is the project’s **seed contract**:

- Broad on purpose (it’s the outline)
- Edited to match project reality (constraints, scope, deviations)
- Used as the source of truth to build deeper documents inside `/docs/blueprint/`

After this guide is edited, the team begins expanding the system by filling out layer artifacts that enforce and detail what the guide establishes.

## 📚 How This Document Is Created

Choose **one** upstream starting point:

- **Public Edition** — lightweight, exploratory adoption
- **Team Edition** — balanced default for most teams
- **Master Edition** — deep, opinionated starting point

Then:

- Copy the chosen Guide into `docs/blueprint/`
- Rename it to `Blueprint Project Guide.md`
- Edit it to match the project:
  - remove irrelevant sections
  - tighten/expand standards as needed
  - add constraints, scope, and deviations

The upstream Guide stays unchanged. The copied file becomes project-owned.

## 🚫 Explicit Non-Goals

This step does **not**:

- Install the Blueprint System (already done in Step 1)
- Populate layer directories with detailed rules or setup artifacts
- Configure tooling or infrastructure
- Create ADRs or stack summaries

Those happen after the baseline is defined.

## 🛠 Setup Steps

1. Select an upstream Guide + version
2. Copy it into the project as `docs/blueprint/Blueprint Project Guide.md`
3. Edit it to reflect project reality and desired rigor
4. Begin expanding deeper layer artifacts using the guide as the baseline

## ✅ Verification

- `docs/blueprint/Blueprint Project Guide.md` exists
- It references which upstream Guide + version it was derived from
- It has been edited for the project (not a verbatim copy)
- It includes baseline conventions (principles + layer intent + standards outline)
- Deeper layer artifacts are created only to expand and enforce what this guide establishes
