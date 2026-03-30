import { useRef, useEffect, useCallback } from 'react'
import { useTranslation } from '../i18n/LanguageContext'

const MARKETS_COUNT = 9

export default function MarketsSection() {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const namesRef = useRef<HTMLSpanElement[]>([])

  const updateNames = useCallback(() => {
    const container = containerRef.current
    if (!container) return

    const viewportW = container.clientWidth
    const focusX = viewportW * 0.38

    namesRef.current.forEach((el) => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      const elCenter = rect.left + rect.width / 2 - containerRect.left
      const offset = elCenter - focusX
      const distance = Math.abs(offset)
      const maxDist = viewportW * 0.5

      const ratio = Math.min(distance / maxDist, 1)

      // Globe arc: tight radius, steep curve
      const angle = ratio * (Math.PI * 0.45)
      const arcRadius = 150
      const arcY = arcRadius * (1 - Math.cos(angle)) // curve down

      const opacity = 1 - ratio * 0.85
      const blur = ratio * 6
      const scale = 1 - ratio * 0.25

      el.style.opacity = String(opacity)
      el.style.filter = `blur(${blur}px)`
      el.style.transform = `translateY(${arcY}px) scale(${scale})`
    })
  }, [])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    updateNames()

    container.addEventListener('scroll', updateNames, { passive: true })
    window.addEventListener('resize', updateNames)

    return () => {
      container.removeEventListener('scroll', updateNames)
      window.removeEventListener('resize', updateNames)
    }
  }, [updateNames])

  // Re-run when section becomes active
  useEffect(() => {
    const observer = new MutationObserver(updateNames)
    const container = containerRef.current
    if (container) {
      observer.observe(container, { attributes: true, attributeFilter: ['style'] })
    }
    return () => observer.disconnect()
  }, [updateNames])

  return (
    <div className="markets-section">
      {/* Top text */}
      <div className="markets-ui reveal-text">
        <p className="markets-ui__label">{t('transition.label')}</p>
        <h2 className="markets-ui__title">{t('transition.title')}</h2>
        <p className="markets-ui__subtitle">{t('transition.subtitle')}</p>
      </div>

      {/* Horizontal scrolling globe wheel */}
      <div className="markets-scroll-container" ref={containerRef}>
        <div className="markets-spacer-left" />
        {Array.from({ length: MARKETS_COUNT }).map((_, i) => (
          <div key={i} className="markets-item">
            <span
              className="markets-name"
              ref={(el) => { if (el) namesRef.current[i] = el }}
            >
              {t(`markets.${i}`)}
            </span>
          </div>
        ))}
        <div className="markets-spacer-right" />
      </div>
    </div>
  )
}
