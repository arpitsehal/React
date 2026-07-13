# Notes 11 — Local Todo App with Context API + localStorage

> Project: `ToDo_Local` — a Todo app where global state is shared via **Context API** and persisted in the browser's **localStorage**. Interview-ready quick revision.

---

## 1. Big Picture — What this project teaches

- **Context API** to avoid prop-drilling (share `todos` + CRUD functions across components).
- **localStorage** to persist data across page reloads.
- **Controlled inputs** and **immutable state updates**.
- Clean project structure: `contexts/`, `components/`, barrel `index.js` files.

---

## 2. Context API — The 3 Steps

Context lets you share state without passing props manually through every level.

### Step 1 — Create the context (with a default shape)
```js
// contexts/TodoContext.js
import { createContext, useContext } from "react"

export const TodoContext = createContext({
  todos: [{ id: 1, todo: "Todo msg", completed: false }],
  addTodo: (todo) => {},
  updateTodo: (id, todo) => {},
  deleteTodo: (id) => {},
  toggleComplete: (id) => {},
})

// Custom hook — cleaner than importing useContext everywhere
export const useTodo = () => useContext(TodoContext)

export const TodoProvider = TodoContext.Provider
```
**Why a default object with functions?** It documents the "contract" and gives IntelliSense/autocomplete for consumers.

**Why a custom `useTodo()` hook?** DRY — consumers call `useTodo()` instead of `useContext(TodoContext)` everywhere.

### Step 2 — Wrap the app in the Provider & supply real values
```jsx
// App.jsx
<TodoProvider value={{ todos, addTodo, updateTodo, deleteTodo, toggleComplete }}>
  {/* children */}
</TodoProvider>
```
The `value` is what all children actually receive (overrides the default).

### Step 3 — Consume anywhere below the Provider
```jsx
const { addTodo } = useTodo()          // TodoForm
const { updateTodo, deleteTodo, toggleComplete } = useTodo()  // TodoItem
```

---

## 3. State Logic (lives in App.jsx)

All state + logic sits in `App` and is passed down via context.

```js
const [todos, setTodos] = useState([])

const addTodo = (todo) =>
  setTodos((prev) => [{ id: Date.now(), ...todo }, ...prev])

const updateTodo = (id, todo) =>
  setTodos((prev) => prev.map((t) => (t.id === id ? todo : t)))

const deleteTodo = (id) =>
  setTodos((prev) => prev.filter((t) => t.id !== id))

const toggleComplete = (id) =>
  setTodos((prev) =>
    prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
  )
```

**Key interview points:**
- Always use the **updater form** `setTodos(prev => ...)` when new state depends on old state.
- **Never mutate** — use `map`, `filter`, spread `{...t}` to return new arrays/objects.
- `Date.now()` is a quick unique id (fine for demos; use `uuid`/`crypto.randomUUID()` in production).
- `add` prepends (`[new, ...prev]`) so newest todos appear on top.

---

## 4. localStorage Persistence (two useEffects)

```js
// LOAD once on mount
useEffect(() => {
  const todos = JSON.parse(localStorage.getItem("todos"))
  if (todos && todos.length > 0) setTodos(todos)
}, [])

// SAVE whenever todos change
useEffect(() => {
  localStorage.setItem("todos", JSON.stringify(todos))
}, [todos])
```

**Key points:**
- localStorage stores **strings only** → `JSON.stringify` to save, `JSON.parse` to read.
- Load effect runs **once** (`[]` dependency).
- Save effect runs on **every `todos` change** (`[todos]` dependency).
- Guard the load with `if (todos && todos.length > 0)` because `getItem` returns `null` on first visit.

---

## 5. Component Breakdown

### TodoForm — adds a todo (controlled input)
```jsx
const [todo, setTodo] = useState("")
const { addTodo } = useTodo()

const add = (e) => {
  e.preventDefault()
  if (!todo) return
  addTodo({ todo, completed: false })
  setTodo("")               // clear input after submit
}
```
- `e.preventDefault()` stops the form from reloading the page.
- Guard `if (!todo) return` prevents empty todos.

### TodoItem — edit / toggle / delete (local UI state + context actions)
```jsx
const [isTodoEditable, setIsTodoEditable] = useState(false)
const [todoMsg, setTodoMsg] = useState(todo.todo)
const { updateTodo, deleteTodo, toggleComplete } = useTodo()

const editTodo = () => {
  updateTodo(todo.id, { ...todo, todo: todoMsg })
  setIsTodoEditable(false)
}
const toggleCompleted = () => toggleComplete(todo.id)
```
- **Local state** (`isTodoEditable`, `todoMsg`) is UI-only → stays in the component.
- **Shared state actions** (`updateTodo` etc.) come from context.
- Input uses `readOnly={!isTodoEditable}` to toggle between view/edit mode.
- The ✏️/📁 button flips edit mode, then saves; disabled while `todo.completed`.

---

## 6. Project Structure & Barrel Exports

```
src/
├── App.jsx                  # state + logic + provider
├── contexts/
│   ├── TodoContext.js       # createContext, useTodo, TodoProvider
│   └── index.js             # barrel: re-exports
└── components/
    ├── TodoForm.jsx
    ├── TodoItem.jsx
    └── index.js             # barrel: export { TodoForm, TodoItem }
```
**Barrel files** (`index.js`) let you write clean imports:
```js
import { TodoForm, TodoItem } from "./components"
import { TodoProvider, useTodo } from "./contexts"
```

---

## 7. Common Interview Q&A

**Q: When use Context vs props?**
A: Context for *global-ish* data needed by many components at different depths (theme, auth, todos here). Props for direct parent→child data. Overusing context hurts reusability.

**Q: Context vs Redux?**
A: Context is built-in, great for low-frequency global state. Redux/Zustand add devtools, middleware, and better performance for large, frequently-updated state.

**Q: Downside of Context?**
A: Every consumer **re-renders** when the `value` changes. Fix by splitting contexts or memoizing the value.

**Q: Why `useState(todo.todo)` in TodoItem instead of reading context?**
A: The edit box needs its own draft value so typing doesn't mutate global state until you hit Save.

**Q: Why the updater function `setTodos(prev => ...)`?**
A: State updates are async/batched; using `prev` guarantees you act on the latest value, not a stale closure.

---

## 8. One-line Recap
> **Context API shares `todos` + CRUD functions app-wide via a `useTodo()` hook; two `useEffect`s sync that state to localStorage (stringify on save, parse on load); components stay dumb and immutable updates keep React re-rendering correctly.**
