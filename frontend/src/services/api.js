import { supabase } from './supabase'

const API_BASE_URL = '/api'

const apiCall = async (endpoint, options = {}) => {
  const headers = {}
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }
  } catch (err) {
    console.error('Error attaching auth header:', err)
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      ...headers,
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || 'API request failed')
  }

  return response.json()
}

export const api = {
  // Auth
  login: (email, password) =>
    apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  forgotPassword: (email) =>
    apiCall('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token, newPassword) =>
    apiCall('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    }),

  // Users
  getUser: (userId) => apiCall(`/users/${userId}`),
  
  listUsers: (role = null, status = null) => {
    let query = '/users'
    const params = new URLSearchParams()
    if (role) params.append('role', role)
    if (status) params.append('status', status)
    if (params.toString()) query += `?${params.toString()}`
    return apiCall(query)
  },

  createUser: (userData) =>
    apiCall('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  updateUser: (userId, userData) =>
    apiCall(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  deactivateUser: (userId) =>
    apiCall(`/users/${userId}/deactivate`, {
      method: 'PATCH',
    }),

  archiveUser: (userId) =>
    apiCall(`/users/${userId}/archive`, {
      method: 'PATCH',
    }),

  promoteUser: (userId, newRole) =>
    apiCall(`/users/${userId}/promote`, {
      method: 'PATCH',
      body: JSON.stringify({ newRole }),
    }),

  revertUser: (userId) =>
    apiCall(`/users/${userId}/revert`, {
      method: 'POST',
    }),
  // Activities
  createActivity: (activityData) =>
    apiCall('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    }),

  getActivity: (activityId) => apiCall(`/activities/${activityId}`),

  getActivityFiles: (activityId) => apiCall(`/activities/${activityId}/files`),

  createActivityFile: (activityId, fileData) =>
    apiCall(`/activities/${activityId}/files`, {
      method: 'POST',
      body: JSON.stringify(fileData),
    }),

  deleteActivityFile: (fileId) =>
    apiCall(`/activities/files/${fileId}`, {
      method: 'DELETE',
    }),

  deleteStorageFile: (activityId, fileUrl) =>
    apiCall(`/activities/${activityId}/storage`, {
      method: 'DELETE',
      body: JSON.stringify({ fileUrl }),
    }),

  listActivities: (userId = null, status = null) => {
    let query = '/activities'
    const params = new URLSearchParams()
    if (userId) params.append('userId', userId)
    if (status) params.append('status', status)
    if (params.toString()) query += `?${params.toString()}`
    return apiCall(query)
  },

  updateActivity: (activityId, activityData) =>
    apiCall(`/activities/${activityId}`, {
      method: 'PUT',
      body: JSON.stringify(activityData),
    }),

  deleteActivity: (activityId) =>
    apiCall(`/activities/${activityId}`, {
      method: 'DELETE',
    }),

  updateActivityStatus: (activityId, status) =>
    apiCall(`/activities/${activityId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  uploadFile: (activityId, file) => {
    const formData = new FormData()
    formData.append('file', file)
    return apiCall(`/activities/${activityId}/upload`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    })
  },

  // Evaluations
  createEvaluation: (evaluationData) =>
    apiCall('/evaluations', {
      method: 'POST',
      body: JSON.stringify(evaluationData),
    }),

  getEvaluations: (candidateId) => apiCall(`/evaluations?candidateId=${candidateId}`),


  // Promotions
  getPromotions: () => apiCall('/promotions'),

  // Leaderboards
  getLeaderboard: (role) => apiCall(`/leaderboards/${role}`),

  // Reports
  getTopMembers: (role, limit = 10) =>
    apiCall(`/reports/top-members?role=${role}&limit=${limit}`),

  getMonthlyReport: (year, month) =>
    apiCall(`/reports/monthly?year=${year}&month=${month}`),

  getPromotionReport: () => apiCall('/reports/promotions'),

  exportReport: (type, format = 'pdf') =>
    apiCall(`/reports/export?type=${type}&format=${format}`),
}
