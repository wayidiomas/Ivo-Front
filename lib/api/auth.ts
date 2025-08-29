/**
 * API Client para Autenticação - Integração com IVO Auth API
 */

import { buildApiUrl } from '@/lib/utils/api-url'

// Tipos baseados na API real
interface LoginRequest {
  email: string
  api_key_ivo: string
}

interface RegisterRequest {
  email: string
  phone?: string
  metadata?: Record<string, any>
  scopes?: string[]
  rate_limit_config?: {
    requests_per_minute: number
    requests_per_hour: number
  }
}

interface AuthResponse {
  access_token: string
  token_type: string
  user_id?: string
  scopes: string[]
  expires_at?: string
  rate_limit: {
    requests_per_minute: number
    requests_per_hour: number
  }
}

interface User {
  id: string
  email: string
  phone?: string
  is_active: boolean
  metadata: Record<string, any>
  created_at: string
  updated_at: string
}

interface CreateUserResponse {
  user: User
  token_info: AuthResponse
  message: string
}

interface ValidateTokenResponse {
  valid: boolean
  user_id?: string
  scopes: string[]
  expires_at?: string
  usage_count: number
}

interface ApiError {
  detail: string
}

class AuthApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = buildApiUrl('/api/auth').replace('/api/auth', '') + '/api/auth'
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    console.log(`🌐 Fazendo requisição para: ${url}`)
    console.log('📦 Headers:', headers)
    if (options.body) {
      console.log('📋 Body:', options.body)
    }

    try {
      const response = await fetch(url, config)
      
      console.log(`📡 Response status: ${response.status} ${response.statusText}`)
      
      const data = await response.json()
      console.log('📥 Response data:', data)
      
      if (!response.ok) {
        const error = data as ApiError
        console.error('❌ API Error:', error)
        throw new Error(error.detail || `Erro ${response.status}: ${response.statusText}`)
      }

      return data as T
    } catch (error) {
      console.error(`❌ Erro na requisição para ${endpoint}:`, error)
      throw error
    }
  }

  /**
   * Login com email + chave de acesso
   */
  async login(loginData: LoginRequest): Promise<AuthResponse> {
    console.log('🔐 Tentativa de login:', {
      email: loginData.email,
      api_key_length: loginData.api_key_ivo.length,
      api_key_prefix: loginData.api_key_ivo.substring(0, 8) + '...'
    })
    
    return this.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
    })
  }

  /**
   * Registrar novo usuário
   */
  async register(registerData: RegisterRequest): Promise<CreateUserResponse> {
    return this.request<CreateUserResponse>('/create-user', {
      method: 'POST',
      body: JSON.stringify(registerData),
    })
  }

  /**
   * Validar token bearer atual
   */
  async validateToken(bearerToken: string): Promise<ValidateTokenResponse> {
    return this.request<ValidateTokenResponse>('/validate-token', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bearerToken}`,
      },
    })
  }

  /**
   * Utilitários para localStorage
   */
  saveToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ivo_bearer_token', token)
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('ivo_bearer_token')
    }
    return null
  }

  removeToken(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ivo_bearer_token')
    }
  }

  saveUser(user: User): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ivo_user', JSON.stringify(user))
    }
  }

  getUser(): User | null {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('ivo_user')
      return userData ? JSON.parse(userData) : null
    }
    return null
  }

  removeUser(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('ivo_user')
    }
  }

  clearSession(): void {
    this.removeToken()
    this.removeUser()
  }
}

// Instância singleton
export const authApi = new AuthApiClient()

// Exports
export type { 
  LoginRequest, 
  RegisterRequest, 
  AuthResponse, 
  User, 
  CreateUserResponse, 
  ValidateTokenResponse,
  ApiError 
}
export { AuthApiClient }