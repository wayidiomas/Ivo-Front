// lib/utils/api-config.ts - Configuração inteligente de API para local/produção

/**
 * Configuração automática de URLs da API
 * Funciona para desenvolvimento local e produção na Vercel
 */

export const API_CONFIG = {
  // URL base da API - usa variável de ambiente ou fallback para localhost
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  
  // URL do WebSocket (futuro)
  WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000',
  
  // URL do frontend
  FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
  
  // Ambiente atual (Next.js define automaticamente)
  IS_DEVELOPMENT: typeof window !== 'undefined' ? 
    window.location.hostname === 'localhost' : 
    process.env.NODE_ENV === 'development',
  IS_PRODUCTION: typeof window !== 'undefined' ? 
    window.location.hostname !== 'localhost' : 
    process.env.NODE_ENV === 'production',
  
  // Headers padrão para todas as chamadas
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
  },
  
  // Timeouts em ms
  TIMEOUT: {
    DEFAULT: 300000,     // 5min para chamadas normais (IA pode demorar)
    GENERATION: 600000,  // 10min para geração de conteúdo IA
    UPLOAD: 120000,      // 2min para uploads
    DASHBOARD: 300000,   // 5min específico para dashboard (dados demoram)
    UNIT_CREATION: 600000, // 10min para criação de unidades (IA + processamento)
  }
}

/**
 * Obter URL completa da API
 * No desenvolvimento: usa proxy do Next.js (/api/*)
 * Na produção: usa URL direta ou proxy configurado
 */
export function getApiUrl(endpoint: string): string {
  // Remove barra inicial se existir
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
  // Para desenvolvimento local, usa proxy do Next.js
  if (typeof window !== 'undefined' && API_CONFIG.IS_DEVELOPMENT) {
    return `/${cleanEndpoint}`
  }
  
  // Para produção ou server-side, usa URL completa
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`
}

/**
 * Obter headers de autenticação
 */
export function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { ...API_CONFIG.DEFAULT_HEADERS }
  
  // Adicionar token se existir (apenas no browser)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ivo_bearer_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  return headers
}

/**
 * Fazer chamada HTTP com configuração automática
 */
export async function apiCall(
  endpoint: string, 
  options: RequestInit = {}
): Promise<Response> {
  const url = getApiUrl(endpoint)
  const headers = { 
    ...getAuthHeaders(), 
    ...options.headers 
  }
  
  const config: RequestInit = {
    ...options,
    headers,
    // Timeout padrão
    signal: options.signal || AbortSignal.timeout(API_CONFIG.TIMEOUT.DEFAULT)
  }
  
  console.log(`🌐 API Call: ${options.method || 'GET'} ${url}`)
  
  try {
    const response = await fetch(url, config)
    
    if (!response.ok) {
      console.error(`❌ API Error: ${response.status} ${response.statusText}`)
    } else {
      console.log(`✅ API Success: ${response.status}`)
    }
    
    return response
  } catch (error) {
    console.error(`🚨 Network Error:`, error)
    throw error
  }
}

/**
 * Helper para GET requests
 */
export async function apiGet(endpoint: string): Promise<Response> {
  return apiCall(endpoint, { method: 'GET' })
}

/**
 * Helper para POST requests
 */
export async function apiPost(endpoint: string, data: any): Promise<Response> {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

/**
 * Verificar se a API está online
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await apiGet('health')
    return response.ok
  } catch {
    return false
  }
}

/**
 * Log de configuração para debug
 */
export function logApiConfig() {
  if (API_CONFIG.IS_DEVELOPMENT) {
    console.log('🔧 Ivo API Configuration:', {
      BASE_URL: API_CONFIG.BASE_URL,
      IS_DEVELOPMENT: API_CONFIG.IS_DEVELOPMENT,
      FRONTEND_URL: API_CONFIG.FRONTEND_URL
    })
  }
}