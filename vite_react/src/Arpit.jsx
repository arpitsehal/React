// ---------------------------------------------------------------------------
// A REACT COMPONENT (Vite version)
// ---------------------------------------------------------------------------
// A "component" is just a JavaScript FUNCTION that RETURNS JSX (UI).
// Build it once here, then reuse it anywhere with <Arpit />.
//
// NAMING RULE: the function name MUST start with a CAPITAL letter (PascalCase).
//   - <Arpit /> -> React renders OUR component.
//   - <arpit /> -> React thinks it's an unknown HTML tag and it won't render.
function Arpit() {
  // A component must return ONE parent element — here a single <h2>.
  return (
    <h2>Hey from Arpit</h2>
  );
}

// `export default` lets other files import this component (see App.jsx).
export default Arpit;
