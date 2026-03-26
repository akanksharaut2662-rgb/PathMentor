import React from 'react'
import { Link } from 'react-router-dom'

const STATS = [
  { value: '20+', label: 'Real experiences' },
  { value: '3', label: 'Career stages' },
  { value: 'AI', label: 'Personalized plans' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: '🎯',
    title: 'Tell Us Where You Are',
    desc: 'Share your current role, skills, courses, and what you are trying to achieve.',
  },
  {
    step: '02',
    icon: '📊',
    title: 'See What Others Did',
    desc: 'We analyse real community experiences to show you common paths, differentiators, and regrets.',
  },
  {
    step: '03',
    icon: '🤖',
    title: 'Get Your AI Roadmap',
    desc: 'Amazon Bedrock generates a week-by-week personalized plan based on your exact situation.',
  },
]

const PILLARS = [
  { icon: '🔁', color: '#A0A0C0', title: 'Common Patterns', desc: 'What most people do — and why following the herd keeps you average.' },
  { icon: '⚡', color: '#B794FF', title: 'Differentiators', desc: 'What actually helped people stand out, ranked by community impact.' },
  { icon: '💡', color: '#FCD34D', title: 'Regret Learning', desc: 'What people wish they had done earlier — so you can skip the hard lessons.' },
  { icon: '🗺️', color: '#FF8C5A', title: 'Personalized Plan', desc: 'A realistic, time-based roadmap built for your exact context.' },
]

export default function Home() {
  return (
    <div>
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <section style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        background: 'var(--gradient-hero)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative orbs */}
        <div className="glow-orb glow-orb-purple" style={{ top: '10%', left: '-10%' }} />
        <div className="glow-orb glow-orb-orange" style={{ bottom: '10%', right: '-5%' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(108,58,255,0.15)', border: '1px solid rgba(108,58,255,0.3)', borderRadius: 100, padding: '6px 16px', marginBottom: 32, fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-accent)' }}>
            <span>✨</span> Powered by Amazon Bedrock AI
          </div>

          <h1 style={{ marginBottom: 24, maxWidth: 800, margin: '0 auto 24px' }}>
            Stop Following The{' '}
            <span className="gradient-text">Generic Path.</span>
          </h1>

          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)', maxWidth: 580, margin: '0 auto 40px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            PathMentor combines real experiences from people like you with AI-powered insights — to help you discover exactly what to do differently.
          </p>

          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}>
            <Link to="/start" className="btn btn-primary btn-lg">
              Get My Personalized Roadmap →
            </Link>
            <Link to="/experiences" className="btn btn-secondary btn-lg">
              Browse Experiences
            </Link>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 48, justifyContent: 'center', flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{s.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4 Pillars ──────────────────────────────────────────────────────── */}
      <section className="section" style={{ background: 'var(--bg-card)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2>Everything You Need to<br /><span className="gradient-text">Actually Stand Out</span></h2>
            <p style={{ marginTop: 16, maxWidth: 520, margin: '16px auto 0', fontSize: '1.05rem' }}>
              Not generic advice. Real patterns from real people, processed by AI.
            </p>
          </div>
          <div className="grid-2">
            {PILLARS.map(p => (
              <div key={p.title} className="card" style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${p.color}22`,
                  border: `1px solid ${p.color}44`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.4rem', flexShrink: 0,
                }}>
                  {p.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', marginBottom: 8, color: p.color }}>{p.title}</h3>
                  <p style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2>How It Works</h2>
            <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Three steps from generic to differentiated</p>
          </div>
          <div className="grid-3">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="card" style={{ textAlign: 'center', position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: -12, left: 20,
                  fontWeight: 900, fontSize: '3rem', color: 'rgba(108,58,255,0.12)',
                  lineHeight: 1, fontFamily: 'monospace',
                }}>
                  {step.step}
                </div>
                <div style={{ fontSize: '2.5rem', marginBottom: 16, marginTop: 16 }}>{step.icon}</div>
                <h3 style={{ fontSize: '1rem', marginBottom: 10, color: 'var(--text-primary)' }}>{step.title}</h3>
                <p style={{ fontSize: '0.875rem', lineHeight: 1.7 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ──────────────────────────────────────────────────────── */}
      <section className="section-sm">
        <div className="container">
          <div style={{
            background: 'var(--gradient-primary)',
            borderRadius: 'var(--radius-xl)',
            padding: 'clamp(40px, 6vw, 64px)',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -40, left: -40, width: 160, height: 160, background: 'rgba(0,0,0,0.1)', borderRadius: '50%' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ color: '#fff', marginBottom: 16 }}>Ready to discover your edge?</h2>
              <p style={{ color: 'rgba(255,255,255,0.8)', marginBottom: 32, fontSize: '1.05rem', maxWidth: 500, margin: '0 auto 32px' }}>
                Answer a few questions and get a personalized AI roadmap in under a minute.
              </p>
              <Link to="/start" className="btn" style={{ background: '#fff', color: 'var(--primary-dark)', padding: '16px 40px', fontSize: '1rem', borderRadius: 'var(--radius-lg)', fontWeight: 700 }}>
                Start for Free →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}