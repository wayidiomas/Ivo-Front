"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen,
  Download,
  FileText,
  GraduationCap,
  Users,
  Palette,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  Settings,
  RefreshCw
} from "lucide-react"

import { Unit } from "@/lib/types/api.types"
import { pdfExportApi, PDFExportRequest } from "@/lib/api/pdf-export"
import { generatePDF } from "@/lib/pdf/pdf-generator"

interface UnitPDFExportProps {
  unit: Unit | null
  onExportComplete?: () => void
}

// Tipos para as opções de PDF
type PDFVersion = 'student' | 'professor'
type PDFTheme = 'classico' | 'moderno'

interface PDFExportState {
  version: PDFVersion | null
  theme: PDFTheme | null
  isGenerating: boolean
  isPreviewLoading: boolean
  error: string | null
  progress: number
}

export default function UnitPDFExport({ unit, onExportComplete }: UnitPDFExportProps) {
  const [exportState, setExportState] = useState<PDFExportState>({
    version: null,
    theme: 'classico', // Default theme
    isGenerating: false,
    isPreviewLoading: false,
    error: null,
    progress: 0
  })

  // Verificar se o pipeline está completo
  const isPipelineComplete = unit ? checkPipelineCompletion(unit) : false
  const completionPercentage = unit ? calculateCompletionPercentage(unit) : 0

  // Atualizar estado quando unit muda
  useEffect(() => {
    if (unit && !exportState.version) {
      // Auto-selecionar versão estudante por padrão
      setExportState(prev => ({ ...prev, version: 'student' }))
    }
  }, [unit])

  const handleVersionChange = (version: PDFVersion) => {
    setExportState(prev => ({ ...prev, version, error: null }))
  }

  const handleThemeChange = (theme: PDFTheme) => {
    setExportState(prev => ({ ...prev, theme, error: null }))
  }

  const handleGeneratePDF = async () => {
    if (!unit || !exportState.version || !exportState.theme) {
      setExportState(prev => ({ ...prev, error: "Selecione a versão e o tema antes de gerar o PDF" }))
      return
    }

    setExportState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null, 
      progress: 0 
    }))

    try {
      // Preparar request para API
      const request: PDFExportRequest = {
        version: exportState.version,
        theme: exportState.theme,
        include_hierarchy: true,
        content_sections: getContentSections(unit),
        format_options: {
          language: 'pt-br',
          include_advanced_phonetics: true
        }
      }

      console.log('🚀 Iniciando geração PDF:', { unitId: unit.id, request })

      // Simular progresso enquanto processa
      const progressInterval = setInterval(() => {
        setExportState(prev => ({ 
          ...prev, 
          progress: Math.min(prev.progress + 15, 80) 
        }))
      }, 800)

      // Chamar API real para preparar dados
      const pdfData = await pdfExportApi.preparePDFData(unit.id, request)

      clearInterval(progressInterval)
      
      console.log('✅ Dados PDF preparados:', pdfData)

      if (pdfData.success) {
        setExportState(prev => ({ ...prev, progress: 90 }))

        // Gerar PDF real usando React-PDF
        console.log('🎯 Gerando PDF físico...')
        const pdfBlob = await generatePDF(pdfData.data, exportState.version, exportState.theme)
        
        setExportState(prev => ({ ...prev, progress: 100 }))

        // Download do arquivo
        const fileName = `${unit.title || 'Unit'}_${exportState.version}_${exportState.theme}.pdf`
        console.log('📥 Iniciando download:', fileName)
        
        const url = URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
        
        console.log('✅ PDF baixado com sucesso!')

        setTimeout(() => {
          setExportState(prev => ({ 
            ...prev, 
            isGenerating: false, 
            progress: 0 
          }))
          
          if (onExportComplete) {
            onExportComplete()
          }
        }, 1000)

      } else {
        throw new Error(pdfData.message || 'Falha na preparação dos dados PDF')
      }

    } catch (error: any) {
      console.error('❌ Erro na geração PDF:', error)
      setExportState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: error.message || "Erro ao gerar PDF. Tente novamente.",
        progress: 0 
      }))
    }
  }

  const renderVersionPreview = () => {
    if (!exportState.version) return null

    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Preview: {exportState.version === 'student' ? 'Versão Estudante' : 'Versão Professor'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            {exportState.version === 'student' ? (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Vocabulário com fonética e definições</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Sentenças contextualizadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>{unit?.unit_type === 'lexical_unit' ? 'Dicas de aprendizagem' : 'Explicações gramaticais'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Exercícios práticos</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-green-600" />
                  <span>Gabarito com explicações básicas</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-600" />
                  <span>Tudo da versão estudante +</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-600" />
                  <span>Notas pedagógicas detalhadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-600" />
                  <span>Análise de erros comuns</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-600" />
                  <span>Sugestões de atividades extras</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-blue-600" />
                  <span>Gabarito completo com justificativas</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderThemePreview = () => {
    if (!exportState.theme) return null

    return (
      <Card className="mt-4">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            Preview: Tema {exportState.theme === 'classico' ? 'Clássico Cambridge' : 'Moderno'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {exportState.theme === 'classico' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-900 rounded"></div>
                <span className="text-sm">Cambridge Blue (#003f7f)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-500 rounded"></div>
                <span className="text-sm">Accent Blue (#0066cc)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-700 rounded"></div>
                <span className="text-sm">Cambridge Red (#cc0000)</span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Layout acadêmico inspirado nos livros Cambridge com tabelas estruturadas e tipografia clássica.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Tema moderno em desenvolvimento...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!unit) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            Livros IVO
          </CardTitle>
          <CardDescription>
            Carregando dados da unidade...
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Livros IVO
          </CardTitle>
          <CardDescription>
            Gere livros didáticos profissionais nos formatos estudante e professor
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Status do Pipeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Status do Conteúdo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Completude do Pipeline</span>
              <Badge variant={isPipelineComplete ? "default" : "secondary"}>
                {completionPercentage.toFixed(0)}%
              </Badge>
            </div>
            <Progress value={completionPercentage} className="h-2" />
            
            {!isPipelineComplete && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Execute o pipeline completo antes de gerar o PDF para obter melhor qualidade.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Versão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Escolha a Versão
          </CardTitle>
          <CardDescription>
            Selecione se o PDF será para estudantes ou professores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={exportState.version || ''} 
            onValueChange={handleVersionChange}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/20 cursor-pointer">
              <RadioGroupItem value="student" id="student" />
              <div className="flex-1">
                <Label htmlFor="student" className="flex items-center gap-2 cursor-pointer">
                  <GraduationCap className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium">Estudante</div>
                    <div className="text-xs text-muted-foreground">Conteúdo filtrado e focado no aprendizado</div>
                  </div>
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/20 cursor-pointer">
              <RadioGroupItem value="professor" id="professor" />
              <div className="flex-1">
                <Label htmlFor="professor" className="flex items-center gap-2 cursor-pointer">
                  <Users className="h-4 w-4 text-green-600" />
                  <div>
                    <div className="font-medium">Professor</div>
                    <div className="text-xs text-muted-foreground">Guia completo com notas pedagógicas</div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>

          {renderVersionPreview()}
        </CardContent>
      </Card>

      {/* Seleção de Tema */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            Escolha o Tema
          </CardTitle>
          <CardDescription>
            Selecione o estilo visual do PDF
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={exportState.theme || ''} 
            onValueChange={handleThemeChange}
            className="grid grid-cols-2 gap-4"
          >
            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/20 cursor-pointer">
              <RadioGroupItem value="classico" id="classico" />
              <div className="flex-1">
                <Label htmlFor="classico" className="flex items-center gap-2 cursor-pointer">
                  <BookOpen className="h-4 w-4 text-blue-900" />
                  <div>
                    <div className="font-medium">Clássico Cambridge</div>
                    <div className="text-xs text-muted-foreground">Estilo acadêmico tradicional</div>
                  </div>
                </Label>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-muted/20 cursor-pointer opacity-50">
              <RadioGroupItem value="moderno" id="moderno" disabled />
              <div className="flex-1">
                <Label htmlFor="moderno" className="flex items-center gap-2 cursor-not-allowed">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <div>
                    <div className="font-medium">Moderno</div>
                    <div className="text-xs text-muted-foreground">Em desenvolvimento</div>
                  </div>
                </Label>
              </div>
            </div>
          </RadioGroup>

          {renderThemePreview()}
        </CardContent>
      </Card>

      {/* Geração do PDF */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            Gerar PDF
          </CardTitle>
          <CardDescription>
            Clique para processar e baixar o PDF
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {exportState.isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span className="text-sm">Gerando PDF...</span>
              </div>
              <Progress value={exportState.progress} className="h-2" />
              <div className="text-xs text-muted-foreground text-center">
                {exportState.progress}% concluído
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              onClick={handleGeneratePDF}
              disabled={!exportState.version || !exportState.theme || exportState.isGenerating}
              className="bg-gradient-to-r from-primary to-accent text-white hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {exportState.isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </>
              )}
            </Button>

            {!exportState.isGenerating && (
              <Button 
                variant="outline"
                onClick={() => setExportState(prev => ({ ...prev, version: null, theme: 'classico', error: null }))}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Limpar
              </Button>
            )}
          </div>

          {exportState.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{exportState.error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

    </div>
  )
}

// Funções auxiliares
function checkPipelineCompletion(unit: Unit): boolean {
  const requiredSections = ['vocabulary', 'sentences', 'qa', 'assessments']
  
  if (unit.unit_type === 'lexical_unit') {
    requiredSections.push('tips')
  } else if (unit.unit_type === 'grammar_unit') {
    requiredSections.push('grammar')
  }

  return requiredSections.every(section => {
    switch (section) {
      case 'vocabulary':
        return unit.vocabulary && Object.keys(unit.vocabulary).length > 0
      case 'sentences':
        return unit.sentences && Object.keys(unit.sentences).length > 0
      case 'tips':
        return unit.tips && Object.keys(unit.tips).length > 0
      case 'grammar':
        return unit.grammar && Object.keys(unit.grammar).length > 0
      case 'qa':
        return unit.qa && Object.keys(unit.qa).length > 0
      case 'assessments':
        return unit.assessments && Object.keys(unit.assessments).length > 0
      default:
        return true
    }
  })
}

function calculateCompletionPercentage(unit: Unit): number {
  const sections = ['vocabulary', 'sentences', 'qa', 'assessments']
  
  if (unit.unit_type === 'lexical_unit') {
    sections.push('tips')
  } else if (unit.unit_type === 'grammar_unit') {
    sections.push('grammar')
  }

  let completed = 0
  sections.forEach(section => {
    switch (section) {
      case 'vocabulary':
        if (unit.vocabulary && Object.keys(unit.vocabulary).length > 0) completed++
        break
      case 'sentences':
        if (unit.sentences && Object.keys(unit.sentences).length > 0) completed++
        break
      case 'tips':
        if (unit.tips && Object.keys(unit.tips).length > 0) completed++
        break
      case 'grammar':
        if (unit.grammar && Object.keys(unit.grammar).length > 0) completed++
        break
      case 'qa':
        if (unit.qa && Object.keys(unit.qa).length > 0) completed++
        break
      case 'assessments':
        if (unit.assessments && Object.keys(unit.assessments).length > 0) completed++
        break
    }
  })

  return (completed / sections.length) * 100
}

function getContentSections(unit: Unit): string[] {
  const sections = ['objectives', 'vocabulary', 'sentences']
  
  if (unit.unit_type === 'lexical_unit' && unit.tips) {
    sections.push('tips')
  } else if (unit.unit_type === 'grammar_unit' && unit.grammar) {
    sections.push('grammar')
  }
  
  if (unit.qa && Object.keys(unit.qa).length > 0) {
    sections.push('qa')
  }
  if (unit.assessments && Object.keys(unit.assessments).length > 0) {
    sections.push('assessments')
  }
  if (unit.solve_assessments && Object.keys(unit.solve_assessments).length > 0) {
    sections.push('solve_assessments')
  }

  return sections
}