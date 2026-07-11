# React Notes — Part 9: React Router (`createBrowserRouter`, `Outlet`, `NavLink`, `useParams`, `loader`)

> Part 1 (`NOTES1.md`) → **creating** a React project (CRA vs Vite).
> Part 2 (`NOTES2.md`) → **components**, the building blocks.
> Part 3 (`NOTES3.md`) → **build your own React** (JSX → object → DOM).
> Part 4 (`NOTES4.md`) → **Hooks** & `useState` (the Counter).
> Part 5 (`NOTES5.md`) → **Virtual DOM, Fiber & reconciliation**.
> Part 6 (`NOTES6.md`) → **Tailwind CSS** + **Props**.
> Part 7 (`NOTES7.md`) → **Password Generator** (`useCallback`, `useEffect`, `useRef`).
> Part 8 (`NOTES8.md`) → **Custom Hooks** (Currency Converter, `useCurrencyInfo`, `useId`).
> Part 9 → **React Router** — client-side routing with a shared layout, active links,
> URL params, and data loaders (the `router_project`).

---

## 0. Big Picture (read this first)

A traditional website asks the **server** for a fresh HTML page on every click → full page reload.
A **Single Page Application (SPA)** loads **one** HTML page, and JavaScript swaps the content in and
out as the URL changes — **no reload, no round-trip**. **React Router** is the library that makes
this happen: it maps a **URL path → a React component**.

> 🧠 **One-line mental model:** *React Router keeps the page fixed and swaps components based on the
> URL. `<Link>` changes the URL without reloading; the router re-renders the matching component into
> an `<Outlet />`.*

Three things you must be able to explain in an interview:
1. How you **define** routes (`createBrowserRouter` + `RouterProvider`).
2. How a **shared layout** (header/footer that stay put) works via **`<Outlet />`**.
3. How you read **dynamic URL data** (`useParams`) and **pre-load data** (`loader` + `useLoaderData`).

---

## 1. Install & the project structure (from `router_project/`)

```bash
npm install react-router-dom
```

```
src/
├── main.jsx                    # ← router is DEFINED here (createBrowserRouter)
├── Layout.jsx                  # Header + <Outlet /> + Footer  (the shared shell)
└── components/
    ├── Header/Header.jsx       # nav bar with <Link> and <NavLink>
    ├── Footer/Footer.jsx       # footer links
    ├── Home/Home.jsx           # "/"        page
    ├── About/About.jsx         # "/about"   page
    ├── Contact/Contact.jsx     # "/contact" page
    └── User/User.jsx           # "/user/:userid"  page (dynamic)
```

> `react-router-dom` is the **web** build. (`react-router-native` exists for React Native.)

---

## 2. Defining the router — `main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './Layout.jsx'
import Home from './components/Home/Home.jsx'
import About from './components/About/About.jsx'
import Contact from './components/Contact/Contact.jsx'
import User from './components/User/User.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,          // the shell (header/footer) for every child route
    children: [                   // ⚠️ lowercase "children" — a common bug!
      { path: '',        element: <Home /> },      // "" = index route → matches "/"
      { path: 'about',   element: <About /> },     // "/about"
      { path: 'contact', element: <Contact /> },   // "/contact"
      { path: 'user',          element: <User /> },// "/user"
      { path: 'user/:userid',  element: <User /> },// "/user/123"  (dynamic segment)
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
```

**What each piece does:**

| Piece | Role |
|---|---|
| `createBrowserRouter([...])` | Builds the route config object from an array. Uses the HTML5 **History API** (clean URLs, no `#`). |
| `RouterProvider router={router}` | Actually renders the router into the app. Replaces the old `<App/>`. |
| `path: '/'` + `element: <Layout/>` | The **parent** route: its element wraps all children. |
| `children: [...]` | **Nested routes** rendered inside the parent's `<Outlet />`. |
| `path: ''` | The **index route** — shown when the URL is exactly the parent path (`/`). |

> ⚠️ **The classic bugs** (both happened in this project):
> 1. Using `Children` (capital C, the React import) instead of `children` → nested routes never render.
> 2. Forgetting `import { createBrowserRouter }` → `ReferenceError: createBrowserRouter is not defined`.

**Alternative (JSX) syntax** — same thing, `createRoutesFromElements`:
```jsx
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<Layout />}>
      <Route path="" element={<Home />} />
      <Route path="about" element={<About />} />
      <Route path="user/:userid" element={<User />} />
    </Route>
  )
)
```

---

## 3. The shared layout & `<Outlet />` — `Layout.jsx`

```jsx
import { Outlet } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'

function Layout() {
  return (
    <>
      <Header />
      <Outlet />   {/* ← the matched child route renders HERE */}
      <Footer />
    </>
  )
}
export default Layout
```

**`<Outlet />` is the whole trick.** The `Header` and `Footer` render **once** and stay on screen.
Only the piece where `<Outlet />` sits gets swapped as the URL changes. Navigate to `/about` and
`<About/>` drops into the outlet — header/footer never re-mount or flicker.

> 🧠 Think of `<Outlet />` as a **picture frame**: the frame (layout) stays; the photo (page) changes.

---

## 4. Navigation — `<Link>` vs `<NavLink>` (Header.jsx)

**Never use a plain `<a href>` for internal links** — that triggers a **full page reload** and kills
the SPA. Use React Router's components, which update the URL client-side.

```jsx
import { Link, NavLink } from 'react-router-dom'

<Link to="/">Home</Link>              // plain navigation, no reload

<NavLink
  to="/about"
  className={({ isActive }) =>          // NavLink gives you isActive
    isActive ? 'text-orange-700' : 'text-gray-700'
  }
>
  About
</NavLink>
```

| | `<Link>` | `<NavLink>` |
|---|---|---|
| Navigates without reload | ✅ | ✅ |
| Knows if **it is the active route** | ❌ | ✅ via `isActive` |
| Typical use | logos, buttons, footers | **nav menus** (highlight current page) |

- `<NavLink>`'s `className` (and `style`) can be a **function** receiving `{ isActive, isPending }`.
- Use `<Link to="..." />` — **not** `href`. `to` is the prop.

---

## 5. Dynamic routes & `useParams` — `User.jsx`

A `:segment` in the path is a **URL parameter** — a placeholder that matches anything.

```jsx
// route:  { path: 'user/:userid', element: <User /> }
import { useParams } from 'react-router-dom'

function User() {
  const { userid } = useParams()   // reads the ":userid" segment from the URL
  return <div>User: {userid}</div>  // /user/arpit  →  "User: arpit"
}
```

- `useParams()` returns an **object** of all dynamic segments — the key name matches the `:name`.
- `/user/42` → `{ userid: '42' }`. Values are always **strings**.

> ⚠️ **Gotcha (happened here):** the route was only `user/:userid`, so visiting **`/user`** (no id)
> matched **nothing → "not found"**. The `:userid` segment is **required**. Fixes: visit
> `/user/<something>`, add a separate `{ path: 'user' }` route, or make the id optional.

---

## 6. Data loaders — fetch **before** the component renders (`loader` + `useLoaderData`)

Instead of the usual `useEffect`-then-`setState` fetch (which renders once with empty data, then
again after the fetch), React Router can **load data before rendering the route** and hand it to you.

```jsx
// github.jsx
export const githubInfoLoader = async () => {
  const response = await fetch('https://api.github.com/users/hiteshchoudhary')
  return response.json()          // whatever you return becomes the loader data
}

function Github() {
  const data = useLoaderData()    // ← already-loaded data, no useEffect needed
  return <div>Followers: {data.followers}</div>
}
```

```jsx
// wire the loader to the route in main.jsx
import Github, { githubInfoLoader } from './components/Github/Github'

{ path: 'github', element: <Github />, loader: githubInfoLoader }
```

**Why loaders beat `useEffect` fetching:**
- Data is ready **on first paint** — no empty→filled flicker, no loading `useState`.
- React Router can **prefetch** on hover/focus of the `<Link>`, so navigation feels instant.
- Loaders run **in parallel** for nested routes.

> `useEffect` fetch = *render, then go get data*. `loader` = *get data, then render*.

---

## 7. Programmatic navigation (bonus, common interview follow-up)

Navigate from code (e.g. after a form submit), not just from a click:

```jsx
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()
navigate('/about')       // go to a route
navigate(-1)             // go back (like the browser back button)
```

Other handy hooks: `useLocation()` (current URL info), `useSearchParams()` (read/write `?query=`).

---

## 8. Interview Q&A — rapid fire

**Q. Why React Router if the browser already routes?**
Because an SPA loads one HTML page. Without a router, changing the URL would reload the page and
lose all React state. React Router intercepts navigation and swaps components client-side.

**Q. `createBrowserRouter` vs `HashRouter`?**
`createBrowserRouter` uses the History API → clean URLs (`/about`). `HashRouter` uses `/#/about` —
needed only when the server can't be configured to serve `index.html` for every path.

**Q. What is `<Outlet />`?**
A placeholder in a parent (layout) route where the matched **child** route renders. It's how a
shared header/footer persist while the page content changes.

**Q. `Link` vs `NavLink`?**
Both navigate without reload. `NavLink` additionally exposes `isActive` (and `isPending`) so you can
style the link for the current route — used for nav menus.

**Q. `useParams` vs `useSearchParams`?**
`useParams` reads **path** segments (`/user/:id` → `id`). `useSearchParams` reads the **query
string** (`?sort=asc`).

**Q. What's an index route?**
A child route with `path: ''` (or `index: true`) — rendered when the URL exactly matches the parent
path, i.e. the default child.

**Q. `loader` vs fetching in `useEffect`?**
`loader` runs **before** the component renders and provides data via `useLoaderData()` — no loading
flicker, supports prefetch and parallel loading. `useEffect` fetches **after** the first render.

**Q. What broke rendering in this project?**
(1) `createBrowserRouter` wasn't imported → `ReferenceError`. (2) The config used `Children`
(capital C) instead of `children`, so nested routes never appeared in the `<Outlet />`.

---

## 9. TL;DR cheat-sheet

| Concept | API | One-liner |
|---|---|---|
| Define routes | `createBrowserRouter([...])` | array of `{ path, element, children, loader }` |
| Render router | `<RouterProvider router={router} />` | mounts the router (replaces `<App/>`) |
| Shared layout slot | `<Outlet />` | where child routes render inside a parent |
| Nested routes | `children: [...]` | **lowercase** — capital `Children` is a bug |
| Index route | `path: ''` | the default child for the parent path |
| Navigate (link) | `<Link to="/x">` | no reload; use `to`, never `href` |
| Active-aware link | `<NavLink>` + `isActive` | highlight the current nav item |
| Read path param | `useParams()` | `/user/:id` → `{ id }` (string) |
| Navigate in code | `useNavigate()` | `navigate('/x')`, `navigate(-1)` |
| Pre-load data | `loader` + `useLoaderData()` | fetch **before** render, no `useEffect` |

> **Golden rule:** *URL → component. `<Link>` changes the URL, the router matches a route, and the
> matched component renders into the nearest `<Outlet />`.*
