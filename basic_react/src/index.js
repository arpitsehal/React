// ---------------------------------------------------------------------------
// index.js — the ENTRY POINT (the first file React runs, CRA version)
// ---------------------------------------------------------------------------
import React from 'react';                 // core React library (components, JSX)
import ReactDOM from 'react-dom/client';   // connects React to the browser DOM
import App from './App';                   // our root component (holds everything)

// Grab the empty <div id="root"> from public/index.html and make it React's root.
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render our whole app INSIDE that root div.
root.render(
  <React.StrictMode>
    {/* <App /> is our root component. Every other component (like <Arpit />)
        lives inside App, so rendering App renders the entire app. */}
    <App />
  </React.StrictMode>
);
