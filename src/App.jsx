import './App.css'
import MapView from "./components/mapas/MapView"
import NegociosCards from "./components/cards/negociosCards"
import BottomNav from './components/navegation/bottomNavegation'
import { Serch } from './components/serch/serch'


function App() {
  const bars = [
    {
      id: 1,
      name: "Cervecería Neón",
      rating: 4.8,
      distance: "200m",
      open: "Abierto hasta 03:00",
      tag1: "CHILL VIBES",
      tag2: "PROMO 2x1 GIN",
      image: "/bar1.jpg"
    },
    {
      id: 2,
      name: "Bar Eclipse",
      rating: 4.6,
      distance: "350m",
      open: "Abierto hasta 02:00",
      tag1: "DJ SET",
      tag2: "TRAGOS",
      image: "/bar2.jpg"
    }
  ]

  return (
    <>
      <Serch />
      <div style={{ position: "relative", height: "80vh",width:"100%", overflow: "hidden",marginTop:"1vh" }}>
      <MapView />
        <NegociosCards bars={bars} />
      </div>
  
      <BottomNav
        active="map"
        onChange={(tab) => console.log(tab)}
      />
    </>
  )
}

export default App
