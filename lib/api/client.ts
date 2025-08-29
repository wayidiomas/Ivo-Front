import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { toast } from 'sonner'
import { getApiBaseUrl } from '@/lib/utils/api-url'

// Rate limiting state
const rateLimitState = {
  requests: [] as number[],
  maxRequests: 100,
  windowMs: 60000 // 1 minute
}

// Rate limiting function
function checkRateLimit(): boolean {
  const now = Date.now()
  const windowStart = now - rateLimitState.windowMs
  
  // Remove old requests
  rateLimitState.requests = rateLimitState.requests.filter(time => time > windowStart)
  
  if (rateLimitState.requests.length >= rateLimitState.maxRequests) {
    return false
  }
  
  rateLimitState.requests.push(now)
  return true
}

// API Client configuration - dinâmico local/produção
const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Rate limiting check
    if (!checkRateLimit()) {
      const error = new Error('Rate limit exceeded. Please try again later.')
      ;(error as any).isRateLimit = true
      throw error
    }

    // Add authentication token if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('ivo-token') : null
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add API key for IVO
    config.headers['X-API-Key'] = process.env.NEXT_PUBLIC_API_KEY_IVO || 'ivo_test_token_dev_only'

    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    }

    return config
  },
  (error) => {
    console.error('Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    }
    return response
  },
  (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }

    // Handle rate limiting
    if ((error as any).isRateLimit) {
      toast.error('Too many requests. Please slow down.')
      return Promise.reject(error)
    }

    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.')
      return Promise.reject(error)
    }

    const status = error.response.status
    const message = (error.response.data as any)?.message || error.message

    // Handle different status codes
    switch (status) {
      case 401:
        // Unauthorized - clear token and redirect
        if (typeof window !== 'undefined') {
          localStorage.removeItem('ivo-token')
          window.location.href = '/login'
        }
        toast.error('Session expired. Please login again.')
        break

      case 403:
        toast.error('Access denied. Insufficient permissions.')
        break

      case 404:
        toast.error('Resource not found.')
        break

      case 422:
        // Validation errors
        const validationErrors = (error.response.data as any)?.errors || {}
        const firstError = Object.values(validationErrors)[0] as string[]
        toast.error(firstError?.[0] || 'Validation error occurred.')
        break

      case 429:
        // Too many requests
        toast.error('Rate limit exceeded. Please try again later.')
        break

      case 500:
        toast.error('Server error. Please try again later.')
        break

      case 503:
        toast.error('Service unavailable. Please try again later.')
        break

      default:
        toast.error(message || 'An unexpected error occurred.')
    }

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${status} ${error.config?.url}`, error.response?.data)
    }

    return Promise.reject(error)
  }
)

// Typed API methods
export const apiClient = {
  // Generic methods
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.get(url, config),
  
  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.post(url, data, config),
  
  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.put(url, data, config),
  
  patch: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.patch(url, data, config),
  
  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> =>
    api.delete(url, config),

  // Health check
  health: () => api.get('/health'),

  // Authentication endpoints
  auth: {
    login: (apiKey: string) =>
      api.post('/api/auth/login', { api_key_ivo: apiKey }),
    
    logout: () =>
      api.post('/api/auth/logout'),
    
    refresh: () =>
      api.post('/api/auth/refresh'),
  },

  // Courses endpoints
  courses: {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      api.get('/api/v2/courses', { params }),
    
    get: (id: string) =>
      api.get(`/api/v2/courses/${id}`),
    
    create: (data: any) =>
      api.post('/api/v2/courses', data),
    
    update: (id: string, data: any) =>
      api.put(`/api/v2/courses/${id}`, data),
    
    delete: (id: string) =>
      api.delete(`/api/v2/courses/${id}`),
  },

  // Books endpoints
  books: {
    list: (courseId: string, params?: { page?: number; limit?: number }) =>
      api.get(`/api/v2/courses/${courseId}/books`, { params }),
    
    get: (courseId: string, bookId: string) =>
      api.get(`/api/v2/courses/${courseId}/books/${bookId}`),
    
    create: (courseId: string, data: any) =>
      api.post(`/api/v2/courses/${courseId}/books`, data),
    
    update: (courseId: string, bookId: string, data: any) =>
      api.put(`/api/v2/courses/${courseId}/books/${bookId}`, data),
    
    delete: (courseId: string, bookId: string) =>
      api.delete(`/api/v2/courses/${courseId}/books/${bookId}`),
  },

  // Units endpoints
  units: {
    list: (courseId: string, bookId: string, params?: { page?: number; limit?: number }) =>
      api.get(`/api/v2/courses/${courseId}/books/${bookId}/units`, { params }),
    
    get: (courseId: string, bookId: string, unitId: string) =>
      api.get(`/api/v2/courses/${courseId}/books/${bookId}/units/${unitId}`),
    
    create: (courseId: string, bookId: string, data: any) =>
      api.post(`/api/v2/courses/${courseId}/books/${bookId}/units`, data),
    
    update: (courseId: string, bookId: string, unitId: string, data: any) =>
      api.put(`/api/v2/courses/${courseId}/books/${bookId}/units/${unitId}`, data),
    
    delete: (courseId: string, bookId: string, unitId: string) =>
      api.delete(`/api/v2/courses/${courseId}/books/${bookId}/units/${unitId}`),

    // Generate vocabulary
    generateVocabulary: (courseId: string, bookId: string, unitId: string, data: any) =>
      api.post(`/api/v2/courses/${courseId}/books/${bookId}/units/${unitId}/vocabulary`, data),
  },
}

export default api