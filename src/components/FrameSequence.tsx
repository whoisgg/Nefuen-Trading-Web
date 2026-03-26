import { useRef } from 'react'
import { useTranslation } from '../i18n/LanguageContext'

const ITEMS = [
  { label: '01', key: '01', bg: '#1B5E20' },
  { label: '02', key: '02', bg: '#316838' },
  { label: '03', key: '03', bg: '#388E3C' },
  { label: '04', key: '04', bg: '#7CB342' },
  { label: '05', key: '05', bg: '#558B2F' },
]

export default function FrameSequence() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div className="gallery-fixed-title">
        <h2 style={{ fontSize: 'clamp(3rem, 5vw, 4.5rem)', color: 'var(--green-brand)', textTransform: 'uppercase', fontWeight: 800, lineHeight: 0.9 }}>
          {t('gallery.title')}
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
          scrollSnapType: 'none',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
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
                {t(`gallery.${item.key}.heading`)}
              </h2>
              <p className="frame-text-body" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1.05rem', lineHeight: 1.7 }}>
                {t(`gallery.${item.key}.body`)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
