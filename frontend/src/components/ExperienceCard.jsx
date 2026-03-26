import React, { useState } from 'react'

const USER_TYPE_LABELS = {
  cs_student:   { label: 'CS Student',   color: 'badge-purple' },
  new_grad:     { label: 'New Grad',     color: 'badge-blue'   },
  professional: { label: 'Professional', color: 'badge-orange' },
}

const GOAL_LABELS = {
  get_coop:       'Co-op Hunt',
  get_job:        'Job Search',
  switch_job:     'Career Switch',
  improve_skills: 'Skill Growth',
  get_promotion:  'Promotion',
}

export default function ExperienceCard({ experience }) {
  const [expanded, setExpanded] = useState(false)

  const {
    title,
    user_type,
    goal,
    what_i_did,
    what_most_people_do,
    what_i_did_differently,
    what_i_regret,
    skills_involved = [],
    outcome,
    time_investment,
    upvotes = 0,
  } = experience

  const typeInfo = USER_TYPE_LABELS[user_type] || { label: user_type, color: 'badge-purple' }
  const goalLabel = GOAL_LABELS[goal] || goal

  return (
    <div className="card" style={{ cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            <span className={`badge ${typeInfo.color}`}>{typeInfo.label}</span>
            <span className="badge badge-yellow">{goalLabel}</span>
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {title}
          </h3>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 48 }}>
          <span style={{ fontSize: '1.1rem' }}>▲</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-light)' }}>{upvotes}</span>
        </div>
      </div>

      {/* Preview — always visible */}
      <div style={{
        background: 'rgba(108,58,255,0.08)',
        borderRadius: 'var(--radius-sm)',
        padding: '10px 14px',
        borderLeft: '3px solid var(--primary)',
        marginBottom: 12,
      }}>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-accent)', fontWeight: 600, marginBottom: 4 }}>What they did differently</p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {what_i_did_differently?.length > 120 && !expanded
            ? what_i_did_differently.slice(0, 120) + '…'
            : what_i_did_differently}
        </p>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, animation: 'fadeInUp 0.3s ease' }}>
          <InsightBlock color="#A0A0C0" label="What most people do" text={what_most_people_do} />
          <InsightBlock color="#34D399" label="Outcome" text={outcome} />
          <InsightBlock color="#FCD34D" label="Regret" text={what_i_regret} icon="⚠️" />

          {skills_involved?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {skills_involved.map(skill => (
                <span key={skill} style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 6,
                  padding: '3px 10px',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                }}>{skill}</span>
              ))}
            </div>
          )}

          {time_investment && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              ⏱ Time invested: <strong style={{ color: 'var(--text-secondary)' }}>{time_investment}</strong>
            </p>
          )}
        </div>
      )}

      <div style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right' }}>
        {expanded ? '▲ Show less' : '▼ Read more'}
      </div>
    </div>
  )
}

function InsightBlock({ label, text, color = 'var(--text-secondary)', icon }) {
  if (!text) return null
  return (
    <div style={{ borderRadius: 'var(--radius-sm)', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p style={{ fontSize: '0.78rem', fontWeight: 600, color, marginBottom: 4 }}>{icon} {label}</p>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{text}</p>
    </div>
  )
}
