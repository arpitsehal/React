# 12 — Redux Toolkit (RTK) — Interview-Ready Notes

> Based on **"Redux Toolkit Crash Course | Chai aur React"** and the todo app in this project.

---

## 1. Why Redux / Why RTK?
- **Redux** = predictable, centralized **global state** container. Solves prop-drilling and lets any component read/update shared state.
- Classic Redux had lots of boilerplate (action types, action creators, switch-case reducers, immutable spreads).
- **Redux Toolkit (RTK)** is the **official, recommended** way to write Redux — less boilerplate, sane defaults, built-in Immer & Thunk.

## 2. Core Vocabulary (must-know for interviews)
- **Store** — single source of truth; holds the whole app state tree.
- **Reducer** — pure function `(state, action) => newState`. Decides how state changes.
- **Action** — plain object `{ type, payload }` describing *what happened*.
- **Dispatch** — the only way to trigger a state change (`dispatch(action)`).
- **Selector** — function that reads a slice of state (`useSelector`).
- **Slice** — a feature's state + reducers + actions bundled together.

## 3. Install
```bash
npm install @reduxjs/toolkit react-redux
```
- `@reduxjs/toolkit` → core RTK.
- `react-redux` → React bindings (`Provider`, `useSelector`, `useDispatch`).

## 4. Create the Store — `configureStore`
```js
// app/store.js
import { configureStore } from '@reduxjs/toolkit';
import todoReducer from '../features/todo/todoSlice';

export const store = configureStore({
  reducer: todoReducer,   // for multiple: { todos: todoReducer, auth: authReducer }
});
```
- `configureStore` replaces old `createStore` — auto-configures **Redux DevTools** and **redux-thunk** middleware.

## 5. Create a Slice — `createSlice`
```js
// features/todo/todoSlice.js
import { createSlice, nanoid } from '@reduxjs/toolkit';

const initialState = { todos: [{ id: 1, text: 'Hello world' }] };

export const todoSlice = createSlice({
  name: 'todo',
  initialState,
  reducers: {
    addTodo: (state, action) => {
      state.todos.push({ id: nanoid(), text: action.payload });
    },
    removeTodo: (state, action) => {
      state.todos = state.todos.filter(t => t.id !== action.payload);
    },
  },
});

export const { addTodo, removeTodo } = todoSlice.actions; // auto-generated action creators
export default todoSlice.reducer;                          // register in the store
```
**Key interview points:**
- `createSlice` **auto-generates action creators** from reducer names — no manual action types.
- **`nanoid()`** generates unique IDs (built into RTK).
- Every reducer takes **`(state, action)`**; the value passed to the action creator arrives as **`action.payload`**.

## 6. Immer — "mutating" is actually immutable
- RTK uses **Immer** under the hood, so you can write `state.todos.push(...)` directly.
- It *looks* mutable but Immer produces a **new immutable state** behind the scenes. (Classic Redux required manual `...spread` copies.)
- ⚠️ Either mutate the draft **or** return a new state — don't do both in one reducer.

## 7. Provide the Store to React — `<Provider>`
```jsx
// main.jsx
import { Provider } from 'react-redux';
import { store } from './app/store.js';

<Provider store={store}>
  <App />
</Provider>
```
- `Provider` makes the store available to **every** component in the tree (React Context under the hood).

## 8. Read State — `useSelector`
```jsx
const todos = useSelector(state => state.todos);
```
- Subscribes the component to the store; re-renders when the selected slice changes.
- Shape of `state` depends on how reducers are registered in `configureStore`.

## 9. Update State — `useDispatch`
```jsx
const dispatch = useDispatch();
dispatch(addTodo(input));      // payload = input
dispatch(removeTodo(todo.id)); // payload = id
```
- `useDispatch` returns the store's `dispatch` function.
- Pass the **action creator** (imported from the slice) with its payload.

## 10. Data Flow (one-directional) — great whiteboard answer
```
UI event → dispatch(action) → reducer(state, action) → new store state → useSelector re-renders UI
```

## 11. RTK vs Classic Redux vs Context API
| | Context API | Classic Redux | Redux Toolkit |
|---|---|---|---|
| Boilerplate | Low | High | **Low** |
| DevTools / time-travel | No | Yes | **Yes** |
| Best for | Small/low-freq state | Large apps | **Large apps, less code** |
| Async | Manual | thunk (manual setup) | **thunk built-in** |
- **Context** re-renders all consumers on change; **Redux** re-renders only components whose selected slice changed → better for **frequently-updated** global state.

## 12. Quick Recall / Rapid-Fire
- **4 steps to wire RTK:** `configureStore` → `createSlice` → `<Provider store>` → `useSelector` / `useDispatch`.
- **Folder convention:** `app/store.js` + `features/<feature>/<feature>Slice.js`.
- `createSlice` gives you both the **reducer** (default export) and the **actions** (named export).
- **`createAsyncThunk`** → handles async API calls (auto `pending` / `fulfilled` / `rejected` actions). *(next step beyond this crash course)*
- **RTK Query** → RTK's built-in data-fetching & caching layer (replaces manual thunks for server state).

---

## 13.Interview Questions

**Q: What is Redux and why use it?**
A: A centralized, predictable global-state container. Solves prop-drilling and keeps shared state in one place with a one-directional data flow, making state changes traceable/debuggable.

**Q: What is Redux Toolkit and why prefer it over classic Redux?**
A: RTK is the **official, recommended** way to write Redux. It removes boilerplate (no manual action types/creators/switch reducers), ships with **Immer**, **redux-thunk**, and **DevTools** pre-configured via `configureStore`.

**Q: `configureStore` vs old `createStore`?**
A: `configureStore` auto-sets up DevTools + default middleware (thunk) and lets you combine multiple reducers via an object — `createStore` needed all of this wired manually.

**Q: What does `createSlice` do?**
A: Bundles a feature's `name`, `initialState`, and `reducers` in one place and **auto-generates action creators + action types** from the reducer names. Returns `slice.reducer` (default export) and `slice.actions` (named exports).

**Q: How can you write `state.todos.push(...)` if Redux state is immutable?**
A: RTK uses **Immer** internally. You mutate a *draft*; Immer produces a new immutable state. Rule: mutate the draft **or** return new state — never both in one reducer.

**Q: What is an action and what is `action.payload`?**
A: An action is a plain object `{ type, payload }` describing what happened. Whatever you pass to the auto-generated action creator (e.g. `addTodo(input)`) lands in `action.payload`.

**Q: Difference between `useSelector` and `useDispatch`?**
A: `useSelector(state => ...)` **reads** a slice of state and re-renders the component when it changes. `useDispatch()` returns `dispatch` to **send actions** and trigger reducers.

**Q: What does `<Provider store={store}>` do?**
A: Makes the store available to the whole component tree (via React Context under the hood) so any component can use `useSelector` / `useDispatch`.

**Q: Redux Toolkit vs Context API — when to use which?**
A: Context is a *transport* mechanism for low-frequency global state (theme, auth) and re-renders **all** consumers on change. RTK is a full state manager with DevTools, middleware, and **selective re-renders** (only components whose selected slice changed) — better for large, frequently-updated state.

**Q: How do you handle async / API calls in RTK?**
A: With **`createAsyncThunk`**, which auto-dispatches `pending`/`fulfilled`/`rejected` actions handled in `extraReducers`. For server-state fetching + caching, use **RTK Query**.

**Q: What is `nanoid()`?**
A: A tiny unique-ID generator built into RTK, used here to give each todo a unique `id`.

---

## 14. One-line Recap
> **Redux Toolkit wires global state in 4 steps — `configureStore` → `createSlice` → `<Provider store>` → `useSelector`/`useDispatch` — cutting classic-Redux boilerplate while Immer lets you write "mutating" reducers safely and DevTools + thunk come pre-configured.**
