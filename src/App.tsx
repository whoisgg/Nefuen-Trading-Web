import { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import './index.css'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

function App() {
  const [showUI, setShowUI] = useState(false)
  const currentSection = useRef(0)
  const isAnimating = useRef(false)
  const sectionsRef = useRef<HTMLElement[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)

  const totalSections = 4 // hero + 3 content sections

  // Navigate to a specific section
  const goToSection = useCallback((index: number) => {
    if (index < 0 || index >= totalSections) return
    if (isAnimating.current) return

    const prevIndex = currentSection.current
    isAnimating.current = true
    currentSection.current = index

    // Notify 3D scene of section change (progress 0–1)
    const progress = index / (totalSections - 1)
    window.dispatchEvent(new CustomEvent('section-change', { detail: { section: index, progress } }))

    // Hide previous section text
    const prevSection = sectionsRef.current[prevIndex]
    if (prevSection) {
      const prevContent = prevSection.querySelector('.reveal-text')
      if (prevContent) {
        gsap.to(prevContent, { autoAlpha: 0, y: -20, duration: 0.3, ease: 'power2.in' })
      }
    }

    // Slide to new section
    gsap.to(wrapperRef.current, {
      y: -index * window.innerHeight,
      duration: 1,
      ease: 'power3.inOut',
      onComplete: () => {
        isAnimating.current = false
      }
    })

    // Reveal new section text
    const section = sectionsRef.current[index]
    if (section) {
      const content = section.querySelector('.reveal-text')
      if (content) {
        gsap.fromTo(content,
          { y: 40, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.8, delay: 0.5, ease: 'power3.out' }
        )
      }
    }
  }, [totalSections])

  // Delayed UI reveal
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    const timer = setTimeout(() => {
      setShowUI(true)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  // Wheel / touch / keyboard handlers — one event = one section
  useEffect(() => {
    if (!showUI) return

    let touchStartY = 0

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (isAnimating.current) return

      if (e.deltaY > 0) {
        goToSection(currentSection.current + 1)
      } else if (e.deltaY < 0) {
        goToSection(currentSection.current - 1)
      }
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      if (isAnimating.current) return
      const deltaY = touchStartY - e.changedTouches[0].clientY
      const threshold = 50

      if (deltaY > threshold) {
        goToSection(currentSection.current + 1)
      } else if (deltaY < -threshold) {
        goToSection(currentSection.current - 1)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating.current) return
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        goToSection(currentSection.current + 1)
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        goToSection(currentSection.current - 1)
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showUI, goToSection])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (wrapperRef.current) {
        gsap.set(wrapperRef.current, {
          y: -currentSection.current * window.innerHeight
        })
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Collect section refs
  const addSectionRef = useCallback((el: HTMLElement | null, index: number) => {
    if (el) sectionsRef.current[index] = el
  }, [])

  // On showUI: hide all section texts, then reveal hero (section 0)
  useGSAP(() => {
    if (!showUI) return

    // Hide all reveal-text elements
    gsap.utils.toArray<HTMLElement>('.reveal-text').forEach((el) => {
      gsap.set(el, { autoAlpha: 0, y: 40 })
    })

    // Reveal hero section text
    const hero = sectionsRef.current[0]
    if (hero) {
      const content = hero.querySelector('.reveal-text')
      if (content) {
        gsap.to(content, { autoAlpha: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' })
      }
    }
  }, [showUI])

  return (
    <>
      <div className="canvas-container">
        <Canvas camera={{ position: [0, 5, 15], fov: 45 }}>
          <Scene />
        </Canvas>
      </div>

      {/* Fixed UI — stays on top of everything */}
      {showUI && (
        <>
          <nav className="navbar fade-in">
            <div className="logo"><img src="/logo_notext.png" alt="Nefuen Trading" /></div>
            <div className="nav-links">
              <a href="#" onClick={(e) => { e.preventDefault(); goToSection(0) }}>Inicio</a>
              <a href="#" onClick={(e) => { e.preventDefault(); goToSection(1) }}>Servicios</a>
              <a href="#" onClick={(e) => { e.preventDefault(); goToSection(2) }}>Nosotros</a>
              <a href="#" onClick={(e) => { e.preventDefault(); goToSection(3) }}>Contacto</a>
            </div>
          </nav>

          <div className="section-dots">
            {Array.from({ length: totalSections }).map((_, i) => (
              <button
                key={i}
                className={`dot ${currentSection.current === i ? 'active' : ''}`}
                onClick={() => goToSection(i)}
                aria-label={`Go to section ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      <div className="fullpage-wrapper" ref={wrapperRef}>
        {/* Section 0 — Hero */}
        <section className="fullpage-section" ref={(el) => addSectionRef(el, 0)}>
          <div className={`cert-badges ${showUI ? 'fade-in' : 'hidden'}`}>
            <img src="/brc-food.png" alt="BRC Food Certificated" />
            <img src="/globalgap.png" alt="Global G.A.P." />
          </div>

          <div className={`hero-overlay ${showUI ? 'fade-in' : 'hidden'}`}>
            <div className="hero-content reveal-text">
              <p className="subtitle">NEFUEN TRADING</p>
              <h1>NEFUEN TRADING</h1>
              <p className="description">HAZELNUTS FROM NORTH PATAGONIA</p>
              <button className="cta-button" onClick={() => goToSection(1)}>OUR SERVICES</button>
            </div>
          </div>
        </section>

        {/* Section 1 */}
        <section className="fullpage-section" ref={(el) => addSectionRef(el, 1)}>
          <div className="section-content left">
            <div className="content reveal-text tech-specs">
              <div className="spec-header">
                <span className="spec-subtitle" style={{ fontSize: '1rem' }}>01</span>
              </div>
              <h2 className="spec-title">LIMPIEZA Y<br/>SECADO</h2>
              
              <div className="spec-divider"></div>
              
              <div className="spec-block">
                <p>Recibimos el fruto desde haciendas certificadas. Pesaje, muestreo y análisis de humedad garantizan trazabilidad total.</p>
                <ul className="spec-list">
                  <li>Control peso y humedad</li>
                  <li>Muestras trazables</li>
                  <li>Asignación de lote</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2 */}
        <section className="fullpage-section" ref={(el) => addSectionRef(el, 2)}>
          <div className="section-content left">
            <div className="content reveal-text">
              <h2>Procesos Sostenibles</h2>
              <p>Implementamos agricultura de precisión y utilizamos energía 100% limpia para reducir al máximo nuestra huella de carbono, protegiendo el ecosistema nativo.</p>
            </div>
          </div>
        </section>

        {/* Section 3 */}
        <section className="fullpage-section" ref={(el) => addSectionRef(el, 3)}>
          <div className="section-content bottom-center">
            <div className="content reveal-text">
              <h2>Alcance Global</h2>
              <p>Desde los fértiles valles del sur de Chile hasta los paladares y mercados más exigentes de Europa, Asia y Norteamérica.</p>
              <button className="cta-button" onClick={() => goToSection(0)}>CONTÁCTANOS</button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default App
