import React from 'react'

export default function InsightPanel({ insights }) {
  if (!insights) return null

  const {
    common_patterns = [],
    differentiators = [],
    regrets = [],
    top_skills = [],
    experience_count = 0,
  } = insights

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* Stats Bar */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(108,58,255,0.15), rgba(255,107,53,0.1))',
        border: '1px solid rgba(108,58,255,0.25)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 28px',
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <span style={{ fontSize: '2rem' }}>📊</span>
        <div>
          <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.1rem' }}>
            Based on {experience_count} real experience{experience_count !== 1 ? 's' : ''}
          </p>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: 2 }}>
            Here's what the data shows for your profile
          </p>
        </div>
      </div>

      {/* Common Patterns */}
      {common_patterns.length > 0 && (
        <Section
          icon="🔁"
          title="What Most People Do"
          subtitle="The common path — following this won't make you stand out"
          color="rgba(160,160,192,0.1)"
          borderColor="rgba(160,160,192,0.3)"
          items={common_patterns}
          textKey="text"
          sourceKey="source_title"
          labelColor="var(--text-muted)"
        />
      )}

      {/* Differentiators */}
      {differentiators.length > 0 && (
        <Section
          icon="⚡"
          title="What Actually Differentiates People"
          subtitle="Real strategies that helped others stand out — ranked by community votes"
          color="rgba(108,58,255,0.08)"
          borderColor="var(--primary)"
          items={differentiators}
          textKey="text"
          sourceKey="source_title"
          labelColor="var(--text-accent)"
          showUpvotes
        />
      )}

      {/* Regrets */}
      {regrets.length > 0 && (
        <Section
          icon="💡"
          title="What People Wish They'd Done Earlier"
          subtitle="Learn from others' regrets before it's too late"
          color="rgba(245,158,11,0.08)"
          borderColor="rgba(245,158,11,0.4)"
          items={regrets}
          textKey="text"
          sourceKey="source_title"
          labelColor="#FCD34D"
        />
      )}

      {/* Top Skills */}
      {top_skills.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 6, color: 'var(--text-primary)' }}>
            🛠 Most Valuable Skills for This Path
          </h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            Skills mentioned most across all matching experiences
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {top_skills.map(({ skill, count }, i) => (
              <div key={skill} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: i < 3 ? 'rgba(108,58,255,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${i < 3 ? 'rgba(108,58,255,0.35)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8,
                padding: '8px 14px',
              }}>
                <span style={{ fontWeight: 600, color: i < 3 ? '#B794FF' : 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {skill}
                </span>
                <span style={{
                  background: i < 3 ? 'rgba(108,58,255,0.3)' : 'rgba(255,255,255,0.08)',
                  color: i < 3 ? '#B794FF' : 'var(--text-muted)',
                  borderRadius: 100,
                  padding: '1px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                }}>
                  ×{count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ icon, title, subtitle, color, borderColor, items, textKey, sourceKey, labelColor, showUpvotes }) {
  return (
    <div>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 4, color: 'var(--text-primary)' }}>
        {icon} {title}
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 16 }}>{subtitle}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, i) => (
          <div key={i} style={{
            background: color,
            border: `1px solid ${borderColor}`,
            borderRadius: 'var(--radius-md)',
            padding: '14px 18px',
          }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 8 }}>
              {item[textKey]}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '0.75rem', color: labelColor, fontWeight: 600 }}>
                From: {item[sourceKey]}
              </p>
              {showUpvotes && item.upvotes > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--primary-light)', fontWeight: 700 }}>
                  ▲ {item.upvotes}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
