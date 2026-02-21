---
name: javascript-fundamentals
description: JavaScript fundamentals for interviews and daily engineering: hoisting, scope, closures, event loop, promises, garbage collection, and error handling.
metadata:
	author: sintesy
	version: '1.0'
---

# JavaScript Fundamentals

## Hoisting and initialization

### var

`var` declarations are hoisted and initialized with `undefined` during the creation phase of the execution context.

```js
console.log(name)
var name = 'Ada'
console.log(name)
```

### let and const

`let` and `const` declarations are hoisted but are not initialized until the declaration is evaluated.
Accessing them before initialization throws a `ReferenceError`.

```js
console.log(name)
let name = 'Ada'
```

### Function declarations vs function expressions

Function declarations are hoisted with their body.

```js
sayHi()
function sayHi() {
	return 'hi'
}
```

Function expressions follow variable initialization rules.

```js
sayHi()
const sayHi = () => 'hi'
```

## Scope and the scope chain

### Scope types

- **Global scope**
- **Function scope**
- **Block scope**

`var` is function-scoped.
`let` and `const` are block-scoped.

### for loops and closure capture

With `var`, the loop uses a single binding.

```js
for (var i = 0; i < 3; i++) {
	setTimeout(() => console.log(i), 0)
}
```

With `let`, each iteration creates a new binding.

```js
for (let i = 0; i < 3; i++) {
	setTimeout(() => console.log(i), 0)
}
```

## Closures

A closure is a function plus the lexical environment it was created in.

```js
function createCounter() {
	let count = 0

	return function increment() {
		count = count + 1
		return count
	}
}

const c1 = createCounter()
const c2 = createCounter()

c1()
c1()
c2()
```

### Closure memory retention

Prefer closing over minimal data.

```js
function createLengthReader(items) {
	const length = items.length
	return function readLength() {
		return length
	}
}
```

## Event loop: call stack, macrotasks, microtasks

The script runs as a macrotask.
Promises schedule microtasks.
Timers schedule macrotasks.
Microtasks are drained after each macrotask.

```js
console.log('first')

setTimeout(() => {
	console.log('timeout')
}, 0)

Promise.resolve().then(() => {
	console.log('promise')
})

console.log('third')
```

## Promises and async/await

### Always handle rejections

```js
await fetch(url)
	.then((res) => res.json())
	.catch(() => ({ ok: false }))
```

### Parallelize independent async work

```js
const [a, b] = await Promise.all([getA(), getB()])
```

## Garbage collection (reachability)

Objects are kept alive while reachable from roots:

- global objects
- the call stack
- closures
- active timers/listeners

Prefer `WeakMap` for caches keyed by objects.

```js
const cache = new WeakMap()

function memoizeByObjectKey(key, compute) {
	if (cache.has(key))
		return cache.get(key)

	const value = compute()
	cache.set(key, value)
	return value
}
```

## Error handling

### try/catch for sync code

```js
function parseJson(value) {
	try {
		return JSON.parse(value)
	} catch {
		return null
	}
}
```

### try/catch for async code

```js
async function getData(url) {
	try {
		const res = await fetch(url)
		return await res.json()
	} catch (err) {
		throw err
	}
}
```

### Avoid returning from finally

```js
function run() {
	try {
		return 'ok'
	} finally {
		doCleanup()
	}
}
