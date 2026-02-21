---
trigger: model_decision
---
# Rule: No return in finally

Do not `return` from a `finally` block.

## Why

A `return` in `finally` overrides:

- values returned from `try` or `catch`
- errors thrown in `try` or `catch`

## Allowed

- Cleanup-only code, no control flow changes

## Example

```ts
function run() {
	try {
		return 'ok'
	} finally {
		doCleanup()
	}
}
```
