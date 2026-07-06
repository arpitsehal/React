// ---------------------------------------------------------------------------
// A REACT COMPONENT (CRA version)
// ---------------------------------------------------------------------------
// A "component" is just a JavaScript FUNCTION that RETURNS JSX (UI).
// This one file = one reusable piece of UI that we can drop anywhere.
//
// NAMING RULE: the function name MUST start with a CAPITAL letter (PascalCase).
//   - <Arpit />  -> React treats it as a COMPONENT (renders our function).
//   - <arpit />  -> React treats it as a plain HTML tag (won't work).
//
// NOTE: the file is called "Sehal.js" but the function is called "Arpit".
// That is allowed because we use `export default` below — whoever imports it
// can call it any name they like (see App.js: `import Arpit from './Sehal'`).
function Arpit() {
  // A component must return ONE parent element. Here it's a single <h1>.
  return (
    <h1>Arpit from react</h1>
  );
}

// `export default` makes this component importable from other files.
// "default" = this is the ONE main thing this file hands out.
export default Arpit;
