---
trigger: model_decision
---
# Rule: Avoid var

Use `const` by default.
Use `let` only when reassignment is required.
Avoid `var`.

## Why

- `var` is function-scoped and ignores block scope
- `var` hoisting initializes the binding as `undefined`, which hides bugs
- `var` interacts poorly with closures in loops

## Allowed

- Legacy code where changing to `let`/`const` would be risky without tests

## When editing existing code

- If you touch a function/file and see `var` in the modified region, migrate it to `const` or `let`.
