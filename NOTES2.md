# React Notes — Part 2: Components (the building blocks of React)

> Part 1 (`NOTES1.md`) was about **creating** a React project (CRA vs Vite).
> Part 2 is about the **first real thing you build inside it: Components.**

---

## 0. Big Picture (read this first)

A **component** is a **reusable, independent piece of UI**. In modern React, a
component is simply a **JavaScript function that returns JSX** (the HTML-like markup).

Think of components like **LEGO bricks**: you build a small brick once (`<Arpit />`),
then snap it into bigger structures (`<App />`) as many times as you want.

**Key takeaway:** React apps are built by **writing small components and
nesting them inside each other**. The whole page is really one big tree of components,
all mounted inside the single `<div id="root">`.

In my repo I built the same tiny component **twice** (once in each project) to prove
CRA and Vite work identically:

| Project | Component file | Component name | Rendered by |
|---------|----------------|----------------|-------------|
| **CRA** (`basic_react/`) | `src/Sehal.js` | `Arpit` | `src/App.js` |
| **Vite** (`vite_react/`) | `src/Arpit.jsx` | `Arpit` | `src/App.jsx` |

---

## 1. What exactly is a component?

```jsx
function Arpit() {
  return <h1>Arpit from react</h1>;
}
export default Arpit;
```

Three things make this a component:
1. **It's a function** — a plain JS function (this style is a "functional component").
2. **It returns JSX** — the UI it should draw on screen.
3. **It's exported** — so other files can import and use it.

Once exported, you use it like a custom HTML tag: `<Arpit />`.

> 🧠 **Interview line:** "A React component is a reusable function that returns JSX
> describing a piece of the UI. React calls that function and turns the returned JSX
> into real DOM nodes."

---

## 2. Rule #1 — Component names MUST be Capitalized (PascalCase)

This is the **single most common beginner bug**, and it's in my code comments:

```jsx
<Arpit />   // ✅ Capital A -> React renders OUR component
<arpit />   // ❌ lowercase -> React thinks it's an unknown HTML tag, renders nothing
```

**Why?** When React sees JSX, it uses the **casing** to decide:
- **lowercase** (`<div>`, `<h1>`, `<span>`) → a **built-in HTML element**.
- **Capitalized** (`<Arpit>`, `<App>`) → a **custom component** to call.

So `function Arpit()` and `<Arpit />` both start with a capital letter on purpose.

> 🧠 **Interview line:** "React distinguishes components from HTML tags by the first
> letter's case. Capitalized = your component, lowercase = a native DOM element. That's
> why every component name is PascalCase."

---

## 3. Rule #2 — A component can return only ONE parent element

You **cannot** return two side-by-side elements:

```jsx
// ❌ ERROR: two siblings returned at once
function App() {
  return (
    <h1>Hello World</h1>
    <Arpit />
  );
}
```

You must **wrap them in one parent**. In my code I used a `<div>`:

```jsx
// ✅ Works: one <div> wraps both children
function App() {
  return (
    <div>
      <h1>Hello World</h1>
      <Arpit />
    </div>
  );
}
```

**Why the rule exists:** a function can only `return` one value. JSX compiles to a
single `React.createElement(...)` call, so it needs exactly one root node.

### Better option: React Fragment (`<> </>`)
A `<div>` adds an **extra, sometimes-unwanted `<div>`** to the real page. To group
elements **without** adding a wrapper node, use a **Fragment**:

```jsx
function App() {
  return (
    <>                       {/* Fragment: groups children, renders NOTHING itself */}
      <h1>Hello World</h1>
      <Arpit />
    </>
  );
}
```

> 🧠 **Interview line:** "A component must return a single root element because JSX
> maps to one `createElement` call. Wrap siblings in a `<div>`, or use a `<>...</>`
> Fragment when you don't want an extra wrapper node in the DOM."

---

## 4. Rule #3 — `export` here, `import` there

A component in one file is useless until you **share** it. Two halves:

**In `Sehal.js` / `Arpit.jsx` — give it out:**
```jsx
export default Arpit;   // "default" = the ONE main thing this file exports
```

**In `App.js` / `App.jsx` — bring it in:**
```jsx
import Arpit from './Sehal';   // note: relative path, "./" = same folder
```

### 🔑 The interesting detail in MY code
In `basic_react`, the **file is `Sehal.js`** but the **function is `Arpit`**, and I
import it as `Arpit`:

```jsx
import Arpit from './Sehal';   // file name ≠ import name — and that's fine!
```

Because it's a **default export**, the **importing file chooses the name**. I could
have written `import Whatever from './Sehal'` and it would still work. The file *path*
is what matters, not the name.

> 💡 **default vs named exports:**
> - `export default X` → import with **any** name, no curly braces: `import Foo from ...`
> - `export { X }` (named) → import with the **exact** name in braces: `import { X } from ...`

> 🧠 **Interview line:** "With a default export the importing file picks the local
> name; with a named export the name must match and use curly braces. That's why my
> `Sehal.js` file's `Arpit` component can be imported as `Arpit` (or anything)."

---

## 5. Rule #4 — Nesting components (the component TREE)

Components go **inside** other components. My app is three layers deep:

```
index.js / main.jsx        (entry point)
      │  renders
      ▼
   <App />                  (root component)
      │  renders
      ▼
   <Arpit />                (child component)
      │  returns
      ▼
   <h1>Arpit from react</h1>   ← real HTML the user finally sees
```

So `<Arpit />` is a **child** of `<App />`, and `<App />` is mounted into `#root`.
This "components inside components" structure is called the **component tree**.

**Reusability payoff:** because `<Arpit />` is a component, I can drop it multiple
times and it repeats:
```jsx
<div>
  <Arpit />
  <Arpit />   {/* same component, rendered again — no copy-paste */}
</div>
```

> 🧠 **Interview line:** "A React UI is a tree of nested components with a single root
> (`<App />`). Building small components and composing them is how React scales — you
> reuse a component instead of duplicating markup."

---

## 6. The full flow (connecting Part 1 to Part 2)

Part 1 explained how `<App />` gets mounted. Part 2 adds **what's inside** it:

```
index.html   <div id="root"></div>          (empty box)
     │
     ▼
index.js / main.jsx
     │   createRoot(document.getElementById('root')).render(<App />)
     ▼
  <App />                        ← imports and renders...
     │
     ▼
  <Arpit />                      ← our custom component
     │
     ▼
React turns the JSX tree into real DOM and injects it into #root
```

---

## 7. My actual code, side by side (CRA vs Vite — identical concepts)

### The component
```jsx
// CRA:  basic_react/src/Sehal.js        // Vite: vite_react/src/Arpit.jsx
function Arpit() {                        function Arpit() {
  return <h1>Arpit from react</h1>;         return <h2>Hey from Arpit</h2>;
}                                         }
export default Arpit;                      export default Arpit;
```

### The root component that renders it
```jsx
// CRA:  basic_react/src/App.js          // Vite: vite_react/src/App.jsx
import Arpit from './Sehal';             import Arpit from './Arpit';
function App() {                         function App() {
  return (                                 return (
    <div>                                    <div>
      <h1>Hello World</h1>                     <h1>Hello World</h1>
      <Arpit />                                <Arpit />
    </div>                                   </div>
  );                                       );
}                                        }
export default App;                      export default App;
```

**The only difference is `.js` vs `.jsx` and the heading text — the component rules are
100% the same.** That's the whole point: components are a React concept, not a
CRA-or-Vite concept.

---

## 8. JSX rules to remember (beyond components)

JSX looks like HTML but is really JavaScript, so a few things differ:

| HTML | JSX | Why |
|------|-----|-----|
| `class="btn"` | `className="btn"` | `class` is a reserved JS keyword |
| `for="id"` | `htmlFor="id"` | `for` is a reserved JS keyword |
| `<br>` | `<br />` | every tag must be **closed** |
| `onclick=""` | `onClick={...}` | events are camelCase, take `{ }` |
| comments `<!-- -->` | `{/* ... */}` | JSX comments live in `{ }` |

- **Self-closing:** `<Arpit />` and `<img />` must end with `/>`.
- **`{ }` = "JavaScript goes here"** inside JSX (variables, expressions, comments).

> 🧠 **Interview line:** "JSX is syntactic sugar for `React.createElement`. Because it's
> JavaScript, we use `className`/`htmlFor`, camelCase events, self-closing tags, and
> `{ }` to embed JS expressions."

---

## 9. Interview Questions & Answers

**Q1. What is a component in React?**
> A reusable, self-contained piece of UI — in modern React, a JavaScript function that
> returns JSX. React calls the function and renders whatever JSX it returns.

**Q2. Why must a component name start with a capital letter?**
> React uses casing to tell components from HTML tags. Capitalized = your component;
> lowercase = a native DOM element. `<arpit />` would be treated as an unknown HTML tag.

**Q3. Why can't a component return two elements side by side?**
> A function returns one value, and JSX compiles to a single `createElement` call, so
> there must be exactly one root node. Wrap siblings in a `<div>` or a Fragment.

**Q4. What is a React Fragment and why use it over a `<div>`?**
> `<>...</>` groups multiple elements without adding an extra DOM node. A wrapper `<div>`
> would appear in the real HTML; a Fragment renders nothing itself, keeping the DOM clean.

**Q5. Difference between a default export and a named export?**
> `export default X` allows importing under any name without braces. Named exports
> (`export { X }`) must be imported with the exact name inside curly braces.

**Q6. In my code the file is `Sehal.js` but I import `Arpit` — how does that work?**
> Because it's a default export, the importing file chooses the local name. The import
> path (`./Sehal`) is what matters, not the component or file name.

**Q7. How do you render one component inside another?**
> Import it, then use it as a JSX tag: `import Arpit from './Arpit'` then `<Arpit />`
> inside the parent's returned JSX. This nesting forms the component tree.

**Q8. What is the component tree?**
> The hierarchy of nested components with a single root (`<App />`) mounted into
> `#root`. Every visible component is a node in this tree.

**Q9. Why is `className` used instead of `class` in JSX?**
> `class` is a reserved keyword in JavaScript, and JSX is JavaScript, so React uses
> `className` (and `htmlFor` instead of `for`) to avoid conflicts.

**Q10. Are functional components the only kind?**
> No — older React used class components. Functional components (plus Hooks) are the
> modern standard: simpler, less code, and recommended today.

**Q11. What's the difference between returning `<h1>` and `<Arpit />`?**
> `<h1>` is a built-in HTML element React renders directly. `<Arpit />` is a custom
> component — React calls the `Arpit()` function and renders whatever JSX it returns.

**Q12. Can you reuse the same component multiple times?**
> Yes — that's the main benefit. `<Arpit />` can be placed as many times as needed and
> each usage renders an independent copy of that UI.

---

## 10. Quick self-test (cover the answers above)

1. What must the first letter of a component name always be? *(Capital / PascalCase)*
2. What are the two ways to wrap multiple returned elements? *(a `<div>` or a Fragment `<> </>`)*
3. In `basic_react`, which file holds the component and what is it named? *(`Sehal.js`, named `Arpit`)*
4. Which keyword lets a file share its component? *(`export default`)*
5. What is the structure of nested components called? *(the component tree)*
6. Why write `className` not `class` in JSX? *(`class` is a reserved JS keyword)*

---

### ✅ Summary in one paragraph (for revision)
A **component** is a reusable JavaScript function that **returns JSX**. Its name must be
**Capitalized** so React treats it as a component (not an HTML tag), and it must return a
**single parent element** (wrap siblings in a `<div>` or a `<> </>` **Fragment**). You
**`export default`** a component from its file and **`import`** it wherever you need it —
with a default export the importing file picks the name, which is why my `Sehal.js` file's
`Arpit` component is imported as `Arpit`. Components **nest inside each other** to form a
**component tree** rooted at `<App />`, which the entry file mounts into the single
`<div id="root">`. I built the exact same component in both `basic_react` (CRA) and
`vite_react` (Vite) to show the rules are identical — components are a React concept,
independent of the tool that created the project.
