'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authApi, type User, type LoginRequest } from '@/lib/api/auth'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  validateSession: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  // Validar sessão existente ao inicializar
  useEffect(() => {
    validateSession()
  }, [])

  const validateSession = async (): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const token = authApi.getToken()
      if (!token) {
        setUser(null)
        setIsLoading(false)
        return false
      }

      // Validar token com a API
      const tokenInfo = await authApi.validateToken(token)
      
      if (tokenInfo.valid) {
        // Buscar dados do usuário salvos
        const savedUser = authApi.getUser()
        if (savedUser) {
          setUser(savedUser)
          setIsLoading(false)
          return true
        }
      }

      // Token inválido ou usuário não encontrado
      authApi.clearSession()
      setUser(null)
      setIsLoading(false)
      return false
      
    } catch (error) {
      console.error('Erro na validação da sessão:', error)
      authApi.clearSession()
      setUser(null)
      setIsLoading(false)
      return false
    }
  }

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true)
      
      const authResponse = await authApi.login(credentials)
      
      // Salvar token
      authApi.saveToken(authResponse.access_token)
      
      // Criar objeto do usuário (já que a API não retorna dados completos do user no login)
      const userData: User = {
        id: authResponse.user_id || '',
        email: credentials.email,
        phone: '',
        is_active: true,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      authApi.saveUser(userData)
      setUser(userData)
      
    } catch (error) {
      console.error('Erro no login:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = (): void => {
    authApi.clearSession()
    setUser(null)
    
    // Redirecionar para login se necessário
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    validateSession,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

// Hook para proteção de rotas
export function useRequireAuth(): AuthContextType {
  const auth = useAuth()
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      // Redirecionar para login se não autenticado
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }, [auth.isAuthenticated, auth.isLoading])

  return auth
}