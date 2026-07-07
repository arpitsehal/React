# React Notes — Part 4: Hooks & `useState` (a Counter project)

> Part 1 (`NOTES1.md`) → **creating** a React project (CRA vs Vite).
> Part 2 (`NOTES2.md`) → **components**, the building blocks.
> Part 3 (`NOTES3.md`) → **build your own React** (JSX → object → DOM).
> Part 4 → **Hooks**, learned by building a **Counter** (`counter/src/App.jsx`).

---

## 0. Big Picture (read this first)

So far our UI has been **static** — it draws once and never changes. Real apps need the
screen to **update when data changes** (a counter goes up, a form fills in, a list grows).

**The core problem hooks solve:**
> If you change a normal JavaScript variable, **React does not re-draw the screen.**
> React needs a special way to store changing data *and* re-render when it changes.
> That special way is a **Hook** — and the most basic one is **`useState`**.

To feel this, we build a **counter** with an *Add* and *Remove* button:

| File | What it does |
|------|--------------|
| `counter/src/App.jsx` | the counter component using `useState` |
| `counter/src/main.jsx` | mounts `<App />` into `#root` (same as before) |

---

## 1. Why a normal variable does NOT work

Beginners try this first — and it **fails**:

```jsx
function App() {
  let counter = 0;                       // ❌ plain variable

  const addValue = () => {
    counter = counter + 1;               // value DOES change in memory...
    console.log(counter);                // ...console shows 1, 2, 3
  };

  return (
    <>
      <h2>value : {counter}</h2>         {/* ...but the SCREEN stays 0 */}
      <button onClick={addValue}>Add</button>
    </>
  );
}
```

The number changes in memory, but **the UI never updates**. Why? Because React only
re-renders a component when its **state** changes. A plain `let` variable is invisible to
React's rendering system — nothing tells React "redraw me."

> 🧠 **Interview line:** "Updating a normal variable doesn't re-render the component.
> React re-renders only when *state* changes, so UI that needs to change over time must
> live in state via a hook like `useState` — not in a plain variable."

---

## 2. The fix — `useState`

```jsx
import { useState } from 'react';

function App() {
  const [counter, setCounter] = useState(0);
  //      │          │                  │
  //      │          │                  └─ initial value (starts at 0)
  //      │          └─ the FUNCTION to update it (triggers a re-render)
  //      └─ the current state VALUE (read this in your JSX)
}
```

`useState(0)` returns an **array of exactly two things**, and we grab them with array
destructuring:

1. **`counter`** — the current value. Use it to *read/display* state.
2. **`setCounter`** — the *setter*. Call it to *change* state. **Only the setter tells
   React to re-render** — that's the whole point.

> 🧠 **Interview line:** "`useState(initial)` returns `[value, setter]`. You read the
> value in JSX and call the setter to update it. Calling the setter is what schedules a
> re-render, which is why UI updates — assigning to the variable directly would not."

---

## 3. The actual Counter code (from my repo)

```jsx
import { useState } from 'react';

function App() {
  const [counter, setCounter] = useState(0);

  const addValue = () => {
    setCounter(counter + 1);              // update state -> React re-renders
  };

  return (
    <>
      <h1>Counter by Arpit</h1>
      <h2>value : {counter}</h2>          {/* reads current state */}
      <button onClick={addValue}>Add value</button>
      <br />
      <button onClick={() => setCounter(counter - 1)}>Remove value</button>
    </>
  );
}

export default App;
```

What happens on a click:
1. You click **Add value** → `addValue()` runs.
2. `setCounter(counter + 1)` updates the state.
3. React **re-renders `App`** → `{counter}` in the JSX now shows the new number.
4. The **Remove value** button does the same with `counter - 1`, using an **inline arrow
   function** so it only runs on click (not during render).

> ⚠️ **Why `onClick={addValue}` and not `onClick={addValue()}`?**
> You pass the **function itself** (a reference), so React calls it *when clicked*. Adding
> `()` would call it **immediately during render** — wrong. For the Remove button we wrap
> it in `() => setCounter(counter - 1)` for the same reason: delay the call until click.

---

## 4. The important lesson — state updates are asynchronous & batched

This is the classic interview trap. Suppose you try to add 4 at once:

```jsx
const addValue = () => {
  setCounter(counter + 1);
  setCounter(counter + 1);
  setCounter(counter + 1);
  setCounter(counter + 1);   // expecting +4...
};
```

**Result: the counter only goes up by 1, not 4.** 😮

**Why?** During one render, `counter` is a **fixed snapshot** (say `0`). All four calls
read the *same* `0` and compute `0 + 1 = 1`. React also **batches** the updates into one
re-render. So four identical "set it to 1" calls collapse into a single +1.

### The fix — pass a function (the "updater" form)
```jsx
const addValue = () => {
  setCounter(prev => prev + 1);
  setCounter(prev => prev + 1);
  setCounter(prev => prev + 1);
  setCounter(prev => prev + 1);   // now correctly +4
};
```

When you pass a **function**, React feeds it the **latest pending value** each time
(`prev`), so they chain: `0→1→2→3→4`. Use the updater form **whenever the new value
depends on the old value**.

> 🧠 **Interview line:** "State updates are asynchronous and batched. Within one render
> `counter` is a snapshot, so calling `setCounter(counter + 1)` multiple times only
> applies once. Use the functional updater `setCounter(prev => prev + 1)` so each update
> builds on the latest value."

---

## 5. What a "Hook" even is

A **Hook** is a special React function (its name starts with `use…`) that lets a
**functional component** "hook into" React features like state and lifecycle.

- `useState` → add state (a memory that survives re-renders).
- `useEffect` → run side effects (fetch data, timers) — covered later.
- `useRef`, `useContext`, … → other features.

### The Rules of Hooks (must-know)
1. **Only call hooks at the top level** of a component — never inside `if`, loops, or
   nested functions. React relies on the **call order** being the same every render.
2. **Only call hooks from React functions** — components or custom hooks, not plain JS.
3. **Hook names start with `use`** — a convention React's tooling depends on.

> 🧠 **Interview line:** "Hooks are functions starting with `use` that let function
> components use state and other React features. They must be called at the top level and
> in the same order every render, because React tracks hooks positionally, not by name."

---

## 6. The re-render mental model

```
click "Add value"
      │
      ▼
setCounter(counter + 1)      ← updates state + tells React "this changed"
      │
      ▼
React re-runs App()          ← the whole function runs again...
      │
      ▼
useState returns the NEW counter value (state is preserved across renders)
      │
      ▼
JSX rebuilt with new {counter}  →  React diffs & updates only what changed in the DOM
```

Two things to internalize:
- The component **function runs again on every state change** — but `useState`
  **remembers** the value between runs (it doesn't reset to `0`).
- React updates **only the parts of the DOM that changed** (here, the `<h2>` text), not
  the whole page — that's the virtual-DOM efficiency from Part 3.

---

## 7. Common gotchas

| Gotcha | What goes wrong | Fix |
|--------|-----------------|-----|
| Using a plain `let` for changing UI | screen never updates | store it in `useState` |
| `onClick={addValue()}` | runs on render, not click; can loop | pass reference `onClick={addValue}` or `onClick={() => ...}` |
| Multiple `setCounter(counter + 1)` in a row | only applies once (snapshot + batching) | use `setCounter(prev => prev + 1)` |
| Expecting `counter` to change on the next line after `setCounter` | it's still the old value | state updates apply on the **next render**, not immediately |
| Calling a hook inside an `if`/loop | breaks hook order → bug/crash | call hooks at the **top level** only |
| Mutating state directly (`counter++`) | React doesn't detect it | always go through the setter |

---

## 8. Interview Questions & Answers

**Q1. What is a hook in React?**
> A special `use…` function that lets a function component use React features like state.
> `useState` is the most basic one; it adds state that persists across re-renders.

**Q2. Why can't we just update a normal variable to change the UI?**
> React only re-renders when *state* changes. A plain variable changes in memory but never
> triggers a re-render, so the screen stays stale. State via `useState` triggers re-render.

**Q3. What does `useState` return?**
> An array of two items: the current state value and a setter function —
> `const [value, setValue] = useState(initial)`.

**Q4. What actually causes the component to re-render?**
> Calling the state setter (e.g. `setCounter`). That schedules React to re-run the
> component and update the DOM with the new value.

**Q5. Why does calling `setCounter(counter + 1)` four times only add 1?**
> Within one render `counter` is a fixed snapshot, so all four read the same value and
> compute the same result, and React batches them into one update.

**Q6. How do you correctly update state based on the previous value?**
> Use the functional/updater form: `setCounter(prev => prev + 1)`. React passes the latest
> pending value as `prev`, so multiple updates chain correctly.

**Q7. Why write `onClick={addValue}` instead of `onClick={addValue()}`?**
> You pass a function *reference* so React calls it on click. With `()` it runs immediately
> during render, which is wrong (and can cause infinite loops if it sets state).

**Q8. Is `setCounter` synchronous? Is `counter` updated right after you call it?**
> No — state updates are asynchronous and batched. The new value shows up on the *next*
> render, not on the line right after the setter call.

**Q9. What are the Rules of Hooks?**
> Call hooks only at the top level (not inside conditions/loops/nested functions) and only
> from React components or custom hooks. This keeps their call order stable across renders.

**Q10. Does the component function run again on every state change?**
> Yes. The whole component function re-runs, but `useState` preserves the value between
> runs, so it doesn't reset to the initial value.

**Q11. Can a component have multiple pieces of state?**
> Yes — call `useState` multiple times, one per independent value (e.g. name, age, count).
> React tracks them by call order, which is why hooks must stay at the top level.

**Q12. What's the difference between the value and the setter from `useState`?**
> The value is read-only for display; the setter is the *only* correct way to change state
> and is what triggers the re-render. Never mutate the value directly.

---

## 9. Quick self-test (cover the answers above)

1. Why doesn't changing a plain variable update the screen? *(no re-render; only state triggers it)*
2. What two things does `useState` give you? *(the value + the setter)*
3. What triggers a re-render? *(calling the setter, e.g. `setCounter`)*
4. Why does 4× `setCounter(counter + 1)` add only 1? *(snapshot + batching)*
5. How do you fix it? *(`setCounter(prev => prev + 1)`)*
6. Why `onClick={addValue}` not `onClick={addValue()}`? *(pass reference, don't call on render)*
7. Where must hooks be called? *(top level of the component only)*

---

### ✅ Summary in one paragraph (for revision)
UI that changes over time can't live in a plain variable, because React **only re-renders
when state changes**. The fix is the **`useState`** hook: `const [counter, setCounter] =
useState(0)` gives you the current **value** (to display) and a **setter** (to update).
Calling the setter is what **schedules a re-render**, so the screen updates — assigning to
the variable directly would not. State updates are **asynchronous and batched**, so calling
`setCounter(counter + 1)` several times in one handler only applies once (it reads a fixed
snapshot); when the new value depends on the old, use the **functional updater**
`setCounter(prev => prev + 1)` so updates chain correctly. Pass event handlers as
**references** (`onClick={addValue}`), not calls, so they fire on click, and follow the
**Rules of Hooks** — call them at the top level, in the same order, every render. I proved
all of this by building the **Counter** in `counter/src/App.jsx` with Add/Remove buttons.
