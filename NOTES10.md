# NOTES10 — React Context API (Interview Prep)

> Built alongside 2 projects: `mini_context` (login/profile state) and `theme_switcher` (dark/light theme).

---

## 1. The Problem Context Solves — "Prop Drilling"

- **Prop drilling** = passing props down through many intermediate components that don't need the data, just to reach a deeply nested child.
- Context lets any component **subscribe** to shared state directly, skipping the middle layers.
- Context is for **global-ish state**: current user, theme, language, cart. Not a replacement for all state — local UI state should stay `useState`.

**One-liner:** *"Context provides a way to pass data through the component tree without passing props down manually at every level."*

---

## 2. The 3 Core Pieces

| Piece | What it does | Code |
|-------|-------------|------|
| `createContext()` | Creates the context object | `const UserContext = React.createContext()` |
| `<Context.Provider>` | Wraps the tree, supplies a `value` | `<UserContext.Provider value={{user, setUser}}>` |
| `useContext()` | Reads the value in any child | `const {user} = useContext(UserContext)` |

**Data flow:** `createContext` → wrap app in `Provider` with a `value` → consume with `useContext`.

---

## 3. Project A — `mini_context` (user state)

**Create the context:**
```js
// UserContext.js
import React from 'react'
const UserContext = React.createContext()
export default UserContext
```

**Provider component (holds the state):**
```jsx
// UserContextProvider.jsx
const UserContextProvider = ({ children }) => {
    const [user, setUser] = React.useState(null)
    return (
        <UserContext.Provider value={{ user, setUser }}>
            {children}
        </UserContext.Provider>
    )
}
```

**Consume it:**
```jsx
const { user } = useContext(UserContext)   // read
const { setUser } = useContext(UserContext) // update (e.g. on login)
```

### Common bugs (that I actually hit)
- `{chidren}` typo → prop is `children`.
- `<Context.Provider />` self-closing instead of `</Context.Provider>` closing tag → JSX parse error.
- Destructuring `User` when the value key is `user` → `undefined`. **Case matters.**

---

## 4. Project B — `theme_switcher` (theme + custom hook)

**Context with default values AND a custom hook — the clean pattern:**
```js
// contexts/Theme.js
export const ThemeContext = createContext({
    themeMode: "light",
    darkTheme: () => {},
    lightTheme: () => {},
})

export const ThemeProvider = ThemeContext.Provider

// custom hook so consumers don't import useContext + context everywhere
export default function useTheme() {
    return useContext(ThemeContext)
}
```

**Apply the theme (side effect on `<html>`):**
```jsx
useEffect(() => {
    document.querySelector('html').classList.remove("light", "dark")
    document.querySelector('html').classList.add(themeMode)
}, [themeMode])
```

**Tailwind v4 gotcha:** `dark:` uses the `prefers-color-scheme` media query by default. To make it follow the `.dark` class you toggle, add to CSS:
```css
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```
(In Tailwind v3 this was `darkMode: 'class'` in the config file.)

---

## 5. Two Setup Styles (know both)

**Style 1 — separate Provider component** (`mini_context`): state lives in a dedicated `XProvider` component, cleaner for larger apps.

**Style 2 — provide defaults in `createContext` + custom hook** (`theme_switcher`): gives autocomplete + a documented shape, and `useTheme()` hides the wiring.

---

## 6. Likely Interview Questions

**Q: What is the Context API?**
Built-in React way to share state across the tree without prop drilling.

**Q: createContext vs useContext?**
`createContext` creates the context object (once, at module level). `useContext` reads its current value inside a component.

**Q: Why a custom hook like `useTheme`?**
Encapsulation — consumers call `useTheme()` instead of importing both `useContext` and the context. Central place to add guards (e.g. throw if used outside a Provider).

**Q: Context vs Redux/Zustand?**
Context is a *transport* mechanism, not a state manager — no built-in reducers, middleware, or selective re-render optimization. Fine for low-frequency global state (theme, auth). For large, frequently-updated state, a dedicated library is better.

**Q: Biggest performance pitfall?**
**Every consumer re-renders when the `value` changes.** Passing a fresh object literal `value={{...}}` re-renders all consumers on every parent render. Mitigate with `useMemo` on the value, or split into multiple contexts.

**Q: What if you read context with no Provider above?**
You get the default passed to `createContext()` (often `undefined` → runtime error). Good custom hooks throw a clear message.

---

## 7. 30-Second Recap
1. `createContext()` → the pipe.
2. `Provider value={...}` → fills the pipe, wraps the tree.
3. `useContext()` (or a custom hook) → taps the pipe.
4. Watch: object-literal `value` causes re-renders → `useMemo`.
5. Use for global-ish state; keep local UI state in `useState`.
