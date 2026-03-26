import { useState, useEffect, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import Scene from '../components/Scene'
import FrameSequence from '../components/FrameSequence'
import CanvasErrorBoundary from '../components/CanvasErrorBoundary'
import Navbar from '../components/Navbar'
import { useTranslation } from '../i18n/LanguageContext'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

const TOTAL_SECTIONS = 5

const SECTION_PROGRESS: Record<number, number> = {
  0: 0,
  1: 0.333,
  2: 0.4,
  3: 0.5,
  4: 1.0,
}

export default function Home() {
  const { t } = useTranslation()
  const [showUI, setShowUI] = useState(false)
  const [sceneLoaded, setSceneLoaded] = useState(false)
  const [activeSection, setActiveSection] = useState(0)
  const currentSection = useRef(0)
  const isAnimating = useRef(false)
  const scrollLockAt = useRef(0)
  const sectionsRef = useRef<HTMLElement[]>([])
  const wrapperRef = useRef<HTMLDivElement>(null)
  const galleryBoundaryAt = useRef(0)

  const getVH = useCallback(() => {
    return window.visualViewport ? window.visualViewport.height : window.innerHeight
  }, [])

  const goToSection = useCallback((index: number) => {
    if (index < 0 || index >= TOTAL_SECTIONS) return
    if (isAnimating.current) return

    const prevIndex = currentSection.current
    isAnimating.current = true
    currentSection.current = index
    setActiveSection(index)

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

    const progress = SECTION_PROGRESS[index] ?? 0
    window.dispatchEvent(new CustomEvent('section-change', { detail: { section: index, progress } }))

    const prevSection = sectionsRef.current[prevIndex]
    if (prevSection) {
      const prevContent = prevSection.querySelector('.reveal-text')
      if (prevContent) {
        gsap.to(prevContent, { autoAlpha: 0, y: -20, duration: 0.3, ease: 'power2.in' })
      }
    }

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

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    if (!sceneLoaded) return
    const timer = setTimeout(() => setShowUI(true), 4000)
    return () => { clearTimeout(timer) }
  }, [sceneLoaded])

  // Restore overflow when leaving home
  useEffect(() => {
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (!showUI) return

    let touchStartY = 0
    let touchCurrentY = 0

    const handleScroll = (direction: 'down' | 'up') => {
      if (isAnimating.current || Date.now() - scrollLockAt.current < 800) return
      if (direction === 'down') goToSection(currentSection.current + 1)
      else goToSection(currentSection.current - 1)
    }

    const handleWheel = (e: WheelEvent) => {
      if (currentSection.current === 3) {
        const scrollContainer = document.querySelector('.gallery-scroll-container')
        if (scrollContainer) {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainer
          const isAtBottom = Math.abs((scrollTop + clientHeight) - scrollHeight) <= 2
          const isAtTop = scrollTop <= 2
          // Not at boundary — allow native gallery scroll, reset flag
          if (e.deltaY > 0 && !isAtBottom) { galleryBoundaryAt.current = 0; return }
          if (e.deltaY < 0 && !isAtTop) { galleryBoundaryAt.current = 0; return }
          // At boundary — absorb scrolls for 500ms then allow transition
          const now = Date.now()
          if (galleryBoundaryAt.current === 0) galleryBoundaryAt.current = now
          if (now - galleryBoundaryAt.current < 500) { e.preventDefault(); return }
          galleryBoundaryAt.current = 0
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
      if (currentSection.current !== 3) {
        if (e.cancelable) e.preventDefault()
      } else {
        const scrollContainer = document.querySelector('.gallery-scroll-container')
        if (!scrollContainer) { if (e.cancelable) e.preventDefault(); return }
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer
        const delta = touchStartY - touchCurrentY
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
          const isAtTop = scrollTop <= 15
          const isAtBottom = (scrollTop + clientHeight) >= (scrollHeight - 15)
          // Not at boundary — stay in gallery and mark as not at boundary
          if (deltaY > threshold && !isAtBottom) { galleryBoundaryAt.current = 0; return }
          if (deltaY < -threshold && !isAtTop) { galleryBoundaryAt.current = 0; return }
          // At boundary — absorb first swipe, allow second
          if ((deltaY > threshold && isAtBottom) || (deltaY < -threshold && isAtTop)) {
            if (galleryBoundaryAt.current === 0) {
              galleryBoundaryAt.current = Date.now()
              return
            }
            // Second swipe at boundary — allow transition
            galleryBoundaryAt.current = 0
          }
        }
      }
      if (deltaY > threshold) handleScroll('down')
      else if (deltaY < -threshold) handleScroll('up')
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') { e.preventDefault(); handleScroll('down') }
      else if (e.key === 'ArrowUp' || e.key === 'PageUp') { e.preventDefault(); handleScroll('up') }
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

  useEffect(() => {
    const handleResize = () => {
      const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight
      if (wrapperRef.current) gsap.set(wrapperRef.current, { y: -currentSection.current * vh })
    }
    window.addEventListener('resize', handleResize)
    window.visualViewport?.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      window.visualViewport?.removeEventListener('resize', handleResize)
    }
  }, [])

  const addSectionRef = useCallback((el: HTMLElement | null, index: number) => {
    if (el) sectionsRef.current[index] = el
  }, [])

  useGSAP(() => {
    if (!showUI) return
    gsap.utils.toArray<HTMLElement>('.reveal-text').forEach((el) => {
      gsap.set(el, { autoAlpha: 0, y: 40 })
    })
    const hero = sectionsRef.current[0]
    if (hero) {
      const content = hero.querySelector('.reveal-text')
      if (content) gsap.to(content, { autoAlpha: 1, y: 0, duration: 1, delay: 0.2, ease: 'power3.out' })
    }
  }, [showUI])

  return (
    <>
      <div className="canvas-container">
        <CanvasErrorBoundary>
          <Canvas camera={{ position: [0, 5, 15], fov: 45 }}>
            <Scene onLoaded={() => setSceneLoaded(true)} />
          </Canvas>
        </CanvasErrorBoundary>
      </div>

      {showUI && (
        <>
          <Navbar visible={showUI} />
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
        <section className="fullpage-section" ref={(el) => addSectionRef(el, 0)}>
          <div className={`cert-badges ${showUI ? 'fade-in' : 'hidden'}`}>
            <img src="/brc-food.png" alt="BRC Food Certificated" />
            <img src="/brcgs-food-safety.png" alt="BRCGS Food Safety Certificated" className="cert-brcgs" />
            <img src="/smeta.png" alt="SMETA" />
          </div>
          <div className={`hero-overlay ${showUI ? 'fade-in' : 'hidden'}`}>
            <div className="hero-content reveal-text">
              <h1>{t('hero.title')}</h1>
              <p className="description">{t('hero.subtitle')}</p>
              <button className="cta-button" onClick={() => goToSection(1)}>{t('hero.cta')}</button>
            </div>
          </div>
        </section>

        <section className="fullpage-section" ref={(el) => addSectionRef(el, 1)}>
          <div className="section-content left">
            <div className="content reveal-text services-layout">
              <div className="services-title">
                <p className="subtitle" style={{ color: 'var(--green-accent)', fontFamily: 'var(--font-heading)', fontWeight: 600, letterSpacing: '0.12em', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '12px' }}>
                  {t('services.label')}
                </p>
                <h2 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', textTransform: 'uppercase', fontWeight: 800, lineHeight: 0.9 }}>
                  {t('services.title')}
                </h2>
              </div>
              <p className="services-body" style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '1.05rem', marginTop: '16px' }}>
                {t('services.body')}
              </p>
            </div>
          </div>
        </section>

        <section className="fullpage-section" ref={(el) => addSectionRef(el, 2)}>
          <div className="transition-overlay">
            <div className="transition-content reveal-text">
              <p className="transition-label">{t('transition.label')}</p>
              <h2 className="transition-heading" style={{ whiteSpace: 'pre-line' }}>{t('transition.title')}</h2>
              <p className="transition-body">{t('transition.body')}</p>
              <button className="cta-button" onClick={() => goToSection(3)}>{t('transition.cta')}</button>
            </div>
          </div>
        </section>

        <section className="fullpage-section" ref={(el) => addSectionRef(el, 3)}>
          <FrameSequence />
        </section>

        <section className="fullpage-section" ref={(el) => addSectionRef(el, 4)}>
          <div className="section-content bottom-center">
            <div className="content reveal-text">
              <h2>{t('final.title')}</h2>
              <p>{t('final.body')}</p>
              <button className="cta-button" onClick={() => goToSection(0)}>{t('final.cta')}</button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}
