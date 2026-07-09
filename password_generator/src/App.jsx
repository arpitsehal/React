import { useCallback, useState, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {
  const [length , setLength] = useState(8)
  const [numberAllowed , setNumberAllowed] = useState(false)
  const [characterAllowed , setCharacterAllowed] = useState(false)
  const [password , setPassword] = useState("")
  const passwordRef = useRef(null)
  const passwordGenerator = useCallback(() => {
    let pass = ""
    let str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

    if (numberAllowed) {
      str += "0123456789"
    }

    if (characterAllowed) {
      str += "!@#$%^&*()-+"
    }

    for (let i = 0; i < length; i++) {
      let randomIndex = Math.floor(Math.random() * str.length)
      pass += str[randomIndex]
    }

    setPassword(pass) 
  }, [length, numberAllowed, characterAllowed, setPassword])


  return (
      <>
      <div className='w-full max-w-md mx-auto shadow-md rounded-lg px-4 my-8 text-orange-500 bg-amber-50 '> 
        <div className='flex shadow rounded-lg overflow-hidden mb-4'>
          <input type = "text" 
          value = {password}
          className='outline-none px-3 py-1 w-full text-gray-700'
          placeholder='Password' 
          readOnly
          ref={passwordRef}
          />
          <button className='bg-orange-500 text-white px-3 py-1' onClick={() => {
            passwordRef.current.select()
            document.execCommand('copy')
          }}>Copy</button>

        </div>
        <div className='flex text-sm gap-x-2'>
         <div className='flex items-center gap-x-1'>
          <input 
          type="range"
          min={6}
          max={100}
          value={length}
          className='cursor-pointer'
          onChange={(e) => setLength(e.target.value)}
          />
          <label>Length: {length}</label>
         </div>
         <div className='flex items-center gap-x-1'>
          <input 
          type="checkbox"
          checked={numberAllowed}
          id="numberAllowed"
          onChange={() => {
            setNumberAllowed((prev) => !prev)
          }}
          />
          <label htmlFor="numberAllowed">Numbers</label>
         </div>
         <div className='flex items-center gap-x-1'>
          <input 
          type="checkbox"
          checked={characterAllowed}
          id="characterAllowed"
          onChange={() => {
            setCharacterAllowed((prev) => !prev)
          }}
          />
          <label htmlFor="characterAllowed">Characters</label>
         </div>
        </div>
                 <button className='bg-orange-500 text-white px-3 py-1 rounded-lg ' onClick={passwordGenerator}>Generate</button>

      </div>
      </>
  )
}

export default App
