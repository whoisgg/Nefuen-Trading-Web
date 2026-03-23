import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import './index.css'

function App() {
  const [showUI, setShowUI] = useState(false)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    lenis.stop()
    document.body.style.overflow = 'hidden'

    const timer = setTimeout(() => {
      setShowUI(true)
      document.body.style.overflow = 'auto'
      lenis.start()
    }, 4000)

    return () => {
      clearTimeout(timer)
      lenis.destroy()
    }
  }, [])

  return (
    <>
      <div className="canvas-container">
        <Canvas shadows camera={{ position: [0, 5, 15], fov: 45 }}>
          <Scene />
        </Canvas>
      </div>

      <main className="content-wrapper">
        <section className="hero-section">
          {/* Navbar Filler */}
          <nav className={`navbar ${showUI ? 'fade-in' : 'hidden'}`}>
            <div className="logo">NEFUEN</div>
            <div className="nav-links">
              <a href="#home">Inicio</a>
              <a href="#services">Servicios</a>
              <a href="#about">Nosotros</a>
              <a href="#contact">Contacto</a>
            </div>
          </nav>

          {/* Hero Overlay */}
          <div className={`hero-overlay ${showUI ? 'fade-in' : 'hidden'}`}>
            <div className="hero-content">
              <p className="subtitle">NEFUEN TRADING</p>
              <h1>ESPECIALISTAS EN<br/>AVELLANO EUROPEO</h1>
              <p className="description">Liderazgo &middot; Calidad &middot; Exportación desde Chile</p>
              <button className="cta-button">CONOCER SERVICIOS</button>
            </div>
          </div>
        </section>

        {showUI && (
          <section className="next-section fade-in">
            <div className="content">
              <h2>Siguiente Sección</h2>
              <p>The 3D scene effortlessly stays pinned to the background and rotates around the hazelnuts as you scroll down!</p>
            </div>
          </section>
        )}
      </main>
    </>
  )
}

export default App
