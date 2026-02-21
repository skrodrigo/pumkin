---
trigger: model_decision
---
# Rule: Always handle promises

Every promise must have an explicit rejection path.

## Requirements

- Use `await` inside `try/catch`, or
- Use `.catch(...)` when using `.then(...)`, or
- Return the promise to a caller that handles errors

## Not allowed

- Fire-and-forget promises without `.catch(...)`
- Ignoring `Promise` return values from async functions

## Patterns

### async/await

```ts
try {
	const data = await loadData()
	return { data }
} catch {
	return { data: null }
}
```

### then/catch

```ts
return loadData()
	.then((data) => ({ data }))
	.catch(() => ({ data: null }))
```
