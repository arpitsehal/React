import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {

  const [counter, setCounter] = useState(0);
  const addValue = () => {
    setCounter(counter + 1);
  }

  return (
   <> 
   <h1>Counter by Arpit</h1>
   <h2> value : {counter}</h2>
   <button onClick={addValue}>Add value</button>
   <br />
   <button onClick ={() => setCounter(counter - 1)}>Remove value</button>
   </>
  )
}

export default App
