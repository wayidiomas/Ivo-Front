// lib/api/base-api.ts - API Base para todo o sistema Ivo
import { apiCall, apiGet, apiPost, getAuthHeaders } from '@/lib/utils/api-config'

/**
 * Classe base para todos os serviços de API do Ivo
 * Centraliza configuração de ambiente (local/produção)
 */
export class BaseApiService {
  /**
   * GET request genérico
   */
  protected async get<T = any>(endpoint: string): Promise<T> {
    const response = await apiGet(endpoint)
    
    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * POST request genérico
   */
  protected async post<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await apiPost(endpoint, data)
    
    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * PUT request genérico
   */
  protected async put<T = any>(endpoint: string, data?: any): Promise<T> {
    const response = await apiCall(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
    
    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * DELETE request genérico
   */
  protected async delete<T = any>(endpoint: string): Promise<T> {
    const response = await apiCall(endpoint, { method: 'DELETE' })
    
    if (!response.ok) {
      throw new Error(`API Error ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  /**
   * Upload de arquivo
   */
  protected async upload<T = any>(endpoint: string, formData: FormData): Promise<T> {
    // Para upload, não incluir Content-Type (browser define automaticamente)
    const headers = getAuthHeaders()
    delete headers['Content-Type']

    const response = await apiCall(endpoint, {
      method: 'POST',
      body: formData,
      headers
    })
    
    if (!response.ok) {
      throw new Error(`Upload Error ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }
}

/**
 * Instância singleton da API base
 */
export const baseApi = new BaseApiService()