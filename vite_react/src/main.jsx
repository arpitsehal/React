import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

function MyApp(){
  return(
    <div>
      <h1>Custom App</h1>
    </div>
  )
}

const anotherElement =  (
  <a href = "https://www.google.com" target="_blank">Click me to visit Google</a>
)

const anotherUser = "Arpit"

const reactElement = React.createElement(
  'a',
  {href : 'https://www.google.com', target: '_blank'},
  'click me to visit Google'
)

createRoot(document.getElementById('root')).render(
    // <MyApp />,
    anotherUser,
    // anotherElement // this is how u can call object in react, this is the same as the customRender function in custom_react/Customreact.js
    // reactElement // this is how we can call react element in react
) 