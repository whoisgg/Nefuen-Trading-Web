import { Link } from 'react-router-dom'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <p className="site-footer__copyright">&copy; Nefuen Trading</p>
      <div className="site-footer__links">
        <Link to="/privacy">Privacy</Link>
        <span>&middot;</span>
        <Link to="/terms">Terms</Link>
        <span>&middot;</span>
        <Link to="/cookies">Cookies</Link>
      </div>
      <div className="site-footer__links-mobile">
        <Link to="/terms">Legal</Link>
      </div>
    </footer>
  )
}
