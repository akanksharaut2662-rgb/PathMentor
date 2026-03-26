import React, { useState } from 'react'

const EFFORT_COLOR = { Low: '#34D399', Medium: '#FCD34D', High: '#FF8C5A' }
const IMPACT_COLOR = { Low: '#A0A0C0', Medium: '#60A5FA', High: '#B794FF' }

export default function RoadmapCard({ roadmap, userProfile }) {
  const [activeTab, setActiveTab] = useState('plan')

  if (!roadmap) return null

  const {
    summary,
    common_path_warning,
    unique_strategies = [],
    week_by_week_plan = [],
    regret_avoidance_tips = [],
    differentiator_score,
  } = roadmap

  const tabs = [
    { id: 'plan', label: '📅 Week-by-Week Plan' },
    { id: 'strategies', label: '⚡ Unique Strategies' },
    { id: 'regrets', label: '💡 Avoid These Regrets' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(108,58,255,0.2), rgba(255,107,53,0.1))',
        border: '1px solid rgba(108,58,255,0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-light)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Your Personalized Roadmap
            </p>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{summary}</p>
          </div>

          {/* Differentiator Score */}
          {differentiator_score && (
            <div style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(108,58,255,0.3)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
              textAlign: 'center',
              minWidth: 120,
            }}>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>DIFFERENTIATOR SCORE</p>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 4 }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#B794FF' }}>
                  {differentiator_score.current}
                </span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>→</span>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#FF6B35' }}>
                  {differentiator_score.potential}
                </span>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>now → potential /10</p>
              {differentiator_score.explanation && (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.5 }}>
                  {differentiator_score.explanation}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Warning: Common Path */}
      {common_path_warning && (
        <div style={{
          background: 'rgba(239,68,68,0.08)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 18px',
          display: 'flex', gap: 12, alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>⚠️</span>
          <div>
            <p style={{ fontWeight: 700, color: '#FCA5A5', fontSize: '0.85rem', marginBottom: 4 }}>Common Path Warning</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{common_path_warning}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: 4 }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="btn"
            style={{
              flex: 1,
              padding: '10px 8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)',
              justifyContent: 'center',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'plan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {week_by_week_plan.map((week, i) => (
            <div key={i} style={{
              display: 'flex', gap: 16, alignItems: 'flex-start',
            }}>
              {/* Timeline dot */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `linear-gradient(135deg, #6C3AFF, #FF6B35)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: '0.75rem', color: '#fff',
                }}>
                  {i + 1}
                </div>
                {i < week_by_week_plan.length - 1 && (
                  <div style={{ width: 2, flex: 1, minHeight: 20, background: 'rgba(108,58,255,0.25)', marginTop: 4 }} />
                )}
              </div>
              <div className="card" style={{ flex: 1, padding: '16px 20px', marginBottom: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary-light)', fontSize: '0.85rem' }}>{week.week_range}</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{week.focus}</span>
                </div>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 0, listStyle: 'none' }}>
                  {week.actions?.map((action, j) => (
                    <li key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      <span style={{ color: 'var(--success)', flexShrink: 0, marginTop: 1 }}>✓</span>
                      {action}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'strategies' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {unique_strategies.map((s, i) => (
            <div key={i} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <h4 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{s.title}</h4>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${EFFORT_COLOR[s.effort]}22`, color: EFFORT_COLOR[s.effort] || '#A0A0C0' }}>
                    {s.effort} effort
                  </span>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${IMPACT_COLOR[s.impact]}22`, color: IMPACT_COLOR[s.impact] || '#A0A0C0' }}>
                    {s.impact} impact
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>{s.description}</p>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(108,58,255,0.12)', border: '1px solid rgba(108,58,255,0.25)',
                borderRadius: 6, padding: '4px 10px',
                fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary-light)',
              }}>
                🕐 Start: {s.time_to_start}
              </span>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'regrets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {regret_avoidance_tips.map((tip, i) => (
            <div key={i} style={{
              background: 'rgba(245,158,11,0.08)',
              border: '1px solid rgba(245,158,11,0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              display: 'flex', gap: 12, alignItems: 'flex-start',
            }}>
              <span style={{ fontWeight: 800, color: '#FCD34D', flexShrink: 0, fontSize: '1rem' }}>{i + 1}.</span>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tip}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
