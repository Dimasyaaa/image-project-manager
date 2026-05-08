import { Link, useLocation } from 'react-router-dom'

export default function Header() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <header className="site-header">
      <div className="container header-content">
        <div className="logo">
          <div className="logo-text">
            <h1>AREAL- Тестовое задание</h1>
          </div>
        </div>
        
        <nav className="header-nav">
          <Link to="/" className={isHome ? 'nav-link active' : 'nav-link'}>
            Главная
          </Link>
        </nav>
      </div>
    </header>
  )
}