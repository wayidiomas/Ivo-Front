/**
 * API Client para Units - Integração com IVO V2 API
 * Suporte para FormData (imagens) e timeouts longos para IA
 */

import { authApi } from './auth'
import { buildApiUrl } from '@/lib/utils/api-url'
import type { Unit, UnitCreateRequest } from '@/lib/types/api.types'

interface UnitWithContent extends Unit {
  unit_data: Unit & {
    vocabulary: any
    sentences: any
    tips: any
    grammar: any
    qa: any
    assessments: any
    images: string[]
  }
  hierarchy_context: {
    course: {
      id: string
      name: string
      language_variant: string
      target_levels: string[]
    }
    book: {
      id: string
      name: string
      target_level: string
      sequence_order: number
    }
  }
  content_status: {
    has_vocabulary: boolean
    has_sentences: boolean
    has_strategies: boolean
    has_assessments: boolean
    completion_percentage: number
    ready_for_generation: boolean
  }
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  hierarchy_info?: any
  next_suggested_actions?: string[]
}

interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  message: string
  pagination: {
    page: number
    size: number
    total: number
    pages: number
    has_next: boolean
    has_prev: boolean
    next_page?: number
    prev_page?: number
  }
  hierarchy_info?: any
  filters_applied?: any
  sort_info?: any
}

class UnitsApiClient {
  constructor() {
    // Não precisamos de baseUrl fixo - vamos usar buildApiUrl para cada endpoint
  }

  private getAuthToken(): string | null {
    return authApi.getToken()
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {},
    timeout: number = 600000 // 10 minutes for AI requests
  ): Promise<T> {
    // Usar buildApiUrl que já tem lógica de bypass para endpoints lentos
    const url = buildApiUrl(endpoint)
    const token = this.getAuthToken()
    
    // Create abort controller for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const headers: Record<string, string> = {
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers as Record<string, string>,
    }

    // Don't set Content-Type for FormData - let browser set it with boundary
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json'
    }

    const config: RequestInit = {
      ...options,
      headers,
      signal: controller.signal,
    }

    try {
      const response = await fetch(url, config)
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      clearTimeout(timeoutId)
      console.error(`Erro na requisição para ${endpoint}:`, error)
      throw error
    }
  }

  /**
   * Criar nova unit dentro de um book (com FormData para imagens)
   */
  async createUnit(
    bookId: string, 
    unitData: UnitCreateRequest
  ): Promise<ApiResponse<{ unit: Unit; book_context: any; created: boolean }>> {
    const formData = new FormData()
    
    // Campos obrigatórios
    formData.append('cefr_level', unitData.cefr_level)
    formData.append('language_variant', unitData.language_variant)
    formData.append('unit_type', unitData.unit_type)
    
    // Context opcional (obrigatório se sem imagens)
    if (unitData.context) {
      formData.append('context', unitData.context)
    }
    
    // Imagens no formato correto: image_1, image_2
    if (unitData.images && unitData.images.length > 0) {
      formData.append('image_1', unitData.images[0])
      if (unitData.images.length > 1) {
        formData.append('image_2', unitData.images[1])
      }
    }

    return this.request<ApiResponse<{ unit: Unit; book_context: any; created: boolean }>>(
      `/api/v2/books/${bookId}/units`,
      {
        method: 'POST',
        body: formData,
      },
      600000 // 10 minutes timeout for AI generation
    )
  }

  /**
   * Listar units de um book com paginação
   */
  async listUnitsByBook(
    bookId: string,
    params: {
      page?: number
      size?: number
      sort_by?: string
      sort_order?: 'asc' | 'desc'
      status?: string
      unit_type?: string
      cefr_level?: string
    } = {}
  ): Promise<PaginatedResponse<Unit>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    const response = await this.request<PaginatedResponse<any>>(
      `/api/v2/books/${bookId}/units?${searchParams.toString()}`,
      {},
      30000 // Normal timeout for listing
    )

    // Transform API response to match full Unit type
    const transformedUnits: Unit[] = response.data.map((unit: any): Unit => ({
      ...unit,
      // Ensure required arrays exist with API data or empty defaults
      subsidiary_aims: unit.subsidiary_aims || [],
      strategies_used: unit.strategies_used || [],
      assessments_used: unit.assessments_used || [],
      vocabulary_taught: unit.vocabulary_taught || [],
      pronunciation_focus: unit.pronunciation_focus || [],
      images: unit.images || [],
      checklist_completed: unit.checklist_completed || []
    }))

    return {
      ...response,
      data: transformedUnits
    }
  }

  /**
   * Obter unit específica com todo o conteúdo gerado
   */
  async getUnit(unitId: string): Promise<ApiResponse<UnitWithContent>> {
    return this.request<ApiResponse<UnitWithContent>>(
      `/api/v2/units/${unitId}`,
      {},
      30000 // Normal timeout for getting data
    )
  }

  /**
   * Atualizar unit existente (com FormData para imagens)
   */
  async updateUnit(
    unitId: string,
    unitData: Partial<UnitCreateRequest>
  ): Promise<ApiResponse<{ unit: Unit; changes_applied: any; updated: boolean }>> {
    const formData = new FormData()
    
    // Adicionar campos fornecidos
    if (unitData.context) formData.append('context', unitData.context)
    if (unitData.cefr_level) formData.append('cefr_level', unitData.cefr_level)
    if (unitData.language_variant) formData.append('language_variant', unitData.language_variant)
    if (unitData.unit_type) formData.append('unit_type', unitData.unit_type)
    
    // Adicionar imagens se fornecidas
    if (unitData.images && unitData.images.length > 0) {
      unitData.images.forEach((file) => {
        formData.append('images', file)
      })
    }

    return this.request<ApiResponse<{ unit: Unit; changes_applied: any; updated: boolean }>>(
      `/api/v2/units/${unitId}`,
      {
        method: 'PUT',
        body: formData,
      },
      180000 // 3 minutes timeout if regenerating content
    )
  }

  /**
   * Deletar unit
   */
  async deleteUnit(unitId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(
      `/api/v2/units/${unitId}`,
      {
        method: 'DELETE',
      },
      30000 // Normal timeout for deletion
    )
  }

  /**
   * Regenerar conteúdo de uma unit (vocabulary, sentences, etc.)
   */
  async regenerateUnitContent(
    unitId: string,
    contentTypes: string[] = ['vocabulary', 'sentences', 'tips', 'grammar', 'qa', 'assessments']
  ): Promise<ApiResponse<{ unit: Unit; regenerated_content: any }>> {
    return this.request<ApiResponse<{ unit: Unit; regenerated_content: any }>>(
      `/api/v2/units/${unitId}/regenerate`,
      {
        method: 'POST',
        body: JSON.stringify({ content_types: contentTypes }),
      },
      180000 // 3 minutes timeout for AI regeneration
    )
  }
}

// Instância singleton
export const unitsApi = new UnitsApiClient()

// Exports
export type { 
  UnitCreateRequest, 
  Unit, 
  UnitWithContent, 
  ApiResponse, 
  PaginatedResponse 
}