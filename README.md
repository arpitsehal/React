# React — Interview-Ready Notes & Projects

A learn-by-building React repository. Every concept has **two halves**: a hands-on project folder you can run, and a matching `NOTES*.md` file that explains the theory, the gotchas, and the interview questions for that project.

The notes are numbered in the order they were learned. Follow them in order — each one assumes the previous one.

---

## Repository at a Glance

| # | Notes | Project | Core Topic |
|---|-------|---------|-----------|
| 1 | [NOTES1.md](NOTES1.md) | `basic_react/`, `vite_react/` | CRA vs Vite, bundlers, project anatomy |
| 2 | [NOTES2.md](NOTES2.md) | `basic_react/`, `vite_react/` | Components, JSX rules, Fragments, import/export |
| 3 | [NOTES3.md](NOTES3.md) | `custom_react/` | Build your own React — JSX → real DOM |
| 4 | [NOTES4.md](NOTES4.md) | `counter/` | Hooks intro, `useState`, batching, updater form |
| 5 | [NOTES5.md](NOTES5.md) | *(theory only)* | Virtual DOM, Fiber, Reconciliation, `key` |
| 6 | [NOTES6.md](NOTES6.md) | `tailwind_props/` | Tailwind CSS + Props |
| 7 | [NOTES7.md](NOTES7.md) | `password_generator/` | `useCallback`, `useEffect`, `useRef` |
| 8 | [NOTES8.md](NOTES8.md) | `currency_convertor/` | Custom hooks, `useId`, API fetching |
| 9 | [NOTES9.md](NOTES9.md) | `router_project/` | React Router, `Outlet`, `useParams`, loaders |
| 10 | [NOTES10.md](NOTES10.md) | `mini_context/`, `theme_switcher/` | Context API, prop drilling |
| 11 | [NOTES11.md](NOTES11.md) | `ToDo_Local/` | Context + localStorage, barrel exports |
| 12 | [NOTES12.md](NOTES12.md) | `reduxToolkit/` | Redux Toolkit, slices, Immer |

---

## The Learning Path

Work through one step at a time. For each step: **run the project first**, poke at the code until it makes sense, *then* read the notes. The notes will land much harder once you've seen the thing run.

### Step 1 — Setup & Tooling
**Projects:** `basic_react/` (CRA) → `vite_react/` (Vite) · **Read:** [NOTES1.md](NOTES1.md)

Why a bundler exists at all, what CRA hides from you, why Vite replaced it, and how `index.html` → `main.jsx` → `<App />` actually connects. Also covers `React.StrictMode` and the everyday CLI commands.

> **Interview hooks:** Why is Vite faster than CRA? What does `ReactDOM.createRoot` do? Why does StrictMode double-render in dev?

### Step 2 — Components & JSX
**Projects:** `basic_react/src/Sehal.js`, `vite_react/src/Arpit.jsx` · **Read:** [NOTES2.md](NOTES2.md)

The four rules: PascalCase names, one parent element (and Fragments `<> </>`), export/import pairing, and nesting into a component tree.

> **Interview hooks:** Why must components be capitalized? Default vs named exports? Why can't JSX return two sibling elements?

### Step 3 — Build Your Own React
**Project:** `custom_react/` · **Read:** [NOTES3.md](NOTES3.md)

The single most clarifying exercise here. A React element is just a plain object — this project hand-writes the render function that turns that object into real DOM, and shows why you loop over `props` instead of hard-coding attributes.

> **Interview hooks:** What does JSX compile to? What *is* a React element? Why not just use `document.createElement`?

### Step 4 — State & `useState`
**Project:** `counter/` · **Read:** [NOTES4.md](NOTES4.md)

Why a plain variable never updates the UI, what a Hook is, the Rules of Hooks, and the big one: **state updates are asynchronous and batched** — plus the updater-function fix.

> **Interview hooks:** Why does calling `setCount(count + 1)` four times only add 1? Why can't hooks go inside conditionals?

### Step 5 — Virtual DOM, Fiber & Reconciliation
**Project:** *none — pure theory* · **Read:** [NOTES5.md](NOTES5.md)

The mental model behind everything in Step 4. Diffing, the interruptible Render phase vs the atomic Commit phase, why lists need `key`, and the common interview traps ("the Virtual DOM is faster than the real DOM" — it isn't, quite).

> **Interview hooks:** What is reconciliation? Why is `key={index}` a bug? What changed in React 16 with Fiber?

### Step 6 — Props & Tailwind
**Project:** `tailwind_props/` · **Read:** [NOTES6.md](NOTES6.md)

Props are **read-only** — the golden rule. Destructuring, default values, and the two special props (`children`, `key`). Tailwind setup is covered for both v3 and v4, since most tutorials are still on v3.

> **Interview hooks:** Can a child mutate props? What is `children`? Why is `key` not accessible inside the component?

### Step 7 — The Hook Trio
**Project:** `password_generator/` · **Read:** [NOTES7.md](NOTES7.md)

`useCallback` (memoize a function), `useEffect` (side effects after render), `useRef` (a direct handle to a DOM node) — and how all four hooks cooperate in one real feature. Controlled inputs recap included.

> **Interview hooks:** When does `useCallback` actually help? What does the dependency array control? `useRef` vs `useState`?

### Step 8 — Custom Hooks
**Project:** `currency_convertor/` · **Read:** [NOTES8.md](NOTES8.md)

Extracting `useCurrencyInfo` into `hooks/` — the rules custom hooks must follow, why extraction pays off, and `useId` for accessible input IDs.

> **Interview hooks:** What makes a function a custom hook? Do two components sharing a hook share state? (No — and know why.)

### Step 9 — Routing
**Project:** `router_project/` · **Read:** [NOTES9.md](NOTES9.md)

`createBrowserRouter`, shared layouts via `<Outlet />`, `<Link>` vs `<NavLink>`, dynamic routes with `useParams`, and `loader` + `useLoaderData` to fetch **before** render. Programmatic navigation as the bonus round.

> **Interview hooks:** `Link` vs `NavLink` vs `<a>`? Why do loaders beat `useEffect` fetching?

### Step 10 — Context API
**Projects:** `mini_context/` (user state) → `theme_switcher/` (theme + custom hook) · **Read:** [NOTES10.md](NOTES10.md)

The prop-drilling problem and the three pieces that solve it: `createContext` → `Provider` → `useContext`. Both setup styles are covered — separate provider file (`mini_context`) and all-in-one (`theme_switcher`).

> **Interview hooks:** What is prop drilling? Does Context replace Redux? Why do all consumers re-render on context change?

### Step 11 — Context + Persistence
**Project:** `ToDo_Local/` · **Read:** [NOTES11.md](NOTES11.md)

The first *real* app. Context holding both state and actions, two `useEffect`s for localStorage read/write, controlled forms, per-item local UI state, and barrel exports (`components/index.js`, `contexts/index.js`).

> **Interview hooks:** Why two separate effects for localStorage? Why does the edit state live in `TodoItem` and not context?

### Step 12 — Redux Toolkit
**Project:** `reduxToolkit/` · **Read:** [NOTES12.md](NOTES12.md)

`configureStore`, `createSlice`, Immer (why "mutating" code is actually immutable), `<Provider>`, `useSelector`, `useDispatch`, and the one-directional data-flow diagram that makes a great whiteboard answer. Ends with an RTK vs classic Redux vs Context comparison.

> **Interview hooks:** Why RTK over classic Redux? How does Immer let you write `state.push()`? When would you pick Context over Redux?

---

## Running Any Project

Every project except `custom_react/` is a normal npm project. `node_modules` is gitignored, so install first:

```bash
cd counter          # or any project folder
npm install
npm run dev         # Vite projects
```

Two exceptions:

- **`basic_react/`** is Create React App — use `npm start` instead of `npm run dev`.
- **`custom_react/`** has no build step at all. Open `custom_react/index.html` directly in a browser.

---

## Suggested Revision Order (Day Before an Interview)

If you're short on time and just want to reload everything, read the notes in this order — this front-loads what gets asked most:

1. **NOTES5** — Virtual DOM / Fiber / reconciliation *(most asked, no code to run)*
2. **NOTES4** — `useState`, batching, Rules of Hooks
3. **NOTES7** — `useEffect` / `useCallback` / `useRef`
4. **NOTES12** — Redux Toolkit
5. **NOTES10** — Context API + when it beats Redux
6. **NOTES3** — what JSX compiles to *(the question that separates people)*
7. Skim **NOTES2**, **NOTES6**, **NOTES8**, **NOTES9** for the rapid-fire bits

Most notes end with a **Quick self-test** and a **one-paragraph summary** — cover the answers and use those as flashcards.
