---
name: state-derived-no-effect
description: Eliminate derived state stored via useState + synchronized via useEffect. Use when refactoring React components that have extra renders, chained effects, or state inconsistencies due to "when X changes, set Y" patterns.
license: MIT
metadata:
	author: sintesy
	version: '1.0'
---

# State derived during render (no effect)

This skill targets a common React performance and correctness anti-pattern:

- Keeping **derived values** in state via `useState`
- Keeping that state "in sync" via `useEffect`

This usually causes:

- Extra render passes (render -> effect -> setState -> re-render)
- Intermediate inconsistent UI state
- Cascading effects (effect A updates state that triggers effect B)

The fix is typically to compute derived values during render.

---

## Rule

If a value can be computed from existing `props` or `state`, it should **not** be stored in `useState` and should **not** be synchronized with `useEffect`.

Instead:

- Compute it directly during render, or
- Use `useMemo` only when the computation is expensive and has been measured

---

## What to look for (detection heuristics)

### 1) Derived state sync effect

Pattern:

```tsx
const [filteredItems, setFilteredItems] = useState<Item[]>([])

useEffect(() => {
	setFilteredItems(items.filter((item) => item.isActive))
}, [items])
```

Signals:

- `useEffect` calls a `setX(...)`
- The dependency array contains values used to compute the next state
- The new state is purely a function of existing values

### 2) Chained effects (render cascades)

Pattern:

- Effect A updates state X
- Effect B depends on X and updates Y

This produces multiple consecutive re-renders and makes the UI temporarily inconsistent.

### 3) State that is only used for rendering

If a `useState` value is never modified by user interaction, external events, or async results, it's probably derived.

---

## Refactor recipe

### Step 1: Remove the derived `useState`

Replace:

- `const [derived, setDerived] = useState(...)`

with:

- `const derived = ...` computed from existing inputs

### Step 2: Remove the sync `useEffect`

Delete effects whose only purpose is `setDerived(...)`.

### Step 3: If computation is expensive, use `useMemo`

Use `useMemo` only if profiling shows the computation is actually heavy.

---

## Examples

### Example A: filter + total (remove 2 effects + 2 states)

Before:

```tsx
const [filteredItems, setFilteredItems] = useState<Item[]>([])
const [total, setTotal] = useState(0)

useEffect(() => {
	setFilteredItems(items.filter((item) => item.isActive))
}, [items])

useEffect(() => {
	setTotal(filteredItems.length)
}, [filteredItems])
```

After:

```tsx
const filteredItems = items.filter((item) => item.isActive)
const total = filteredItems.length
```

### Example B: expensive derived computation (useMemo)

```tsx
const filteredItems = useMemo(() => {
	return items.filter((item) => item.isActive)
}, [items])
```

Notes:

- `useMemo` returns the computed value during the same render
- This avoids scheduling another render pass (unlike effect + setState)

---

## Why this matters

### Performance

Derived-state effects cause extra renders and commits. On interactive pages, this can increase work on the main thread and degrade responsiveness.

### Correctness

Syncing derived state via effects creates windows where the component is inconsistent:

- Inputs updated
- Derived state not updated yet

This is a source of UI bugs and flicker.

---

## When useEffect is still correct

Use `useEffect` for **side effects outside React**, such as:

- Event listeners (`window`, `document`)
- Timers / intervals with cleanup
- Subscriptions (WebSocket, external stores)
- DOM integrations with non-React libraries
- Logging/analytics

---

## Quick checklist

- [ ] Any `useEffect` that only calls `setState` from existing values? Derive during render.
- [ ] Any chain of effects? Collapse into a single derived computation.
- [ ] Any derived computation that is truly heavy? Use `useMemo` (after measuring).
