// lib/utils/api-url.ts - Detector de URL para local/produção
// Solução não intrusiva que não quebra APIs existentes

/**
 * Detectar automaticamente se estamos em desenvolvimento ou produção
 * e retornar a URL base da API correspondente
 */
export function getApiBaseUrl(): string {
  // Se estamos no browser, SEMPRE usar proxy do Next.js
  if (typeof window !== 'undefined') {
    return ''  // URL vazia usa proxy automático do Next.js (/api/v2/* → backend)
  }
  
  // Server-side: usar variável de ambiente
  return process.env.BACKEND_URL || 'http://localhost:8000'
}

/**
 * Endpoints que podem demorar muito e devem bypassar o proxy Next.js
 */
const SLOW_ENDPOINTS = [
  '/api/v2/units/',
  '/api/v2/books/',
  '/api/v2/courses/',
  'vocabulary',
  'sentences',
  'assessments',
  'generation',
  'gabarito',
  'solve'
]

/**
 * Verificar se endpoint pode ser lento e precisa de bypass do proxy
 */
function isSlowEndpoint(endpoint: string): boolean {
  return SLOW_ENDPOINTS.some(pattern => endpoint.includes(pattern))
}

/**
 * Construir URL completa para endpoint da API
 * Browser: buildApiUrl('/api/v2/courses') → '/api/v2/courses' (proxy Next.js)
 * Server: buildApiUrl('/api/v2/courses') → 'http://localhost:8000/api/v2/courses'
 * Slow endpoints: Bypass proxy e usa conexão direta
 */
export function buildApiUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  
  // APENAS em desenvolvimento, usar conexão direta para endpoints lentos
  // Em produção, TODOS os endpoints devem passar pelo proxy Next.js
  if (typeof window !== 'undefined' && isSlowEndpoint(endpoint) && process.env.NODE_ENV === 'development') {
    const directUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    console.log(`🚀 Bypass proxy para endpoint lento (DEV ONLY): ${directUrl}${cleanEndpoint}`)
    return `${directUrl}${cleanEndpoint}`
  }
  
  const baseUrl = getApiBaseUrl()
  
  // Se baseUrl é vazio (produção), usa proxy do Next.js
  if (!baseUrl) {
    return cleanEndpoint
  }
  
  return `${baseUrl}${cleanEndpoint}`
}

/**
 * Headers padrão com autenticação
 */
export function getApiHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }
  
  // Adicionar token se estivermos no browser
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ivo_bearer_token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
  }
  
  return headers
}