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

bold() { tput bold 2>/dev/null || true; }
normal() { tput sgr0 2>/dev/null || true; }
reverse_on() { tput rev 2>/dev/null || true; }
reverse_off() { tput sgr0 2>/dev/null || true; }

draw_menu() {
  tput clear

  # Top padding so nothing is flush against the terminal header
  local TOP_PAD=2
  tput cup "$TOP_PAD" 0

  echo "Docs init: choose a layer folder structure"
  echo "↑/↓ to move • Enter to select"
  echo

  for i in "${!OPTIONS[@]}"; do
    if [[ "$i" -eq "$SELECTED" ]]; then
      reverse_on
      printf "  > %s\n" "${OPTIONS[$i]}"
      reverse_off
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
tput clear
tput cup 0 0

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
echo
echo "Selected: ${OPTIONS[$SELECTED]}"
echo

mkdir -p docs/{__project,adr,blueprint,process,references}

# ✅ Layer directories are two-digit (00–06) and prefixed with "Layer"
LAYER_DIRS=(
  "Layer 00 - System Initialization"
  "Layer 01 - Language & Architecture"
  "Layer 02 - State & Framework"
  "Layer 03 - Quality & Stability"
  "Layer 04 - UI & Experience"
  "Layer 05 - Build & Delivery"
  "Layer 06 - Security & Observability"
)

for layer in "${LAYER_DIRS[@]}"; do
  mkdir -p "docs/blueprint/${layer}"
done

cat > docs/README.md <<'EOF'
# Documentation

/docs is the documentation root for this project.

Folders:
- /docs/__project — project-wide truth (overview, stack, ownership, review cadence)
- /docs/adr — architecture decision records (immutable decisions)
- /docs/blueprint — layer guides, standards, examples
- /docs/process — workflows + templates used to run the project
- /docs/references — diagrams and external notes
EOF

cat > docs/__project/README.md <<'EOF'
# __project

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
- ADRs should link to related docs in /docs/__project and /docs/blueprint
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

# ✅ Extract the two-digit layer index (00–06) from "Layer 00 - ..."
layer_number_from_name() {
  local layer_name="$1"
  local prefix=""
  if [[ "$layer_name" =~ ([0-9]{2}) ]]; then
    prefix="${BASH_REMATCH[1]}"
  else
    echo "Error: could not parse layer number from: $layer_name" >&2
    exit 1
  fi
  echo "$((10#$prefix))"
}

for dir in docs/blueprint/*; do
  [[ -d "$dir" ]] || continue
  layer="$(basename "$dir")"
  layer_num="$(layer_number_from_name "$layer")"

  # ✅ Sections are decimals of the base layer number (0.1, 1.1, 2.1, ...)
  section_prefix="${layer_num}.1"
  section_name="${section_prefix} Section Example"
  SECTION_EXAMPLE_DIR="$dir/${section_name}"

  if [[ "$MODE" == "organized" ]]; then
    cat > "$dir/README.md" <<EOF
# ${layer}

This layer contains Sections only.

Each Section contains:
- Base Project Rules and Tooling (includes __Initialization)
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

  mkdir -p "$SECTION_EXAMPLE_DIR"

  if [[ "$MODE" == "organized" ]]; then
    mkdir -p \
      "$SECTION_EXAMPLE_DIR/Base Project Rules and Tooling/__Initialization" \
      "$SECTION_EXAMPLE_DIR/Core Sequential Subsections" \
      "$SECTION_EXAMPLE_DIR/Supporting Atomic Notes"

    cat > "$SECTION_EXAMPLE_DIR/README.md" <<EOF
# ${section_name}

Copy this folder to create a new Section in this layer, then rename it.

Structure:
- Base Project Rules and Tooling
  - __Initialization
- Core Sequential Subsections
- Supporting Atomic Notes
EOF

    cat > "$SECTION_EXAMPLE_DIR/Base Project Rules and Tooling/README.md" <<'EOF'
# Base Project Rules and Tooling

Enforced project rules and configuration for this Section.

This folder contains:
- Non-negotiable rules and standards
- Tooling requirements
- __Initialization (setup path for adding this module to a project)
EOF

    cat > "$SECTION_EXAMPLE_DIR/Base Project Rules and Tooling/__Initialization/README.md" <<'EOF'
# __Initialization

How to adopt this Section in a project.

This folder is the practical setup path for this module:
- What to add (files, packages, scripts, config)
- How to configure it (required settings + defaults)
- How to verify it works (commands + expected output)
- Common setup issues (symptoms + fixes)
EOF

    cat > "$SECTION_EXAMPLE_DIR/Core Sequential Subsections/README.md" <<'EOF'
# Core Sequential Subsections

The ordered learning path for this Section.

Rules:
- Progressive sequence
- Each step assumes the prior step
- No jumps, no orphan concepts
- No setup/config here (setup lives in Base Project Rules and Tooling/__Initialization)
EOF

    cat > "$SECTION_EXAMPLE_DIR/Supporting Atomic Notes/README.md" <<'EOF'
# Supporting Atomic Notes

Small, focused notes that support this Section without bloating Core.

Use this for:
- single-topic explanations
- examples
- gotchas and edge cases
EOF
  else
    cat > "$SECTION_EXAMPLE_DIR/README.md" <<EOF
# ${section_name}

Copy this folder to create a new Section in this layer, then rename it.

Structure: open and configurable (no required subfolders).
EOF
  fi
done

echo "✅ Docs structure + README framing created."
