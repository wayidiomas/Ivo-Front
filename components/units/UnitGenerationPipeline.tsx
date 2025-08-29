"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { 
  Play,
  Square,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Activity,
  Sparkles,
  MessageSquare,
  BookOpen,
  Target,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Loader2,
  ChevronRight,
  Eye,
  Download,
  Brain
} from "lucide-react"
import { Unit } from "@/lib/types/api.types"
import { contentGenerationApi } from "@/lib/api/content-generation"

interface UnitGenerationPipelineProps {
  unit: Unit
  onPipelineComplete?: () => void
  onStepComplete?: (stepId: string) => void
}

interface PipelineStep {
  id: string
  name: string
  description: string
  icon: any
  status: 'pending' | 'running' | 'completed' | 'error'
  progress: number
  duration?: number
  startTime?: Date
  endTime?: Date
  details?: string
}

export default function UnitGenerationPipeline({ unit, onPipelineComplete, onStepComplete }: UnitGenerationPipelineProps) {
  const router = useRouter()
  const params = useParams()
  
  // Create unique keys for localStorage based on unit ID
  const pipelineStateKey = `pipeline_${unit?.id}_state`
  const pipelineLogKey = `pipeline_${unit?.id}_log`
  const pipelineStepsKey = `pipeline_${unit?.id}_steps`

  // Load initial state from localStorage
  const getInitialState = () => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(pipelineStateKey)
      if (savedState) {
        const parsed = JSON.parse(savedState)
        return {
          isGenerating: parsed.isGenerating || false,
          currentStep: parsed.currentStep || null,
          generationLog: parsed.generationLog || []
        }
      }
    }
    return {
      isGenerating: false,
      currentStep: null,
      generationLog: []
    }
  }

  const initialState = getInitialState()
  const [isGenerating, setIsGenerating] = useState(initialState.isGenerating)
  const [currentStep, setCurrentStep] = useState<string | null>(initialState.currentStep)
  const [generationLog, setGenerationLog] = useState<string[]>(initialState.generationLog)
  
  // Add custom CSS for animations
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = '@keyframes pulse-once { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } } .animate-pulse-once { animation: pulse-once 1.2s ease-in-out; } @keyframes step-glow { 0%, 100% { box-shadow: 0 0 3px rgba(0, 150, 150, 0.2); } 50% { box-shadow: 0 0 12px rgba(0, 150, 150, 0.4); } } .animate-step-glow { animation: step-glow 3s ease-in-out infinite; }'
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Initialize pipeline steps based on unit type
  const initializePipelineSteps = (): PipelineStep[] => {
    const baseSteps: PipelineStep[] = [
      {
        id: 'aims',
        name: 'Objetivos',
        description: 'Definir objetivos de aprendizagem CEFR',
        icon: Target,
        status: unit?.main_aim && unit?.main_aim?.trim() !== '' ? 'completed' : 'pending',
        progress: unit?.main_aim && unit?.main_aim?.trim() !== '' ? 100 : 0
      },
      {
        id: 'vocabulary',
        name: 'Vocabulário',
        description: 'Gerar vocabulário contextualizado',
        icon: Sparkles,
        status: unit?.vocabulary && Object.keys(unit?.vocabulary).length > 0 ? 'completed' : 'pending',
        progress: unit?.vocabulary && Object.keys(unit?.vocabulary).length > 0 ? 100 : 0
      },
      {
        id: 'sentences',
        name: 'Sentenças',
        description: 'Criar sentenças de exemplo',
        icon: MessageSquare,
        status: unit?.sentences && Object.keys(unit?.sentences).length > 0 ? 'completed' : 'pending',
        progress: unit?.sentences && Object.keys(unit?.sentences).length > 0 ? 100 : 0
      }
    ]

    // Add conditional steps based on unit type
    if (unit?.unit_type === 'grammar_unit') {
      baseSteps.push({
        id: 'grammar',
        name: 'Gramática',
        description: 'Explicação sistemática e interferências L1',
        icon: BookOpen,
        status: unit?.grammar && Object.keys(unit?.grammar).length > 0 ? 'completed' : 'pending',
        progress: unit?.grammar && Object.keys(unit?.grammar).length > 0 ? 100 : 0
      })
    }

    if (unit?.unit_type === 'lexical_unit') {
      baseSteps.push({
        id: 'tips',
        name: 'Dicas',
        description: 'Estratégias de aprendizagem e memorização',
        icon: Lightbulb,
        status: unit?.tips && Object.keys(unit?.tips).length > 0 ? 'completed' : 'pending',
        progress: unit?.tips && Object.keys(unit?.tips).length > 0 ? 100 : 0
      })
    }

    // Always add final steps
    baseSteps.push(
      {
        id: 'assessments',
        name: 'Avaliações',
        description: 'Criar exercícios variados',
        icon: CheckCircle2,
        status: unit?.assessments && Object.keys(unit?.assessments).length > 0 ? 'completed' : 'pending',
        progress: unit?.assessments && Object.keys(unit?.assessments).length > 0 ? 100 : 0
      },
      {
        id: 'qa',
        name: 'Q&A',
        description: 'Gerar questões para discussão',
        icon: HelpCircle,
        status: unit?.qa && Object.keys(unit?.qa).length > 0 ? 'completed' : 'pending',
        progress: unit?.qa && Object.keys(unit?.qa).length > 0 ? 100 : 0
      },
      {
        id: 'assessments-solving',
        name: 'Gabarito Ivo',
        description: 'Geração automática de gabaritos para todos os assessments',
        icon: Brain,
        // CORREÇÃO: Verificar se TODOS os assessments têm gabarito gerado
        status: (() => {
          if (!unit?.assessments?.activities || !unit?.solve_assessments) return 'pending'
          const assessmentTypes = unit.assessments.activities.map(a => a.type)
          const solvedTypes = Object.keys(unit.solve_assessments)
          const allSolved = assessmentTypes.every(type => solvedTypes.includes(type))
          return allSolved ? 'completed' : 'pending'
        })(),
        progress: (() => {
          if (!unit?.assessments?.activities || !unit?.solve_assessments) return 0
          const assessmentTypes = unit.assessments.activities.map(a => a.type)
          const solvedTypes = Object.keys(unit.solve_assessments)
          const allSolved = assessmentTypes.every(type => solvedTypes.includes(type))
          return allSolved ? 100 : 0
        })()
      }
    )

    return baseSteps
  }

  // Map icon names back to components
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      'Sparkles': Sparkles,
      'MessageSquare': MessageSquare,
      'Target': Target,
      'BookOpen': BookOpen,
      'Lightbulb': Lightbulb,
      'CheckCircle2': CheckCircle2,
      'HelpCircle': HelpCircle,
      'Brain': Brain
    }
    return iconMap[iconName] || Sparkles
  }

  // Load pipeline steps from localStorage or initialize
  const getInitialPipelineSteps = () => {
    if (typeof window !== 'undefined') {
      const savedSteps = localStorage.getItem(pipelineStepsKey)
      if (savedSteps) {
        try {
          const parsed = JSON.parse(savedSteps)
          // Validate that parsed data has the expected structure
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Merge saved state with fresh initialization (to get icons)
            const freshSteps = initializePipelineSteps()
            return freshSteps.map(freshStep => {
              const savedStep = parsed.find(s => s.id === freshStep.id)
              if (savedStep) {
                return {
                  ...freshStep, // Keep icon and other fresh data
                  ...savedStep,  // Override with saved progress/state
                  icon: freshStep.icon // Always use fresh icon
                }
              }
              return freshStep
            })
          }
        } catch (error) {
          console.warn('Error parsing saved pipeline steps:', error)
          // Clear corrupted data
          localStorage.removeItem(pipelineStepsKey)
        }
      }
    }
    return initializePipelineSteps()
  }

  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(getInitialPipelineSteps())
  const [isNavigating, setIsNavigating] = useState(false)

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stateToSave = {
        isGenerating,
        currentStep,
        generationLog
      }
      localStorage.setItem(pipelineStateKey, JSON.stringify(stateToSave))
    }
  }, [isGenerating, currentStep, generationLog, pipelineStateKey])

  // Save pipeline steps to localStorage whenever they change (without icons)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stepsToSave = pipelineSteps.map(step => ({
        id: step.id,
        name: step.name,
        description: step.description,
        status: step.status,
        progress: step.progress,
        duration: step.duration,
        startTime: step.startTime,
        endTime: step.endTime,
        details: step.details
        // Don't save icon component
      }))
      localStorage.setItem(pipelineStepsKey, JSON.stringify(stepsToSave))
    }
  }, [pipelineSteps, pipelineStepsKey])

  // Update pipeline steps when unit changes - BUT ONLY when pipeline is not active
  useEffect(() => {
    // PROTEÇÃO: Não sobrescrever estado do pipeline durante execução
    if (!isGenerating) {
      console.log('🔄 Updating pipeline steps based on unit data (pipeline inactive)')
      setPipelineSteps(initializePipelineSteps())
    } else {
      console.log('⏸️ Skipping pipeline steps update - pipeline is running')
    }
  }, [unit?.unit_type, unit?.vocabulary, unit?.sentences, unit?.grammar, unit?.tips, unit?.assessments, unit?.qa, unit?.solve_assessments, unit?.main_aim, isGenerating])

  // Clean up localStorage when pipeline truly completes (only clear after user explicitly starts a new generation)
  useEffect(() => {
    const overallProgress = (pipelineSteps.reduce((acc, step) => acc + step.progress, 0) / pipelineSteps.length)
    const allStepsCompleted = pipelineSteps.every(step => step.status === 'completed')
    
    // Only clear localStorage when pipeline is truly done AND user has seen the completion
    if (overallProgress === 100 && allStepsCompleted && !isGenerating) {
      // Don't auto-clear - let user navigate freely. Only clear when they explicitly restart
      console.log('Pipeline completed, but keeping state for navigation persistence')
    }
  }, [pipelineSteps, isGenerating, pipelineStateKey, pipelineStepsKey])

  // Real API pipeline generation
  const runPipeline = async (startFromStep?: string) => {
    setIsGenerating(true)
    setGenerationLog([])
    
    // Filtrar steps que precisam ser executados (excluir 'aims' que já existe)
    let stepsToRun = pipelineSteps.filter(step => step.status === 'pending' && step.id !== 'aims')
    
    if (startFromStep) {
      const startIndex = pipelineSteps.findIndex(step => step.id === startFromStep)
      const hasIncompleteDependencies = pipelineSteps
        .slice(0, startIndex)
        .some(step => step.status !== 'completed')
      
      if (hasIncompleteDependencies) {
        setGenerationLog(prev => [...prev, '⚠️ Dependências não atendidas. Iniciando do começo...'])
        stepsToRun = pipelineSteps.filter(step => step.status === 'pending' && step.id !== 'aims')
      } else {
        stepsToRun = pipelineSteps.slice(startIndex).filter(step => step.status === 'pending' && step.id !== 'aims')
      }
    }
    
    if (stepsToRun.length === 0) {
      setGenerationLog(prev => [...prev, '✨ Todos os passos já foram concluídos!'])
      setIsGenerating(false)
      return
    }
    
    setGenerationLog(prev => [...prev, `🚀 Iniciando pipeline real da API: ${stepsToRun.length} etapa(s) para processar`])
    
    try {
      // Configurações da unidade para API (valores padrão ou personalizáveis)
      const config = {
        vocabulary_target_count: (unit as any).vocabulary_target_count || 15,
        sentences_target_count: (unit as any).sentences_target_count || 10,
        qa_target_count: (unit as any).qa_target_count || 8,
        assessment_count: (unit as any).assessment_count || 2,
        is_revision_unit: (unit as any).is_revision_unit || false,
        unit_type: unit?.unit_type as 'lexical_unit' | 'grammar_unit'
      }

      setGenerationLog(prev => [...prev, `⚙️ Configurações: ${JSON.stringify(config, null, 2)}`])

      // Executar steps sequencialmente com API real
      for (const step of stepsToRun) {
        setCurrentStep(step.id)
        
        setPipelineSteps(prev => prev.map(s => 
          s.id === step.id 
            ? { ...s, status: 'running', startTime: new Date(), progress: 0 }
            : s
        ))

        setGenerationLog(prev => [...prev, `⚡ Processando: ${step.name} via API...`])

        try {
          let result = null
          const startTime = Date.now()


          // Chamar API baseado no step
          switch (step.id) {
            case 'vocabulary':
              setPipelineSteps(prev => prev.map(s => 
                s.id === step.id ? { ...s, progress: 20 } : s
              ))
              result = await contentGenerationApi.generateVocabulary(unit?.id, {
                target_count: config.vocabulary_target_count,
                difficulty_level: 'intermediate',
                is_revision_unit: config.is_revision_unit, // USANDO PARÂMETRO REAL
                avoid_repetition: true,
                ipa_variant: 'general_american'
              })
              break

            case 'sentences':
              setPipelineSteps(prev => prev.map(s => 
                s.id === step.id ? { ...s, progress: 20 } : s
              ))
              result = await contentGenerationApi.generateSentences(unit?.id, {
                target_count: config.sentences_target_count,
                complexity_level: 'basic'
              })
              break

            case 'tips':
              if (config.unit_type === 'lexical_unit') {
                console.log(`🔧 Generating tips for lexical unit ${unit?.id}...`)
                setPipelineSteps(prev => prev.map(s => 
                  s.id === step.id ? { ...s, progress: 20 } : s
                ))
                result = await contentGenerationApi.generateTips(unit?.id, {
                  strategy_count: 2,
                  focus_type: 'vocabulary',
                  include_l1_warnings: true
                })
                console.log(`💡 Tips generation result:`, { success: result?.success, message: result?.message })
              } else {
                console.log(`⏭️ Skipping tips for grammar unit`)
                result = { success: true, message: 'Tips skipped for grammar unit' }
              }
              break

            case 'grammar':
              if (config.unit_type === 'grammar_unit') {
                setPipelineSteps(prev => prev.map(s => 
                  s.id === step.id ? { ...s, progress: 20 } : s
                ))
                result = await contentGenerationApi.generateGrammar(unit?.id, {
                  strategy_count: 2,
                  grammar_focus: 'unit_based',
                  connect_to_vocabulary: true
                })
              } else {
                // Skip grammar for non-grammar units with success
                result = { success: true, message: 'Grammar skipped for lexical unit' }
              }
              break

            case 'qa':
              setPipelineSteps(prev => prev.map(s => 
                s.id === step.id ? { ...s, progress: 20 } : s
              ))
              result = await contentGenerationApi.generateQA(unit?.id, {
                target_count: config.qa_target_count,
                bloom_levels: ['remember', 'understand', 'apply'],
                difficulty_progression: true
              })
              break

            case 'assessments':
              setPipelineSteps(prev => prev.map(s => 
                s.id === step.id ? { ...s, progress: 20 } : s
              ))
              result = await contentGenerationApi.generateAssessments(unit?.id, {
                assessment_count: config.assessment_count,
                difficulty_distribution: 'balanced',
                connect_to_content: true,
                ensure_variety: true
              })
              break

            case 'assessments-solving':
              // CORREÇÃO: Buscar assessments diretamente da API ao invés de confiar no state
              console.log('🔄 Buscando assessments diretamente da API...')
              let apiAssessments = null
              try {
                const assessmentResponse = await contentGenerationApi.getAssessments(unit?.id)
                if (assessmentResponse.success && assessmentResponse.data?.assessments?.activities) {
                  apiAssessments = assessmentResponse.data.assessments.activities
                  console.log('✅ Assessments obtidos da API:', apiAssessments.length, 'items')
                } else {
                  console.log('⚠️ API não retornou assessments válidos')
                }
              } catch (apiError) {
                console.log('❌ Erro ao buscar assessments da API:', apiError)
              }
              
              // Usar assessments da API se disponível, senão usar do state
              const availableAssessments = apiAssessments || unit?.assessments?.activities || []
              
              console.log('🔍 DEBUG ASSESSMENTS:')
              console.log('🔍 unit?.assessments:', unit?.assessments)
              console.log('🔍 apiAssessments:', apiAssessments)
              console.log('🔍 availableAssessments (final):', availableAssessments)
              console.log('🔍 availableAssessments.map(types):', availableAssessments.map((a: any) => ({ 
                type: a.type, 
                title: a.title,
                id: a.id 
              })))
              3
              if (availableAssessments.length === 0) {
                console.log(`❌ Erro: Nenhum assessment encontrado nem no state nem na API`)
                throw new Error('Nenhum assessment disponível para geração de gabarito. Verifique se a etapa de Assessments foi executada corretamente.')
              }

              console.log(`🧠 Gabarito Ivo: Processando ${availableAssessments.length} assessments...`)
              
              // CORREÇÃO: Progresso inicial padrão como outras seções
              setPipelineSteps(prev => prev.map(s => 
                s.id === step.id ? { ...s, progress: 20 } : s
              ))

              // Usar Promise.allSettled para ser mais robusto
              const promises = availableAssessments.map(async (assessment: any) => {
                try {
                  console.log(`🎯 Gerando gabarito para: ${assessment.type}`)
                  const assessmentResult = await contentGenerationApi.solveOrGenerateGabarito(unit?.id, {
                    assessment_type: assessment.type,
                    include_explanations: true,
                    difficulty_analysis: true,
                    // Campos antigos para fallback
                    include_student_answers: false,
                    student_context: 'Geração automática de gabarito pelo sistema Ivo'
                  })
                  
                  if (assessmentResult.success) {
                    console.log(`✅ ${assessment.type} gabarito gerado com sucesso`)
                    return {
                      type: assessment.type,
                      title: assessment.title,
                      success: true,
                      result: assessmentResult.data.gabarito_result || assessmentResult.data.correction_result
                    }
                  } else {
                    console.log(`❌ Erro ao gerar gabarito ${assessment.type}: ${assessmentResult.message}`)
                    return {
                      type: assessment.type, 
                      title: assessment.title,
                      success: false,
                      error: assessmentResult.message
                    }
                  }
                } catch (error) {
                  console.log(`❌ Erro ao gerar gabarito ${assessment.type}:`, error)
                  return {
                    type: assessment.type,
                    title: assessment.title, 
                    success: false,
                    error: error instanceof Error ? error.message : String(error)
                  }
                }
              })

              // CORREÇÃO: Aguardar TODAS as promises terminarem primeiro
              console.log('🔄 Aguardando todas as promises do gabarito terminarem...')
              const results = await Promise.allSettled(promises)
              console.log('✅ Todas as promises do gabarito terminaram')
              
              const allResults = results.map(r => r.status === 'fulfilled' ? r.value : {
                type: 'unknown',
                title: 'Unknown',
                success: false,
                error: 'Promise foi rejeitada'
              })

              // CORREÇÃO: Só calcular resultado APÓS todas terminarem
              const successCount = allResults.filter(r => r.success).length
              const totalCount = allResults.length
              
              // CORREÇÃO: Definir result ANTES de qualquer update de progresso
              result = {
                success: successCount > 0,
                message: `Gabarito Ivo: ${successCount}/${totalCount} gabaritos gerados com sucesso`,
                data: { 
                  results: allResults,
                  summary: {
                    total: totalCount,
                    success: successCount,
                    failed: totalCount - successCount
                  }
                }
              }
              
              console.log(`🎯 Gabarito Ivo finalizado: ${successCount}/${totalCount} gabaritos gerados`)
              
              // CORREÇÃO: Progress update final removido - deixar o loop principal cuidar disso
              // O loop principal vai definir progress: 100 quando result.success for true
              break
          }

          const duration = Date.now() - startTime

          if (result && result.success) {
            setPipelineSteps(prev => prev.map(s => 
              s.id === step.id 
                ? { 
                    ...s, 
                    status: 'completed', 
                    progress: 100, 
                    endTime: new Date(),
                    duration
                  }
                : s
            ))
            setGenerationLog(prev => [...prev, `✅ ${step.name} concluído com sucesso! (${duration}ms)`])
            
            // Notificar step individual completado para refresh em tempo real
            console.log(`🔄 Step ${step.id} marked as completed, triggering refresh...`)
            if (onStepComplete) {
              onStepComplete(step.id)
            }
            
            // CORREÇÃO: Aguardar mais tempo após assessments para garantir que dados sejam atualizados
            if (step.id === 'assessments') {
              console.log('⏳ Aguardando refresh dos assessments antes de continuar para gabarito...')
              await new Promise(resolve => setTimeout(resolve, 5000)) // 5 segundos extras
            }
          } else {
            throw new Error(result?.message || 'Resposta inválida da API')
          }

        } catch (stepError: any) {
          console.error(`Erro no step ${step.id}:`, stepError)
          setPipelineSteps(prev => prev.map(s => 
            s.id === step.id 
              ? { ...s, status: 'error', progress: 0 }
              : s
          ))
          setGenerationLog(prev => [...prev, `❌ Erro em ${step.name}: ${stepError.message}`])
          
          // Continue com outros steps mesmo se um falhar
          continue
        }

        // Aguardar mais tempo entre steps para garantir processamento e salvamento
        await new Promise(resolve => setTimeout(resolve, 3000))
      }

      setCurrentStep(null)
      setIsGenerating(false)
      setGenerationLog(prev => [...prev, '🎉 Pipeline concluído! Conteúdo gerado via API.'])
      
      // Salvar estado final no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(pipelineStateKey, JSON.stringify({
          isGenerating: false,
          currentStep: null,
          generationLog: [...generationLog, '🎉 Pipeline concluído! Conteúdo gerado via API.'],
          completedAt: new Date().toISOString()
        }))
      }
      
      // Notificar conclusão para refresh do conteúdo (com delay para garantir salvamento)
      setTimeout(() => {
        if (onPipelineComplete) {
          console.log('🔔 Notifying pipeline completion...')
          onPipelineComplete()
        }
      }, 500)

    } catch (error: any) {
      console.error('Erro geral no pipeline:', error)
      setGenerationLog(prev => [...prev, `❌ Erro geral no pipeline: ${error.message}`])
      setIsGenerating(false)
      setCurrentStep(null)
    }
  }
  
  // Run specific step (with dependency check)
  const runFromStep = (stepId: string) => {
    if (isGenerating) return
    
    // Não permitir regenerar 'aims' (objetivos já existem)
    if (stepId === 'aims') {
      setGenerationLog(prev => [...prev, '⚠️ Objetivos não podem ser regenerados - já foram definidos na criação da unidade.'])
      return
    }
    
    // Reset the target step and all subsequent steps to 'pending' for regeneration
    setPipelineSteps(prev => prev.map(step => {
      const stepIndex = prev.findIndex(s => s.id === stepId)
      const currentIndex = prev.findIndex(s => s.id === step.id)
      
      if (currentIndex >= stepIndex) {
        // Não resetar 'aims' mesmo se for subsequente
        if (step.id === 'aims') {
          return step
        }
        
        return {
          ...step,
          status: 'pending' as const,
          progress: 0,
          startTime: undefined,
          endTime: undefined,
          duration: undefined
        }
      }
      return step
    }))
    
    // Run pipeline from this step
    setTimeout(() => runPipeline(stepId), 100) // Small delay to allow state update
  }
  
  // Restart entire pipeline
  const restartPipeline = () => {
    if (isGenerating) return
    
    // Reset all steps to pending (exceto 'aims' que já existe)
    setPipelineSteps(prev => prev.map(step => {
      if (step.id === 'aims') {
        // Manter 'aims' como completed se já tem main_aim
        return {
          ...step,
          status: unit?.main_aim && unit?.main_aim?.trim() !== '' ? 'completed' as const : 'pending' as const,
          progress: unit?.main_aim && unit?.main_aim?.trim() !== '' ? 100 : 0
        }
      }
      
      return {
        ...step,
        status: 'pending' as const,
        progress: 0,
        startTime: undefined,
        endTime: undefined,
        duration: undefined
      }
    }))
    
    setGenerationLog([])
    runPipeline()
  }
  
  // Stop generation
  const stopGeneration = () => {
    setIsGenerating(false)
    setCurrentStep(null)
    setGenerationLog(prev => [...prev, '⏸️ Geração pausada pelo usuário'])
  }

  // Clear pipeline state (useful for debugging or reset)
  const clearPipelineState = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(pipelineStateKey)
      localStorage.removeItem(pipelineStepsKey)
    }
    setIsGenerating(false)
    setCurrentStep(null)
    setGenerationLog([])
    setPipelineSteps(initializePipelineSteps())
  }

  // Navigate to content section (with protection against rapid clicks)
  const navigateToContent = async (sectionId: string) => {
    if (isNavigating) {
      console.log('Navigation already in progress, skipping...')
      return
    }
    
    setIsNavigating(true)
    
    try {
      // Mapear IDs do pipeline para IDs das seções de conteúdo
      const sectionMap: Record<string, string> = {
        'aims': 'aims',
        'vocabulary': 'vocabulary',
        'sentences': 'sentences',
        'tips': 'tips',
        'grammar': 'grammar',
        'assessments': 'assessments',
        'qa': 'qa',
        'assessments-solving': 'assessments-solving'
      }
      
      const targetSection = sectionMap[sectionId]
      if (targetSection) {
        // Limpar URL atual e definir nova de forma limpa
        const cleanUrl = `${window.location.pathname}?tab=content&section=${targetSection}`
        
        // Update URL imediatamente
        window.history.replaceState({}, '', cleanUrl)
        
        // Disparar evento customizado para forçar re-render
        window.dispatchEvent(new PopStateEvent('popstate'))
        
        // Router backup
        router.replace(cleanUrl)
        
        console.log(`Navegando para seção: ${targetSection}`)
        
        // Small delay to ensure navigation completes
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } finally {
      setIsNavigating(false)
    }
  }

  const getStatusIcon = (status: string, isActive: boolean = false) => {
    if (isActive && status === 'running') {
      return <Loader2 className="h-4 w-4 animate-spin text-primary" />
    }
    
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-primary" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-gray-400" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-500/20 bg-green-500/10 dark:border-green-500/30 dark:bg-green-500/15'
      case 'running': return 'border-primary/30 bg-primary/10 dark:border-primary/40 dark:bg-primary/15'
      case 'error': return 'border-red-500/30 bg-red-500/10 dark:border-red-500/40 dark:bg-red-500/15'
      default: return 'border-muted bg-muted/20 dark:border-muted dark:bg-muted/30'
    }
  }

  const overallProgress = (pipelineSteps.reduce((acc, step) => acc + step.progress, 0) / pipelineSteps.length)
  const completedSteps = pipelineSteps.filter(step => step.status === 'completed').length
  const hasErrors = pipelineSteps.some(step => step.status === 'error')
  const hasPendingSteps = pipelineSteps.some(step => step.status === 'pending')

  return (
    <div className="space-y-6 w-full max-w-none">

      {/* Pipeline Overview */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Pipeline de Geração
          </CardTitle>
          <CardDescription>
            Processo automatizado de criação de conteúdo para a unidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm">Progresso Geral</div>
              <div className="flex items-center gap-3">
                <span className="text-sm">{completedSteps}/{pipelineSteps.length} seções</span>
                {hasErrors && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Erro
                  </Badge>
                )}
                {isGenerating ? (
                  <Badge className="bg-primary text-xs">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    Gerando...
                  </Badge>
                ) : overallProgress === 100 ? (
                  <Badge className="bg-green-600 text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    Pendente
                  </Badge>
                )}
              </div>
            </div>
            <div className="relative">
              <Progress value={overallProgress} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1 relative">
                <span>0%</span>
                {overallProgress >= 100 ? (
                  <span className="text-green-600 font-medium animate-pulse">✨ Completo</span>
                ) : (
                  <span>100%</span>
                )}
                {/* Indicador dinâmico da porcentagem atual - ABAIXO da barra */}
                <div 
                  className="absolute top-0 transform -translate-x-1/2 transition-all duration-500 ease-out"
                  style={{ left: `${Math.min(overallProgress, 95)}%` }}
                >
                  {overallProgress >= 100 ? (
                    <>
                      <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-green-600 mx-auto mb-1"></div>
                      <div className="bg-green-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow-lg whitespace-nowrap animate-bounce flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Concluído
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-0 h-0 border-l-2 border-r-2 border-b-2 border-transparent border-b-primary mx-auto mb-1"></div>
                      <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium shadow-lg whitespace-nowrap">
                        {overallProgress.toFixed(0)}%
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Button 
              onClick={() => runPipeline()}
              disabled={isGenerating}
              className="bg-gradient-to-r from-primary to-accent text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl border-0"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : hasPendingSteps ? (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Gerar Conteúdo
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Gerar Novamente
                </>
              )}
            </Button>
            
            {isGenerating ? (
              <Button 
                variant="outline" 
                onClick={stopGeneration}
                className="border-orange-300 text-orange-600 hover:bg-orange-50"
              >
                <Square className="h-4 w-4 mr-2" />
                Parar
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={restartPipeline}
                disabled={overallProgress === 0}
                className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Reiniciar
              </Button>
            )}
              
          </div>

        </CardContent>
      </Card>

      {/* Pipeline Steps */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Etapas do Pipeline</CardTitle>
          <CardDescription>
            Acompanhe o progresso de cada seção de conteúdo
          </CardDescription>
        </CardHeader>
        <CardContent>
          
          <div className="space-y-4">
            {pipelineSteps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              
              return (
                <div key={step.id} className="w-full">
                  <div className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-500 transform w-full ${
                    getStatusColor(step.status)
                  } ${isActive ? 'ring-2 ring-primary scale-[1.01] shadow-lg animate-step-glow relative z-50' : 'hover:shadow-md hover:scale-[1.005] relative z-0'} ${
                    step.status === 'completed' ? 'animate-pulse-once' : ''
                  }`}>
                    
                    {/* Step Icon and Status */}
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        {getStatusIcon(step.status, isActive)}
                      </div>
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    {/* Step Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{step.name}</h4>
                        {step.duration && (
                          <Badge variant="secondary" className="text-xs">
                            {(step.duration / 1000).toFixed(1)}s
                          </Badge>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      {(step.status === 'running' || step.progress > 0) && (
                        <div className="mt-2">
                          <Progress value={step.progress} className="h-2" />
                        </div>
                      )}
                    </div>

                    {/* Step Actions */}
                    <div className="flex items-center gap-1">
                      {step.status === 'completed' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="hover:bg-blue-50 hover:text-blue-600"
                            onClick={() => navigateToContent(step.id)}
                            title="Visualizar conteúdo"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {/* Não mostrar botão de regeneração para 'aims' */}
                          {step.id !== 'aims' && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              className="hover:bg-orange-50 hover:text-orange-600"
                              onClick={() => runFromStep(step.id)}
                              title="Regenerar esta etapa"
                            >
                              <RefreshCw className="h-3 w-3" />
                            </Button>
                          )}
                        </>
                      )}
                      {step.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="hover:bg-gradient-to-r hover:from-red-500 hover:to-blue-500 transition-all"
                          onClick={() => runFromStep(step.id)}
                          disabled={isGenerating}
                          title="Executar a partir desta etapa"
                        >
                          <Play className="h-3 w-3 text-white" />
                        </Button>
                      )}
                      <ChevronRight className={`h-4 w-4 transition-colors ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`} />
                    </div>
                  </div>
                  
                  {/* Connector Line */}
                  {index < pipelineSteps.length - 1 && (
                    <div className="flex justify-start ml-6">
                      <div className={`w-px h-4 transition-colors duration-500 ${
                        step.status === 'completed' && pipelineSteps[index + 1]?.status === 'running'
                          ? 'bg-primary animate-pulse'
                          : step.status === 'completed' && pipelineSteps[index + 1]?.status === 'completed'
                          ? 'bg-green-500'
                          : 'bg-border'
                      }`}></div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </CardContent>
      </Card>

      {/* Generation Log */}
      {/* {generationLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Log de Geração
            </CardTitle>
            <CardDescription>
              Acompanhe o progresso em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
              {generationLog.map((log, index) => (
                <div key={index} className="mb-1">
                  <span className="text-slate-500">[{new Date().toLocaleTimeString()}]</span> {log}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )} */}

      {/* Export Options - MOVIDO PARA ABA "LIVROS IVO" */}
      {/* <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            Exportar Conteúdo
          </CardTitle>
          <CardDescription>
            Baixe o conteúdo gerado nos formatos para estudante e professor
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center gap-6 flex-wrap">
            <Button 
              variant="outline" 
              size="default" 
              disabled={overallProgress < 100}
              className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:hover:shadow-none"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF Estudante
            </Button>
            <Button 
              variant="outline" 
              size="default" 
              disabled={overallProgress < 100}
              className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:text-white transition-all duration-300 shadow-lg hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500 disabled:hover:shadow-none"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF Professor
            </Button>
          </div>
        </CardContent>
      </Card> */}

    </div>
  )
}