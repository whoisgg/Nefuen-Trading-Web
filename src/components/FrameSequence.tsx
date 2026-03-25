import { useRef } from 'react'

const ITEMS = [
  {
    label: '01',
    heading: 'Cosecha\ny Selección',
    body: 'Recolectamos avellanas en su punto óptimo de madurez en los valles del norte de la Patagonia.',
    bg: '#1B5E20',
  },
  {
    label: '02',
    heading: 'Secado\ny Limpieza',
    body: 'Secado controlado para alcanzar la humedad ideal, seguido de limpieza profunda.',
    bg: '#316838',
  },
  {
    label: '03',
    heading: 'Descascarado\ny Calibrado',
    body: 'Clasificación por calibre y peso que garantiza uniformidad para los estándares de exportación.',
    bg: '#388E3C',
  },
  {
    label: '04',
    heading: 'Exportación\nCertificada',
    body: 'Embalaje BRC Food y Global G.A.P., listo para los mercados de Europa, Asia y Norteamérica.',
    bg: '#7CB342',
  },
]

export default function FrameSequence() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div className="gallery-fixed-title">
        <h2 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', color: 'var(--green-brand)', textTransform: 'uppercase', fontWeight: 800, lineHeight: 0.9 }}>
          OUR SERVICES
        </h2>
      </div>

      <div 
        className="gallery-scroll-container" 
        ref={containerRef}
      style={{ 
        height: '100%', 
        width: '100%', 
        overflowY: 'auto', 
        overflowX: 'hidden',
        background: 'transparent',
        scrollSnapType: 'y mandatory'
      }}
    >
      <div style={{ pointerEvents: 'none', position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.7) 100%)', zIndex: -1 }} />

      {ITEMS.map((item, i) => (
        <div key={i} className={`gallery-item-wrapper ${i % 2 === 0 ? 'align-left' : 'align-right'}`}>
          <div
            className="content"
            style={{
              maxWidth: '480px',
              backgroundColor: item.bg,
              padding: '50px',
              borderRadius: '24px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
            }}
          >
            <p className="frame-text-label" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '16px', fontWeight: 800 }}>{item.label}</p>
            <h2 className="frame-text-heading" style={{ fontSize: 'clamp(1.8rem, 3.2vw, 2.8rem)', color: '#fff', marginBottom: '20px', lineHeight: 1.1, whiteSpace: 'pre-line' }}>
              {item.heading}
            </h2>
            <p className="frame-text-body" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', lineHeight: 1.7 }}>{item.body}</p>
          </div>
        </div>
      ))}
    </div>
    </div>
  )
}
