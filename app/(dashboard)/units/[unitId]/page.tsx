"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  BookOpen, 
  GraduationCap, 
  Settings, 
  Image as ImageIcon,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Info,
  Edit,
  Save,
  X
} from "lucide-react"
import { Unit } from "@/lib/types/api.types"
import UnitConfigurationForm from "@/components/units/UnitConfigurationForm"
import UnitContentSections from "@/components/units/UnitContentSections"
import UnitGenerationPipeline from "@/components/units/UnitGenerationPipeline"
import UnitPDFExport from "@/components/units/UnitPDFExport"

interface UnitDetailPageProps {}

export default function UnitDetailPage({}: UnitDetailPageProps) {
  const params = useParams()
  const router = useRouter()
  const unitId = params.unitId as string
  
  // Get current URL params
  const [urlParams, setUrlParams] = useState<{ tab: string | null; section: string | null }>({
    tab: null,
    section: null
  })

  const [unit, setUnit] = useState<Unit | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("pipeline")
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update URL params and active tab on mount and URL changes
  useEffect(() => {
    const updateFromUrl = () => {
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search)
        const tab = searchParams.get('tab')
        const section = searchParams.get('section')
        
        setUrlParams({ tab, section })
        setActiveTab(tab || "pipeline")
      }
    }

    updateFromUrl()
    
    // Listen for URL changes
    window.addEventListener('popstate', updateFromUrl)
    
    return () => {
      window.removeEventListener('popstate', updateFromUrl)
    }
  }, [])

  // Handle tab change from UI clicks
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
    
    // Update URL
    const newUrl = `${window.location.pathname}?tab=${newTab}`
    window.history.pushState({}, '', newUrl)
    
    // Update local state
    setUrlParams({ tab: newTab, section: null })
    
    // Se mudou para 'content' e acabou de completar pipeline, forçar refresh
    if (newTab === 'content' && unit) {
      console.log('🔄 Switched to content tab, ensuring data is fresh...')
      refreshUnitData('tab-switch-content')
    }
  }

  // Debounced refresh function to prevent race conditions
  const refreshUnitData = async (reason = 'update', forceRefresh = false) => {
    if (!unitId) {
      console.error('🚨 CRITICAL: unitId is undefined/null, cannot refresh')
      return
    }
    
    if (isRefreshing && !forceRefresh) {
      console.log(`🚫 Refresh already in progress, skipping ${reason}...`)
      return
    }
    
    console.log(`🔄 Starting refresh for unit ${unitId} (${reason})...`)
    setIsRefreshing(true)
    
    try {
      const { unitsApi } = await import('@/lib/api/units')
      console.log(`📡 Making API call to getUnit(${unitId})...`)
      
      const response = await unitsApi.getUnit(unitId)
      console.log(`📥 API response received:`, { 
        success: response.success, 
        hasData: !!response.data,
        hasUnitData: !!response.data?.unit_data,
        dataKeys: response.data ? Object.keys(response.data) : null,
        reason 
      })
      
      if (response.success && response.data) {
        const oldUnit = unit // Pode ser null na primeira chamada
        // Tentar unit_data primeiro, depois unit como fallback
        const newUnit = response.data.unit_data || (response.data as any).unit
        
        if (!newUnit) {
          console.warn(`⚠️ No unit data found in response:`, response.data)
          return
        }
        
        setUnit(newUnit)
        console.log(`✅ Unit data refreshed successfully (${reason})`)
        
        // Detailed content status logging
        console.log(`📊 Content status after ${reason}:`, {
          vocabulary: newUnit?.vocabulary ? Object.keys(newUnit.vocabulary).length : 0,
          sentences: newUnit?.sentences ? Object.keys(newUnit.sentences).length : 0,
          tips: newUnit?.tips ? Object.keys(newUnit.tips).length : 0,
          grammar: newUnit?.grammar ? Object.keys(newUnit.grammar).length : 0,
          qa: newUnit?.qa?.questions ? newUnit.qa.questions.length : 0,
          assessments: newUnit?.assessments?.activities ? newUnit.assessments.activities.length : 0,
          main_aim: !!newUnit?.main_aim
        })
        
        // Safe comparison - oldUnit pode ser null
        if (oldUnit) {
          console.log(`📊 Unit update comparison:`, {
            vocabulary: { old: !!oldUnit?.vocabulary, new: !!newUnit?.vocabulary },
            sentences: { old: !!oldUnit?.sentences, new: !!newUnit?.sentences },
            tips: { old: !!oldUnit?.tips, new: !!newUnit?.tips },
            qa: { old: !!oldUnit?.qa, new: !!newUnit?.qa }
          })
        }
      } else {
        console.warn(`⚠️ Unit refresh failed (${reason}):`, response)
        // Não mostrar erro pro usuário, continuar com dados atuais
      }
    } catch (error) {
      console.error(`❌ CRITICAL ERROR refreshing unit data (${reason}):`, {
        error,
        message: (error as any)?.message,
        unitId,
        timestamp: new Date().toISOString()
      })
      
      // Em caso de erro, não quebrar a UI - manter dados existentes
      if ((error as any)?.message?.includes('404') || (error as any)?.message?.includes('not found')) {
        console.error('🚨 CRITICAL: Unit not found during pipeline - DEBUGGING INFO:', {
          unitId,
          reason,
          currentUnit: !!unit,
          isRefreshing,
          timestamp: new Date().toISOString()
        })
        setError('Unidade não encontrada. Recarregue a página.')
      }
    } finally {
      setIsRefreshing(false)
    }
  }

  // Handle individual step completion - SYNCHRONOUS refresh for pipeline reliability
  const handleStepComplete = async (stepId: string) => {
    console.log(`🎯 Step ${stepId} completed, refreshing data synchronously...`)
    
    // CANCELAR timeout anterior se existir (limpeza de segurança)
    if (refreshTimeoutRef.current) {
      console.log(`🧹 Cleaning up previous refresh timeout...`)
      clearTimeout(refreshTimeoutRef.current)
      refreshTimeoutRef.current = null
    }
    
    try {
      // Refresh SÍNCRONO para garantir que próximo step veja dados atualizados
      console.log(`🔄 Starting synchronous refresh for step ${stepId}...`)
      await refreshUnitData(`step-${stepId}-complete`, true) // forceRefresh = true
      console.log(`✅ Step ${stepId} refresh completed, pipeline can continue safely`)
    } catch (error) {
      console.error(`❌ Error refreshing data after step ${stepId}:`, error)
      // Não quebrar o pipeline por erro de refresh - melhor continuar
    }
  }

  // Handle pipeline completion - refresh unit data with delay
  const handlePipelineComplete = async () => {
    console.log('🎉 Pipeline completed, scheduling final refresh in 3s...')
    
    // Cancelar qualquer refresh pendente
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }
    
    // Delay para garantir que o backend processou tudo
    setTimeout(async () => {
      console.log('⏰ Executing final pipeline refresh...')
      await refreshUnitData('pipeline-complete-final', true) // forceRefresh = true
      
      // Forçar re-render dos componentes
      setIsRefreshing(false)
    }, 3000)
  }

  // Real API call
  useEffect(() => {
    const fetchUnit = async () => {
      try {
        setIsLoading(true)
        
        // Import the API client dynamically to avoid SSR issues
        const { unitsApi } = await import('@/lib/api/units')
        const response = await unitsApi.getUnit(unitId)
        
        if (response.success) {
          setUnit(response.data.unit_data)
        } else {
          throw new Error(response.message || 'Erro ao carregar unidade')
        }
      } catch (err) {
        setError("Erro ao carregar unidade")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    if (unitId) {
      fetchUnit()
    }
  }, [unitId])

  const handleSave = async (updatedUnit: Partial<Unit>) => {
    try {
      // API call to save unit
      console.log("Saving unit:", updatedUnit)
      
      setUnit(prev => prev ? { ...prev, ...updatedUnit } : null)
      setIsEditing(false)
      
      // Show success message or toast
    } catch (error) {
      console.error("Error saving unit:", error)
      setError("Erro ao salvar unidade")
    }
  }

  const getStatusInfo = (status: string) => {
    const statusMap = {
      'creating': { color: 'bg-blue-500', text: 'Criando', icon: Play },
      'vocab_pending': { color: 'bg-yellow-500', text: 'Vocabulário Pendente', icon: Pause },
      'sentences_pending': { color: 'bg-yellow-500', text: 'Sentenças Pendentes', icon: Pause },
      'content_pending': { color: 'bg-orange-500', text: 'Conteúdo Pendente', icon: AlertCircle },
      'completed': { color: 'bg-green-500', text: 'Concluído', icon: CheckCircle },
      'error': { color: 'bg-red-500', text: 'Erro', icon: X }
    }
    
    return statusMap[status as keyof typeof statusMap] || statusMap.creating
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4" />
          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <div className="h-64 bg-muted rounded" />
              <div className="h-48 bg-muted rounded" />
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-muted rounded" />
              <div className="h-48 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !unit) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error || "Unidade não encontrada"}
        </AlertDescription>
      </Alert>
    )
  }

  const statusInfo = getStatusInfo(unit.status)
  const StatusIcon = statusInfo.icon

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <button 
              onClick={() => {
                // Se tem book_id, volta para a página de unidades do livro
                if (unit?.book_id) {
                  router.push(`/books/${unit.book_id}/units`)
                } else {
                  // Caso contrário, volta para a página geral de unidades
                  router.push('/units')
                }
              }}
              className="hover:text-foreground transition-colors"
            >
              ← Voltar para Unidades
            </button>
          </div>
          <h1 className="text-3xl font-bold">
            {unit.title || `Unidade ${unit.sequence_order}`}
          </h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{unit.course_name || 'Curso'}</span>
            <span>•</span>
            <span>{unit.book_name || 'Livro'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline" className={`${statusInfo.color} text-white border-0`}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {statusInfo.text}
          </Badge>
          
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                onClick={() => handleSave(unit)}
                className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6">
        
        {/* Main Content - Full Width */}
        <div className="w-full space-y-6">
          
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
              <TabsTrigger value="content">Conteúdo</TabsTrigger>
              <TabsTrigger value="configuration">Configuração</TabsTrigger>
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="livros-ivo">Livros IVO</TabsTrigger>
            </TabsList>

            <TabsContent value="pipeline">
              <UnitGenerationPipeline 
                unit={unit} 
                onPipelineComplete={handlePipelineComplete}
                onStepComplete={handleStepComplete}
              />
            </TabsContent>

            <TabsContent value="content">
              <UnitContentSections unit={unit} initialSection={urlParams.section} />
            </TabsContent>

            <TabsContent value="configuration">
              <UnitConfigurationForm 
                unit={unit} 
                onSave={handleSave}
                isEditing={isEditing}
                showStatus={false}
              />
            </TabsContent>

            <TabsContent value="overview" className="space-y-6">
              {/* Unit Overview */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Informações da Unidade
                      </CardTitle>
                      <CardDescription>
                        Dados básicos e contexto da unidade
                      </CardDescription>
                    </div>
                    {unit.quality_score && (
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {unit.quality_score.toFixed(1)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Qualidade
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Context */}
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Contexto
                    </label>
                    <p className="mt-1 text-sm leading-relaxed">
                      {unit.context}
                    </p>
                  </div>

                  {/* Images */}
                  {unit.images && unit.images.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Imagens ({unit.images.length}/2)
                      </label>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        {unit.images.map((image, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-video bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
                              <span className="ml-2 text-sm text-muted-foreground">
                                Imagem {index + 1}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Nível CEFR
                      </label>
                      <Badge variant="outline" className="mt-1">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        {unit.cefr_level}
                      </Badge>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Tipo
                      </label>
                      <Badge variant="outline" className="mt-1">
                        {unit.unit_type === 'lexical_unit' ? 'Vocabulário' : 'Gramática'}
                      </Badge>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Sequência
                      </label>
                      <div className="mt-1 text-sm font-medium">
                        #{unit.sequence_order}
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Variante
                      </label>
                      <div className="mt-1 text-sm font-medium">
                        {unit.language_variant?.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Targets Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-accent" />
                    Metas de Conteúdo
                  </CardTitle>
                  <CardDescription>
                    Configuração de quantidade de conteúdo a ser gerado
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Vocabulary Target */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">
                        Vocabulário
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {(unit as any).vocabulary_target_count || 15} palavras
                      </span>
                    </div>
                    <Progress 
                      value={((unit as any).vocabulary_target_count || 15) / 50 * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Min: 5</span>
                      <span>Max: 50</span>
                    </div>
                  </div>

                  {/* Sentences Target */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">
                        Sentenças
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {(unit as any).sentences_target_count || 10} sentenças
                      </span>
                    </div>
                    <Progress 
                      value={((unit as any).sentences_target_count || 10) / 20 * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Min: 3</span>
                      <span>Max: 20</span>
                    </div>
                  </div>

                  {/* Assessments Target */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium">
                        Avaliações
                      </label>
                      <span className="text-sm text-muted-foreground">
                        {(unit as any).assessment_count || 2} avaliações
                      </span>
                    </div>
                    <Progress 
                      value={((unit as any).assessment_count || 2) / 5 * 100} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>Min: 1</span>
                      <span>Max: 5</span>
                    </div>
                  </div>

                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="livros-ivo">
              <UnitPDFExport 
                unit={unit}
                onExportComplete={() => {
                  // Callback se necessário
                }}
              />
            </TabsContent>

          </Tabs>
        </div>
      </div>
    </div>
  )
}