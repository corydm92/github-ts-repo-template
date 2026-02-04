# 1. Feature Flag Strategy

## Goal

Define a consistent flag approach that makes trunk-based releases safe.

## Rules

- Default flags to OFF in production.
- Keep flags small and capability-scoped.
- Assign a clear owner per flag.
- Use a central flag source (config service or environment config).
- Prefer names like `area.capability` for clarity.

## Verification

- New flags default to OFF in production.
- Each flag has an owner and a removal ticket.
