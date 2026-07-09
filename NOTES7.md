# React Notes — Part 7: Password Generator (`useCallback`, `useEffect`, `useRef`)

> Part 1 (`NOTES1.md`) → **creating** a React project (CRA vs Vite).
> Part 2 (`NOTES2.md`) → **components**, the building blocks.
> Part 3 (`NOTES3.md`) → **build your own React** (JSX → object → DOM).
> Part 4 (`NOTES4.md`) → **Hooks** & `useState` (the Counter).
> Part 5 (`NOTES5.md`) → **Virtual DOM, Fiber & reconciliation**.
> Part 6 (`NOTES6.md`) → **Tailwind CSS** + **Props**.
> Part 7 → **A real project: Password Generator** using three new hooks —
> `useCallback`, `useEffect`, `useRef`.

---

## 0. Big Picture (read this first)

We build one small app — a **password generator** — and it forces us to learn three hooks
because each solves a real problem that comes up while building it:

| Hook | The problem it solves here |
|---|---|
| **`useState`** | Store the settings & the password (length, numbers?, symbols?, the password itself). |
| **`useCallback`** | Stop re-creating the generator function on every render — **memoize** it. |
| **`useEffect`** | Run the generator **automatically** whenever a setting changes (and once on load). |
| **`useRef`** | Grab the actual `<input>` DOM node so the **Copy** button can select & copy it. |

> 🧠 **One-line mental model:** *`useState` = remember values · `useCallback` = remember a
> function · `useEffect` = do something after render (side effects) · `useRef` = a direct
> handle to a DOM element (or any value that survives renders without causing one).*

---

## 1. The full project code (from `password_generator/src/App.jsx`)

```jsx
import { useState, useCallback, useEffect, useRef } from 'react'

function App() {
  const [length, setLength]                   = useState(8)
  const [numberAllowed, setNumberAllowed]     = useState(false)
  const [charAllowed, setCharAllowed]         = useState(false)
  const [password, setPassword]               = useState("")

  // useRef → a handle to the password <input> in the DOM
  const passwordRef = useRef(null)

  // useCallback → memoize the generator; only rebuilt if a dependency changes
  const passwordGenerator = useCallback(() => {
    let pass = ""
    let str  = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    if (numberAllowed) str += "0123456789"
    if (charAllowed)   str += "!@#$%^&*()-_+=[]{}~`"

    for (let i = 1; i <= length; i++) {
      const char = Math.floor(Math.random() * str.length)   // 0 .. str.length-1
      pass += str.charAt(char)
    }
    setPassword(pass)
  }, [length, numberAllowed, charAllowed, setPassword])

  // Copy handler — uses the ref to select the text and write it to the clipboard
  const copyPasswordToClipboard = useCallback(() => {
    passwordRef.current?.select()
    passwordRef.current?.setSelectionRange(0, 999)   // optional: nice on mobile
    window.navigator.clipboard.writeText(password)
  }, [password])

  // useEffect → run the generator on first load AND whenever a dependency changes
  useEffect(() => {
    passwordGenerator()
  }, [length, numberAllowed, charAllowed, passwordGenerator])

  return (
    <div className="w-full max-w-md mx-auto shadow-md rounded-lg px-4 py-3 my-8 bg-gray-800 text-orange-500">
      <h1 className="text-white text-center my-3">Password Generator</h1>

      <div className="flex shadow rounded-lg overflow-hidden mb-4">
        <input
          type="text"
          value={password}
          className="outline-none w-full py-1 px-3"
          placeholder="Password"
          readOnly
          ref={passwordRef}                 {/* connect the ref to this node */}
        />
        <button
          onClick={copyPasswordToClipboard}
          className="outline-none bg-blue-700 text-white px-3 py-0.5 shrink-0"
        >copy</button>
      </div>

      <div className="flex text-sm gap-x-2">
        <div className="flex items-center gap-x-1">
          <input
            type="range"
            min={6}
            max={100}
            value={length}
            className="cursor-pointer"
            onChange={(e) => setLength(Number(e.target.value))}
          />
          <label>Length: {length}</label>
        </div>

        <div className="flex items-center gap-x-1">
          <input
            type="checkbox"
            defaultChecked={numberAllowed}
            id="numberInput"
            onChange={() => setNumberAllowed((prev) => !prev)}
          />
          <label htmlFor="numberInput">Numbers</label>
        </div>

        <div className="flex items-center gap-x-1">
          <input
            type="checkbox"
            defaultChecked={charAllowed}
            id="charInput"
            onChange={() => setCharAllowed((prev) => !prev)}
          />
          <label htmlFor="charInput">Characters</label>
        </div>
      </div>
    </div>
  )
}

export default App
```

> ⚠️ **The `App.jsx` in this repo was mid-build** and had two bugs we fixed earlier:
> `const passwordGenerator = () => useCallback(...)` (a hook must **not** be wrapped in an
> extra arrow function → `const passwordGenerator = useCallback(...)`), and an **unclosed
> `<div>`**. The block above is the complete, working version.

---

## 2. `useState` — the four pieces of state

Nothing new vs Part 4, just more of it. We track **four** values:

```jsx
const [length, setLength]               = useState(8)      // slider value
const [numberAllowed, setNumberAllowed] = useState(false)  // include 0-9 ?
const [charAllowed, setCharAllowed]     = useState(false)  // include symbols ?
const [password, setPassword]           = useState("")     // the generated result
```

Each `setX` triggers a re-render. Note the **updater form** for the checkboxes —
`setNumberAllowed(prev => !prev)` — which flips the current value safely.

> 🧠 **Interview line:** "`useState` returns a `[value, setter]` pair; calling the setter
> schedules a re-render. Use the functional updater `setX(prev => …)` when the next value
> depends on the previous one."

---

## 3. `useCallback` — memoizing a function

Every render creates **brand-new function objects**. `passwordGenerator` would be a *different*
function on every render. Usually that's fine — but here the function is a **dependency of
`useEffect`**, so a new function each render could cause the effect to re-run needlessly (or
loop). `useCallback` returns the **same function instance** between renders and only rebuilds it
when a value in its dependency array changes.

```jsx
const passwordGenerator = useCallback(() => {
  /* ...build the password... */
}, [length, numberAllowed, charAllowed, setPassword])
//   └──────────── dependency array ────────────┘
```

- **Signature:** `useCallback(fn, deps)` → returns a **memoized** `fn`.
- It rebuilds `fn` **only** when one of `deps` changes; otherwise you get the cached one.
- Purpose: **performance / referential stability** — not correctness of the logic itself.

> ⚠️ **Common confusion:** `useCallback(fn, deps)` caches the **function**;
> `useMemo(fn, deps)` caches the **return value** of a function. Same idea, different target.

> 🧠 **Interview line:** "`useCallback` memoizes a function so the same reference is reused
> across renders unless a dependency changes. It's useful when a function is passed to child
> components (to avoid re-renders) or is a dependency of another hook like `useEffect`."

---

## 4. `useEffect` — running side effects after render

We want the password to appear **on first load** and **update automatically** whenever the
length or a checkbox changes — without clicking a button. That's a **side effect** (something
that happens as a result of rendering), and `useEffect` is the tool.

```jsx
useEffect(() => {
  passwordGenerator()          // run after render
}, [length, numberAllowed, charAllowed, passwordGenerator])
//  └──────────── dependency array ────────────┘
```

**How the dependency array controls it:**

| Dependency array | When the effect runs |
|---|---|
| *(omitted)* | after **every** render |
| `[]` (empty) | **once**, after the first render (mount) — great for initial fetch/setup |
| `[a, b]` | after the first render **and** whenever `a` or `b` changes |

So here: it runs once on mount (initial password) and again every time a setting changes.

**Cleanup (bonus):** if the effect returns a function, React runs it before the next effect and
on unmount — used for timers, subscriptions, event listeners:
```jsx
useEffect(() => {
  const id = setInterval(tick, 1000)
  return () => clearInterval(id)   // cleanup
}, [])
```

> 🧠 **Interview line:** "`useEffect(fn, deps)` runs side effects after render. With `[]` it
> runs once on mount; with dependencies it re-runs when they change; with no array it runs
> every render. Returning a function provides cleanup that runs before the next effect and on
> unmount."

---

## 5. `useRef` — a direct handle to a DOM node

To make the **Copy** button work we need the real `<input>` element so we can `.select()` its
text. React doesn't give you the DOM node directly — you connect a **ref**.

```jsx
const passwordRef = useRef(null)          // 1. create a ref (starts null)

<input ref={passwordRef} value={password} readOnly />   // 2. attach it to a node

const copy = () => {
  passwordRef.current?.select()                          // 3. use it: .current = the DOM node
  window.navigator.clipboard.writeText(password)
}
```

- `useRef(initial)` returns an object `{ current: initial }`.
- Attach it to an element with the special `ref={…}` prop; after render, `ref.current`
  **is the DOM node**.
- **Changing `ref.current` does NOT trigger a re-render** — that's the key difference from
  state. Use a ref for values you want to persist across renders *without* re-rendering (DOM
  nodes, timer IDs, previous values).

> 🧠 **Interview line:** "`useRef` returns a mutable `{ current }` object that persists across
> renders and does **not** cause a re-render when changed. Its two main uses are accessing DOM
> nodes (via the `ref` prop) and holding mutable values between renders, like timer IDs."

---

## 6. How the four hooks work together (the data flow)

```
User drags slider / toggles a checkbox
        │
        ▼
setLength / setNumberAllowed / setCharAllowed   ← useState setters
        │  (state changes → re-render)
        ▼
useEffect sees its deps changed → calls passwordGenerator()   ← memoized by useCallback
        │
        ▼
generator builds a string → setPassword(pass)   → input shows new password
        │
        ▼
Click "copy" → copyPasswordToClipboard()
        │
        ▼
passwordRef.current.select()  +  clipboard.writeText(password)   ← useRef
```

> 🧠 **Interview line:** "State drives the UI, `useEffect` reacts to state changes to
> regenerate the password, `useCallback` keeps the generator's reference stable so the effect
> doesn't loop, and `useRef` reaches into the DOM so we can select and copy the field."

---

## 7. Controlled inputs recap (why `value` + `onChange`)

The slider and password field are **controlled components** — React state is the single source
of truth:

- `value={length}` / `value={password}` → the input displays what state says.
- `onChange={e => setLength(Number(e.target.value))}` → user input updates state, which
  re-renders the input. Without `onChange`, a `value`-bound input is **read-only** (React even
  warns). The password field is intentionally `readOnly` because the user shouldn't type it.

> ⚠️ `e.target.value` from a range/text input is always a **string**. Wrap with `Number(...)`
> when you need a number (e.g. the loop `i <= length`).

---

## 8. Common gotchas

| Gotcha | What goes wrong | Fix |
|---|---|---|
| `const gen = () => useCallback(...)` | hook wrapped in a function; `gen()` returns the fn, doesn't run it — and it breaks the Rules of Hooks | `const gen = useCallback(() => {...}, deps)` |
| Missing deps in `useCallback` / `useEffect` | stale values (e.g. old `length`) captured in a closure | list every value used inside in the array |
| `useEffect` with no dep array calling `setState` | infinite re-render loop | give it a correct dependency array |
| Reading `ref.current` before render | it's still `null` | only use `.current` in handlers/effects, after mount |
| Expecting a ref change to re-render | UI doesn't update | refs don't re-render; use `useState` for UI values |
| `value` without `onChange` | React warning; input won't change | add `onChange`, or use `readOnly` (as for the password) |
| Forgetting `Number(e.target.value)` | length is a string; comparisons/loops misbehave | convert with `Number(...)` |
| `navigator.clipboard` on non-HTTPS | clipboard API blocked | serve over `localhost`/HTTPS |

---

## 9. Interview Questions & Answers

**Q1. What does `useCallback` do?**
> Memoizes a function — returns the same function reference between renders unless a value in
> its dependency array changes. Used for referential stability (props to children, deps of
> other hooks).

**Q2. `useCallback` vs `useMemo`?**
> `useCallback(fn, deps)` caches the **function**; `useMemo(factory, deps)` caches the
> **value** the factory returns. `useCallback(fn, d)` ≈ `useMemo(() => fn, d)`.

**Q3. What is `useEffect` for?**
> Running **side effects** after render — data fetching, subscriptions, timers, DOM work, or
> here regenerating the password. It runs after the render is committed.

**Q4. How does the `useEffect` dependency array work?**
> No array → runs every render. `[]` → once on mount. `[a, b]` → on mount and whenever `a` or
> `b` changes. A returned function is the cleanup, run before the next effect and on unmount.

**Q5. What is `useRef` and how is it different from state?**
> `useRef` returns a persistent mutable `{ current }` object. Unlike state, **mutating it does
> not cause a re-render**. Used for DOM access (`ref` prop) and storing mutable values across
> renders.

**Q6. Why is the password generator wrapped in `useCallback` here?**
> Because it's a dependency of `useEffect`. Without memoization it'd be a new function each
> render, which could make the effect re-run unnecessarily. `useCallback` keeps its reference
> stable so the effect only runs when the actual settings change.

**Q7. Why use `useEffect` instead of just calling the generator in the body?**
> Calling `setPassword` directly during render causes an infinite render loop. `useEffect`
> runs the side effect **after** render and only when its dependencies change.

**Q8. What's a controlled component?**
> An input whose value is driven by React state (`value={state}`) and updated via `onChange`.
> React is the single source of truth for the input's value.

**Q9. How does the copy button work?**
> A `useRef` is attached to the input; on click we call `passwordRef.current.select()` to
> highlight it and `navigator.clipboard.writeText(password)` to copy it.

**Q10. Why must hooks be called at the top level, not inside conditions/loops/nested funcs?**
> React tracks hooks by call order. Calling them conditionally or nesting them (like
> `() => useCallback(...)`) breaks that order and violates the Rules of Hooks.

---

## 10. Quick self-test (cover the answers above)

1. What does `useCallback` memoize? *(a function's reference)*
2. `useEffect` with `[]` runs when? *(once, on mount)*
3. Does changing `ref.current` re-render? *(no)*
4. Why is the generator wrapped in `useCallback`? *(stable ref → useEffect dep)*
5. Why not call `setPassword` directly in the component body? *(infinite loop)*
6. What makes an input "controlled"? *(`value` from state + `onChange`)*
7. How do you access a DOM node in React? *(`useRef` + `ref={…}`, read `.current`)*
8. `useCallback` vs `useMemo`? *(function vs returned value)*

---

### ✅ Summary in one paragraph (for revision)
Part 7 builds a real **password generator** in `password_generator/`, and it teaches three
hooks by necessity. **`useState`** holds the four values (length, numbers?, characters?, the
password). **`useCallback`** memoizes the generator function so it keeps a **stable reference**
across renders — important because it's a dependency of `useEffect`; it only rebuilds when
`length`, `numberAllowed`, or `charAllowed` change. **`useEffect`** runs that generator as a
**side effect after render** — once on mount and again whenever a setting changes — so the
password updates automatically; its **dependency array** decides when it runs (`[]` = once,
`[deps]` = on change), and a returned function would be its cleanup. **`useRef`** gives a direct
`{ current }` handle to the password `<input>` DOM node (attached via `ref={…}`) so the **copy**
button can `.select()` it and write it to the clipboard — and crucially, mutating a ref does
**not** trigger a re-render. Together: state drives the UI, `useEffect` reacts to it,
`useCallback` keeps the reactor stable, and `useRef` reaches into the DOM.
