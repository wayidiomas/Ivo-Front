"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  Brain,
  Play,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  Eye,
  TrendingUp,
  Target,
  MessageSquare,
  Lightbulb,
  BookOpen,
  Users
} from "lucide-react"

import { 
  Unit, 
  SolveAssessmentRequest, 
  SolveAssessmentResult,
  GabaritoRequest,
  GabaritoResult,
  AssessmentSolutionResult,
  isGabaritoResult,
  isSolveAssessmentResult
} from "@/lib/types/api.types"
import { contentGenerationApi } from "@/lib/api/content-generation"

interface AssessmentsSolvingStepProps {
  unit: Unit
  onStepComplete?: () => void
}

export default function AssessmentsSolvingStep({ unit, onStepComplete }: AssessmentsSolvingStepProps) {
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>("")
  // Novos campos para gabarito
  const [includeExplanations, setIncludeExplanations] = useState(true)
  const [difficultyAnalysis, setDifficultyAnalysis] = useState(true)
  // Campos antigos mantidos para compatibilidade
  const [includeStudentAnswers, setIncludeStudentAnswers] = useState(false)
  const [studentContext, setStudentContext] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string>("")

  // Obter tipos de assessment disponíveis
  const availableAssessments = unit?.assessments?.activities?.map(activity => ({
    type: activity.type,
    title: activity.title,
    difficulty: activity.difficulty_level
  })) || []

  // Verificar se já existem soluções geradas (gabaritos ou correções)
  const existingSolveResults = unit?.solve_assessments || {}
  const hasResults = Object.keys(existingSolveResults).length > 0
  const correctedAssessments = Object.keys(existingSolveResults)

  // Detectar se temos gabaritos ou correções antigas
  const hasGabaritos = correctedAssessments.some(key => {
    const result = existingSolveResults[key]
    return isGabaritoResult(result)
  })

  const hasOldCorrections = correctedAssessments.some(key => {
    const result = existingSolveResults[key]
    return isSolveAssessmentResult(result)
  })

  // Se não tem assessment selecionado mas tem resultados, selecionar o primeiro
  useEffect(() => {
    if (!selectedAssessmentType && hasResults && correctedAssessments.length > 0) {
      setSelectedAssessmentType(correctedAssessments[0])
    }
  }, [hasResults, correctedAssessments, selectedAssessmentType])

  const handleSolveAssessment = async () => {
    if (!selectedAssessmentType) return

    setIsProcessing(true)
    setError("")

    try {
      // Usar método híbrido que tenta gabarito primeiro, fallback para correção
      const request = {
        assessment_type: selectedAssessmentType,
        // Novos campos para gabarito
        include_explanations: includeExplanations,
        difficulty_analysis: difficultyAnalysis,
        // Campos antigos para compatibilidade (fallback)
        include_student_answers: includeStudentAnswers,
        student_context: studentContext || undefined
      }

      const response = await contentGenerationApi.solveOrGenerateGabarito(unit.id, request)
      
      if (response.success) {
        // Não precisamos mais setSolveResult aqui, pois os dados vêm via unit.solve_assessments
        console.log('✅ Gabarito gerado com sucesso!', response.data?.gabarito_result || response.data?.correction_result)
        if (onStepComplete) {
          onStepComplete()
        }
      } else {
        setError(response.message || "Erro ao gerar gabarito")
      }
    } catch (err: any) {
      setError(err.message || "Erro ao processar gabarito")
      console.error("Erro na geração:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRegenerateCorrection = async () => {
    if (!selectedAssessmentType) return

    setIsProcessing(true)
    setError("")

    try {
      const request = {
        include_student_answers: includeStudentAnswers,
        student_context: studentContext || undefined
      }

      const response = await contentGenerationApi.updateSolveAssessment(
        unit.id, 
        selectedAssessmentType, 
        request
      )
      
      if (response.success) {
        // Os dados já serão atualizados via unit.solve_assessments
      } else {
        setError(response.message || "Erro ao regenerar correção")
      }
    } catch (err: any) {
      setError(err.message || "Erro ao reprocessar correção")
      console.error("Erro na regeneração:", err)
    } finally {
      setIsProcessing(false)
    }
  }

  const getPerformanceLevelVariant = (level: string) => {
    switch (level) {
      case 'excellent': 
      case 'good': return 'default'
      case 'satisfactory': return 'secondary'
      case 'needs_improvement': return 'outline'
      default: return 'secondary'
    }
  }

  const getCefrDemonstrationColor = (level: string) => {
    switch (level) {
      case 'above': return 'text-primary'
      case 'at': return 'text-primary'
      case 'below': return 'text-muted-foreground'
      default: return 'text-muted-foreground'
    }
  }

  // Obter resultado do assessment atualmente selecionado
  const currentSolveResult = selectedAssessmentType ? existingSolveResults[selectedAssessmentType] : null
  
  // Detectar se é gabarito ou correção antiga
  const isGabaritoData = currentSolveResult && isGabaritoResult(currentSolveResult)
  const isCorrectionData = currentSolveResult && isSolveAssessmentResult(currentSolveResult)

  return (
    <div className="space-y-6">
      
      {/* Mostrar resumo se já tem resultados */}
      {hasResults && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              {hasGabaritos ? 'Gabaritos Ivo Gerados' : 'Correções Ivo Realizadas'}
            </CardTitle>
            <CardDescription>
              {correctedAssessments.length} {hasGabaritos ? 'gabarito' : 'assessment'}{correctedAssessments.length !== 1 ? 's' : ''} 
              {hasGabaritos ? ' gerado' : ' corrigido'}{correctedAssessments.length !== 1 ? 's' : ''} automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {correctedAssessments.map((assessmentType) => (
                <Badge 
                  key={assessmentType} 
                  variant={selectedAssessmentType === assessmentType ? "default" : "secondary"}
                  className="cursor-pointer"
                  onClick={() => setSelectedAssessmentType(assessmentType)}
                >
                  {assessmentType}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuração da Correção - só mostrar se não tem resultados */}
      {!hasResults && (
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Gabarito Ivo - Assessments
          </CardTitle>
          <CardDescription>
            Sistema inteligente de geração de gabaritos com explicações pedagógicas detalhadas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Seleção de Assessment */}
          <div className="space-y-2">
            <Label htmlFor="assessment-select">Assessment para Correção</Label>
            <Select value={selectedAssessmentType} onValueChange={setSelectedAssessmentType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um assessment da unidade" />
              </SelectTrigger>
              <SelectContent>
                {availableAssessments.map((assessment) => (
                  <SelectItem key={assessment.type} value={assessment.type}>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {assessment.type}
                      </Badge>
                      <span>{assessment.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {assessment.difficulty}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {availableAssessments.length === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Nenhum assessment encontrado nesta unidade. Execute o pipeline de geração primeiro.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Configurações Avançadas */}
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h4 className="text-sm font-medium">Configurações da Correção</h4>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="include-answers"
                checked={includeStudentAnswers}
                onCheckedChange={setIncludeStudentAnswers}
              />
              <Label htmlFor="include-answers" className="text-sm">
                Incluir respostas de alunos (simulação)
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="student-context">Contexto Adicional do Estudante</Label>
              <Textarea
                id="student-context"
                placeholder="Ex: Estudante iniciante, dificuldades com gramática, foco em vocabulário..."
                value={studentContext}
                onChange={(e) => setStudentContext(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Ações */}
          <div className="flex gap-3">
            <Button 
              onClick={handleSolveAssessment}
              disabled={!selectedAssessmentType || isProcessing}
              className="bg-gradient-to-r from-primary to-accent"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Corrigir com Ivo
                </>
              )}
            </Button>

            {hasResults && selectedAssessmentType && (
              <Button 
                variant="outline"
                onClick={handleRegenerateCorrection}
                disabled={isProcessing}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerar {selectedAssessmentType}
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      )}

      {/* Resultados - Gabarito ou Correção */}
      {currentSolveResult && isGabaritoData && (
        <GabaritoResultsCard gabarito={currentSolveResult} />
      )}
      
      {currentSolveResult && isCorrectionData && (
        <CorrectionResultsCard correction={currentSolveResult} />
      )}
    </div>
  )
}

// Componente para mostrar resultados de gabarito
function GabaritoResultsCard({ gabarito }: { gabarito: any }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Gabarito Ivo Gerado
        </CardTitle>
        <CardDescription>
          {gabarito.total_items} itens resolvidos por {gabarito.ai_model_used} em {(gabarito.processing_time || 0).toFixed(2)}s
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Resumo do Gabarito */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">
              {gabarito.total_items}
            </div>
            <div className="text-xs text-muted-foreground">Total de Itens</div>
          </div>
          
          <div className="text-center space-y-2">
            <Badge variant="default">
              {gabarito.assessment_type.replace('_', ' ').toUpperCase()}
            </Badge>
            <div className="text-xs text-muted-foreground">Tipo de Assessment</div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-lg font-semibold text-primary">
              {gabarito.difficulty_distribution?.medium || 0} Médio
            </div>
            <div className="text-xs text-muted-foreground">Distribuição</div>
          </div>
        </div>

        <Separator />

        {/* Skills Overview */}
        {gabarito.skills_overview && gabarito.skills_overview.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Skills Testadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {gabarito.skills_overview.map((skill: string, idx: number) => (
                  <Badge key={idx} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Items do Gabarito */}
        {gabarito.items && gabarito.items.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Soluções Completas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {gabarito.items.map((item: any, idx: number) => (
                <div key={idx} className="p-3 bg-muted/20 rounded-md border-l-4 border-l-primary">
                  <div className="font-medium text-sm mb-1">
                    {item.question_text}
                  </div>
                  <div className="text-primary font-semibold mb-2">
                    ✓ {item.correct_answer}
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {item.explanation}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {item.difficulty_level}
                    </Badge>
                    {item.skills_tested?.map((skill: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Notas de Ensino */}
        {gabarito.teaching_notes && gabarito.teaching_notes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Notas Pedagógicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {gabarito.teaching_notes.map((note: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Metadados */}
        <div className="text-xs text-muted-foreground text-center p-3 bg-muted/20 rounded-md border">
          Assessment: {gabarito.assessment_title} • 
          Modelo: {gabarito.ai_model_used} • 
          Gerado em: {new Date(gabarito.solution_timestamp).toLocaleString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  )
}

// Componente para mostrar resultados de correção antiga
function CorrectionResultsCard({ correction }: { correction: any }) {
  const getPerformanceLevelVariant = (level: string) => {
    switch (level) {
      case 'excellent': 
      case 'good': return 'default'
      case 'satisfactory': return 'secondary'
      case 'needs_improvement': return 'outline'
      default: return 'secondary'
    }
  }

  const getCefrDemonstrationColor = (level: string) => {
    switch (level) {
      case 'above': return 'text-primary'
      case 'at': return 'text-primary'
      case 'below': return 'text-muted-foreground'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-primary" />
          Resultado da Correção Ivo
        </CardTitle>
        <CardDescription>
          Análise completa gerada por {correction.ai_model_used} em {correction.completion_time?.toFixed(2)}s
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Resumo Geral */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center space-y-2">
            <div className="text-2xl font-bold text-primary">
              {correction.total_score}/{correction.total_possible}
            </div>
            <div className="text-xs text-muted-foreground">Score Total</div>
            <Progress value={correction.accuracy_percentage} className="h-2" />
          </div>
          
          <div className="text-center space-y-2">
            <Badge variant={getPerformanceLevelVariant(correction.performance_level)}>
              {correction.performance_level}
            </Badge>
            <div className="text-xs text-muted-foreground">Desempenho</div>
          </div>
          
          <div className="text-center space-y-2">
            <span className={`font-medium ${getCefrDemonstrationColor(correction.cefr_demonstration)}`}>
              {correction.cefr_demonstration?.toUpperCase() || 'N/A'}
            </span>
            <div className="text-xs text-muted-foreground">Nível CEFR</div>
          </div>
          
          <div className="text-center space-y-2">
            <div className="text-lg font-semibold">
              {correction.accuracy_percentage?.toFixed(1) || 0}%
            </div>
            <div className="text-xs text-muted-foreground">Precisão</div>
          </div>
        </div>

        {/* Metadados */}
        <div className="text-xs text-muted-foreground text-center p-3 bg-muted/20 rounded-md border">
          Assessment: {correction.assessment_title} • 
          Modelo: {correction.ai_model_used} • 
          Processado em: {new Date(correction.correction_timestamp).toLocaleString('pt-BR')}
        </div>
      </CardContent>
    </Card>
  )
}