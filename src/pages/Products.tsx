import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import ArrowCTA from '../components/ArrowCTA'
import { useTranslation } from '../i18n/LanguageContext'


function ProductSection({
  title,
  subtitle,
  description,
  image,
  reverse = false,
}: {
  title: string
  subtitle: string
  description: string
  image?: string
  reverse?: boolean
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
            <img src={image} alt={title} className="product-section__img" />
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
        <h3
          className="product-section__subtitle"
          onMouseEnter={() => setIsHovered(false)}
        >
          {subtitle}
        </h3>
        <p
          className="product-section__desc"
          onMouseEnter={() => setIsHovered(false)}
        >
          {description}
        </p>
        <ArrowCTA label={t('products.cta.button')} to="/contact" />
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
      </section>

      {/* Product Sections */}
      <section>
        <ProductSection
          title={t('products.item.inshell.name')}
          subtitle={t('products.grid.label')}
          description={t('products.item.inshell.desc')}
          image="/inshell.webp"
        />
        <ProductSection
          title={t('products.item.shelled.name')}
          subtitle={t('products.grid.label')}
          description={t('products.item.shelled.desc')}
          image="/kernell.webp"
          reverse
        />
        <ProductSection
          title={t('products.item.blanched.name')}
          subtitle={t('products.grid.label')}
          description={t('products.item.blanched.desc')}
          image="/blanched.webp"
        />
        <ProductSection
          title={t('products.item.roasted.name')}
          subtitle={t('products.grid.label')}
          description={t('products.item.roasted.desc')}
          image="/valor2.webp"
          reverse
        />
      </section>

      {/* CTA Section */}
      <section className="products-cta">
        <div className="products-cta__inner">
          <span className="products-cta__label">{t('products.cta.label')}</span>
          <h2 className="products-cta__title">{t('products.cta.title')}</h2>
          <p className="products-cta__subtitle">{t('products.cta.subtitle')}</p>
          <ArrowCTA label={t('products.cta.button')} to="/contact" />
        </div>
      </section>
    </div>
  )
}
