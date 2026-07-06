# React Notes — Creating React Projects (CRA vs Vite)

---

## 0. Big Picture (read this first)

**React** is a JavaScript **library** for building user interfaces (UIs) out of small,
reusable pieces called **components**.

You almost never write React "from scratch" in a plain HTML file. Instead you use a
**tool/boilerplate** that sets up the project for you (folders, config, dev server,
bundler). This video is about **two ways** to create that project:

| Tool | My folder | Command | Bundler under the hood |
|------|-----------|---------|------------------------|
| **Create React App (CRA)** | `basic_react/` | `npx create-react-app my-app` | Webpack |
| **Vite** | `vite_react/` | `npm create vite@latest` | Rollup / esbuild |

**Key takeaway of the video:** CRA is the old, heavy, slow way. **Vite is the modern,
fast, recommended way.** Both give you the same React — just a different setup experience.

---

## 1. What is a "bundler" and why do we need a tool?

Modern React code uses:
- **JSX** (HTML-like syntax inside JavaScript) — browsers **cannot** read this directly.
- **ES Modules** (`import` / `export`) spread across many files.
- **npm packages** (`react`, `react-dom`) from `node_modules`.

A **bundler** (Webpack for CRA, Rollup/esbuild for Vite) does the heavy lifting:
1. **Transpiles** JSX + modern JS → browser-friendly JavaScript (using Babel/esbuild).
2. **Bundles** all your files + packages into a few optimized files.
3. Runs a **dev server** with **hot reload** (page updates instantly when you save).

> 🧠 **Interview line:** "The browser doesn't understand JSX or `import` statements the
> way we write them, so a bundler transpiles and bundles our code into plain JS the
> browser can run."

---

## 2. Create React App (CRA) — my `basic_react/` folder

### How I made it
```bash
npx create-react-app basic_react
cd basic_react
npm start          # runs on http://localhost:3000
```

### `package.json` (the project's ID card)
```json
{
  "name": "basic_react",
  "dependencies": {
    "react": "^19.2.7",
    "react-dom": "^19.2.7",
    "react-scripts": "5.0.1",     // <-- CRA's engine (wraps Webpack + Babel)
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",   // dev server
    "build": "react-scripts build",   // production build
    "test":  "react-scripts test",
    "eject": "react-scripts eject"     // rarely used; exposes hidden config
  }
}
```

**What `react-scripts` is:** CRA hides Webpack/Babel config inside this one package so
beginners don't have to configure anything. That "hiding" is also why CRA feels heavy.

### My actual code

`src/index.js` — **the entry point** (where React starts):
```js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

`src/App.js` — **the root component**:
```js
function App() {
  return (
    <h1>Hello World</h1>
  );
}

export default App;
```

---

## 3. Vite — my `vite_react/` folder (the modern way)

### How I made it
```bash
npm create vite@latest vite_react
# choose: React  ->  JavaScript
cd vite_react
npm install        # Vite does NOT auto-install; you run this yourself
npm run dev        # runs on http://localhost:5173
```

### `package.json` (notice how much smaller it is)
```json
{
  "name": "vite_react",
  "type": "module",              // enables ES modules (import/export)
  "scripts": {
    "dev": "vite",               // start dev server
    "build": "vite build",       // production build
    "preview": "vite preview"    // preview the built app locally
  },
  "dependencies": {
    "react": "^19.2.7",
    "react-dom": "^19.2.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^6.0.3",   // teaches Vite about React/JSX
    "vite": "^8.1.1"
  }
}
```

> 💡 Note the split: `react`/`react-dom` are **dependencies** (needed to run),
> while `vite` and the plugin are **devDependencies** (only needed while building).
> CRA lumps everything together; Vite keeps it clean.

### `vite.config.js` — Vite's small, visible config
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

### My actual code

`src/main.jsx` — **the entry point** (note `.jsx` extension and no top-level React import needed):
```js
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

`src/App.jsx` — **the root component**:
```js
function App() {
  return (
    <h1>Hello World</h1>
  )
}

export default App
```

---

## 4. How React actually shows up on the page (the "flow")

This is a **favourite interview topic**. The flow is the same for both CRA and Vite:

```
index.html  (has <div id="root"></div>)
      │
      ▼
main.jsx / index.js   ← entry file the bundler runs first
      │  createRoot(document.getElementById('root'))
      ▼
   <App />            ← your root React component
      │  returns JSX
      ▼
  React converts JSX → real DOM nodes and INJECTS them into <div id="root">
```

### The one line that connects HTML to React
In `vite_react/index.html`:
```html
<body>
  <div id="root"></div>                          <!-- React fills THIS -->
  <script type="module" src="/src/main.jsx"></script>
</body>
```

- `<div id="root">` starts **empty**.
- `createRoot(document.getElementById('root'))` grabs that div.
- `.render(<App />)` tells React to build the `<App />` UI **inside** it.
- So your whole app lives inside one div — this is why React is a **"Single Page
  Application" (SPA)**.

> 🧠 **Interview line:** "React mounts the entire app into a single root DOM node
> (`#root`). `createRoot` creates a React root pointing at that node, and `render`
> injects the component tree into it."

---

## 5. CRA vs Vite — comparison table (memorize this)

| Feature | Create React App (`basic_react`) | Vite (`vite_react`) |
|---|---|---|
| Bundler | Webpack | esbuild (dev) + Rollup (build) |
| Speed | Slow to start / reload | **Very fast** (near-instant) |
| Entry file | `src/index.js` | `src/main.jsx` |
| Dev command | `npm start` | `npm run dev` |
| Default port | `3000` | `5173` |
| Config file | Hidden (`react-scripts`) | Visible (`vite.config.js`) |
| Install deps | Auto during create | You run `npm install` yourself |
| `index.html` location | `public/index.html` | project **root** |
| Status today | Legacy / discouraged | **Recommended** |

**Why is Vite faster?** It uses **esbuild** (written in Go) and serves files as
**native ES modules** on demand instead of bundling everything upfront like Webpack.

---

## 6. Key files & folders (what each one is for)

| File / Folder | Purpose |
|---|---|
| `node_modules/` | All installed packages. **Huge**, auto-generated, never edit, git-ignored. |
| `package.json` | Project info + dependencies + scripts. The "recipe". |
| `package-lock.json` | Exact locked versions of every package (reproducible installs). |
| `public/` | Static files served as-is (favicon, etc.). |
| `index.html` | The single HTML page with `<div id="root">`. |
| `src/` | **Your code lives here.** Components, styles, logic. |
| `src/main.jsx` / `src/index.js` | Entry point — first file that runs. |
| `src/App.jsx` / `src/App.js` | Root component. |
| `.gitignore` | Lists files git should ignore (like `node_modules`). |

---

## 7. `React.StrictMode` — why is it wrapping `<App />`?

Both my entry files wrap the app in `<StrictMode>`:
```js
<StrictMode>
  <App />
</StrictMode>
```
- It's a **development-only** helper (does nothing in production).
- It highlights potential problems: unsafe lifecycles, deprecated APIs, side-effect bugs.
- In dev it **intentionally double-renders** components to help you catch impure code.

> 🧠 **Interview line:** "StrictMode is a dev-only wrapper that surfaces potential bugs;
> it renders nothing visible and has zero effect in the production build."

---

## 8. Common beginner commands cheat-sheet

```bash
# --- Create ---
npx create-react-app my-app        # CRA
npm create vite@latest my-app      # Vite

# --- Install dependencies (needed after cloning any repo) ---
npm install

# --- Run dev server ---
npm start        # CRA (port 3000)
npm run dev      # Vite (port 5173)

# --- Build for production ---
npm run build

# --- Preview production build (Vite) ---
npm run preview
```

---

## 9. Interview Questions & Answers (from this video's topics)

**Q1. Is React a library or a framework?**
> A **library** for building UIs. It focuses only on the view layer; you add routing,
> state management, etc. separately. (Frameworks like Angular give you everything.)

**Q2. What's the difference between CRA and Vite?**
> Both scaffold a React app. CRA uses Webpack (slow, config hidden in `react-scripts`).
> Vite uses esbuild + Rollup (much faster, visible `vite.config.js`). Vite is the
> modern recommended choice.

**Q3. Why can't the browser run JSX directly?**
> Browsers only understand plain JS/HTML. JSX is syntactic sugar that must be
> **transpiled** (by Babel in CRA, esbuild in Vite) into `React.createElement` calls.

**Q4. What is the role of `react-dom`?**
> `react` defines components; **`react-dom`** renders them into the browser DOM.
> `createRoot(...).render(...)` comes from `react-dom/client`.

**Q5. What does `createRoot(document.getElementById('root'))` do?**
> It creates a React root attached to the `<div id="root">` element, giving React a
> place to inject and manage the component tree.

**Q6. Why is there only one `<div id="root">`?**
> React is a Single Page Application — the whole UI renders inside that one node, and
> React updates it dynamically instead of loading new HTML pages.

**Q7. What is `react-scripts`?**
> CRA's engine package that bundles Webpack + Babel + config so beginners don't
> configure anything. Running `npm start` actually runs `react-scripts start`.

**Q8. Difference between `dependencies` and `devDependencies`?**
> `dependencies` are needed for the app to run (e.g. `react`). `devDependencies` are
> only needed during development/building (e.g. `vite`, `@vitejs/plugin-react`).

**Q9. What does `npm install` do?**
> Reads `package.json`, downloads all listed packages into `node_modules`, and locks
> exact versions in `package-lock.json`.

**Q10. What is `StrictMode`?**
> A dev-only wrapper that helps detect bugs (double-renders components, warns about
> deprecated APIs). No effect in production.

**Q11. Why is Vite faster than CRA?**
> esbuild (Go-based) transpiles far faster than Babel, and Vite serves native ES
> modules on demand in dev instead of pre-bundling the whole app like Webpack.

**Q12. What is the entry point of a React app?**
> `src/main.jsx` (Vite) or `src/index.js` (CRA) — the first file the bundler executes,
> which mounts `<App />` into the DOM.

---

## 10. Quick self-test (cover the answers above)

1. Which folder in my repo is CRA and which is Vite? *(basic_react = CRA, vite_react = Vite)*
2. What port does each dev server use? *(3000 vs 5173)*
3. What element does React inject into? *(`<div id="root">`)*
4. Name the two bundlers involved. *(Webpack; esbuild/Rollup)*
5. Which two packages must always be installed for React? *(`react`, `react-dom`)*

---

### ✅ Summary in one paragraph (for revision)
React apps are created with a tool — **CRA** (old, Webpack, my `basic_react`) or **Vite**
(modern, fast, my `vite_react`). The tool sets up folders, a bundler, and a dev server.
Your code lives in `src/`; the **entry file** (`main.jsx`/`index.js`) uses
`createRoot(document.getElementById('root')).render(<App />)` to **inject** your root
`<App />` component into the single `<div id="root">` in `index.html`. The browser can't
read JSX, so the bundler transpiles it to plain JS first. Vite is preferred today because
it's dramatically faster.
