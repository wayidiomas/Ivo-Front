// lib/api/dashboard.ts - Serviços para dashboard
import { BaseApiService } from './base-api'
import { API_CONFIG, apiCall, getAuthHeaders } from '@/lib/utils/api-config'

export interface DashboardStats {
  title: string
  value: string
  description: string
  trend: string
  change_percentage: number
  period_data: any
  color?: string
  IconComponent?: any
}

export interface RecentUnit {
  id: string
  title: string
  description: string
  courseName: string
  bookName: string
  vocabulary: number
  sentences: number
  progress: number
  level: string
  type: string
  status: string
  lastWorked: string
  timeSpent: string
  completion_details: any
}

export interface DashboardStatsResponse {
  success: boolean
  data: {
    stats: DashboardStats[]
    period: {
      days: number
      start_date: string
      end_date: string
    }
    additional_insights: any
    system_totals: any
    generated_at: string
  }
}

export interface DashboardUnitsResponse {
  success: boolean
  data: {
    recent_units: RecentUnit[]
    limit: number
    total_recent: number
    activity_summary: any
    generated_at: string
  }
}

class DashboardService extends BaseApiService {
  /**
   * GET específico para dashboard com timeout estendido
   */
  private async getDashboard<T = any>(endpoint: string): Promise<T> {
    const response = await apiCall(endpoint, {
      method: 'GET',
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT.DASHBOARD)
    })
    
    if (!response.ok) {
      throw new Error(`Dashboard API Error ${response.status}: ${response.statusText}`)
    }
    
    return response.json()
  }

  async getStats(periodDays: number = 30): Promise<DashboardStatsResponse> {
    return this.getDashboard(`api/v2/dashboard/stats?period_days=${periodDays}`)
  }

  async getRecentUnits(limit: number = 3): Promise<DashboardUnitsResponse> {
    return this.getDashboard(`api/v2/dashboard/recent-units?limit=${limit}`)
  }

  async getAllDashboardData(periodDays: number = 30, unitsLimit: number = 3) {
    const [statsData, unitsData] = await Promise.all([
      this.getStats(periodDays),
      this.getRecentUnits(unitsLimit)
    ])

    return {
      stats: statsData,
      units: unitsData
    }
  }
}

export const dashboardService = new DashboardService()

export interface BookFullData {
  book: {
    id: string
    name: string
    description: string
    target_level: string
    course_id: string
    created_at: string
    updated_at: string
  }
  course: {
    id: string
    name: string
    description: string
    target_levels: string[]
  } | null
  units: Array<{
    id: string
    title: string
    context: string
    status: string
    unit_type: string
    cefr_level: string
    sequence_order: number
    quality_score: number
    created_at: string
    updated_at: string
    main_aim: string
    images: string[]
  }>
  stats: {
    total: number
    completed: number
    creating: number
    pending: number
    by_type: {
      lexical_unit: number
      grammar_unit: number
      functional_unit: number
      mixed_unit: number
    }
  }
}

export interface BookFullDataResponse {
  success: boolean
  data: BookFullData
  message: string
}

// Serviço otimizado para buscar todos os dados da página de units em 1 chamada
export async function getBookFullData(bookId: string): Promise<BookFullDataResponse> {
  const response = await apiCall(`api/v2/dashboard/book-full-data/${bookId}?include_stats=true`, {
    method: 'GET',
    headers: getAuthHeaders(),
    signal: AbortSignal.timeout(API_CONFIG.TIMEOUT.DEFAULT)
  })
  
  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${response.statusText}`)
  }
  
  return response.json()
}