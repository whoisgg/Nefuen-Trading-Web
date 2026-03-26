import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ArrowCTA from '../components/ArrowCTA'
import { useTranslation } from '../i18n/LanguageContext'
import gsap from 'gsap'

const teamMembers = [0, 1, 2, 3, 4, 5, 6] as const

export default function AboutUs() {
  const { t } = useTranslation()
  const heroContainerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const textLeftRef = useRef<HTMLDivElement>(null)
  const textRightRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set(titleRef.current, { opacity: 0, y: 60 })
      gsap.set(imageRef.current, { opacity: 0, scale: 1.1, y: 40 })
      gsap.set([textLeftRef.current, textRightRef.current], { opacity: 0, y: 40 })

      const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 1 } })

      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 1.2 })
        .to(imageRef.current, { opacity: 1, scale: 1, y: 0, duration: 1.4 }, '-=0.6')
        .to(textLeftRef.current, { opacity: 1, y: 0 }, '-=0.8')
        .to(textRightRef.current, { opacity: 1, y: 0 }, '-=0.7')
    }, heroContainerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div className="page-container" style={{ overflow: 'auto', height: '100vh' }}>
      <Navbar />

      {/* Hero - Sticky */}
      <div ref={heroContainerRef} className="about-hero-container">
        <section className="about-hero-sticky">
          <div className="about-hero-inner">
            <div className="about-hero-title-row">
              <span className="about-label">{t('aboutus.hero.label')}</span>
              <h1 ref={titleRef} className="about-hero-title">
                {t('aboutus.hero.title')}
              </h1>
            </div>

            {/* Image placeholder */}
            <div ref={imageRef} className="about-hero-image">
              <div className="about-hero-image-placeholder">
                <span>Nefuen Trading</span>
              </div>
            </div>

            {/* CTA + Text row */}
            <div className="about-hero-bottom">
              <div ref={textLeftRef} className="about-hero-cta-col">
                <ArrowCTA label={t('nav.productos')} to="/products" />
              </div>
              <p ref={textRightRef} className="about-hero-text">
                {t('aboutus.hero.subtitle')}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Our Story - slides over hero */}
      <section className="about-concept-section">
        <div className="about-concept-inner">
          <div className="about-concept-grid">
            <div>
              <span className="about-label">{t('aboutus.story.label')}</span>
              <h2 className="about-concept-title">{t('aboutus.story.title')}</h2>
              <p className="about-concept-text">{t('aboutus.story.subtitle')}</p>
            </div>
            <div className="about-concept-image">
              <span>{t('aboutus.story.label')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Quote */}
      <section className="about-parallax">
        <div className="about-parallax-bg">
          <div className="about-parallax-overlay" />
        </div>
        <div className="about-parallax-content">
          <p className="about-parallax-quote">
            "To produce, process and commercialize world-class European hazelnuts, vertically integrating the entire value chain"
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="about-mv-section">
        <div className="about-mv-inner">
          <div className="about-mv-grid">
            <div className="about-mv-card">
              <span className="about-label">{t('aboutus.mission.label')}</span>
              <h2 className="about-mv-title">{t('aboutus.mission.title')}</h2>
              <p className="about-mv-text">{t('aboutus.mission.subtitle')}</p>
            </div>
            <div className="about-mv-card">
              <span className="about-label">{t('aboutus.vision.label')}</span>
              <h2 className="about-mv-title">{t('aboutus.vision.title')}</h2>
              <p className="about-mv-text">{t('aboutus.vision.subtitle')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="about-team-section">
        <div className="about-team-inner">
          <span className="about-label">{t('aboutus.team.label')}</span>
          <h2 className="about-team-title">{t('aboutus.team.title')}</h2>
          <p className="about-team-subtitle">{t('aboutus.team.subtitle')}</p>
          <div className="about-team-grid">
            {teamMembers.map((i) => (
              <div key={i} className="about-team-card">
                <div className="about-team-avatar">
                  <span>{t(`aboutus.team.members.${i}.name`).charAt(0)}</span>
                </div>
                <p className="about-team-name">{t(`aboutus.team.members.${i}.name`)}</p>
                <p className="about-team-role">{t(`aboutus.team.members.${i}.role`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Grupo Hijuelas */}
      <section className="about-grupo-section">
        <div className="about-grupo-inner">
          <div className="about-concept-grid">
            <div className="about-concept-image" style={{ order: -1 }}>
              <span>{t('aboutus.grupo.title')}</span>
            </div>
            <div>
              <span className="about-label">{t('aboutus.grupo.label')}</span>
              <h2 className="about-concept-title">{t('aboutus.grupo.title')}</h2>
              <p className="about-concept-text">{t('aboutus.grupo.subtitle')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section">
        <div className="about-cta-inner">
          <span className="about-label about-label--light">{t('aboutus.cta.label')}</span>
          <h2 className="about-cta-title">{t('aboutus.cta.title')}</h2>
          <p className="about-cta-subtitle">{t('aboutus.cta.subtitle')}</p>
          <Link to="/contact" className="about-cta-button">
            {t('aboutus.cta.button')}
          </Link>
        </div>
      </section>
    </div>
  )
}
