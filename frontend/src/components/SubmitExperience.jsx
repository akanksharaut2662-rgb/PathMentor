import React, { useState } from 'react'
import { postExperience } from '../api/client.js'

const INITIAL = {
  user_type: '',
  goal: '',
  title: '',
  what_i_did: '',
  what_most_people_do: '',
  what_i_did_differently: '',
  what_i_regret: '',
  skills_involved: '',
  time_investment: '',
  outcome: '',
}

export default function SubmitExperience({ onSuccess }) {
  const [form, setForm] = useState(INITIAL)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        ...form,
        skills_involved: form.skills_involved
          ? form.skills_involved.split(',').map(s => s.trim()).filter(Boolean)
          : [],
        tags: [form.user_type, form.goal].filter(Boolean),
      }

      await postExperience(payload)
      setSuccess(true)
      setForm(INITIAL)
      if (onSuccess) onSuccess()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 8 }}>Experience Submitted!</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
          Thank you for helping others learn from your journey.
        </p>
        <button className="btn btn-secondary" onClick={() => setSuccess(false)}>
          Submit Another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.2rem' }}>Share Your Experience</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Help others learn from your path. Be specific — vague advice helps nobody.
        </p>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="grid-2">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>I am a *</label>
          <select value={form.user_type} onChange={set('user_type')} required>
            <option value="">Select role...</option>
            <option value="cs_student">CS Student</option>
            <option value="new_grad">New Graduate</option>
            <option value="professional">Professional</option>
          </select>
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>My goal was *</label>
          <select value={form.goal} onChange={set('goal')} required>
            <option value="">Select goal...</option>
            <option value="get_coop">Get a Co-op</option>
            <option value="get_job">Get a Job</option>
            <option value="switch_job">Switch Jobs</option>
            <option value="improve_skills">Improve Skills</option>
            <option value="get_promotion">Get Promoted</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>Title of your story *</label>
        <input
          type="text"
          value={form.title}
          onChange={set('title')}
          placeholder="e.g. How I landed a co-op without a 4.0 GPA"
          required
          maxLength={120}
        />
      </div>

      <div className="form-group">
        <label>What did you do? *</label>
        <textarea
          value={form.what_i_did}
          onChange={set('what_i_did')}
          placeholder="Describe your starting point and what you did..."
          required
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>What do most people do? *</label>
        <textarea
          value={form.what_most_people_do}
          onChange={set('what_most_people_do')}
          placeholder="What's the typical, generic approach most people take?"
          required
          rows={3}
        />
      </div>

      <div className="form-group" style={{ position: 'relative' }}>
        <label style={{ color: 'var(--text-accent)' }}>⚡ What did YOU do differently? *</label>
        <textarea
          value={form.what_i_did_differently}
          onChange={set('what_i_did_differently')}
          placeholder="This is the most valuable part — be specific and honest"
          required
          rows={4}
          style={{ borderColor: 'rgba(108,58,255,0.3)' }}
        />
      </div>

      <div className="form-group">
        <label style={{ color: '#FCD34D' }}>💡 What do you regret or wish you'd done earlier?  *</label>
        <textarea
          value={form.what_i_regret}
          onChange={set('what_i_regret')}
          placeholder="Be honest — this helps others avoid your mistakes"
          required
          rows={3}
        />
      </div>

      <div className="grid-2">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Skills involved</label>
          <input
            type="text"
            value={form.skills_involved}
            onChange={set('skills_involved')}
            placeholder="React, AWS, Python (comma-separated)"
          />
        </div>

        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Time investment</label>
          <input
            type="text"
            value={form.time_investment}
            onChange={set('time_investment')}
            placeholder="e.g. 3 months, 2 hrs/day"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Outcome</label>
        <input
          type="text"
          value={form.outcome}
          onChange={set('outcome')}
          placeholder="What happened as a result?"
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={loading}
        style={{ alignSelf: 'flex-start' }}
      >
        {loading ? 'Submitting…' : 'Submit Experience →'}
      </button>
    </form>
  )
}
