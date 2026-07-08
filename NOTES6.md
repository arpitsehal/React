# React Notes — Part 6: Tailwind CSS & Props

> Part 1 (`NOTES1.md`) → **creating** a React project (CRA vs Vite).
> Part 2 (`NOTES2.md`) → **components**, the building blocks.
> Part 3 (`NOTES3.md`) → **build your own React** (JSX → object → DOM).
> Part 4 (`NOTES4.md`) → **Hooks** & `useState` (the Counter).
> Part 5 (`NOTES5.md`) → **Virtual DOM, Fiber & reconciliation**.
> Part 6 → **Tailwind CSS** (styling) + **Props** (passing data into components).

*(Video: "07 — Tailwind and Props in reactjs", Chai aur React series. Built in `tailwind_props/`.)*

---

## 0. Big Picture (read this first)

Two separate ideas in this part:

1. **Tailwind CSS** — a faster way to *style* — write utility classes directly in your JSX
   (`className="p-4 rounded-xl bg-black"`) instead of writing separate CSS files.
2. **Props** — the way to *pass data* from a parent component into a child, so one component
   (like a `Card`) can be **reused** with different content.

They're taught together because the natural example is a **reusable styled Card** — Tailwind
makes it look good, props make it reusable.

> 🧠 **One-line mental model:** *Tailwind = style with classes. Props = a component's
> function arguments. Together = build one Card, reuse it with different data.*

---

## PART A — TAILWIND CSS

## 1. What Tailwind is (and isn't)

**Tailwind is a utility-first CSS framework.** Instead of naming a class and writing CSS
rules for it, you compose tiny **single-purpose utility classes** right in your markup:

```jsx
// Traditional CSS                        // Tailwind
<h1 className="title">Hi</h1>             <h1 className="text-3xl font-bold text-purple-600">Hi</h1>
// .title { font-size: 1.875rem;          // ↑ no separate CSS file needed
//          font-weight: 700; ... }
```

Common utilities you'll use constantly:

| Class | Does |
|---|---|
| `p-4`, `m-2` | padding / margin |
| `flex`, `flex-col`, `items-center`, `gap-4` | flexbox layout |
| `text-xl`, `font-bold`, `text-white` | typography |
| `bg-black`, `bg-green-400` | background color |
| `rounded-xl`, `shadow-xl`, `border` | box styling |
| `hover:scale-105`, `transition-all`, `duration-300` | interaction/animation |
| `md:max-w-sm` | responsive (applies at `md` breakpoint and up) |

> 🧠 **Interview line:** "Tailwind is a utility-first CSS framework. Instead of writing
> custom CSS classes, you compose small predefined utility classes in your JSX `className`.
> It speeds up styling, keeps styles co-located with markup, and produces a small final CSS
> bundle because it only ships the classes you actually use."

---

## 2. Installing Tailwind (version matters!)

⚠️ **The setup is different between Tailwind v3 and v4** — this trips everyone up.

### v3 (older tutorials, including many YouTube videos)
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p          # generates tailwind.config.js + postcss.config.js
```
Then in your CSS you add **three** directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### v4 (current — what our project uses, with Vite)
```bash
npm install tailwindcss @tailwindcss/vite
```
`vite.config.js`:
```js
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({ plugins: [react(), tailwindcss()] })
```
CSS (`index.css`) — **one** line replaces all three `@tailwind` directives:
```css
@import "tailwindcss";
```

> ⚠️ **Key gotchas (learned the hard way):**
> - `npx tailwindcss init -p` **does not exist in v4** → "could not determine executable to
>   run". v4 has no `init`; config is optional and lives in CSS via `@theme`.
> - The three `@tailwind base/components/utilities` directives are **v3 only**. v4 uses a
>   single `@import "tailwindcss";`.
> - `bg-gradient-to-t` was renamed to `bg-linear-to-t` in v4.

> 🧠 **Interview line:** "Setup depends on the version. v3 uses `npx tailwindcss init -p`
> plus three `@tailwind` directives. v4 dropped the init command — with Vite you add the
> `@tailwindcss/vite` plugin and a single `@import \"tailwindcss\";` in your CSS."

---

## PART B — PROPS

## 3. What props are

**Props (properties)** are how a **parent** component passes data **down** to a **child**.
They're exactly like **arguments to a function** — because a component *is* a function.

```jsx
// PARENT (App.jsx) — passes props as attributes
<Card username="Arpit" description="This is a card component" />

// CHILD (Card.jsx) — receives them as one object called `props`
function Card(props) {
  return <h1>{props.username}</h1>   // "Arpit"
}
```

- You write props like **HTML attributes**: `name="value"`.
- Strings use quotes: `username="Arpit"`.
- Anything else (numbers, variables, objects, expressions) uses **curly braces**:
  `image={myObj.image}`, `width={400}`.
- Inside the child, they all arrive on a single **`props` object**.

> 🧠 **Interview line:** "Props are read-only inputs passed from a parent to a child
> component, like function arguments. You pass them as JSX attributes and read them off the
> `props` object inside the child. They make components reusable with different data."

---

## 4. Props are READ-ONLY (the golden rule)

A component must **never modify its own props**. Data flows **one way**: parent → child.
If a child could change props, you couldn't predict your UI.

```jsx
function Card(props) {
  props.username = "changed"   // ❌ NEVER do this — props are immutable
}
```

If a child needs to change something, the **parent** owns that data (often in `useState`)
and passes a setter down, or the child uses its *own* state. Props stay read-only.

> 🧠 **Interview line:** "Props are immutable and flow one-way, parent to child. A component
> never mutates its own props; to change data, the state must live in a parent (or the
> child's own state) — this one-way data flow is what makes React predictable."

---

## 5. The actual project code (from `tailwind_props/`)

**Parent — `src/App.jsx`:** builds a data object and passes it as props.
```jsx
import Card from './components/card'

function App() {
  let myObj = {
    name: "card",
    description: "This is a card component",
    image: "https://picsum.photos/400/300?random=90"
  }

  return (
    <>
      <h1 className="bg-green-400 text-black p-4 rounded-xl">tailwind test</h1>
      <Card
        username="Arpit"
        name={myObj.name}
        description={myObj.description}
        image={myObj.image}
      />
    </>
  )
}
```

**Child — `src/components/card.jsx`:** receives `props` and uses them + Tailwind classes.
```jsx
function Card(props) {
  return (
    <div className="md:max-w-sm w-full p-6 rounded-xl shadow-xl bg-black border border-zinc-800 hover:scale-105 group">
      <img src={props.image} alt={props.alt} className="w-full h-48 object-cover rounded-lg" />
      <h1 className="text-lg font-semibold">{props.username}</h1>
      <h2 className="text-xl font-bold">{props.description}</h2>
    </div>
  )
}

export default Card
```

**Reusability payoff:** render `<Card />` many times with different props to get many cards —
same component, different data. That's the whole point.

---

## 6. Destructuring props (cleaner, very common)

Instead of writing `props.username`, `props.image` everywhere, **destructure** in the
function signature:

```jsx
function Card({ username, description, image, alt }) {   // pull fields straight out
  return (
    <div>
      <img src={image} alt={alt} />
      <h1>{username}</h1>
      <h2>{description}</h2>
    </div>
  )
}
```

Same result, less noise. You'll see this style in almost all real codebases.

### Default values for props
```jsx
function Card({ username = "Guest" }) { ... }   // used if the parent doesn't pass username
```

> 🧠 **Interview line:** "You can destructure props in the parameter list —
> `function Card({ username, image }) {}` — instead of reading `props.username` each time,
> and give defaults with `= value`. It's cleaner and the common convention."

---

## 7. Two special props: `children` and `key`

- **`children`** — whatever you put *between* a component's tags:
  ```jsx
  <Card>Hello</Card>        // inside Card:  function Card({ children }) { return <div>{children}</div> }
  ```
- **`key`** — a special prop for **lists** (from Part 5). It's not readable inside the child;
  React uses it for reconciliation. Always give list items a stable unique `key`.

> 🧠 **Interview line:** "`children` is the content nested between a component's tags, read
> via `props.children`. `key` is a special reserved prop for list items that React uses for
> reconciliation — it isn't accessible inside the component."

---

## 8. Common gotchas

| Gotcha | What goes wrong | Fix |
|---|---|---|
| `class="..."` in JSX | styles silently ignored | use `className="..."` |
| Passing a number/variable with quotes: `width="400"` | it's the **string** `"400"` | use braces: `width={400}` |
| Mutating props: `props.x = 5` | breaks one-way flow | never mutate; lift state to parent |
| `npx tailwindcss init -p` on v4 | "could not determine executable" | v4 has no init; use `@import "tailwindcss"` |
| v3 `@tailwind` directives on v4 | build errors / no styles | replace with single `@import "tailwindcss";` |
| Using Next.js `<Image>` in Vite | `Image` is not defined | use a plain `<img>` |
| Forgetting to `export default` the component | import fails | export it, and import with a matching name |

---

## 9. Interview Questions & Answers

**Q1. What is Tailwind CSS?**
> A utility-first CSS framework where you style by composing small predefined utility classes
> (`p-4`, `flex`, `bg-black`) in your `className`, instead of writing custom CSS.

**Q2. Why use Tailwind over normal CSS?**
> Faster to write, styles live next to the markup, consistent design tokens, and it purges
> unused classes so the final CSS bundle stays small.

**Q3. What are props in React?**
> Read-only inputs passed from a parent component to a child, like function arguments. They
> arrive as a single `props` object and make components reusable with different data.

**Q4. How do you pass and read props?**
> Pass them as JSX attributes: `<Card name="Arpit" age={20} />` (braces for non-strings).
> Read them inside the child from the `props` object, e.g. `props.name`, or by destructuring.

**Q5. Can a component change its own props?**
> No. Props are immutable and flow one-way, parent → child. To change data, keep it in the
> parent's (or the child's own) state and pass values/handlers down.

**Q6. What's the difference between props and state?**
> Props are passed in from the parent and are read-only. State is owned and managed inside
> the component (via `useState`) and can change, triggering a re-render.

**Q7. How do you destructure props?**
> In the parameter list: `function Card({ username, image }) {}` — pulls fields directly
> instead of `props.username`. You can add defaults: `{ username = "Guest" }`.

**Q8. What is `children`?**
> A special prop holding whatever is nested between a component's opening and closing tags,
> read via `props.children`.

**Q9. Why must you use braces to pass a number, like `width={400}`?**
> In JSX, quotes make a **string** (`"400"`). Curly braces embed a real JavaScript
> expression, so `{400}` passes the actual number.

**Q10. You installed Tailwind but `npx tailwindcss init -p` failed — why?**
> That's a v3 command. In v4 the `init` command was removed and the standalone binary moved
> to `@tailwindcss/cli`. With Vite you use the `@tailwindcss/vite` plugin and
> `@import "tailwindcss";` — no init, no `tailwind.config.js` required.

---

## 10. Quick self-test (cover the answers above)

1. What kind of framework is Tailwind? *(utility-first CSS)*
2. In v4 + Vite, what one CSS line replaces the three `@tailwind` directives? *(`@import "tailwindcss";`)*
3. What are props? *(read-only data passed parent → child)*
4. How do you pass a number vs a string as a prop? *(braces `{400}` vs quotes `"text"`)*
5. Can a child mutate its props? *(no — read-only, one-way flow)*
6. What's the difference between props and state? *(props in from parent/read-only; state owned/changeable)*
7. How do you read props more cleanly? *(destructure: `function Card({ name }) {}`)*
8. Why did `tailwindcss init -p` fail? *(v3 command; removed in v4)*

---

### ✅ Summary in one paragraph (for revision)
This part combines **styling** and **data flow**. **Tailwind CSS** is a utility-first
framework: you style by composing small classes like `p-4 rounded-xl bg-black` in
`className`, which is faster than writing custom CSS. Setup is **version-sensitive** — v3
uses `npx tailwindcss init -p` and three `@tailwind` directives, while our **v4 + Vite**
setup uses the `@tailwindcss/vite` plugin and a single `@import "tailwindcss";`. **Props** are
how a **parent passes data to a child** component — like function arguments — written as JSX
attributes (`username="Arpit"`, `image={myObj.image}`; braces for non-strings) and read from
the child's **`props`** object (or by **destructuring**: `function Card({ username })`). Props
are **read-only and flow one-way**, which keeps React predictable; anything that changes must
live in **state**, not props. We proved both by building a reusable **`Card`** component in
`tailwind_props/` — one component, styled once with Tailwind, reused with different props.
