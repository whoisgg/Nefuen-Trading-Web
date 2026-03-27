import { useEffect, useRef } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Products from './pages/Products'
import Contact from './pages/Contact'
import AboutUs from './pages/AboutUs'
import './index.css'

function App() {
  const location = useLocation()
  const navigationCount = useRef(0)

  useEffect(() => {
    navigationCount.current++
  }, [location.pathname])

  return (
    <Routes key={location.pathname + '-' + navigationCount.current}>
      <Route path="/" element={<Home />} />
      <Route path="/aboutus" element={<AboutUs />} />
      <Route path="/products" element={<Products />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  )
}

export default App
