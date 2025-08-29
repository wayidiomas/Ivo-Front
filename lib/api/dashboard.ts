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