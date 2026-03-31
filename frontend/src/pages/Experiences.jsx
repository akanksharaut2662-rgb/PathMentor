import React, { useEffect, useState, useCallback } from 'react'
import { getExperiences } from '../api/client.js'
import ExperienceCard from '../components/ExperienceCard.jsx'
import SubmitExperience from '../components/SubmitExperience.jsx'

const USER_TYPE_OPTIONS = [
  { value: '', label: 'All Roles' },
  { value: 'cs_student', label: 'CS Students' },
  { value: 'new_grad', label: 'New Grads' },
  { value: 'professional', label: 'Professionals' },
]

const GOAL_OPTIONS = [
  { value: '', label: 'All Goals' },
  { value: 'get_coop', label: 'Co-op Hunt' },
  { value: 'get_job', label: 'Job Search' },
  { value: 'switch_job', label: 'Career Switch' },
  { value: 'improve_skills', label: 'Skill Growth' },
  { value: 'get_promotion', label: 'Promotion' },
]

export default function Experiences() {
  const [experiences, setExperiences] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({ user_type: '', goal: '' })
  const [showSubmit, setShowSubmit] = useState(false)

  const fetchExperiences = useCallback(() => {
    setLoading(true)
    setError(null)
    getExperiences(filters)
      .then(data => setExperiences(data.experiences || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(() => {
    fetchExperiences()
  }, [fetchExperiences])

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }))

  return (
    <div style={{ padding: '60px 0 80px' }}>
      <div className="container">

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h1 style={{ marginBottom: 16 }}>
            Real <span className="gradient-text">Experiences</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 520, margin: '0 auto 32px', fontSize: '1rem' }}>
            Browse stories from CS students, new grads, and professionals who took different paths — and what they learned.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => setShowSubmit(!showSubmit)}
          >
            {showSubmit ? '✕ Close Form' : '+ Share Your Experience'}
          </button>
        </div>

        {/* Submit Form */}
        {showSubmit && (
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-xl)',
            padding: '32px',
            marginBottom: 48,
            animation: 'fadeInUp 0.3s ease',
          }}>
            <SubmitExperience onSuccess={() => {
              setShowSubmit(false)
              fetchExperiences()
            }} />
          </div>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Filter by:</span>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {USER_TYPE_OPTIONS.map(opt => (
              <FilterChip
                key={opt.value}
                label={opt.label}
                active={filters.user_type === opt.value}
                onClick={() => setFilter('user_type', opt.value)}
              />
            ))}
          </div>
          <div style={{ width: 1, height: 20, background: 'var(--border-subtle)' }} />
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {GOAL_OPTIONS.map(opt => (
              <FilterChip
                key={opt.value}
                label={opt.label}
                active={filters.goal === opt.value}
                onClick={() => setFilter('goal', opt.value)}
                color="orange"
              />
            ))}
          </div>
        </div>

        {/* Results */}
        {loading && (
          <div className="loading-center">
            <div className="spinner" />
            <p>Loading experiences…</p>
          </div>
        )}

        {error && (
          <div className="error-banner">
            Failed to load experiences: {error}
          </div>
        )}

        {!loading && !error && experiences.length === 0 && (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔍</div>
            <h3>No experiences found</h3>
            <p>Try adjusting your filters or be the first to share your story!</p>
          </div>
        )}

        {!loading && !error && experiences.length > 0 && (
          <>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              Showing {experiences.length} experience{experiences.length !== 1 ? 's' : ''} · sorted by community votes
            </p>
            <div className="grid-2">
              {experiences.map(exp => (
                <ExperienceCard key={exp.experience_id} experience={exp} />
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}

function FilterChip({ label, active, onClick, color = 'purple' }) {
  const colors = {
    purple: { bg: 'rgba(108,58,255,0.2)', border: 'rgba(108,58,255,0.4)', text: '#B794FF' },
    orange: { bg: 'rgba(255,107,53,0.2)', border: 'rgba(255,107,53,0.4)', text: '#FF8C5A' },
  }
  const c = colors[color]

  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 14px',
        borderRadius: 100,
        fontSize: '0.8rem',
        fontWeight: 600,
        cursor: 'pointer',
        border: `1px solid ${active ? c.border : 'rgba(255,255,255,0.08)'}`,
        background: active ? c.bg : 'transparent',
        color: active ? c.text : 'var(--text-muted)',
        transition: 'all 0.2s',
      }}
    >
      {label}
    </button>
  )
}