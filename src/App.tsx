import { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import FrameSequence from './components/FrameSequence'
import './index.css'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const TOTAL_FRAMES = 80
const TOTAL_SECTIONS = 5

// Map each section index to a 3D camera progress value (0–1)
// Sections 2 & 3 cover the 3D scene so they reuse the section-1 camera position
const SECTION_PROGRESS: Record<number, number> = {
  0: 0,
  1: 0.333,
  2: 0.333,
  3: 0.5,
  4: 1.0,
}

function App() {
  const [showUI, setShowUI] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const [frameIndex, setFrameIndex] = useState(0)
  const currentSection = useRef(0)
  const isAnimating = useRef(false)
  const sectionsRef = useRef<HTMLElement[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)
  const frameIndexRef = useRef(0) // keeps sync with state without closure issues

  // Navigate to a specific section
  const goToSection = useCallback((index: number) => {
    if (index < 0 || index >= TOTAL_SECTIONS) return
    if (isAnimating.current) return

    const prevIndex = currentSection.current
    isAnimating.current = true
    currentSection.current = index
    setActiveSection(index)

    // Reset frame state when leaving the frames section
    if (prevIndex === 3 && index !== 3) {
      setFrameIndex(0)
      frameIndexRef.current = 0
    }

    // Notify 3D scene of section change
    const progress = SECTION_PROGRESS[index] ?? 0
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
  }, [])

  // Delayed UI reveal
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    const timer = setTimeout(() => {
      setShowUI(true)
    }, 4000)

    return () => clearTimeout(timer)
  }, [])

  // Wheel / touch / keyboard handlers
  useEffect(() => {
    if (!showUI) return

    let touchStartY = 0

    const handleScroll = (direction: 'down' | 'up') => {
      // Section 3 (frames) — intercept scroll to drive frame animation
      if (currentSection.current === 3) {
        if (direction === 'down') {
          if (frameIndexRef.current < TOTAL_FRAMES - 1) {
            const next = frameIndexRef.current + 1
            frameIndexRef.current = next
            setFrameIndex(next)
          } else {
            goToSection(4)
          }
        } else {
          if (frameIndexRef.current > 0) {
            const prev = frameIndexRef.current - 1
            frameIndexRef.current = prev
            setFrameIndex(prev)
          } else {
            goToSection(2)
          }
        }
        return
      }

      // Normal section navigation
      if (isAnimating.current) return
      if (direction === 'down') {
        goToSection(currentSection.current + 1)
      } else {
        goToSection(currentSection.current - 1)
      }
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (e.deltaY > 0) handleScroll('down')
      else if (e.deltaY < 0) handleScroll('up')
    }

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaY = touchStartY - e.changedTouches[0].clientY
      const threshold = 50
      if (deltaY > threshold) handleScroll('down')
      else if (deltaY < -threshold) handleScroll('up')
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault()
        handleScroll('down')
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault()
        handleScroll('up')
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

    gsap.utils.toArray<HTMLElement>('.reveal-text').forEach((el) => {
      gsap.set(el, { autoAlpha: 0, y: 40 })
    })

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
              <a href="#" onClick={(e) => { e.preventDefault(); goToSection(4) }}>Contacto</a>
            </div>
          </nav>

          <div className="section-dots">
            {Array.from({ length: TOTAL_SECTIONS }).map((_, i) => (
              <button
                key={i}
                className={`dot ${activeSection === i ? 'active' : ''}`}
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

        {/* Section 1 — Services */}
        <section className="fullpage-section" ref={(el) => addSectionRef(el, 1)}>
          <div className="section-content left">
            <div className="content reveal-text tech-specs">
              <h2 className="spec-title" style={{ fontSize: 'clamp(2.5rem, 4vw, 4rem)' }}>
                SERVICIOS<br/>ASOCIADOS
              </h2>

              <div className="spec-divider"></div>

              <ul className="spec-list services-list">
                <li><span className="service-number">1-</span> Limpieza y secado</li>
                <li><span className="service-number">2-</span> Descascarado</li>
                <li><span className="service-number">3-</span> Exportación</li>
                <li><span className="service-number">4-</span> Valor Agregado</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Section 2 — Transition (text + dark overlay covers 3D) */}
        <section className="fullpage-section" ref={(el) => addSectionRef(el, 2)}>
          <div className="transition-overlay">
            <div className="transition-content reveal-text">
              <p className="transition-label">NEFUEN TRADING</p>
              <h2 className="transition-heading">Procesos<br/>Sostenibles</h2>
              <p className="transition-body">
                Implementamos agricultura de precisión y utilizamos energía 100% limpia para reducir al máximo nuestra huella de carbono, protegiendo el ecosistema nativo.
              </p>
              <button className="cta-button" onClick={() => goToSection(3)}>
                VER MÁS ↓
              </button>
            </div>
          </div>
        </section>

        {/* Section 3 — Frame Sequence (scroll-locked animation) */}
        <section className="fullpage-section" ref={(el) => addSectionRef(el, 3)}>
          <FrameSequence frameIndex={frameIndex} totalFrames={TOTAL_FRAMES} />
        </section>

        {/* Section 4 — Final */}
        <section className="fullpage-section" ref={(el) => addSectionRef(el, 4)}>
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
