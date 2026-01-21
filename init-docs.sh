#!/usr/bin/env bash
set -euo pipefail

OPTIONS=(
  "Organized Layer Structure (Base Project Rules and Tooling / Core Sequential Subsections / Supporting Atomic Notes)"
  "Open Layer Structure (open and configurable)"
)

MODE=""
SELECTED=0

supports_tput() { command -v tput >/dev/null 2>&1; }
supports_tput || { echo "Error: 'tput' is required for arrow-key selection." >&2; exit 1; }

hide_cursor() { tput civis || true; }
show_cursor() { tput cnorm || true; }
cleanup() { show_cursor; }
trap cleanup EXIT

draw_menu() {
  tput cup 2 0
  tput ed
  echo "Docs init: choose a layer folder structure"
  echo "Use ↑/↓ and Enter"
  echo
  for i in "${!OPTIONS[@]}"; do
    if [[ "$i" -eq "$SELECTED" ]]; then
      printf "  > %s\n" "${OPTIONS[$i]}"
    else
      printf "    %s\n" "${OPTIONS[$i]}"
    fi
  done
}

read_key() {
  local key
  IFS= read -rsn1 key
  if [[ "$key" == $'\x1b' ]]; then
    IFS= read -rsn2 key
    echo "$key"
    return
  fi
  echo "$key"
}

hide_cursor
while true; do
  draw_menu
  key="$(read_key)"
  case "$key" in
    "[A")
      ((SELECTED--))
      if (( SELECTED < 0 )); then SELECTED=$((${#OPTIONS[@]} - 1)); fi
      ;;
    "[B")
      ((SELECTED++))
      if (( SELECTED >= ${#OPTIONS[@]} )); then SELECTED=0; fi
      ;;
    "")
      if (( SELECTED == 0 )); then MODE="organized"; else MODE="open"; fi
      break
      ;;
  esac
done

show_cursor
echo "Selected: ${OPTIONS[$SELECTED]}"
echo

mkdir -p docs/{_project,adr,blueprint,process,references}

LAYER_DIRS=(
  "00 System Initialization"
  "01 Language Architecture"
  "02 State Framework"
  "03 Quality Stability"
  "04 UI Experience"
  "05 Build Delivery"
  "06 Security Observability"
)

for layer in "${LAYER_DIRS[@]}"; do
  mkdir -p "docs/blueprint/${layer}"
done

cat > docs/README.md <<'EOF'
# Documentation

/docs is the documentation root for this project.

Folders:
- /docs/_project — project-wide truth (overview, stack, ownership, review cadence)
- /docs/adr — architecture decision records (immutable decisions)
- /docs/blueprint — layer guides, standards, examples
- /docs/process — workflows + templates used to run the project
- /docs/references — diagrams and external notes
EOF

cat > docs/_project/README.md <<'EOF'
# _project

Project-wide truth and overview.

This folder answers:
- What is this system?
- What is the current stack and why?
- Who owns the foundations and how often do we review them?
EOF

cat > docs/adr/README.md <<'EOF'
# ADRs

Architecture Decision Records (ADRs) are immutable once accepted.

Rules:
- Accepted ADRs do not change
- If a decision changes, write a new ADR that supersedes the old one
- ADRs should link to related docs in /docs/_project and /docs/blueprint
EOF

cat > docs/blueprint/README.md <<'EOF'
# Blueprint

Layer-by-layer engineering standards and examples.

This folder contains:
- Layer guides (00–06) in maturity order
- Example-driven conventions
- Checklists that prevent drift as the system grows
EOF

cat > docs/process/README.md <<'EOF'
# Process

Repeatable engineering workflows and templates.

This folder contains:
- Templates (created in later steps)
- Operating procedures for maintaining the repo
EOF

cat > docs/references/README.md <<'EOF'
# References

Supporting material (diagrams, external notes, links).

Rules:
- Link to sources when possible
- Don’t duplicate canonical documentation here
EOF

for dir in docs/blueprint/*; do
  [[ -d "$dir" ]] || continue
  layer="$(basename "$dir")"

  if [[ "$MODE" == "organized" ]]; then
    cat > "$dir/README.md" <<EOF
# ${layer}

Layer guide directory.

This layer contains Sections only.
Each Section contains:
- Base Project Rules and Tooling (includes 00 Initialization)
- Core Sequential Subsections
- Supporting Atomic Notes
EOF
  else
    cat > "$dir/README.md" <<EOF
# ${layer}

Layer guide directory.

This folder contains:
- Standards
- Examples
- Checklists
- “How to implement” docs for this layer

Structure: open and configurable (no required subfolders).
EOF
  fi

  SECTION_EXAMPLE_DIR="$dir/00 Section Example"
  mkdir -p "$SECTION_EXAMPLE_DIR"

  if [[ "$MODE" == "organized" ]]; then
    mkdir -p \
      "$SECTION_EXAMPLE_DIR/Base Project Rules and Tooling/00 Initialization" \
      "$SECTION_EXAMPLE_DIR/Core Sequential Subsections" \
      "$SECTION_EXAMPLE_DIR/Supporting Atomic Notes"

    cat > "$SECTION_EXAMPLE_DIR/README.md" <<'EOF'
# 00 Section Example

Copy this folder to create a new section in this layer, then rename it.

Structure (organized):
- Base Project Rules and Tooling
  - 00 Initialization
- Core Sequential Subsections
- Supporting Atomic Notes
EOF

    cat > "$SECTION_EXAMPLE_DIR/Base Project Rules and Tooling/README.md" <<'EOF'
# Base Project Rules and Tooling

Enforced project rules and configuration for this section.

This folder contains:
- Non-negotiable rules and standards
- Tooling requirements
- 00 Initialization (setup path for adding this module to a project)
EOF

    cat > "$SECTION_EXAMPLE_DIR/Base Project Rules and Tooling/00 Initialization/README.md" <<'EOF'
# 00 Initialization

How to add this section to a project.

This folder is the practical setup path for this module:
- What to add (files, packages, scripts, config)
- How to configure it (required settings + defaults)
- How to verify it works (commands + expected output)
- Common setup issues (symptoms + fixes)
EOF

    cat > "$SECTION_EXAMPLE_DIR/Core Sequential Subsections/README.md" <<'EOF'
# Core Sequential Subsections

The ordered learning path for this section.

Rules:
- Progressive sequence
- Each step assumes the prior step
- No jumps, no orphan concepts
EOF

    cat > "$SECTION_EXAMPLE_DIR/Supporting Atomic Notes/README.md" <<'EOF'
# Supporting Atomic Notes

Small, focused notes that support this section without bloating Core.

Use this for:
- single-topic explanations
- examples
- gotchas and edge cases
EOF
  else
    cat > "$SECTION_EXAMPLE_DIR/README.md" <<'EOF'
# 00 Section Example

Copy this folder to create a new section in this layer, then rename it.

Structure: open and configurable (no required subfolders).
EOF
  fi
done

echo "✅ Docs structure + README framing created."
