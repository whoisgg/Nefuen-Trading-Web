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
  maxWidth: 800,
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

export default function AboutUs() {
  const { t } = useTranslation()

  const sections = [
    { key: 'hero', bg: '#fff' },
    { key: 'story', bg: '#f8f8f8' },
    { key: 'vision', bg: '#fff' },
    { key: 'team', bg: '#f8f8f8' },
    { key: 'grupo', bg: '#fff' },
    { key: 'cta', bg: '#f8f8f8' },
  ] as const

  return (
    <div className="page-container" style={{ overflow: 'auto', height: '100vh' }}>
      <Navbar />

      {sections.map(({ key, bg }) => (
        <section key={key} style={sectionStyle(bg)}>
          <div style={wireframeBox}>
            <p style={labelStyle}>{t(`aboutus.${key}.label`)}</p>
            <h2 style={titleStyle}>{t(`aboutus.${key}.title`)}</h2>
            <p style={subtitleStyle}>{t(`aboutus.${key}.subtitle`)}</p>
          </div>
        </section>
      ))}
    </div>
  )
}
