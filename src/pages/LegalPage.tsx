import { useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import SiteFooter from '../components/SiteFooter'
import { useTranslation } from '../i18n/LanguageContext'
import gsap from 'gsap'

type LegalType = 'privacy' | 'terms' | 'cookies'

const SECTIONS: Record<LegalType, { titleKey: string; sectionsPrefix: string; sectionCount: number }> = {
  privacy: { titleKey: 'legal.privacy.title', sectionsPrefix: 'legal.privacy.section', sectionCount: 8 },
  terms: { titleKey: 'legal.terms.title', sectionsPrefix: 'legal.terms.section', sectionCount: 9 },
  cookies: { titleKey: 'legal.cookies.title', sectionsPrefix: 'legal.cookies.section', sectionCount: 6 },
}

export default function LegalPage() {
  const location = useLocation()
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)

  const legalType = (location.pathname.replace('/', '') as LegalType) || 'privacy'
  const config = SECTIONS[legalType] || SECTIONS.privacy

  useEffect(() => {
    document.body.style.overflow = ''
    window.scrollTo(0, 0)

    if (containerRef.current) {
      gsap.fromTo(containerRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      )
    }
  }, [legalType])

  return (
    <>
      <Navbar visible />
      <div className="legal-page" ref={containerRef}>
        <div className="legal-content">
          <div className="legal-top-nav">
            <Link to="/" className="legal-back">&larr; {t('legal.back')}</Link>
            <div className="legal-top-links">
              {legalType !== 'privacy' && <Link to="/privacy">{t('legal.privacy.title')}</Link>}
              {legalType !== 'terms' && <Link to="/terms">{t('legal.terms.title')}</Link>}
              {legalType !== 'cookies' && <Link to="/cookies">{t('legal.cookies.title')}</Link>}
            </div>
          </div>
          <h1 className="legal-title">{t(config.titleKey)}</h1>
          <p className="legal-updated">{t('legal.lastUpdated')}</p>

          {Array.from({ length: config.sectionCount }).map((_, i) => (
            <section key={i} className="legal-section">
              <h2>{t(`${config.sectionsPrefix}.${i}.heading`)}</h2>
              <p>{t(`${config.sectionsPrefix}.${i}.body`)}</p>
            </section>
          ))}

        </div>
        <SiteFooter />
      </div>
    </>
  )
}
