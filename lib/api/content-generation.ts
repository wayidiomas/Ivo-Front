/**
 * API Client para Geração de Conteúdo - Integração com IVO V2 API
 * Endpoints para vocabulary, sentences, tips, grammar, qa e assessments
 */

import { authApi } from './auth'
import { buildApiUrl } from '@/lib/utils/api-url'

// Interfaces baseadas na API real
interface VocabularyGenerationRequest {
  webhook_url?: string
  target_count: number // 5-50
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced'
  focus_areas?: string[]
  ipa_variant?: string
  include_alternative_pronunciations?: boolean
  phonetic_complexity?: 'simple' | 'medium' | 'complex'
  avoid_repetition?: boolean
  is_revision_unit?: boolean // CAMPO REAL DA API
}

interface SentenceGenerationRequest {
  webhook_url?: string
  target_count: number // 3-20
  complexity_level?: 'basic' | 'intermediate' | 'advanced'
  connect_to_vocabulary?: boolean
  vocabulary_coverage?: number
}

interface QAGenerationRequest {
  webhook_url?: string
  target_count: number // 2-15
  bloom_levels?: string[]
  question_types?: string[]
  difficulty_progression?: boolean
}

interface AssessmentGenerationRequest {
  webhook_url?: string
  assessment_count?: number // 1-5
  difficulty_distribution?: 'easy' | 'balanced' | 'challenging'
  preferred_types?: string[]
  avoid_types?: string[]
  ensure_variety?: boolean
  connect_to_content?: boolean
}

interface TipsGenerationRequest {
  webhook_url?: string
  strategy_count?: number
  focus_type?: 'vocabulary'
  include_l1_warnings?: boolean
}

interface GrammarGenerationRequest {
  webhook_url?: string
  strategy_count?: number
  grammar_focus?: 'unit_based'
  connect_to_vocabulary?: boolean
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

class ContentGenerationApiClient {
  constructor() {
    // Não precisamos de baseUrl fixo - vamos usar buildApiUrl para cada endpoint
  }

  private getAuthToken(): string | null {
    return authApi.getToken()
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout: number = 600000 // 10 minutes for AI requests (matching units API)
  ): Promise<T> {
    // Usar buildApiUrl que já tem lógica de bypass para endpoints lentos
    const url = buildApiUrl(endpoint)
    const token = this.getAuthToken()
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
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
   * Gerar vocabulário para uma unidade
   */
  async generateVocabulary(unitId: string, request: VocabularyGenerationRequest): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(
      `/api/v2/units/${unitId}/vocabulary`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  }

  /**
   * Gerar sentenças para uma unidade  
   */
  async generateSentences(unitId: string, request: SentenceGenerationRequest): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(
      `/api/v2/units/${unitId}/sentences`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  }

  /**
   * Gerar perguntas Q&A para uma unidade
   */
  async generateQA(unitId: string, request: QAGenerationRequest): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(
      `/api/v2/units/${unitId}/qa`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  }

  /**
   * Gerar assessments para uma unidade
   */
  async generateAssessments(unitId: string, request: AssessmentGenerationRequest): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(
      `/api/v2/units/${unitId}/assessments`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  }

  /**
   * Obter assessments de uma unidade com conteúdo detalhado
   */
  async getAssessments(unitId: string): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(
      `/api/v2/units/${unitId}/assessments`,
      {
        method: 'GET',
      }
    )
  }

  /**
   * Gerar tips para unidade lexical
   */
  async generateTips(unitId: string, request: TipsGenerationRequest): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(
      `/api/v2/units/${unitId}/tips`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  }

  /**
   * Gerar grammar para unidade gramatical
   */
  async generateGrammar(unitId: string, request: GrammarGenerationRequest): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(
      `/api/v2/units/${unitId}/grammar`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  }

  /**
   * Gerar todo o conteúdo de uma unidade baseado nas configurações
   */
  async generateAllContent(
    unitId: string, 
    config: {
      vocabulary_target_count: number
      sentences_target_count: number
      qa_target_count: number
      assessment_count: number
      is_revision_unit: boolean
      unit_type: 'lexical_unit' | 'grammar_unit'
    }
  ): Promise<{
    vocabulary?: ApiResponse<any>
    sentences?: ApiResponse<any>
    qa?: ApiResponse<any>
    assessments?: ApiResponse<any>
    tips?: ApiResponse<any>
    grammar?: ApiResponse<any>
  }> {
    const results: any = {}

    try {
      // 1. Gerar vocabulário
      console.log('🔄 Gerando vocabulário...')
      results.vocabulary = await this.generateVocabulary(unitId, {
        target_count: config.vocabulary_target_count,
        difficulty_level: 'intermediate',
        is_revision_unit: config.is_revision_unit, // USANDO O CAMPO REAL
        avoid_repetition: true,
        ipa_variant: 'general_american'
      })

      // 2. Gerar sentenças
      console.log('🔄 Gerando sentenças...')
      results.sentences = await this.generateSentences(unitId, {
        target_count: config.sentences_target_count,
        complexity_level: 'basic',
        connect_to_vocabulary: true,
        vocabulary_coverage: 0.7
      })

      // 3. Gerar tips OU grammar baseado no tipo
      if (config.unit_type === 'lexical_unit') {
        console.log('🔄 Gerando tips...')
        results.tips = await this.generateTips(unitId, {
          strategy_count: 2,
          focus_type: 'vocabulary',
          include_l1_warnings: true
        })
      } else if (config.unit_type === 'grammar_unit') {
        console.log('🔄 Gerando grammar...')
        results.grammar = await this.generateGrammar(unitId, {
          strategy_count: 2,
          grammar_focus: 'unit_based',
          connect_to_vocabulary: true
        })
      }

      // 4. Gerar Q&A
      console.log('🔄 Gerando Q&A...')
      results.qa = await this.generateQA(unitId, {
        target_count: config.qa_target_count,
        bloom_levels: ['remember', 'understand', 'apply'],
        difficulty_progression: true
      })

      // 5. Gerar assessments
      console.log('🔄 Gerando assessments...')
      results.assessments = await this.generateAssessments(unitId, {
        assessment_count: config.assessment_count,
        difficulty_distribution: 'balanced',
        connect_to_content: true,
        ensure_variety: true
      })

      console.log('✅ Geração de conteúdo concluída!')
      return results

    } catch (error) {
      console.error('❌ Erro na geração de conteúdo:', error)
      throw error
    }
  }

  /**
   * Corrigir assessment usando IA
   */
  async solveAssessment(unitId: string, request: {
    assessment_type: string;
    include_student_answers?: boolean;
    student_context?: string;
  }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(
      `/api/v2/units/${unitId}/solve_assessments`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  }

  /**
   * Obter resultados de correções de assessments (DEPRECATED - use getGabaritos)
   */
  async getSolveResults(unitId: string, assessmentType?: string): Promise<ApiResponse<any>> {
    const params = assessmentType ? `?assessment_type=${assessmentType}` : '';
    return this.request<ApiResponse<any>>(
      `/api/v2/units/${unitId}/solve_assessments${params}`,
      {
        method: 'GET',
      }
    )
  }

  // =============================================================================
  // NOVOS MÉTODOS PARA GABARITO GENERATION
  // =============================================================================

  /**
   * Gerar gabarito (answer key) para assessment usando IA
   */
  async generateGabarito(unitId: string, request: {
    assessment_type: string;
    include_explanations?: boolean;
    difficulty_analysis?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(
      `/api/v2/${unitId}/generate_gabarito`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    )
  }

  /**
   * Obter gabaritos gerados para uma unidade
   */
  async getGabaritos(unitId: string, assessmentType?: string): Promise<ApiResponse<any>> {
    const params = assessmentType ? `?assessment_type=${assessmentType}` : '';
    return this.request<ApiResponse<any>>(
      `/api/v2/${unitId}/gabaritos${params}`,
      {
        method: 'GET',
      }
    )
  }

  /**
   * Regenerar gabarito específico
   */
  async regenerateGabarito(unitId: string, assessmentType: string, request: {
    include_explanations?: boolean;
    difficulty_analysis?: boolean;
  }): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>(
      `/api/v2/${unitId}/gabarito/${assessmentType}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          assessment_type: assessmentType,
          ...request
        }),
      }
    )
  }

  /**
   * Método híbrido que detecta automaticamente qual API usar
   * Tenta gabarito primeiro, fallback para solve se falhar
   */
  async solveOrGenerateGabarito(unitId: string, request: {
    assessment_type: string;
    include_explanations?: boolean;
    difficulty_analysis?: boolean;
    // Campos antigos para compatibilidade
    include_student_answers?: boolean;
    student_context?: string;
  }): Promise<ApiResponse<any>> {
    try {
      // Tentar novo endpoint primeiro
      console.log('🆕 Tentando gerar gabarito...')
      return await this.generateGabarito(unitId, {
        assessment_type: request.assessment_type,
        include_explanations: request.include_explanations ?? true,
        difficulty_analysis: request.difficulty_analysis ?? true,
      })
    } catch (error) {
      // Fallback para método antigo
      console.log('⚠️ Gabarito falhou, tentando método antigo...')
      return await this.solveAssessment(unitId, {
        assessment_type: request.assessment_type,
        include_student_answers: request.include_student_answers ?? false,
        student_context: request.student_context ?? 'Correção automática do sistema Ivo',
      })
    }
  }

  /**
   * Método híbrido para buscar resultados (gabaritos ou correções)
   */
  async getSolutionResults(unitId: string, assessmentType?: string): Promise<ApiResponse<any>> {
    try {
      // Tentar novo endpoint primeiro
      console.log('🆕 Tentando buscar gabaritos...')
      return await this.getGabaritos(unitId, assessmentType)
    } catch (error) {
      // Fallback para método antigo
      console.log('⚠️ Gabaritos falhou, tentando método antigo...')
      return await this.getSolveResults(unitId, assessmentType)
    }
  }

  /**
   * Atualizar correção de assessment específico (DEPRECATED - usa regenerateGabarito)
   */
  async updateSolveAssessment(unitId: string, assessmentType: string, request: {
    include_student_answers?: boolean;
    student_context?: string;
  }): Promise<ApiResponse<any>> {
    try {
      // Tentar novo endpoint primeiro
      return await this.regenerateGabarito(unitId, assessmentType, {
        include_explanations: true,
        difficulty_analysis: true,
      })
    } catch (error) {
      // Fallback para método antigo
      return this.request<ApiResponse<any>>(
        `/api/v2/units/${unitId}/solve_assessments/${assessmentType}`,
        {
          method: 'PUT',
          body: JSON.stringify({
            assessment_type: assessmentType,
            ...request
          }),
        }
      )
    }
  }

  /**
   * Deletar resultado de correção específico (atualizado para novos endpoints)
   */
  async deleteSolveAssessment(unitId: string, assessmentType: string): Promise<ApiResponse<any>> {
    try {
      // Tentar novo endpoint primeiro
      return await this.request<ApiResponse<any>>(
        `/api/v2/${unitId}/gabarito/${assessmentType}`,
        {
          method: 'DELETE',
        }
      )
    } catch (error) {
      // Fallback para método antigo
      return this.request<ApiResponse<any>>(
        `/api/v2/units/${unitId}/solve_assessments/${assessmentType}`,
        {
          method: 'DELETE',
        }
      )
    }
  }
}

// Instância singleton
export const contentGenerationApi = new ContentGenerationApiClient()

// Exports
export type {
  VocabularyGenerationRequest,
  SentenceGenerationRequest,
  QAGenerationRequest,
  AssessmentGenerationRequest,
  TipsGenerationRequest,
  GrammarGenerationRequest,
  ApiResponse
}