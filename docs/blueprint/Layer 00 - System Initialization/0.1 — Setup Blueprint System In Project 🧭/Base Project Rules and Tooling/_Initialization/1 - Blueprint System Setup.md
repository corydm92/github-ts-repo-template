# 1 — Blueprint System Setup

## 🎯 Goal

Create a predictable `/docs` structure, and framing `README.md` files so contributors know where information lives before any project-specific blueprint documents or decisions are written.

## 📦 What This Step Produces

This step produces **two artifacts**:

- A standardized `/docs` directory structure (project docs, ADRs, blueprint, process, references)
- A `README.md` in each directory that explains what belongs there

- No Blueprint Project Guide is created yet
- No project decisions are recorded yet
- No tooling is chosen yet

This step only establishes the _documentation skeleton_ so future docs land in the right place

## 🧠 Mental Model

Treat `/docs` like the project’s “operating system” for knowledge:

- The folders are **well-known addresses** (people can reliably point to one place for one kind of truth)
- The READMEs are **signposts** (prevent “random-doc sprawl” before it starts)
- `/docs/blueprint` contains layer standards + learning, while `/docs/adr` is decision history
- If a doc doesn’t have an obvious home, that’s a signal the structure (or the doc) needs clarification

Result: onboarding is faster, reviews are cleaner, and decisions don’t get lost in Slack archaeology

## 🗂 Blueprint System Structure

```
/docs
├─ __project/                                           # Project-wide truth (overview, stack, ownership, review cadence)
├─ adr/                                                 # Architecture Decision Records (immutable decisions)
├─ blueprint/                                           # Blueprint root (layers + section standards)
│  ├─ Blueprint Project Guide.md (created in Step 2)    # Project-level guidelines that govern how the Blueprint System is applied
│  ├─ Layer 00 - System Initialization/
│  ├─ Layer 01 - Language & Architecture/
│  │  └─ 1.1 Section Example/                           # Example Section showing the standard internal structure, will be generated for every layer
│  │     ├─ README.md
│  │     ├─ Base Project Rules and Tooling/
│  │     │  ├─ __Initialization/
│  │     │  │  └─ README.md
│  │     │  └─ README.md
│  │     ├─ Core Sequential Subsections/
│  │     │  └─ README.md
│  │     └─ Supporting Atomic Notes/
│  │        └─ README.md
│  ├─ Layer 02 - State & Framework/
│  │  └─ ...
│  ├─ Layer 03 - Quality & Stability/
│  │  └─ ...
│  ├─ Layer 04 - UI & Experience/
│  │  └─ ...
│  ├─ Layer 05 - Build & Delivery/
│  │  └─ ...
│  └─ Layer 06 - Security & Observability/
│     └─ ...
├─ process/                                             # Workflows + templates used to run the project
└─ references/                                          # Diagrams and external notes (supporting material, not canonical)
```

## 🛠 Setup Steps

This step uses an existing script in this repository:

`scripts/init-docs.sh`

Copy it to the base directory of your project and run:

`chmod +x init-docs.sh && ./init-docs.sh`

## ✅ Verification

- docs/ exists with: \_\_project, adr, blueprint, process, references
- Each directory contains a README.md
- docs/blueprint/\* exists and each layer directory contains a README.md
- Script created only directories and README.md files (no other placeholders)
