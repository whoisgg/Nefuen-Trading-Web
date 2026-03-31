import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ArrowCTA from '../components/ArrowCTA'
import SiteFooter from '../components/SiteFooter'
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
            {/* Label on top like Products */}
            <span className="about-label" style={{ marginTop: '1.5rem' }}>{t('aboutus.hero.label')}</span>

            {/* Hero Image */}
            <div ref={imageRef} className="about-hero-image">
              <img
                src="/aboutus.webp"
                alt="Nefuen Trading"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>

            {/* Title + CTA + Text row below image (Products style) */}
            <div className="about-hero-bottom">
              <div ref={textLeftRef} className="about-hero-cta-col">
                <h1 ref={titleRef} className="about-hero-title-inline">
                  {t('aboutus.hero.title')}
                </h1>
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
              <img src="/hist.webp" alt="Nefuen Trading history" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Parallax Quote */}
      <section className="about-parallax">
        <div className="about-parallax-bg-img" />
        <div className="about-parallax-overlay" />
        <div className="about-parallax-content">
          <p className="about-parallax-quote">
            {t('aboutus.parallax.quote')}
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

      {/* Team — Inertia-style staggered grid */}
      <section className="about-team-section">
        <div className="about-team-inner">
          <span className="about-label">{t('aboutus.team.label')}</span>
          <h2 className="about-team-title">{t('aboutus.team.title')}</h2>
          <p className="about-team-subtitle">{t('aboutus.team.subtitle')}</p>

          {/* Desktop: staggered grid */}
          <div className="team-grid-inertia">
            {teamMembers.map((i) => (
              <div key={i} className="team-card-inertia">
                <div className="team-card-inertia__header">
                  <div>
                    <p className="team-card-inertia__name">{t(`aboutus.team.members.${i}.name`)}</p>
                    <p className="team-card-inertia__role">{t(`aboutus.team.members.${i}.role`)}</p>
                  </div>
                  <svg className="team-card-inertia__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </div>
                <div className="team-card-inertia__photo">
                  <span className="team-card-inertia__initial">{t(`aboutus.team.members.${i}.name`).charAt(0)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: horizontal scroll gallery */}
          <div className="team-gallery-mobile">
            {teamMembers.map((i) => (
              <div key={i} className="team-gallery-card">
                <div className="team-card-inertia__header">
                  <div>
                    <p className="team-card-inertia__name">{t(`aboutus.team.members.${i}.name`)}</p>
                    <p className="team-card-inertia__role">{t(`aboutus.team.members.${i}.role`)}</p>
                  </div>
                </div>
                <div className="team-card-inertia__photo">
                  <span className="team-card-inertia__initial">{t(`aboutus.team.members.${i}.name`).charAt(0)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile dot indicators */}
          <div className="team-gallery-dots">
            {teamMembers.map((i) => (
              <span key={i} className="team-gallery-dot" />
            ))}
          </div>
        </div>
      </section>

      {/* Grupo Hijuelas */}
      <section className="about-grupo-section">
        <div className="about-grupo-inner">
          <div className="about-concept-grid">
            <div className="about-grupo-video" style={{ order: -1 }}>
              <video
                className="about-grupo-video__el"
                src="/ghbg.mp4"
                autoPlay
                muted
                loop
                playsInline
              />
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
        <SiteFooter />
      </section>
    </div>
  )
}
