import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.API_URL || 'http://localhost:3000'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token')
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
}

export const notesAPI = {
  getNotes: (params = {}) => api.get('/notes', { params }),
  getNote: (id) => api.get(`/notes/${id}`),
  createNote: (data) => api.post('/notes', data),
  updateNote: (id, data) => api.put(`/notes/${id}`, data),
  deleteNote: (id) => api.delete(`/notes/${id}`),
  archiveNote: (id, isArchived) => api.patch(`/notes/${id}/archive`, { isArchived })
}

export const tenantAPI = {
  getInfo: () => api.get('/tenants/info'),
  getStats: () => api.get('/tenants/stats'),
  upgrade: (slug) => api.post(`/tenants/${slug}/upgrade`)
}

export const healthAPI = {
  check: () => api.get('/health')
}

export default api
