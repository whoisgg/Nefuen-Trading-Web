import Navbar from '../components/Navbar'
import { useTranslation } from '../i18n/LanguageContext'

const sectionStyle = (bg: string): React.CSSProperties => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: bg,
  padding: '80px 5%',
})

const wireframeBox: React.CSSProperties = {
  border: '2px dashed #ccc',
  borderRadius: 12,
  padding: '60px 40px',
  maxWidth: 1000,
  width: '100%',
  textAlign: 'center',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontWeight: 600,
  letterSpacing: '0.12em',
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  color: '#d4812a',
  marginBottom: 12,
}

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontSize: 'clamp(2rem, 4vw, 3.5rem)',
  fontWeight: 800,
  color: '#2d3a2d',
  textTransform: 'uppercase',
  margin: '0 0 16px 0',
  lineHeight: 1,
}

const subtitleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '1.1rem',
  color: '#999',
  maxWidth: 500,
  margin: '0 auto',
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: 20,
  marginTop: 40,
  width: '100%',
}

const cardStyle: React.CSSProperties = {
  border: '1.5px dashed #ccc',
  borderRadius: 10,
  padding: '32px 20px',
  textAlign: 'center',
  background: '#fafafa',
}

const cardTitle: React.CSSProperties = {
  fontFamily: 'var(--font-heading)',
  fontWeight: 700,
  fontSize: '1rem',
  color: '#2d3a2d',
  margin: '0 0 6px 0',
}

const cardSub: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.85rem',
  color: '#999',
  margin: 0,
}

const productKeys = [
  'inshell',
  'shelled',
  'blanched',
  'roasted',
  'paste',
  'cocoa',
  'praline',
  'dragees',
] as const

export default function Products() {
  const { t } = useTranslation()

  return (
    <div className="page-container" style={{ overflow: 'auto', height: '100vh' }}>
      <Navbar />

      {/* Hero */}
      <section style={sectionStyle('#fff')}>
        <div style={wireframeBox}>
          <p style={labelStyle}>{t('products.hero.label')}</p>
          <h2 style={titleStyle}>{t('products.hero.title')}</h2>
          <p style={subtitleStyle}>{t('products.hero.subtitle')}</p>
        </div>
      </section>

      {/* Products Grid */}
      <section style={sectionStyle('#f8f8f8')}>
        <div style={{ ...wireframeBox, maxWidth: 1100 }}>
          <p style={labelStyle}>{t('products.grid.label')}</p>
          <h2 style={titleStyle}>{t('products.grid.title')}</h2>
          <p style={subtitleStyle}>{t('products.grid.subtitle')}</p>
          <div style={gridStyle}>
            {productKeys.map((key) => (
              <div key={key} style={cardStyle}>
                <p style={cardTitle}>{t(`products.item.${key}.name`)}</p>
                <p style={cardSub}>{t(`products.item.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section style={sectionStyle('#fff')}>
        <div style={wireframeBox}>
          <p style={labelStyle}>{t('products.cert.label')}</p>
          <h2 style={titleStyle}>{t('products.cert.title')}</h2>
          <p style={subtitleStyle}>{t('products.cert.subtitle')}</p>
        </div>
      </section>

      {/* CTA Contact */}
      <section style={sectionStyle('#f8f8f8')}>
        <div style={wireframeBox}>
          <p style={labelStyle}>{t('products.cta.label')}</p>
          <h2 style={titleStyle}>{t('products.cta.title')}</h2>
          <p style={subtitleStyle}>{t('products.cta.subtitle')}</p>
        </div>
      </section>
    </div>
  )
}
