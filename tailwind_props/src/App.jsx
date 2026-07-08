import './App.css'
import Card from './components/card'
function App() {
  let myObj = {
    name: "card",
    description: "This is a card component",
    image: "https://picsum.photos/400/300?random=90"
  }

  return (
    <>
      <h1 className="bg-green-400 text-black p-4 rounded-xl">tailwind test</h1>
      <Card username="Arpit" name={myObj.name} description={myObj.description} image={myObj.image} />
    </>
  )
}

export default App
