import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import ArrowCTA from '../components/ArrowCTA'
import SiteFooter from '../components/SiteFooter'
import { useTranslation } from '../i18n/LanguageContext'


function ProductSection({
  title,
  description,
  image,
  reverse = false,
  imgClassName = '',
}: {
  title: string
  description: string
  image?: string
  reverse?: boolean
  imgClassName?: string
}) {
  const [isHovered, setIsHovered] = useState(false)
  const { t } = useTranslation()

  return (
    <div className={`product-section ${reverse ? 'product-section--reverse' : ''}`}>
      {/* Image */}
      <div
        className="product-section__image"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`product-section__image-inner ${isHovered ? 'image-zoomed' : ''}`}>
          {image ? (
            <img src={image} alt={title} className={`product-section__img ${imgClassName}`} />
          ) : (
            <span className="product-section__image-label">{title}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="product-section__content">
        <h2
          className={`product-section__title ${isHovered ? 'title-shifted' : ''}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {title}
        </h2>
        <p
          className="product-section__desc"
          onMouseEnter={() => setIsHovered(false)}
        >
          {description}
        </p>
        <ArrowCTA label={t('products.cta.button')} to="/contact" externalHovered={isHovered} />
      </div>
    </div>
  )
}

export default function Products() {
  const { t } = useTranslation()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="page-container products-snap-container">
      <Navbar />

      {/* Hero Section — max 100vh */}
      <section className="products-hero-container">
        <div className="products-hero-inner">
          <span className="products-hero__label">{t('products.hero.label')}</span>

          <div className={`products-hero-video ${isLoaded ? 'products-hero-video--loaded' : ''}`}>
            <video
              autoPlay
              loop
              muted
              playsInline
              className="products-hero-video__el"
            >
              <source src="/avellanosproduct.mp4" type="video/mp4" />
            </video>
          </div>

          <div className="products-hero-bottom">
            <div className={`products-hero-bottom__left ${isLoaded ? 'fade-in-up' : ''}`}>
              <h1 className="products-hero__title-sm">{t('products.hero.title')}</h1>
              <ArrowCTA label={t('products.cta.button')} to="/contact" />
            </div>
            <p className={`products-hero-bottom__text ${isLoaded ? 'fade-in-up' : ''}`}>
              {t('products.hero.subtitle')}
            </p>
          </div>
        </div>
        <span className="hero-scroll-hint" aria-hidden="true">(SCROLL DOWN)</span>
      </section>

      {/* Product Sections */}
      <section>
        <ProductSection
          title={t('products.item.inshell.name')}

          description={t('products.item.inshell.desc')}
          image="/inshell.webp"
        />
        <ProductSection
          title={t('products.item.shelled.name')}

          description={t('products.item.shelled.desc')}
          image="/kernell.webp"
          reverse
        />
        <ProductSection
          title={t('products.item.blanched.name')}

          description={t('products.item.blanched.desc')}
          image="/blanched.webp"
        />
        {/* Hidden until further notice — value-added products
        <ProductSection
          title={t('products.item.roasted.name')}

          description={t('products.item.roasted.desc')}
          image="/landvalor.webp"
          reverse
        />
        */}
      </section>

      {/* Certifications Section */}
      <section className="products-cert">
        <div className="products-cert__inner">
          <div className="products-cert__text">
            <span className="products-cert__label">{t('products.cert.label')}</span>
            <h2 className="products-cert__title">{t('products.cert.title')}</h2>
            <p className="products-cert__subtitle">{t('products.cert.subtitle')}</p>
          </div>
          <div className="products-cert__logos">
            <a href="https://www.brcgs.com/our-standards/food-safety" target="_blank" rel="noopener noreferrer">
              <img src="/brcgs-food-safety.png" alt="BRCGS Food Safety Certificated" className="cert-brcgs" />
            </a>
            <a href="https://www.sedex.com/solutions/smeta-audit" target="_blank" rel="noopener noreferrer">
              <img src="/smeta.png" alt="SMETA 4-Pillars" />
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section">
        <div className="about-cta-inner">
          <span className="products-cta__label">{t('products.cta.label')}</span>
          <h2 className="about-cta-title">{t('products.cta.title')}</h2>
          <p className="about-cta-subtitle">{t('products.cta.subtitle')}</p>
          <Link to="/contact" className="about-cta-button">
            {t('products.cta.button')}
          </Link>
        </div>
        <SiteFooter />
      </section>
    </div>
  )
}
