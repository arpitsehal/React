# React Notes — Part 8: Custom Hooks & the Currency Converter (`useCurrencyInfo`, `useId`)

> Part 1 (`NOTES1.md`) → **creating** a React project (CRA vs Vite).
> Part 2 (`NOTES2.md`) → **components**, the building blocks.
> Part 3 (`NOTES3.md`) → **build your own React** (JSX → object → DOM).
> Part 4 (`NOTES4.md`) → **Hooks** & `useState` (the Counter).
> Part 5 (`NOTES5.md`) → **Virtual DOM, Fiber & reconciliation**.
> Part 6 (`NOTES6.md`) → **Tailwind CSS** + **Props**.
> Part 7 (`NOTES7.md`) → **Password Generator** (`useCallback`, `useEffect`, `useRef`).
> Part 8 → **A real project: Currency Converter** — writing your **own custom hook**
> (`useCurrencyInfo`) plus `useId` and reusable components.

---

## 0. Big Picture (read this first)

A **custom hook** is just a **normal JavaScript function whose name starts with `use`** and
which *uses other hooks inside it*. That's the entire idea. We take logic that's tangled up in a
component — here, "fetch the exchange rates for a currency" — and **extract it into a reusable
function** so any component can call it.

In this project three ideas come together:

| Piece | What it does here |
|---|---|
| **Custom hook `useCurrencyInfo(currency)`** | Encapsulates the `useState` + `useEffect` + `fetch` that loads exchange-rate data. |
| **`useId`** | Generates a unique, stable `id` inside the reusable `InputBox` so `<label>`↔`<input>` link correctly. |
| **Reusable `InputBox` component** | One styled input+dropdown, used twice (From / To) via props. |

> 🧠 **One-line mental model:** *A custom hook is a `use…` function that calls other hooks to
> package reusable stateful logic. It shares **logic**, not state — each component that calls it
> gets its own independent state.*

---

## 1. The project structure (from `currency_convertor/`)

```
src/
├── App.jsx                     # the converter UI + state
├── components/
│   ├── InputBox.jsx            # reusable input + currency dropdown (uses useId)
│   └── index.js                # barrel file → export { InputBox }
└── hooks/
    └── useCurrencyInfo.js      # ← the CUSTOM HOOK
```

> The **`hooks/` folder** is just convention — custom hooks live wherever you like, but keeping
> them in `hooks/` makes intent obvious.

---

## 2. The custom hook — `hooks/useCurrencyInfo.js`

```js
import { useState, useEffect } from 'react'

function useCurrencyInfo(currency) {          // ① takes an input (the base currency)
  const [data, setData] = useState({})        // ② its OWN state

  useEffect(() => {                            // ③ side effect: fetch when currency changes
    fetch(`https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/${currency}.json`)
      .then((res) => res.json())
      .then((res) => setData(res[currency]))   // res.usd = { inr: 83.1, eur: 0.9, ... }
  }, [currency])                               // ④ re-run whenever `currency` changes

  return data                                  // ⑤ return whatever the caller needs
}

export { useCurrencyInfo }
```

**What makes it a hook (not just a function):**
- Name starts with **`use`** → lets React (and the linter) apply the Rules of Hooks.
- It **calls other hooks** inside (`useState`, `useEffect`).
- It **returns** something useful (`data`) — could be a value, an array, or an object.

> ⚠️ **The two real bugs this file shipped with** (we fixed them):
> 1. `export default useCurrencyInfo` but `App.jsx` imported it as a **named** export
>    → *"does not provide an export named useCurrencyInfo"*. Fix: `export { useCurrencyInfo }`
>    (or change the import). **Named vs default must match.**
> 2. The function used `currency` but never declared it as a **parameter**
>    → `currency is not defined`. Fix: `function useCurrencyInfo(currency)`.

> 🧠 **Interview line:** "A custom hook is a JavaScript function starting with `use` that calls
> other hooks to encapsulate reusable stateful logic. `useCurrencyInfo(currency)` hides the
> `useState`/`useEffect`/`fetch` behind a clean API — the component just gets the data back."

---

## 3. Using the hook in `App.jsx`

```jsx
import { useState } from 'react'
import { InputBox } from './components'
import { useCurrencyInfo } from './hooks/useCurrencyInfo'

function App() {
  const [amount, setAmount]                 = useState(0)
  const [from, setFrom]                     = useState("usd")
  const [to, setTo]                         = useState("inr")
  const [convertedAmount, setConvertedAmount] = useState(0)

  const currencyInfo = useCurrencyInfo(from)        // ← call the custom hook
  const options = Object.keys(currencyInfo)         // ["inr","eur","gbp", ...] for dropdowns

  const swap = () => {
    setFrom(to); setTo(from)
    setConvertedAmount(amount); setAmount(convertedAmount)
  }
  const convert = () => setConvertedAmount(amount * currencyInfo[to])

  // ...form with two <InputBox /> (From / To) + swap + convert buttons
}
```

**How the pieces connect:**
1. `useCurrencyInfo(from)` → returns the rate table for the *from* currency (e.g. all USD rates).
2. `Object.keys(currencyInfo)` → the list of currency codes → feeds the dropdown `<option>`s.
3. `convert()` → `amount * currencyInfo[to]` → the converted value.

> ⚠️ **Wiring bugs we fixed in `App.jsx`:** the *From* box had no `onAmountChange` (couldn't
> type), its `onCurrencyChange` called `setAmount` instead of `setFrom`, and the *To* box used
> `selectCurrency={from}` instead of `{to}`. These are **prop-wiring** mistakes, not hook bugs —
> a good reminder that most "React bugs" are just passing the wrong prop.

---

## 4. `useId` — unique IDs for accessibility (inside `InputBox`)

```jsx
import { useId } from 'react'

function InputBox({ label, amount, onAmountChange, currencyOptions = [], /* ... */ }) {
  const id = useId()                                   // ① unique, stable id per instance
  return (
    <div>
      <label htmlFor={id}>{label}</label>              // ② label ↔ input linked by id
      <input id={id} type="number" value={amount}
             onChange={(e) => onAmountChange?.(Number(e.target.value))} />
      {/* dropdown built from currencyOptions.map(...) */}
    </div>
  )
}
```

- `useId()` returns a **unique string** (like `:r0:`) that's **stable across re-renders** and
  **consistent between server and client** (important for SSR/hydration).
- Because `InputBox` is rendered **twice**, hardcoding `id="amount"` would produce **duplicate
  IDs** — `useId` guarantees each instance gets its own.

> ⚠️ **Do NOT use `useId` for list keys.** It's for element IDs (label/input pairing, aria
> attributes), not for `key` in a `.map()`.

> ⚠️ Original file had `import { React, useId } from 'react'` — `React` is the **default**
> export, not a named one, so that imports `undefined`. Fixed to `import { useId } from 'react'`.

> 🧠 **Interview line:** "`useId` generates a unique, stable ID that's consistent across
> server and client renders. Use it to link a `<label>` to an `<input>` in a reusable
> component so you never get duplicate IDs — not for list keys."

---

## 5. Rules of Custom Hooks

1. **Name must start with `use`** — `useCurrencyInfo`, `useAuth`, `useFetch`. This lets the
   linter enforce the Rules of Hooks and tells React it may call hooks.
2. **Only call hooks at the top level** — never inside conditions, loops, or nested functions
   (same rule as built-in hooks; it keeps call order stable).
3. **Call hooks only from React functions** — components or *other* hooks, not plain functions.
4. **It shares logic, not state** — two components calling the same hook each get **separate,
   independent** state. (A custom hook is not a global store.)

> 🧠 **Interview line:** "Custom hooks follow the same Rules of Hooks: call them at the top
> level, only from components or other hooks, and name them starting with `use`. They reuse
> **logic**; each caller still gets its own isolated state."

---

## 6. Why extract a custom hook? (the payoff)

| Without a custom hook | With `useCurrencyInfo` |
|---|---|
| `useState` + `useEffect` + `fetch` copy-pasted into every component that needs rates | one line: `const info = useCurrencyInfo(from)` |
| Fetch logic mixed into UI code | logic separated from presentation |
| Hard to test the data logic alone | hook can be reasoned about / reused independently |

**When to extract one:** the moment the *same* stateful logic (fetching, subscriptions, timers,
form handling) appears in **more than one component** — or a single component gets cluttered with
effect/state plumbing.

> 🧠 **Interview line:** "You extract a custom hook when stateful logic is duplicated across
> components or clutters one component. It's the primary way to reuse logic in function
> components — the modern replacement for HOCs and render props."

---

## 7. Controlled `InputBox` via props (recap of Part 6 + 7)

`InputBox` is a **reusable controlled component** driven entirely by props:

- `value={amount}` + `onChange → onAmountChange(...)` → controlled input.
- `currencyOptions.map(o => <option key={o}>...)` → dropdown from the hook's keys.
- `amountDisable` / `currencyDisable` → the *To* box disables its amount field.
- Optional handlers are guarded: `onAmountChange?.(...)` / `onCurrencyChange && onCurrencyChange(...)`.

One component, rendered twice with different props = the reusability lesson from Part 6, now
combined with a custom hook feeding it data.

---

## 8. Common gotchas

| Gotcha | What goes wrong | Fix |
|---|---|---|
| `export default` vs named import mismatch | "does not provide an export named X" | make export & import styles match |
| Hook uses a variable it never received | `X is not defined` at runtime | declare it as a **parameter**: `useCurrencyInfo(currency)` |
| Hook name doesn't start with `use` | Rules-of-Hooks lint won't apply; may misbehave | always prefix with `use` |
| Calling a hook inside a condition/loop | breaks hook call order | call at top level only |
| Expecting shared state between callers | each call has its **own** state | use context/store for shared state |
| Missing `useEffect` dependency (`[currency]`) | data won't refetch on change / stale data | list every value used inside |
| Dead / wrong API URL | dropdowns empty, `Object.keys({})` = `[]` | use a live endpoint (`@fawazahmed0/currency-api@latest/v1/...`) |
| `useId` used as a list `key` | misuse; keys should be data-derived | use data IDs for keys; `useId` for element IDs |
| `import { React, useId }` | `React` is default export → `undefined` | `import { useId } from 'react'` |

---

## 9. Interview Questions & Answers

**Q1. What is a custom hook?**
> A JavaScript function whose name starts with `use` and which calls other hooks inside it. It
> packages reusable **stateful logic** so multiple components can share it.

**Q2. How is `useCurrencyInfo` a hook and not just a function?**
> Its name starts with `use`, it calls built-in hooks (`useState`, `useEffect`) internally, and
> it returns data for the caller. The `use` prefix also lets the linter enforce hook rules.

**Q3. Do two components calling the same custom hook share state?**
> No. A custom hook shares **logic, not state** — each call gets its own independent `useState`
> and `useEffect`. For shared state you need Context or a store.

**Q4. What rules must custom hooks follow?**
> The Rules of Hooks: call them only at the top level (not in conditions/loops/nested functions)
> and only from React components or other hooks. And name them starting with `use`.

**Q5. Why did you use a `useEffect` with `[currency]` in the hook?**
> So the fetch runs on mount and re-runs **whenever the base currency changes**, keeping the
> rate data in sync with the selected "from" currency.

**Q6. What does `useId` do and when do you use it?**
> It returns a unique, stable ID consistent across server/client renders. Use it for element IDs
> — e.g. pairing `<label htmlFor>` with `<input id>` in a reusable component — never for list keys.

**Q7. Why not hardcode `id="amount"` in `InputBox`?**
> `InputBox` renders twice, so a hardcoded ID would create **duplicate IDs** in the DOM (invalid
> and breaks label association). `useId` gives each instance a unique one.

**Q8. Custom hooks vs HOCs / render props?**
> Custom hooks are the modern way to reuse logic in function components. They avoid the "wrapper
> hell" of HOCs and the verbosity of render props while keeping full access to hooks.

**Q9. Where should the data-fetching logic live — in the component or a hook?**
> In a hook when it's reused or when it clutters the component. Extracting it separates data
> logic from presentation and makes the component read declaratively (`const info = useCurrencyInfo(from)`).

**Q10. What's a common non-hook bug in this project?**
> Prop wiring: passing `selectCurrency={from}` to the *To* box, or an `onCurrencyChange` that
> updates the wrong state. Most "React bugs" are wrong props/exports, not the hooks themselves.

---

## 10. Quick self-test (cover the answers above)

1. What two things make a function a custom hook? *(name starts with `use` + it calls hooks)*
2. Do callers of the same hook share state? *(no — logic shared, state isolated)*
3. Why `[currency]` in the effect? *(refetch when the base currency changes)*
4. What does `useId` guarantee? *(unique, stable, SSR-safe element IDs)*
5. Should you use `useId` for `key`? *(no — element IDs only)*
6. What caused "does not provide an export named useCurrencyInfo"? *(default vs named mismatch)*
7. Why did the hook throw `currency is not defined`? *(missing parameter)*
8. When do you extract a custom hook? *(duplicated/cluttered stateful logic)*

---

### ✅ Summary in one paragraph (for revision)
Part 8 builds a **currency converter** in `currency_convertor/` and its real lesson is the
**custom hook**. A custom hook is nothing magical — it's a **function named `use…` that calls
other hooks** and returns something useful. We extract the fetch-the-exchange-rates logic into
**`useCurrencyInfo(currency)`**, which holds its own `useState({})`, runs a `useEffect` keyed on
`[currency]` to `fetch` the rate table, and **returns `data`** — so `App` just writes
`const currencyInfo = useCurrencyInfo(from)` and reads the rates and `Object.keys` for the
dropdowns. Custom hooks share **logic, not state**: each caller gets isolated state, and they
obey the same **Rules of Hooks** (top-level only, from components/other hooks, `use` prefix).
Alongside it, **`useId`** gives the reusable **`InputBox`** a unique, stable, SSR-safe element ID
so the two rendered instances don't collide on `<label>`/`<input>` pairing. The bugs we hit were
instructive but ordinary: a **default-vs-named export mismatch**, a **missing hook parameter**, a
bad **API URL** (empty dropdowns), and **prop-wiring** slips — none of them the hook concept
itself. Custom hooks are React's primary, modern mechanism for **reusing stateful logic**.
