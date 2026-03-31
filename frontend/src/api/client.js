// All API calls go through this client.
// The base URL is injected at build time via VITE_API_BASE_URL (set in .env).
// After Terraform runs, copy the api_gateway_url output into .env.

const BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`)
  }

  return data
}

// ── Experiences ───────────────────────────────────────────────────────────────

/**
 * Fetch community experiences.
 * @param {object} filters - { user_type, goal, limit }
 */
export async function getExperiences(filters = {}) {
  const params = new URLSearchParams()
  if (filters.user_type) params.set('user_type', filters.user_type)
  if (filters.goal) params.set('goal', filters.goal)
  if (filters.limit) params.set('limit', filters.limit)
  const qs = params.toString()
  return request(`/experiences${qs ? `?${qs}` : ''}`)
}

/**
 * Submit a new community experience.
 * @param {object} experience - experience payload
 */
export async function postExperience(experience) {
  return request('/experiences', {
    method: 'POST',
    body: JSON.stringify(experience),
  })
}

// ── Insights ──────────────────────────────────────────────────────────────────

/**
 * Get pattern analysis (common paths, differentiators, regrets, top skills).
 * @param {string} user_type
 * @param {string} goal
 */
export async function getInsights(user_type, goal) {
  return request(`/insights?user_type=${user_type}&goal=${goal}`)
}

// ── AI Plan ───────────────────────────────────────────────────────────────────

/**
 * Generate a personalized roadmap via Amazon Bedrock.
 * @param {object} userContext - { user_type, goal, current_role, skills, courses, time_availability, additional_context }
 */
export async function generatePlan(userContext) {
  return request('/generate-plan', {
    method: 'POST',
    body: JSON.stringify(userContext),
  })
}
