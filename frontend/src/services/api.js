
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000'

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const validationErrors = data?.errors
      ? Object.values(data.errors).flat().join(' ')
      : ''

    throw new Error(
      data?.message ||
      data?.error ||
      validationErrors ||
      'Something went wrong. Please try again.'
    )
  }

  return data
}

export const getSkills = () => apiRequest('/api/skills')

export const createSkill = (skill) =>
  apiRequest('/api/skills', {
    method: 'POST',
    body: JSON.stringify(skill)
  })

export const updateSkill = (id, skill) =>
  apiRequest(`/api/skills/${id}`, {
    method: 'PUT',
    body: JSON.stringify(skill)
  })

export const deleteSkill = (id) =>
  apiRequest(`/api/skills/${id}`, {
    method: 'DELETE'
  })

export const getCareers = () => apiRequest('/api/careers')

export const createCareer = (career) =>
  apiRequest('/api/careers', {
    method: 'POST',
    body: JSON.stringify(career)
  })

export const updateCareer = (id, career) =>
  apiRequest(`/api/careers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(career)
  })

export const deleteCareer = (id) =>
  apiRequest(`/api/careers/${id}`, {
    method: 'DELETE'
  })
