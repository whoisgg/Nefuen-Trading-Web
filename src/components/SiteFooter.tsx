import { Link } from 'react-router-dom'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer__copyright">&copy; 2026 Nefuen Trading</p>
      <div className="site-footer__links">
        <Link to="/privacy">Privacy</Link>
        <span>&middot;</span>
        <Link to="/terms">Terms</Link>
        <span>&middot;</span>
        <Link to="/cookies">Cookies</Link>
      </div>
    </footer>
  )
}
