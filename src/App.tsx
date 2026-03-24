import { useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import './index.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger)

function App() {
  const [showUI, setShowUI] = useState(false)

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
    })

    function raf(time: number) {
      lenis.raf(time)
      ScrollTrigger.update() // Sync GSAP with Lenis
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

  useGSAP(() => {
    if (!showUI) return;
    
    gsap.utils.toArray('.reveal-text').forEach((element: any) => {
      gsap.fromTo(element, 
        { y: 60, autoAlpha: 0 },
        {
          y: 0, 
          autoAlpha: 1, 
          duration: 1.2, 
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      )
    })
  }, [showUI])

  return (
    <>
      <div className="canvas-container">
        <Canvas
          shadows
          camera={{ position: [0, 5, 15], fov: 45 }}
        >
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

          {/* Certification Badges — bottom right */}
          <div className={`cert-badges ${showUI ? 'fade-in' : 'hidden'}`}>
            <img src="/brc-food.png" alt="BRC Food Certificated" />
            <img src="/globalgap.png" alt="Global G.A.P." />
          </div>

          {/* Hero Overlay */}
          <div className={`hero-overlay ${showUI ? 'fade-in' : 'hidden'}`}>
            <div className="hero-content reveal-text">
              <p className="subtitle">NEFUEN TRADING</p>
              <h1>NEFUEN TRADING</h1>
              <p className="description">HAZELNUTS FROM NORTH PATAGONIA</p>
              <button className="cta-button">OUR SERVICES</button>
            </div>
          </div>
        </section>

        {showUI && (
          <>
            {/* Section 1 */}
            <section className="next-section right">
              <div className="content reveal-text">
                <h2>Cosecha Premium</h2>
                <p>Nuestras avellanas son seleccionadas a mano, garantizando el mejor calibre y sabor del mercado global. Un estándar de excelencia sin compromisos.</p>
              </div>
            </section>
            
            {/* Section 2 */}
            <section className="next-section left">
              <div className="content reveal-text">
                <h2>Procesos Sostenibles</h2>
                <p>Implementamos agricultura de precisión y utilizamos energía 100% limpia para reducir al máximo nuestra huella de carbono, protegiendo el ecosistema nativo.</p>
              </div>
            </section>
            
            {/* Section 3 */}
            <section className="next-section center">
              <div className="content reveal-text">
                <h2 style={{ fontSize: '4rem', marginBottom: '20px' }}>Alcance Global</h2>
                <p style={{ fontSize: '1.25rem', color: '#666', marginBottom: '40px' }}>Desde los fértiles valles del sur de Chile hasta los paladares y mercados más exigentes de Europa, Asia y Norteamérica.</p>
                <button className="cta-button">CONTÁCTANOS</button>
              </div>
            </section>
          </>
        )}
      </main>
    </>
  )
}

export default App
