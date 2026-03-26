import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  { id: 'role', title: 'Who are you?', icon: '👤' },
  { id: 'goal', title: 'What are you trying to achieve?', icon: '🎯' },
  { id: 'context', title: 'Tell us about your situation', icon: '📋' },
]

const USER_TYPES = [
  { value: 'cs_student',   label: 'CS Student',    desc: 'Currently enrolled in university',  icon: '🎓' },
  { value: 'new_grad',     label: 'New Graduate',  desc: 'Graduated within the last 2 years', icon: '🚀' },
  { value: 'professional', label: 'Professional',  desc: '2+ years of work experience',       icon: '💼' },
]

const GOALS = {
  cs_student:   [
    { value: 'get_coop',       label: 'Land a Co-op / Internship', icon: '🤝' },
    { value: 'improve_skills', label: 'Improve My Skills',         icon: '📈' },
    { value: 'get_job',        label: 'Get My First Job',          icon: '💼' },
  ],
  new_grad: [
    { value: 'get_job',        label: 'Get a Job',                 icon: '💼' },
    { value: 'switch_job',     label: 'Switch to a Better Role',   icon: '🔄' },
    { value: 'improve_skills', label: 'Improve My Skills',         icon: '📈' },
  ],
  professional: [
    { value: 'switch_job',     label: 'Switch Jobs / Companies',   icon: '🔄' },
    { value: 'get_promotion',  label: 'Get Promoted',              icon: '⬆️'  },
    { value: 'improve_skills', label: 'Stay Relevant & Upskill',   icon: '📈' },
  ],
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    user_type: '',
    goal: '',
    current_role: '',
    courses: '',
    skills: '',
    time_availability: '',
    additional_context: '',
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const goNext = () => {
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else handleSubmit()
  }

  const goBack = () => setStep(s => s - 1)

  const handleSubmit = () => {
    const payload = {
      ...form,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      courses: form.courses.split(',').map(s => s.trim()).filter(Boolean),
    }
    // Store in sessionStorage so Insights and Roadmap pages can read it
    sessionStorage.setItem('pathmentor_user_context', JSON.stringify(payload))
    navigate('/insights')
  }

  const canProceed = () => {
    if (step === 0) return !!form.user_type
    if (step === 1) return !!form.goal
    if (step === 2) return !!form.current_role && !!form.time_availability
    return false
  }

  const availableGoals = GOALS[form.user_type] || []

  return (
    <div style={{ minHeight: '90vh', display: 'flex', alignItems: 'center', padding: '40px 0', position: 'relative', overflow: 'hidden' }}>
      <div className="glow-orb glow-orb-purple" style={{ top: '0%', right: '-15%' }} />

      <div className="container-sm" style={{ position: 'relative', zIndex: 1, width: '100%' }}>

        {/* Progress */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {STEPS.map((s, i) => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: i <= step ? 'var(--primary)' : 'rgba(255,255,255,0.08)',
                transition: 'background 0.4s ease',
              }} />
            ))}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Step {step + 1} of {STEPS.length}
          </p>
        </div>

        {/* Step Header */}
        <div style={{ marginBottom: 36, animation: 'fadeInUp 0.4s ease' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>{STEPS[step].icon}</div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', marginBottom: 8 }}>{STEPS[step].title}</h2>
        </div>

        {/* ── Step 0: User Type ── */}
        {step === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {USER_TYPES.map(type => (
              <SelectCard
                key={type.value}
                selected={form.user_type === type.value}
                onClick={() => set('user_type', type.value)}
                icon={type.icon}
                label={type.label}
                desc={type.desc}
              />
            ))}
          </div>
        )}

        {/* ── Step 1: Goal ── */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {availableGoals.map(goal => (
              <SelectCard
                key={goal.value}
                selected={form.goal === goal.value}
                onClick={() => set('goal', goal.value)}
                icon={goal.icon}
                label={goal.label}
              />
            ))}
          </div>
        )}

        {/* ── Step 2: Context ── */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label>Current role / situation *</label>
              <input
                type="text"
                value={form.current_role}
                onChange={e => set('current_role', e.target.value)}
                placeholder={
                  form.user_type === 'cs_student' ? 'e.g. 3rd year CS student at Dalhousie' :
                  form.user_type === 'new_grad'   ? 'e.g. Junior Frontend Dev at a startup' :
                  'e.g. Senior Backend Engineer with 5 years experience'
                }
                required
              />
            </div>

            {form.user_type === 'cs_student' && (
              <div className="form-group">
                <label>Current courses</label>
                <input
                  type="text"
                  value={form.courses}
                  onChange={e => set('courses', e.target.value)}
                  placeholder="e.g. Data Structures, Cloud Computing, OS (comma-separated)"
                />
              </div>
            )}

            <div className="form-group">
              <label>Current skills</label>
              <input
                type="text"
                value={form.skills}
                onChange={e => set('skills', e.target.value)}
                placeholder="e.g. Python, React, SQL, Docker (comma-separated)"
              />
            </div>

            <div className="form-group">
              <label>Weekly time available for growth *</label>
              <select value={form.time_availability} onChange={e => set('time_availability', e.target.value)} required>
                <option value="">Select availability...</option>
                <option value="1-3 hours per week">1–3 hours/week (very limited)</option>
                <option value="4-8 hours per week">4–8 hours/week (moderate)</option>
                <option value="8-15 hours per week">8–15 hours/week (dedicated)</option>
                <option value="15+ hours per week">15+ hours/week (all-in)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Anything else we should know?</label>
              <textarea
                value={form.additional_context}
                onChange={e => set('additional_context', e.target.value)}
                placeholder="e.g. Graduating in 4 months, no internship experience yet, interested in ML..."
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 40 }}>
          <button
            className="btn btn-ghost"
            onClick={goBack}
            disabled={step === 0}
            style={{ visibility: step === 0 ? 'hidden' : 'visible' }}
          >
            ← Back
          </button>
          <button
            className="btn btn-primary btn-lg"
            onClick={goNext}
            disabled={!canProceed()}
          >
            {step === STEPS.length - 1 ? 'See My Insights →' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SelectCard({ selected, onClick, icon, label, desc }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '18px 20px',
        borderRadius: 'var(--radius-md)',
        border: `1.5px solid ${selected ? 'var(--primary)' : 'rgba(255,255,255,0.06)'}`,
        background: selected ? 'rgba(108,58,255,0.15)' : 'rgba(255,255,255,0.02)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        textAlign: 'left',
        width: '100%',
        boxShadow: selected ? 'var(--shadow-md)' : 'none',
      }}
    >
      <span style={{ fontSize: '1.8rem', flexShrink: 0 }}>{icon}</span>
      <div>
        <p style={{ fontWeight: 700, color: selected ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '1rem', marginBottom: desc ? 4 : 0 }}>{label}</p>
        {desc && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{desc}</p>}
      </div>
      {selected && (
        <div style={{
          marginLeft: 'auto',
          width: 24, height: 24, borderRadius: '50%',
          background: 'var(--primary)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
        }}>✓</div>
      )}
    </button>
  )
}