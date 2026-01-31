# No Relative Imports (Base Rule)

All imports must use absolute aliases.

## Rule

- ❌ No relative parent imports (`../`)
- ✅ Use defined aliases (`@root/*`, `@pkg/*`, `@app/*`)

## Why

- Keeps boundaries explicit
- Avoids brittle refactors
- Enforces clear ownership between app and project code

## Examples

**Bad**

```
import { foo } from '../utils/foo';
```

**Good**

```
import { foo } from '@app/utils/foo';
```
