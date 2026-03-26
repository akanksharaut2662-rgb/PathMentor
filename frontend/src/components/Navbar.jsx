import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [location.pathname])

  const links = [
    { to: '/experiences', label: 'Experiences' },
    { to: '/insights', label: 'Insights' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      height: '72px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 24px',
      background: scrolled ? 'rgba(10,10,15,0.95)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : 'none',
      transition: 'all 0.3s ease',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #6C3AFF, #FF6B35)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem', fontWeight: 900, color: '#fff',
          }}>P</div>
          <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#F8F8FF', letterSpacing: '-0.02em' }}>
            Path<span style={{ color: '#B794FF' }}>Mentor</span>
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {links.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: '0.9rem',
                fontWeight: 600,
                color: isActive(link.to) ? '#B794FF' : '#A0A0C0',
                background: isActive(link.to) ? 'rgba(108,58,255,0.12)' : 'transparent',
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="hide-mobile">
          <Link to="/start" className="btn btn-primary" style={{ padding: '10px 22px', fontSize: '0.9rem' }}>
            Get My Roadmap →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="btn btn-ghost"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{ display: 'none', padding: '8px' }}
          aria-label="Toggle menu"
        >
          <div style={{ width: 22, display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={{ height: 2, background: '#F8F8FF', borderRadius: 2, transition: 'all 0.2s', transform: menuOpen ? 'rotate(45deg) translateY(7px)' : 'none' }} />
            <span style={{ height: 2, background: '#F8F8FF', borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: 'all 0.2s' }} />
            <span style={{ height: 2, background: '#F8F8FF', borderRadius: 2, transition: 'all 0.2s', transform: menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none' }} />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          position: 'absolute',
          top: '72px', left: 0, right: 0,
          background: 'rgba(10,10,15,0.98)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 24px 24px',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          {links.map(link => (
            <Link key={link.to} to={link.to} className="btn btn-ghost" style={{ justifyContent: 'flex-start' }}>
              {link.label}
            </Link>
          ))}
          <Link to="/start" className="btn btn-primary" style={{ marginTop: 8 }}>
            Get My Roadmap →
          </Link>
        </div>
      )}
    </nav>
  )
}
