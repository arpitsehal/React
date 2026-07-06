// ---------------------------------------------------------------------------
// App.jsx — the ROOT component (Vite version)
// ---------------------------------------------------------------------------
// Import the component we built in Arpit.jsx so we can use <Arpit /> below.
import Arpit from './Arpit';

function App() {
  // KEY RULE: a component can RETURN ONLY ONE parent element.
  //   return (
  //     <h1>Hello World</h1>
  //     <Arpit />          <-- ❌ two elements side by side = ERROR
  //   )
  // Fix: wrap the siblings in a single parent — a <div> (or <> </> Fragment).
  return (
    <div>
      <h1>Hello World</h1>
      {/* Reusing our imported component. We could render <Arpit /> many
          times here and it would repeat — that is the power of components. */}
      <Arpit />
    </div>
  );
}

// Export App so main.jsx can mount it onto the page.
export default App;
