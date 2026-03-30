import { useState, useEffect, useRef } from 'react'
import Navbar from '../components/Navbar'
import { useTranslation } from '../i18n/LanguageContext'
import gsap from 'gsap'

type FormStatus = 'idle' | 'sending' | 'success' | 'error'

export default function Contact() {
  const { t } = useTranslation()
  const [status, setStatus] = useState<FormStatus>('idle')
  const [form, setForm] = useState({ name: '', email: '', company: '', message: '' })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.contact-image', { opacity: 0, x: -40, duration: 1, delay: 0.2, ease: 'power3.out' })
      gsap.from('.contact-panel', { opacity: 0, x: 40, duration: 1, delay: 0.3, ease: 'power3.out' })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Failed')
      setStatus('success')
      setForm({ name: '', email: '', company: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="page-container contact-page" ref={containerRef}>
      <Navbar />

      <div className="contact-layout">
        {/* Left: Image */}
        <div className="contact-image">
          <img
            src="/DSC03940.webp"
            alt="Hazelnut orchard"
          />
        </div>

        {/* Right: Form panel */}
        <div className="contact-panel">
          <div className="contact-panel__content">
            {/* Header */}
            <span className="contact-panel__label">{t('contact.label')}</span>
            <h1 className="contact-panel__title">{t('contact.subtitle')}</h1>
            <p className="contact-panel__subtitle">{t('contact.body')}</p>

            {/* Quick contact info */}
            <div className="contact-panel__info">
              <a href={`mailto:${t('contact.email')}`} className="contact-panel__info-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                {t('contact.email')}
              </a>
              <span className="contact-panel__info-item">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {t('contact.address')}
              </span>
            </div>

            {/* Divider */}
            <div className="contact-panel__divider" />

            {/* Form */}
            {status === 'success' ? (
              <div className="contact-panel__success">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--green-brand)" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <p className="contact-panel__success-title">{t('contact.form.success')}</p>
                <p className="contact-panel__success-text">{t('contact.form.successDetail')}</p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="contact-panel__btn contact-panel__btn--secondary"
                >
                  {t('contact.form.sendAnother')}
                </button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="contact-form__row">
                  <div className="contact-form__field">
                    <label className="contact-form__field-label" htmlFor="name">{t('contact.form.name')} *</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      className="contact-form__input"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="contact-form__field">
                    <label className="contact-form__field-label" htmlFor="email">{t('contact.form.email')} *</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      className="contact-form__input"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="contact-form__field">
                  <label className="contact-form__field-label" htmlFor="company">{t('contact.form.company')}</label>
                  <input
                    id="company"
                    type="text"
                    name="company"
                    className="contact-form__input"
                    value={form.company}
                    onChange={handleChange}
                  />
                </div>

                <div className="contact-form__field">
                  <label className="contact-form__field-label" htmlFor="message">{t('contact.form.message')} *</label>
                  <textarea
                    id="message"
                    name="message"
                    className="contact-form__input contact-form__textarea"
                    value={form.message}
                    onChange={handleChange}
                    required
                  />
                </div>

                {status === 'error' && (
                  <p className="contact-form__error">{t('contact.form.error')}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="contact-panel__btn"
                >
                  {status === 'sending' ? t('contact.form.sending') : t('contact.form.submit')}
                </button>
              </form>
            )}

            <p className="contact-panel__recipients">{t('contact.form.recipients')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
