import { useState } from 'react'
import { Link } from 'react-router-dom'

interface ArrowCTAProps {
  label: string
  to: string
  variant?: 'dark' | 'light'
}

export default function ArrowCTA({ label, to, variant = 'dark' }: ArrowCTAProps) {
  const [isHovered, setIsHovered] = useState(false)
  const colorClass = variant === 'light' ? 'arrow-cta--light' : ''

  return (
    <Link
      to={to}
      className={`arrow-cta ${colorClass}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="arrow-cta__icon">
        <svg className="arrow-cta__brackets" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M1 8V1H8" className={isHovered ? 'bracket-active' : 'bracket-idle'} />
          <path d="M20 1H27V8" className={isHovered ? 'bracket-active' : 'bracket-idle'} />
          <path d="M1 20V27H8" className={isHovered ? 'bracket-active' : 'bracket-idle'} />
          <path d="M20 27H27V20" className={isHovered ? 'bracket-active' : 'bracket-idle'} />
        </svg>
        <span className="arrow-cta__swap">
          <svg
            className={`arrow-cta__svg ${isHovered ? 'arrow-out' : 'arrow-visible'}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
          <svg
            className={`arrow-cta__svg ${isHovered ? 'arrow-visible' : 'arrow-in'}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </span>
      </span>
      <span className={`arrow-cta__label ${isHovered ? 'label-shifted' : ''}`}>
        {label}
      </span>
    </Link>
  )
}
