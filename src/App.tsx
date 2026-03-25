import { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from './components/Scene'
import FrameSequence from './components/FrameSequence'
import './index.css'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const TOTAL_SECTIONS = 5

// Map each section index to a 3D camera progress value (0–1)
// Sections 2 & 3 cover the 3D scene so they reuse the section-1 camera position
const SECTION_PROGRESS: Record<number, number> = {
  0: 0,
  1: 0.333,
  2: 0.4,
  3: 0.5,
  4: 1.0,
}

function App() {
  const [showUI, setShowUI] = useState(false)
  const [sceneLoaded, setSceneLoaded] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const currentSection = useRef(0)
  const isAnimating = useRef(false)
  const scrollLockAt = useRef(0)
  const sectionsRef = useRef<HTMLElement[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Use visual viewport height to account for iOS browser chrome
  const getVH = useCallback(() => {
    return window.visualViewport ? window.visualViewport.height : window.innerHeight
  }, [])

  // Navigate to a specific section
  const goToSection = useCallback((index: number) => {
    if (index < 0 || index >= TOTAL_SECTIONS) return
    if (isAnimating.current) return

    const prevIndex = currentSection.current
    isAnimating.current = true
    currentSection.current = index
    setActiveSection(index)

    // Set correct starting scroll position when entering Section 3
    if (index === 3) {
      setTimeout(() => {
        const scrollContainer = document.querySelector('.gallery-scroll-container')
        if (scrollContainer) {
          if (prevIndex === 4) {
             scrollContainer.scrollTop = scrollContainer.scrollHeight
          } else {
             scrollContainer.scrollTop = 0
          }
        }
      }, 50)
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

    // Slide to new section using visual viewport height
    const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight
    gsap.to(wrapperRef.current, {
      y: -index * vh,
      duration: 1,
      ease: 'power3.inOut',
      onComplete: () => {
        isAnimating.current = false
        scrollLockAt.current = Date.now()
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
  }, [getVH])

  // Delayed UI reveal (Wait for scene to load, then wait 4s buffer)
  useEffect(() => {
    document.body.style.overflow = 'hidden'

    if (!sceneLoaded) return

    const timer = setTimeout(() => {
      setShowUI(true)
    }, 4000)

    return () => clearTimeout(timer)
  }, [sceneLoaded])

  // Wheel / touch / keyboard handlers
  useEffect(() => {
    if (!showUI) return

    let touchStartY = 0
    let touchCurrentY = 0

    const handleScroll = (direction: 'down' | 'up') => {
      // Prevent trackpad inertia and double triggers:
      // Ignore scroll if actively animating or if we are inside the post-animation cooldown window
      if (isAnimating.current || Date.now() - scrollLockAt.current < 800) return

      if (direction === 'down') {
        goToSection(currentSection.current + 1)
      } else {
        goToSection(currentSection.current - 1)
      }
    }

    const handleWheel = (e: WheelEvent) => {
      if (currentSection.current === 3) {
        const scrollContainer = document.querySelector('.gallery-scroll-container')
        if (scrollContainer) {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainer
          // Allow native scroll if not at absolute boundaries
          if (e.deltaY > 0 && Math.abs((scrollTop + clientHeight) - scrollHeight) > 2) return
          if (e.deltaY < 0 && scrollTop > 2) return
        }
      }

      e.preventDefault()
      if (e.deltaY > 0) handleScroll('down')
      else if (e.deltaY < 0) handleScroll('up')
    }



    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY
      touchCurrentY = touchStartY
    }

    const handleTouchMove = (e: TouchEvent) => {
      touchCurrentY = e.touches[0].clientY
      
      // Block native page scroll — we handle navigation ourselves
      // Only allow native scroll inside the gallery (Section 3) if not at boundaries
      if (currentSection.current !== 3) {
        if (e.cancelable) e.preventDefault()
      } else {
        const scrollContainer = document.querySelector('.gallery-scroll-container')
        if (!scrollContainer) {
          if (e.cancelable) e.preventDefault()
          return
        }
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer
        const delta = touchStartY - touchCurrentY
        
        // If at top and swiping down, or at bottom and swiping up, block native to allow section snap
        const isAtTop = scrollTop <= 2
        const isAtBottom = Math.abs((scrollTop + clientHeight) - scrollHeight) <= 2
        
        if (delta > 0 && isAtBottom) { if (e.cancelable) e.preventDefault() }
        if (delta < 0 && isAtTop) { if (e.cancelable) e.preventDefault() }
      }
    }

    const handleTouchEnd = () => {
      const deltaY = touchStartY - touchCurrentY
      const threshold = 50

      if (currentSection.current === 3) {
        const scrollContainer = document.querySelector('.gallery-scroll-container')
        if (scrollContainer) {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainer
          const isAtTop = scrollTop <= 5
          const isAtBottom = Math.abs((scrollTop + clientHeight) - scrollHeight) <= 5
          
          // If swiping up but NOT at bottom, stay in gallery
          if (deltaY > threshold && !isAtBottom) return
          // If swiping down but NOT at top, stay in gallery
          if (deltaY < -threshold && !isAtTop) return
        }
      }

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
    window.addEventListener('touchmove', handleTouchMove, { passive: false })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showUI, goToSection])

  // Handle window resize — use visualViewport for true mobile height
  useEffect(() => {
    const handleResize = () => {
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight
      if (wrapperRef.current) {
        gsap.set(wrapperRef.current, {
          y: -currentSection.current * vh
        })
      }
    }
    window.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('resize', handleResize)
    }
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
          <Scene onLoaded={() => setSceneLoaded(true)} />
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
            <img src="/brcgs-food-safety.png" alt="BRCGS Food Safety Certificated" className="cert-brcgs" />
            <img src="/smeta.png" alt="SMETA" />
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
            <div className="content reveal-text services-layout">
              <div className="services-title">
                <p className="subtitle" style={{ color: 'var(--green-accent)', fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '0.12em', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px' }}>
                  SERVICES
                </p>
                <h2 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', textTransform: 'uppercase', fontWeight: 800, lineHeight: 0.9 }}>
                  WHAT WE DO
                </h2>
              </div>
              <p className="services-body" style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.05rem', marginTop: '16px' }}>
                We connect Chilean hazelnuts to global markets through precision processing, quality control, and export expertise.
              </p>
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

        {/* Section 3 — Parallax Gallery */}
        <section className="fullpage-section" ref={(el) => addSectionRef(el, 3)}>
          <FrameSequence />
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
