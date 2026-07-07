# React Notes — Part 3: Build Your Own React (how JSX becomes real DOM)

> Part 1 (`NOTES1.md`) → **creating** a React project (CRA vs Vite).
> Part 2 (`NOTES2.md`) → **components**, the building blocks.
> Part 3 → we open the hood: we **write our own tiny React** to see *exactly* what
> React does under the hood when it renders. Code lives in `custom_react/`.

---

## 0. Big Picture (read this first)

React feels like magic: you write `<h1>Hi</h1>` and it shows up on the page. Here we
remove the magic by **rebuilding the core idea ourselves** in plain JavaScript —
no library, no build tool.

**The one sentence to remember:**
> React is really just **a JavaScript object that describes UI**, plus **a function that
> turns that object into real DOM** and puts it on the page.

That's it. In our repo:

| File | Role |
|------|------|
| `custom_react/index.html` | has the single `<div id="root">` + loads our script |
| `custom_react/Customreact.js` | our hand-written `customRender()` — a mini `ReactDOM` |

We don't use React at all here. We prove we understand it by **imitating it**.

---

## 1. What a "React element" actually is

When you write JSX like this:

```jsx
<a href="https://www.google.com" target="_blank">Click me to visit Google</a>
```

React does **not** store HTML. It converts that JSX into a **plain JavaScript object**
that *describes* the tag. In our code we wrote that object by hand to see its shape:

```js
const reactElement = {
  type: 'a',                          // which HTML tag to create
  props: {                            // the attributes (href, target, class, ...)
    href: 'https://www.google.com',
    target: '_blank',
  },
  children: "Click me to visit Google",   // what goes inside the tag
};
```

Three parts every React element has:
1. **`type`** → the tag name (`'a'`, `'div'`, `'h1'`, or a component).
2. **`props`** → an object of all attributes/properties.
3. **`children`** → the content inside (text or nested elements).

> 🧠 **Interview line:** "JSX is just syntactic sugar. `<a href=...>text</a>` compiles
> to `React.createElement('a', { href: ... }, 'text')`, which returns a plain object
> `{ type, props, children }`. React never holds raw HTML — it holds these objects."

---

## 2. The render function — turning the object into real DOM

An object on its own draws nothing. Something has to **read** it and create actual DOM
nodes. In real React that job belongs to **`ReactDOM`**. We wrote our own version:

```js
function customRender(reactElement, container) {
  // 1. create the real DOM node from the "type"
  const domElement = document.createElement(reactElement.type);

  // 2. put the children (text) inside it
  domElement.innerHTML = reactElement.children;

  // 3. copy every prop onto the node as a real attribute
  for (const prop in reactElement.props) {
    domElement.setAttribute(prop, reactElement.props[prop]);
  }

  // 4. attach the finished node into the page
  container.appendChild(domElement);
}

const mainContainer = document.getElementById('root');
customRender(reactElement, mainContainer);
```

Read those four steps out loud — **that is the whole "render" idea** of React,
stripped to its bones:

1. **create** a DOM node from `type`,
2. **fill** it with `children`,
3. **apply** all `props` as attributes,
4. **append** it into the `#root` container.

> 🧠 **Interview line:** "Rendering is: take the element object, `document.createElement`
> its `type`, set its `children` and `props`, then `appendChild` it into the root DOM
> node. React's real renderer does this too — just far more cleverly (diffing, batching,
> the virtual DOM)."

---

## 3. The KEY lesson — why we loop over `props` instead of hard-coding them

This is the exact point my code comments drive home.

**❌ The naive way — set each attribute by hand:**
```js
// works, but ONLY for an <a> with exactly href + target
const domElement = document.createElement(reactElement.type);
domElement.innerHTML = reactElement.children;
domElement.setAttribute('href', reactElement.props.href);
domElement.setAttribute('target', reactElement.props.target);
container.appendChild(domElement);
```
Problem: if an element has 20 props, or different props, you'd rewrite this every time.
It is **not reusable** — the opposite of what React is about.

**✅ The scalable way — loop over whatever props exist:**
```js
for (const prop in reactElement.props) {
  domElement.setAttribute(prop, reactElement.props[prop]);
}
```
Now `customRender` works for **any tag with any number of props** — one function,
infinite elements. This "don't hard-code, loop generically" mindset is precisely how
a real library stays general-purpose.

> 🧠 **Interview line:** "React can't know your props in advance, so its renderer must
> iterate over the `props` object generically and apply each one. Hard-coding attributes
> wouldn't scale — the whole value of a library is handling the general case."

---

## 4. Full flow — from object to pixels

```
Customreact.js
   │
   │  reactElement = { type:'a', props:{href,target}, children:"Click me..." }
   ▼
customRender(reactElement, #root)
   │   createElement('a')  ->  <a></a>
   │   innerHTML           ->  <a>Click me to visit Google</a>
   │   setAttribute loop   ->  <a href="..." target="_blank">Click me...</a>
   │   appendChild(#root)
   ▼
index.html  <div id="root"><a href=...>Click me to visit Google</a></div>
   ▼
Browser paints a clickable Google link on screen
```

Compare this to real React (from Part 1):
```
ReactDOM.createRoot(#root).render(<App/>)   ← real React
customRender(reactElement, #root)           ← our imitation
```
Same shape: **(description of UI) + (render into #root)**. We just replaced the
industrial engine with a bicycle so we can see every moving part.

---

## 5. Why we do NOT just write `document.createElement` everywhere

If our tiny render already uses `document.createElement`, why does React exist at all?
Because doing raw DOM by hand gets unmanageable fast. React adds, on top of this core:

- **JSX** so you write `<a>` instead of hand-typing `{ type, props, children }` objects.
- **A Virtual DOM + diffing** so it only updates what *changed*, not the whole page.
- **State & re-rendering** so the UI updates automatically when data changes.
- **Components** so UI is reusable and composable (Part 2).

Our `customRender` has **none** of that — it renders once and can't update. That gap is
exactly *what React buys you*, and now you can describe it because you've felt its absence.

> 🧠 **Interview line:** "My custom render proves the core is just create-element +
> set-props + append. React's real value is everything *around* that core: JSX, the
> virtual DOM diffing algorithm, state-driven re-renders, and component composition."

---

## 6. Common gotchas this exercise reveals

| Gotcha | What happens | Fix / reason |
|--------|--------------|--------------|
| Using `innerHTML` for children | fine for plain text, but unsafe for user input (XSS) | real React escapes text and uses nodes, not raw HTML strings |
| Hard-coding each `setAttribute` | breaks the moment props change | loop over `props` generically |
| Forgetting the `#root` container | nothing renders | every render needs a target DOM node to `appendChild` into |
| Script loaded before `<div id="root">` | `getElementById('root')` is `null` | put the `<script>` at the **end of `<body>`** (as `index.html` does) |
| Thinking JSX "is HTML" | it's really a JS object | JSX → `createElement` → `{ type, props, children }` |

---

## 7. Interview Questions & Answers

**Q1. What is a "React element"?**
> A plain JavaScript object that describes a piece of UI, of the shape
> `{ type, props, children }`. It's what JSX compiles into — not actual HTML.

**Q2. What does JSX actually compile to?**
> `React.createElement(type, props, children)`, which returns the element object above.
> `<a href="x">hi</a>` becomes `createElement('a', { href: 'x' }, 'hi')`.

**Q3. What does a render function do, in essence?**
> It reads the element object and produces real DOM: `document.createElement(type)`,
> sets the children, applies each prop as an attribute, and appends it into a container.

**Q4. Why loop over `props` instead of setting attributes one by one?**
> Because a general library can't know your props ahead of time. Iterating over the
> `props` object applies whatever exists, so one function handles any element. Hard-coding
> attributes only works for one specific tag and doesn't scale.

**Q5. What is the `#root` div and why does render need it?**
> It's the single container in `index.html` where the whole app is injected. `render`
> needs a target DOM node to `appendChild` the created elements into.

**Q6. If it's "just `document.createElement`", why use React at all?**
> React adds JSX, a virtual DOM with diffing (efficient updates), state-driven
> re-rendering, and reusable components. The raw create-element core is trivial; the
> value is everything built around it.

**Q7. What are the three fields of a React element and what do they mean?**
> `type` (the tag/component to create), `props` (its attributes/properties), and
> `children` (the content inside it).

**Q8. What is the difference between `React` and `ReactDOM`?**
> `React` creates the element objects (`createElement`); `ReactDOM` renders those objects
> into the browser DOM (`createRoot(...).render(...)`). Our `customRender` plays the
> `ReactDOM` role.

**Q9. Why did you build your own render function?**
> To prove the internals aren't magic: JSX is an object and rendering is create + set
> props + append. Understanding this makes the virtual DOM and state updates easier to reason about.

**Q10. Is `innerHTML` how React inserts children?**
> Not really. We used `innerHTML` for simplicity with plain text, but React builds and
> inserts DOM nodes (and escapes text) rather than assigning raw HTML strings, which is
> safer against XSS.

---

## 8. Quick self-test (cover the answers above)

1. What shape does JSX compile to? *(`{ type, props, children }` — a JS object)*
2. What are the four steps inside `customRender`? *(create → set children → loop props → append)*
3. Why loop over `props` instead of hard-coding attributes? *(works for any element / scalable)*
4. Which file plays the role of `ReactDOM` in our repo? *(`custom_react/Customreact.js`)*
5. Name two things real React adds on top of this core. *(JSX, virtual DOM/diffing, state, components — any two)*
6. What does `render` need as its second argument? *(a container DOM node like `#root`)*

---

### ✅ Summary in one paragraph (for revision)
Under the hood, **JSX is not HTML — it's a JavaScript object** of the form
`{ type, props, children }` (that's what `React.createElement` returns). Turning that
object into something you can see is the job of a **render function**: create a DOM node
from `type`, put `children` inside it, **loop over `props`** to apply every attribute
generically (never hard-code them — that's how a library stays reusable), and
`appendChild` it into the `#root` container. In `custom_react/` I wrote exactly that as
`customRender`, which is a bare-bones stand-in for `ReactDOM`. It renders once and can't
update — and that missing piece is precisely what real React provides: **JSX ergonomics,
a virtual DOM with diffing, state-driven re-renders, and reusable components**. Building
the tiny version makes the real one stop feeling like magic.
