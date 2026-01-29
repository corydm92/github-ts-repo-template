# CI/CD System Boundary

CI is the **quality gate**:
- Runs on pull_request (and main if needed)
- Validates formatting, lint, types, and tests
- Validates the inputs required for deterministic builds

CD is the **promotion engine**:
- Rebuilds per environment using the same inputs and rules
- Uses Gitflow triggers (develop, release/*, v* tags)
- Enforces deterministic build settings to avoid drift

Rule: if a step changes build inputs, it belongs in CI, not CD.
