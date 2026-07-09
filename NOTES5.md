# React Notes — Part 5: Virtual DOM, Fiber & Reconciliation

> Part 1 (`NOTES1.md`) → **creating** a React project (CRA vs Vite).
> Part 2 (`NOTES2.md`) → **components**, the building blocks.
> Part 3 (`NOTES3.md`) → **build your own React** (JSX → object → DOM).
> Part 4 (`NOTES4.md`) → **Hooks** & `useState` (the Counter project).
> Part 5 → **how React actually updates the screen** — Virtual DOM, Fiber, reconciliation.


---

## 0. Big Picture (read this first)

In Part 4 we saw that calling `setCounter` **re-runs the whole component function** and the
screen updates — but React only touched the one `<h2>` that changed, not the whole page.

**This part answers: *how* does React know what changed and update only that?**

The short version:
1. React builds a lightweight **JavaScript copy of the UI** (the "Virtual DOM").
2. On every state change it builds a **new copy** and **compares** it to the old one — this
   comparison is called **reconciliation** (the "diffing").
3. The engine that does this work in the modern React is called **Fiber**.
4. React then makes the **minimum real-DOM changes** needed.

> 🧠 **One-line mental model:** *Virtual DOM = the plan, reconciliation = spot the
> difference, Fiber = the worker that does it smartly, real DOM = the final paint.*

> ⚠️ **Myth-buster (interview gold):** "The Virtual DOM is fast" is **not** the real reason
> React is good. Touching the real DOM directly can be just as fast. React's value is the
> **programming model** — you describe *what* the UI should look like for a given state, and
> React figures out the updates for you. React's own team has even **moved away** from the
> term "Virtual DOM"; the docs now talk about **React Elements** and **reconciliation**.

---

## 1. Why the real DOM is the problem

The **DOM (Document Object Model)** is the browser's tree of your HTML — every `<div>`,
`<h1>`, `<button>` is a node.

- Reading/updating a single node is cheap.
- But **re-rendering large chunks repeatedly** — and triggering **reflow/repaint** (the
  browser recalculating layout and re-painting pixels) — is **expensive**.
- Old-school apps (or raw jQuery) often **wiped and rebuilt** big sections on every change,
  which is wasteful.

React's goal: **change as little of the real DOM as possible**, only the nodes that
actually differ.

> 🧠 **Interview line:** "The real DOM isn't slow to touch — it's slow to *thrash*.
> Rebuilding large subtrees causes layout reflow and repaint. React minimizes real-DOM
> mutations by diffing a cheap in-memory representation first."

---

## 2. The Virtual DOM — what it really is

The **Virtual DOM** is just a **plain JavaScript object tree** that describes your UI. It's
lightweight because it's *only data* — no layout, no painting, no browser cost.

Remember Part 3: JSX like `<h1>Hi</h1>` becomes an object roughly like:

```js
{
  type: 'h1',
  props: { children: 'Hi' },
  // ...
}
```

That object is a **React Element**. A whole tree of these elements **is** the Virtual DOM.

**The cycle on every render:**

```
state changes
     │
     ▼
React builds a NEW virtual tree (cheap JS objects)
     │
     ▼
compares NEW tree vs OLD tree   ← "reconciliation" / diffing
     │
     ▼
computes the minimal set of real-DOM changes
     │
     ▼
applies ONLY those changes to the real DOM
```

> 🧠 **Interview line:** "The Virtual DOM is an in-memory JS object tree representing the UI.
> React builds a new one each render, diffs it against the previous one, and patches only
> the changed nodes into the real DOM."

---

## 3. Reconciliation — the "spot the difference" step

**Reconciliation** is the **algorithm** React uses to compare the new virtual tree with the
old one and decide what to update, add, or remove.

A perfect tree-diff is mathematically expensive (O(n³)). React makes it fast (**O(n)**) with
two practical **heuristics**:

1. **Different element type → throw the whole subtree away and rebuild it.**
   `<div>` becoming a `<span>`? React doesn't try to reuse — it destroys and recreates.
2. **Same type → keep the DOM node, just update the changed props/attributes.**
   `<h2>value : 0</h2>` → `<h2>value : 1</h2>`: same `h2`, so React only updates the text.
3. **Lists are matched by `key`** — a stable identity so React can tell which items moved,
   were added, or removed (see §6).

> 🧠 **Interview line:** "Reconciliation is React's diffing algorithm. A naive tree diff is
> O(n³); React uses heuristics — different type = replace subtree, same type = update in
> place, lists keyed by `key` — to bring it to O(n)."

---

## 4. Fiber — the modern reconciliation engine (React 16+)

Before React 16, the reconciler was the **Stack reconciler**: once it started diffing a
tree, it ran **synchronously to the end** and **could not be interrupted**. On a big update
this **blocked the main thread**, so animations stuttered and input felt laggy.

**Fiber** (introduced in React 16) is a **complete rewrite** of the reconciliation engine.

**What a "fiber" is:** a **JavaScript object that represents one unit of work** — usually one
component/element. It holds the component's type, its props/state, and **pointers** to its
parent, child, and sibling. The tree of fibers is a **linked list** React can walk, pause,
and resume.

**What Fiber makes possible (the key wins):**

| Capability | Meaning |
|---|---|
| **Incremental rendering** | Split rendering work into small chunks across multiple frames instead of one giant blocking task |
| **Pause / resume / abort** | React can stop mid-render, let the browser handle a click or paint, then continue — or throw the work away if it's stale |
| **Prioritization** | Urgent updates (typing, clicks, animations) can jump ahead of low-priority ones (offscreen data) |
| **Reuse** | Previously completed work can be reused instead of redone |

This is the foundation for **Concurrent React** features (like `useTransition`,
`Suspense`).

> 🧠 **Interview line:** "Fiber is React 16's reconciler rewrite. A fiber is a unit of work
> (a JS object per element with parent/child/sibling links). Because work is broken into
> units, React can pause, resume, reprioritize, and abort rendering — enabling incremental,
> interruptible, concurrent rendering. The old Stack reconciler was synchronous and
> blocking."

---

## 5. Two phases: Render (interruptible) vs Commit (not)

Fiber splits each update into **two phases**:

1. **Render / Reconcile phase** — React builds the new fiber tree and figures out what
   changed. This is **pure**, **in memory**, and **interruptible/pausable**. Nothing is on
   screen yet. (Because it can run multiple times / be thrown away, side effects here are
   dangerous — this is why render must be pure.)
2. **Commit phase** — React applies the computed changes to the **real DOM** in one go.
   This is **synchronous and NOT interruptible** (the UI must update atomically, no
   half-painted screen). `useLayoutEffect` runs here; `useEffect` runs shortly after.

```
[ RENDER PHASE ]  build new fiber tree, diff, list changes   ← pausable, no DOM touched
        │
        ▼
[ COMMIT PHASE ]  apply minimal changes to real DOM          ← fast, atomic, uninterruptible
```

> 🧠 **Interview line:** "An update has two phases: the render phase (build & diff the fiber
> tree — interruptible, in memory, must be pure) and the commit phase (apply changes to the
> real DOM — synchronous and atomic). Fiber can pause the render phase; it never pauses the
> commit phase."

---

## 6. `key` — why lists need it

When rendering a list, give each item a **stable, unique `key`**:

```jsx
{todos.map(todo => (
  <li key={todo.id}>{todo.text}</li>   // ✅ stable id
))}
```

The `key` is how reconciliation **identifies items across renders**. Without it (or with the
**array index** as key), React can't tell that an item *moved* vs *changed* — so on
insert/delete/reorder it may **update the wrong nodes**, lose input focus, or re-render more
than necessary.

- ✅ Use a **stable unique id** from your data.
- ❌ Avoid the **array index** as key when the list can reorder/insert/delete.
- ⚠️ Keys must be **unique among siblings** (not globally).

> 🧠 **Interview line:** "`key` gives list items a stable identity so reconciliation can
> match them across renders and move/keep DOM nodes instead of rebuilding them. Using the
> array index breaks this when the list reorders, causing wrong updates and lost state."

---

## 7. Putting it together — the full update flow

```
setState / setCounter called
        │
        ▼
React re-runs the component → produces a NEW React element (virtual) tree
        │
        ▼
RENDER PHASE: Fiber diffs new tree vs current fiber tree (reconciliation)
   • same type  → mark "update props"
   • diff type  → mark "replace subtree"
   • lists      → match by key
   (pausable — urgent input can interrupt)
        │
        ▼
COMMIT PHASE: apply the minimal real-DOM mutations (atomic, fast)
        │
        ▼
browser reflows/repaints ONLY what changed
```

That's exactly why, in the Part 4 counter, only the `<h2>` text updated — reconciliation saw
the same `h2` type with only new text, so the commit phase changed just that text node.

---

## 8. Common misconceptions (interview traps)

| Myth | Reality |
|---|---|
| "Virtual DOM is faster than the real DOM." | The VDOM *itself* isn't magic-fast; it exists to **minimize** real-DOM work and give a clean programming model. |
| "React always re-renders the whole page." | It re-runs component **functions**, but only **commits the diff** to the real DOM. |
| "Virtual DOM and Fiber are the same thing." | VDOM = the element tree (data). Fiber = the **engine/algorithm** that reconciles it. |
| "Fiber makes diffing more accurate." | Fiber makes it **interruptible/prioritized**, not more accurate. Same heuristics, better scheduling. |
| "Reconciliation touches the DOM." | The **render phase** is in-memory only. The **commit phase** touches the DOM. |
| "Keys are for performance only." | Wrong keys cause **correctness bugs** (wrong item updated, lost focus/state), not just slowness. |

---

## 9. Interview Questions & Answers

**Q1. What is the Virtual DOM?**
> A lightweight in-memory JavaScript object tree that represents the UI. React builds a new
> one each render and diffs it against the previous one to update the real DOM minimally.

**Q2. Why does React use a Virtual DOM if the real DOM isn't actually slow to touch?**
> Mainly for the **programming model** — you describe the UI for a given state and React
> computes the updates. It also avoids thrashing the real DOM (reflow/repaint) by applying
> only the minimal changes.

**Q3. What is reconciliation?**
> React's diffing algorithm that compares the new virtual tree with the old one and decides
> what to add, update, or remove. It uses heuristics to run in O(n) instead of O(n³).

**Q4. What heuristics does reconciliation use?**
> Different element type → replace the whole subtree. Same type → keep the node and update
> changed props. Lists → match children by their `key`.

**Q5. What is Fiber?**
> The reconciliation engine introduced in React 16. A fiber is a JS object representing one
> unit of work (an element) with parent/child/sibling links, letting React pause, resume,
> reprioritize, and abort rendering — i.e. incremental, interruptible, concurrent rendering.

**Q6. How is Fiber different from the old Stack reconciler?**
> The Stack reconciler was synchronous and ran to completion — it blocked the main thread on
> big updates. Fiber breaks work into units so rendering can be interrupted for
> higher-priority work (input, animations) and resumed later.

**Q7. What are the render phase and commit phase?**
> Render phase: build and diff the fiber tree in memory — interruptible and must be pure, no
> DOM touched. Commit phase: apply the computed changes to the real DOM — synchronous and
> atomic, not interruptible.

**Q8. Which phase can React pause, and which can't it?**
> It can pause/resume/abort the **render phase**. The **commit phase** is never interrupted,
> so the user never sees a half-updated screen.

**Q9. Why must the render function be pure / side-effect-free?**
> Because Fiber may run the render phase multiple times or throw it away before committing.
> Side effects there would run at the wrong time or repeatedly. Put effects in `useEffect`.

**Q10. Why does React need `key`s in lists?**
> Keys give items a stable identity so reconciliation can match them across renders and
> move/reuse DOM nodes instead of rebuilding. Bad keys (like array index on a reorderable
> list) cause wrong updates and lost state.

**Q11. Is the Virtual DOM the same as Fiber?**
> No. The Virtual DOM is the element **tree (data)**; Fiber is the **engine/algorithm** that
> reconciles that tree and schedules the work.

**Q12. Did React "remove" the Virtual DOM?**
> The concept still exists, but the team moved away from the *term*. Modern docs talk about
> **React Elements** and **reconciliation** rather than "Virtual DOM".

---

## 10. Quick self-test (cover the answers above)

1. What is the Virtual DOM in one sentence? *(in-memory JS tree of the UI)*
2. What is reconciliation? *(the diff of new vs old tree)*
3. Name the two reconciliation heuristics. *(diff type → replace; same type → update; keys for lists)*
4. What is a fiber? *(a unit of work / JS object per element)*
5. What can Fiber do that the Stack reconciler couldn't? *(pause/resume/prioritize/abort)*
6. Which phase touches the real DOM? *(commit)*
7. Which phase is interruptible? *(render)*
8. Why do lists need stable keys? *(identity across renders → correct updates)*

---

### ✅ Summary in one paragraph (for revision)
When state changes, React re-runs the component and builds a new **Virtual DOM** — a cheap
in-memory tree of **React Elements**. It then runs **reconciliation**, diffing the new tree
against the old one using O(n) heuristics (different type → replace subtree, same type →
update props, lists matched by **`key`**) to compute the **minimum** real-DOM changes. The
engine doing this is **Fiber** (React 16+): each element is a **unit of work**, so rendering
can be **paused, resumed, reprioritized, and aborted** — unlike the old synchronous **Stack
reconciler** that blocked the main thread. Each update runs in two phases: the **render
phase** (build & diff the fiber tree — in memory, interruptible, must be pure) and the
**commit phase** (apply changes to the real DOM — atomic, uninterruptible). The big takeaway
is that the Virtual DOM's real value isn't raw speed — it's the **declarative programming
model** plus **minimal DOM updates**, which is exactly why the Part 4 counter updated only
the one `<h2>` that changed.
