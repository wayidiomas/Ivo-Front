/**
 * API Client para Export de PDF - Integração com sistema de geração IVO
 * Gerencia dados de unidades, processamento e geração de PDFs educacionais
 */

import { authApi } from './auth'
import { buildApiUrl } from '@/lib/utils/api-url'
import { Unit } from '@/lib/types/api.types'
import { unitsApi } from './units'

// Interfaces para PDF Export
export interface PDFExportRequest {
  version: 'student' | 'professor'
  theme: 'classico' | 'moderno'
  include_hierarchy?: boolean
  content_sections?: string[]
  format_options?: {
    language?: string
    include_advanced_phonetics?: boolean
  }
}

export interface PDFExportResponse {
  success: boolean
  data: {
    pdf_data: {
      unit_info: any
      hierarchy_info?: any
      vocabulary?: any
      sentences?: any
      tips?: any
      grammar?: any
      qa?: any
      assessments?: any
      solve_assessments?: any
      generated_for: 'student' | 'professor'
      theme: string
      total_sections: number
      omitted_sections: string[]
      generation_timestamp: string
    }
    generation_stats: {
      processing_time: number
      data_sources_used: string[]
      quality_score: number
    }
  }
  message: string
}

export interface PDFGenerationStatus {
  status: 'pending' | 'processing' | 'completed' | 'error'
  progress: number
  message: string
  estimated_time_remaining?: number
}

class PDFExportApiClient {
  constructor() {
    // Base configuration
  }

  private getAuthToken(): string | null {
    return authApi.getToken()
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    timeout: number = 300000 // 5 minutes for PDF generation
  ): Promise<T> {
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
   * Preparar dados para geração de PDF
   * Busca dados completos da unidade e processa conforme versão/tema
   */
  async preparePDFData(unitId: string, request: PDFExportRequest): Promise<PDFExportResponse> {
    try {
      // Buscar dados completos da unidade usando API existente
      const unitResponse = await unitsApi.getUnit(unitId)

      console.log('🔍 Unit API Response:', unitResponse)

      if (!unitResponse.success || !unitResponse.data) {
        throw new Error('Dados da unidade não encontrados')
      }

      // Extrair dados da unidade da estrutura UnitWithContent
      const unitWithContent = unitResponse.data
      const unit = unitWithContent.unit_data || unitWithContent

      console.log('🔍 Unit Data:', unit)

      // Processar dados baseado na versão e tema
      const processedData = this.processUnitData(unit, request)

      return {
        success: true,
        data: processedData,
        message: `PDF data preparado para ${request.version} - ${processedData.pdf_data.total_sections} seções incluídas`
      }
    } catch (error) {
      console.error('Erro ao preparar dados PDF:', error)
      throw error
    }
  }

  /**
   * Processar dados da unidade baseado na versão e tema
   */
  private processUnitData(unit: Unit, request: PDFExportRequest) {
    const startTime = Date.now()
    
    // Seções base sempre incluídas
    const baseSections = ['objectives', 'vocabulary', 'sentences']
    
    // Adicionar seção específica por tipo de unidade
    if (unit.unit_type === 'lexical_unit' && unit.tips) {
      baseSections.push('tips')
    } else if (unit.unit_type === 'grammar_unit' && unit.grammar) {
      baseSections.push('grammar')
    }
    
    // Adicionar seções finais se existirem
    if (unit.qa && Object.keys(unit.qa).length > 0) {
      baseSections.push('qa')
    }
    if (unit.assessments && Object.keys(unit.assessments).length > 0) {
      baseSections.push('assessments')
    }
    if (unit.solve_assessments && Object.keys(unit.solve_assessments).length > 0) {
      baseSections.push('solve_assessments')
    }

    // Filtrar dados baseado na versão
    const filteredData = this.filterDataByVersion(unit, request.version)
    
    // Aplicar tema (para futuras customizações visuais)
    const themedData = this.applyTheme(filteredData, request.theme)

    const processingTime = Date.now() - startTime

    return {
      pdf_data: {
        unit_info: {
          id: unit.id,
          title: unit.title || 'Untitled Unit',
          context: unit.context,
          cefr_level: unit.cefr_level,
          language_variant: unit.language_variant,
          unit_type: unit.unit_type,
          main_aim: unit.main_aim,
          subsidiary_aims: unit.subsidiary_aims
        },
        hierarchy_info: request.include_hierarchy !== false ? {
          course_name: unit.course_name || 'Unnamed Course',
          book_name: unit.book_name || 'Unnamed Book',
          sequence_order: unit.sequence_order
        } : null,
        ...themedData,
        generated_for: request.version,
        theme: request.theme,
        total_sections: baseSections.length,
        omitted_sections: this.getOmittedSections(unit, baseSections),
        generation_timestamp: new Date().toISOString()
      },
      generation_stats: {
        processing_time: processingTime,
        data_sources_used: baseSections,
        quality_score: unit.quality_score || 0.85
      }
    }
  }

  /**
   * Filtrar dados baseado na versão (student vs professor)
   */
  private filterDataByVersion(unit: Unit, version: 'student' | 'professor') {
    const isStudent = version === 'student'
    
    return {
      // Vocabulary - sempre inclui campos básicos
      vocabulary: unit.vocabulary ? {
        ...unit.vocabulary,
        items: unit.vocabulary.items?.map((word: any) => ({
          word: word.word,
          phoneme: word.phoneme,
          definition: word.definition,
          example: word.example,
          word_class: word.word_class,
          // Campos adicionais só para professor
          ...(!isStudent && {
            context_relevance: word.context_relevance,
            frequency_level: word.frequency_level,
            is_reinforcement: word.is_reinforcement
          })
        }))
      } : null,

      // Sentences - filtrar metadados pedagógicos para estudante
      sentences: unit.sentences ? {
        ...unit.sentences,
        sentences: unit.sentences.sentences?.map((sentence: any) => ({
          text: sentence.text,
          vocabulary_used: sentence.vocabulary_used,
          context_situation: sentence.context_situation,
          complexity_level: sentence.complexity_level,
          // Campos pedagógicos só para professor
          ...(!isStudent && {
            reinforces_previous: sentence.reinforces_previous,
            introduces_new: sentence.introduces_new,
            phonetic_features: sentence.phonetic_features
          })
        }))
      } : null,

      // Tips/Grammar - sempre completo
      tips: unit.tips,
      grammar: unit.grammar,

      // Q&A - filtrar notas pedagógicas para estudante
      qa: unit.qa ? {
        ...unit.qa,
        questions: unit.qa.questions?.map((qa: any) => ({
          question: qa.question,
          answer: qa.answer,
          bloom_level: qa.bloom_level,
          difficulty: qa.difficulty,
          // Campos pedagógicos só para professor
          ...(!isStudent && {
            focus_area: qa.focus_area,
            pedagogical_notes: qa.pedagogical_notes
          })
        }))
      } : null,

      // Assessments - remover gabaritos para estudante
      assessments: unit.assessments ? {
        ...unit.assessments,
        activities: unit.assessments.activities?.map((assessment: any) => ({
          ...assessment,
          // Remover answer_key para estudante
          ...(isStudent && { answer_key: undefined })
        }))
      } : null,

      // Solve Assessments - filtrar dados sensíveis para estudante
      solve_assessments: unit.solve_assessments ? 
        Object.keys(unit.solve_assessments).reduce((acc: any, key) => {
          const result = unit.solve_assessments![key]
          
          if (isStudent) {
            // Versão estudante: apenas respostas e explicações básicas
            acc[key] = this.filterSolveResultsForStudent(result)
          } else {
            // Versão professor: dados completos
            acc[key] = result
          }
          
          return acc
        }, {}) : null
    }
  }

  /**
   * Filtrar resultados de solve_assessments para estudante
   */
  private filterSolveResultsForStudent(result: any) {
    // Detectar se é GabaritoResult ou SolveAssessmentResult
    if (result.items && Array.isArray(result.items)) {
      // GabaritoResult
      return {
        assessment_type: result.assessment_type,
        assessment_title: result.assessment_title,
        total_items: result.total_items,
        instructions: result.instructions,
        items: result.items.map((item: any) => ({
          question_text: item.question_text,
          correct_answer: item.correct_answer,
          explanation: item.explanation,
          difficulty_level: item.difficulty_level
          // Remove skills_tested para estudante
        })),
        skills_overview: result.skills_overview,
        solution_timestamp: result.solution_timestamp,
        ai_model_used: result.ai_model_used
        // Remove teaching_notes para estudante
      }
    } else if (result.item_corrections && Array.isArray(result.item_corrections)) {
      // SolveAssessmentResult
      return {
        assessment_type: result.assessment_type,
        assessment_title: result.assessment_title,
        total_score: result.total_score,
        total_possible: result.total_possible,
        accuracy_percentage: result.accuracy_percentage,
        performance_level: result.performance_level,
        item_corrections: result.item_corrections.map((correction: any) => ({
          item_id: correction.item_id,
          student_answer: correction.student_answer,
          correct_answer: correction.correct_answer,
          result: correction.result,
          feedback: correction.feedback
          // Remove l1_interference para estudante
        })),
        constructive_feedback: result.constructive_feedback,
        correction_timestamp: result.correction_timestamp,
        ai_model_used: result.ai_model_used
        // Remove error_analysis e pedagogical_notes para estudante
      }
    }
    
    return result
  }

  /**
   * Aplicar tema aos dados (para futuras customizações)
   */
  private applyTheme(data: any, theme: 'classico' | 'moderno') {
    // Por enquanto apenas retorna os dados
    // Futuramente pode incluir customizações específicas do tema
    return {
      ...data,
      theme_config: {
        name: theme,
        colors: theme === 'classico' ? {
          primary: '#003f7f',
          accent: '#0066cc', 
          highlight: '#cc0000'
        } : {
          primary: '#6366f1',
          accent: '#8b5cf6',
          highlight: '#f59e0b'
        }
      }
    }
  }

  /**
   * Obter seções omitidas
   */
  private getOmittedSections(unit: Unit, includedSections: string[]): string[] {
    const allPossibleSections = ['objectives', 'vocabulary', 'sentences', 'tips', 'grammar', 'qa', 'assessments', 'solve_assessments']
    return allPossibleSections.filter(section => !includedSections.includes(section))
  }

  /**
   * Simular progresso de geração (será substituído por WebSocket/polling real)
   */
  async getGenerationStatus(unitId: string): Promise<PDFGenerationStatus> {
    // Simular diferentes status de geração
    const statuses: PDFGenerationStatus[] = [
      { status: 'processing', progress: 25, message: 'Coletando dados da unidade...', estimated_time_remaining: 15 },
      { status: 'processing', progress: 50, message: 'Processando conteúdo educacional...', estimated_time_remaining: 10 },
      { status: 'processing', progress: 75, message: 'Aplicando tema visual...', estimated_time_remaining: 5 },
      { status: 'completed', progress: 100, message: 'PDF gerado com sucesso!' }
    ]

    // Retornar status aleatório para simulação
    return statuses[Math.floor(Math.random() * statuses.length)]
  }

  /**
   * Download do PDF (placeholder - será implementado com endpoint real)
   */
  async downloadPDF(unitId: string, version: string, theme: string): Promise<Blob> {
    // TODO: Implementar download real quando endpoints estiverem prontos
    // return this.request<Blob>(`/api/v2/units/${unitId}/download-pdf?version=${version}&theme=${theme}`)
    
    // Simulação de download
    const response = await fetch('data:application/pdf;base64,JVBERi0xLjQ...')
    return response.blob()
  }
}

// Instância singleton
export const pdfExportApi = new PDFExportApiClient()

// Note: Types are already exported above with their definitions