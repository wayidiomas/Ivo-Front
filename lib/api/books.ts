/**
 * API Client para Books - Integração com IVO V2 API
 */

import { authApi } from './auth'
import { buildApiUrl } from '@/lib/utils/api-url'

// Tipos baseados na API real
interface BookCreateRequest {
  name: string
  description?: string
  target_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
}

interface Book {
  id: string
  course_id: string
  name: string
  description?: string
  target_level: string
  sequence_order: number
  unit_count: number
  vocabulary_count: number  // NOVO CAMPO
  vocabulary_coverage: string[]
  strategies_used: string[]
  assessments_used: string[]
  created_at: string
  updated_at: string
}

interface Unit {
  id: string
  title: string
  sequence_order: number
  status: string
  unit_type: string
  context: string
  created_at: string
  quality_score?: number
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  hierarchy_info?: {
    course_id?: string
    book_id?: string
    level: string
    sequence?: number
  }
  next_suggested_actions?: string[]
}

interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  message: string
  pagination: {
    page: number
    size: number
    total_count: number
    total_pages: number
    has_next: boolean
    has_previous: boolean
  }
  hierarchy_info?: any
}

class BooksApiClient {
  private baseUrl: string
  private bearerToken?: string

  constructor() {
    this.baseUrl = buildApiUrl('/api/v2').replace('/api/v2', '') + '/api/v2'
  }

  private getAuthToken(): string | null {
    return authApi.getToken()
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    const token = this.getAuthToken()
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers as Record<string, string>,
    }

    const config: RequestInit = {
      ...options,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Erro ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Erro na requisição para ${endpoint}:`, error)
      throw error
    }
  }

  /**
   * Criar novo book dentro de um curso
   */
  async createBook(
    courseId: string, 
    bookData: BookCreateRequest
  ): Promise<ApiResponse<{ book: Book; course_info: any; created: boolean }>> {
    return this.request<ApiResponse<{ book: Book; course_info: any; created: boolean }>>(
      `/courses/${courseId}/books`,
      {
        method: 'POST',
        body: JSON.stringify(bookData),
      }
    )
  }

  /**
   * Listar books de um curso com paginação
   */
  async listBooksByCourse(
    courseId: string,
    params: {
      page?: number
      size?: number
      sort_by?: string
      sort_order?: 'asc' | 'desc'
      target_level?: string
      search?: string
      include_units?: boolean
    } = {}
  ): Promise<PaginatedResponse<Book & { units?: Unit[]; units_summary?: any }>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<PaginatedResponse<Book & { units?: Unit[]; units_summary?: any }>>(
      `/courses/${courseId}/books?${searchParams.toString()}`
    )
  }

  /**
   * Listar TODOS os books (de todos os cursos) com paginação
   */
  async listAllBooks(
    params: {
      page?: number
      size?: number
      sort_by?: string
      sort_order?: 'asc' | 'desc'
      course_id?: string
      target_level?: string
      language_variant?: string
      search?: string
      include_stats?: boolean
    } = {}
  ): Promise<PaginatedResponse<Book & {
    course_name: string
    course_language_variant: string
    status: string
  }>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<PaginatedResponse<Book & {
      course_name: string
      course_language_variant: string
      status: string
    }>>(
      `/books?${searchParams.toString()}`
    )
  }

  /**
   * Obter book específico
   */
  async getBook(
    bookId: string,
    options: {
      include_units?: boolean
    } = {}
  ): Promise<ApiResponse<{
    book: Book & { 
      units?: Unit[]
      units_statistics?: any
      progression_analysis?: any
    }
    course_context?: any
    hierarchy_position?: any
  }>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<ApiResponse<{
      book: Book & { 
        units?: Unit[]
        units_statistics?: any
        progression_analysis?: any
      }
      course_context?: any
      hierarchy_position?: any
    }>>(`/books/${bookId}?${searchParams.toString()}`)
  }

  /**
   * Obter análise de progressão pedagógica do book
   */
  async getBookProgression(bookId: string): Promise<ApiResponse<{
    book_info: any
    overall_progression: any
    units_progression: any[]
    pedagogical_insights: any
  }>> {
    return this.request<ApiResponse<{
      book_info: any
      overall_progression: any
      units_progression: any[]
      pedagogical_insights: any
    }>>(`/books/${bookId}/progression`)
  }

  /**
   * Atualizar book
   */
  async updateBook(
    bookId: string,
    bookData: BookCreateRequest
  ): Promise<ApiResponse<{ book: Book; changes_applied: any; updated: boolean }>> {
    return this.request<ApiResponse<{ book: Book; changes_applied: any; updated: boolean }>>(
      `/books/${bookId}`,
      {
        method: 'PUT',
        body: JSON.stringify(bookData),
      }
    )
  }

  /**
   * Deletar book (soft delete)
   */
  async deleteBook(bookId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(
      `/books/${bookId}`,
      {
        method: 'DELETE',
      }
    )
  }

  /**
   * Configurar token Bearer
   */
  setBearerToken(token: string) {
    this.bearerToken = token
  }
}

// Instância singleton
export const booksApi = new BooksApiClient()

// Exports
export type { BookCreateRequest, Book, Unit, ApiResponse, PaginatedResponse }