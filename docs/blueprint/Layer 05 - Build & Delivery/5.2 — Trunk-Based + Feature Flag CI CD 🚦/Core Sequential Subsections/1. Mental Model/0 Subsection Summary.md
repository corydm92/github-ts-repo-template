# 0. Section Summary

Mental Model → CI Gate → CD Promotion → Release Tagging

This section defines a single CI/CD system with:

- One quality gate (CI) that is always enforced
- One promotion path (CD) that rebuilds per environment with deterministic inputs
- One prod trigger (tag) that is auditable and repeatable

## Goal

Align the team on the CI/CD boundary and the required order of operations.

Flow: model → gate → promotion → tag.

## How to use

Read this subsection before the CI gate details to understand the boundary rules.
