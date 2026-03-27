import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from '../i18n/LanguageContext'

interface NavbarProps {
  visible?: boolean
}

function AnimatedLink({ to, children }: { to: string; children: React.ReactNode }) {
  const location = useLocation()

  const handleClick = (e: React.MouseEvent) => {
    if (location.pathname === to) {
      e.preventDefault()
      // Scroll the page container back to top
      const container = document.querySelector('.page-container')
      if (container) {
        container.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }
  }

  return (
    <Link to={to} className="nav-link-animated" onClick={handleClick}>
      <span className="nav-link-top">{children}</span>
      <span className="nav-link-bottom">{children}</span>
    </Link>
  )
}

export default function Navbar({ visible = true }: NavbarProps) {
  const { lang, setLang, t } = useTranslation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  if (!visible) return null

  const navItems = [
    { label: t('nav.nosotros'), to: '/aboutus' },
    { label: t('nav.productos'), to: '/products' },
    { label: t('nav.contacto'), to: '/contact' },
  ]

  return (
    <>
      <nav className="navbar fade-in">
        {/* Left: Logo */}
        <div className="logo">
          <Link to="/">
            <img src="/logo_notext.png" alt="Nefuen Trading" />
          </Link>
        </div>

        {/* Desktop nav (hidden on mobile) */}
        <div className="nav-links nav-links--desktop">
          <AnimatedLink to="/aboutus">{t('nav.nosotros')}</AnimatedLink>
          <AnimatedLink to="/products">{t('nav.productos')}</AnimatedLink>
          <AnimatedLink to="/contact">{t('nav.contacto')}</AnimatedLink>
          <button
            className="lang-slide-button"
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
          >
            <span className="lang-slide-top">{lang === 'en' ? 'EN' : 'ES'}</span>
            <span className="lang-slide-bottom">{lang === 'en' ? 'ES' : 'EN'}</span>
          </button>
        </div>

        {/* Mobile: center lang + right hamburger */}
        <div className="navbar-mobile-right">
          <button
            className="lang-slide-button lang-slide-button--mobile"
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
          >
            <span className="lang-slide-top">{lang === 'en' ? 'EN' : 'ES'}</span>
            <span className="lang-slide-bottom">{lang === 'en' ? 'ES' : 'EN'}</span>
          </button>
          <button
            className={`hamburger ${isMenuOpen ? 'hamburger--open' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="hamburger__line hamburger__line--1" />
            <span className="hamburger__line hamburger__line--2" />
            <span className="hamburger__line hamburger__line--3" />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen menu */}
      <div className={`mobile-menu ${isMenuOpen ? 'mobile-menu--open' : ''}`}>
        <div className="mobile-menu__content">
          <nav className="mobile-menu__nav">
            {navItems.map((item, i) => {
              const isActive = location.pathname === item.to
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`mobile-menu__link ${isActive ? 'mobile-menu__link--active' : ''}`}
                  style={{ transitionDelay: `${i * 50}ms` }}
                  onClick={(e) => {
                    setIsMenuOpen(false)
                    if (isActive) {
                      e.preventDefault()
                      const container = document.querySelector('.page-container')
                      if (container) container.scrollTo({ top: 0, behavior: 'smooth' })
                      else window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                  }}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mobile-menu__footer">
            <p className="mobile-menu__footer-label">Get in touch</p>
            <a href="mailto:infonefuen@grupohijuelas.com" className="mobile-menu__footer-email">
              infonefuen@grupohijuelas.com
            </a>
          </div>
        </div>
      </div>
    </>
  )
}
