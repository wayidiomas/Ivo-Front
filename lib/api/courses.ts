/**
 * API Client para Cursos - Integração com IVO V2 API
 */

import { authApi } from './auth'
import { buildApiUrl } from '@/lib/utils/api-url'
import type { Course, CourseCreateRequest } from '@/lib/types/api.types'

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
  hierarchy_info?: {
    course_id?: string
    level: string
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

class CoursesApiClient {
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
   * Criar novo curso
   */
  async createCourse(courseData: CourseCreateRequest): Promise<ApiResponse<{ course: Course; created: boolean }>> {
    return this.request<ApiResponse<{ course: Course; created: boolean }>>(
      '/courses',
      {
        method: 'POST',
        body: JSON.stringify(courseData),
      }
    )
  }

  /**
   * Listar cursos com paginação
   */
  async listCourses(params: {
    page?: number
    size?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
    language_variant?: string
    target_level?: string
    methodology?: string
    search?: string
    include_stats?: boolean
  } = {}): Promise<PaginatedResponse<Course & { statistics?: any }>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    return this.request<PaginatedResponse<Course & { statistics?: any }>>(
      `/courses?${searchParams.toString()}`
    )
  }

  /**
   * Obter curso específico
   */
  async getCourse(
    courseId: string,
    options: {
      include_books?: boolean
      include_detailed_stats?: boolean
    } = {}
  ): Promise<ApiResponse<{
    course: Course
    books: any[]
    statistics: any
  }>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(options).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    const response = await this.request<ApiResponse<{
      course: any
      books: any[]
      statistics: any
    }>>(`/courses/${courseId}?${searchParams.toString()}`)

    // Transform API response to match full Course type
    const transformedCourse: Course = {
      ...response.data.course,
      // Ensure description is string, not undefined (required in api.types.ts)
      description: response.data.course.description || '',
      // Ensure optional fields exist with defaults or API data
      methodology: response.data.course.methodology || undefined,
      total_books: response.data.course.total_books || 0,
      total_units: response.data.course.total_units || 0,
      completion_rate: response.data.course.completion_rate || undefined
    }

    return {
      ...response,
      data: {
        ...response.data,
        course: transformedCourse
      }
    }
  }

  /**
   * Atualizar curso
   */
  async updateCourse(
    courseId: string,
    courseData: CourseCreateRequest
  ): Promise<ApiResponse<{ course: Course; changes_applied: any; updated: boolean }>> {
    return this.request<ApiResponse<{ course: Course; changes_applied: any; updated: boolean }>>(
      `/courses/${courseId}`,
      {
        method: 'PUT',
        body: JSON.stringify(courseData),
      }
    )
  }

  /**
   * Deletar curso (soft delete)
   */
  async deleteCourse(courseId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(
      `/courses/${courseId}`,
      {
        method: 'DELETE',
      }
    )
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string }> {
    try {
      return await this.request<{ status: string }>('/health', { timeout: 5000 } as any)
    } catch {
      return { status: 'offline' }
    }
  }

  /**
   * Configurar token Bearer
   */
  setBearerToken(token: string) {
    this.bearerToken = token
  }
}

// Instância singleton
export const coursesApi = new CoursesApiClient()

// Exports
export type { CourseCreateRequest, Course, ApiResponse, PaginatedResponse }