import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getInsights } from '../api/client.js'
import InsightPanel from '../components/InsightPanel.jsx'

const GOAL_LABELS = {
  get_coop:       'Getting a Co-op',
  get_job:        'Getting a Job',
  switch_job:     'Switching Jobs',
  improve_skills: 'Improving Skills',
  get_promotion:  'Getting Promoted',
}

const USER_TYPE_LABELS = {
  cs_student:   'CS Student',
  new_grad:     'New Graduate',
  professional: 'Professional',
}

export default function Insights() {
  const navigate = useNavigate()
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userContext, setUserContext] = useState(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('pathmentor_user_context')
    if (!stored) {
      navigate('/start')
      return
    }

    const ctx = JSON.parse(stored)
    setUserContext(ctx)

    getInsights(ctx.user_type, ctx.goal)
      .then(data => setInsights(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [navigate])

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <p>Analyzing community experiences for your profile…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-sm" style={{ paddingTop: 60 }}>
        <div className="error-banner">Failed to load insights: {error}</div>
        <button className="btn btn-secondary" onClick={() => navigate('/start')}>← Start Over</button>
      </div>
    )
  }

  return (
    <div style={{ padding: '60px 0 80px' }}>
      <div className="container-sm">

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <Link to="/start" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
            ← Back
          </Link>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {userContext && (
              <>
                <span className="badge badge-purple">{USER_TYPE_LABELS[userContext.user_type]}</span>
                <span className="badge badge-orange">{GOAL_LABELS[userContext.goal]}</span>
              </>
            )}
          </div>

          <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', marginBottom: 12 }}>
            What the Data Says About <span className="gradient-text">Your Path</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>
            Here's what we found from real people in your situation — what works, what most people get wrong, and what they regret.
          </p>
        </div>

        {/* Insight Panel */}
        <InsightPanel insights={insights} />

        {/* CTA: Get AI Plan */}
        <div style={{
          marginTop: 56,
          background: 'linear-gradient(135deg, rgba(108,58,255,0.2), rgba(255,107,53,0.1))',
          border: '1px solid rgba(108,58,255,0.3)',
          borderRadius: 'var(--radius-xl)',
          padding: '32px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>🤖</div>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>
            Want a personalized week-by-week plan?
          </h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: '0.95rem' }}>
            Amazon Bedrock AI will combine these insights with your specific situation to generate a custom roadmap just for you.
          </p>
          <button
            className="btn btn-primary btn-lg"
            onClick={() => navigate('/roadmap')}
          >
            Generate My AI Roadmap →
          </button>
        </div>

      </div>
    </div>
  )
}