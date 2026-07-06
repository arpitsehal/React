// ---------------------------------------------------------------------------
// App.js — the ROOT component (CRA version)
// ---------------------------------------------------------------------------
// Import the component we built in Sehal.js.
// Because Sehal.js uses `export default`, we can name it anything here.
// The file exports a function called `Arpit`, so we import it as `Arpit`.
// (Path has no ".js" extension — the bundler adds it automatically.)
import Arpit from './Sehal';

function App() {
  // A component can RETURN ONLY ONE parent element.
  // We want an <h1> AND our <Arpit /> component (two siblings), so we wrap
  // BOTH of them inside a single <div>. Without this wrapper, React errors.
  return (
    <div>
      <h1>Hello World</h1>
      {/* Render the imported component. Self-closing tag, capital A. */}
      <Arpit />
    </div>
  );
}

// Export App so index.js can render it into the page.
export default App;
