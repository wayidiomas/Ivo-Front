"use client"
import { useState, useEffect } from "react"
import { contentGenerationApi } from "@/lib/api/content-generation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  BookOpen,
  MessageSquare,
  Target,
  Lightbulb,
  FileText,
  CheckCircle2,
  HelpCircle,
  Play,
  RefreshCw,
  Eye,
  Edit,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  Volume2,
  Copy,
  Brain
} from "lucide-react"
import { Unit } from "@/lib/types/api.types"
import AssessmentRenderer from "@/components/assessments/AssessmentRenderer"
import AssessmentsSolvingStep from "@/components/assessments/AssessmentsSolvingStep"

interface UnitContentSectionsProps {
  unit: Unit
  initialSection?: string | null
}

export default function UnitContentSections({ unit, initialSection }: UnitContentSectionsProps) {
  // Set initial active section based on unit type
  const getInitialActiveSection = () => {
    // Se tem seção específica da URL, usar ela
    if (initialSection) {
      return initialSection
    }
    // Senão, sempre começar com vocabulary se disponível
    return "vocabulary"
  }
  
  const [activeSection, setActiveSection] = useState(getInitialActiveSection())

  // Update active section when initialSection changes
  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection)
    }
  }, [initialSection])

  // Use real vocabulary data from API - support both old and new structure
  const vocabularyItems = unit?.vocabulary?.words || unit?.vocabulary?.items || []
  
  // Debug logging
  console.log('Unit vocabulary:', unit?.vocabulary)
  console.log('Vocabulary items found:', vocabularyItems.length)

  // Use real sentences data from API
  const sentencesItems = unit?.sentences?.sentences || []

  // Use real grammar data from API
  const grammarData = unit?.grammar || null

  // State for detailed assessments
  const [detailedAssessments, setDetailedAssessments] = useState<any[]>([])
  const [loadingAssessments, setLoadingAssessments] = useState(false)

  // Load detailed assessments when tab is assessments and unit has assessments
  useEffect(() => {
    if (activeSection === 'assessments' && unit?.assessments?.activities && unit.assessments.activities.length > 0) {
      loadDetailedAssessments()
    }
  }, [activeSection, unit?.assessments])

  const loadDetailedAssessments = async () => {
    if (loadingAssessments) return
    
    try {
      setLoadingAssessments(true)
      const response = await contentGenerationApi.getAssessments(unit?.id!)
      
      if (response.success && response.data) {
        setDetailedAssessments(response.data.activities || response.data || [])
      }
    } catch (error) {
      console.error('Error loading detailed assessments:', error)
      // Fallback to basic assessments data
      setDetailedAssessments(unit.assessments?.activities || [])
    } finally {
      setLoadingAssessments(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'error': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500' 
      case 'error': return 'bg-red-500'
      default: return 'bg-gray-400'
    }
  }

  // Real section statuses based on API data
  const sectionStatuses = {
    vocabulary: unit?.vocabulary && Object.keys(unit?.vocabulary).length > 0 ? 'completed' : 'pending',
    sentences: unit?.sentences && Object.keys(unit?.sentences).length > 0 ? 'completed' : 'pending',
    grammar: unit?.grammar && Object.keys(unit?.grammar).length > 0 ? 'completed' : 'pending',
    aims: unit?.main_aim && unit?.main_aim?.trim() !== '' ? 'completed' : 'pending',
    tips: unit?.tips && Object.keys(unit?.tips).length > 0 ? 'completed' : 'pending',
    assessments: unit?.assessments && Object.keys(unit?.assessments).length > 0 ? 'completed' : 'pending',
    qa: unit?.qa && unit?.qa?.questions && unit?.qa?.questions?.length > 0 ? 'completed' : 'pending',
    'assessments-solving': unit?.solve_assessments && Object.keys(unit?.solve_assessments).length > 0 ? 'completed' : 'pending'
  }

  return (
    <div className="space-y-6">
      
      {/* Content Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Seções de Conteúdo
          </CardTitle>
          <CardDescription>
            Gerencie e visualize o conteúdo de cada seção da unidade
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {[
              { key: 'vocabulary', label: 'Vocabulário', icon: Sparkles, count: vocabularyItems.length, target: unit?.vocabulary?.total_count || 25 },
              { key: 'sentences', label: 'Sentenças', icon: MessageSquare, count: sentencesItems.length, target: unit?.sentences?.total_count || 12 },
              ...(unit?.unit_type === 'grammar_unit' ? [
                { key: 'grammar', label: 'Gramática', icon: BookOpen, count: grammarData ? 1 : 0, target: 1 }
              ] : []),
              { key: 'aims', label: 'Objetivos', icon: Target, count: unit?.main_aim ? 1 : 0, target: 1 },
              ...(unit?.unit_type === 'lexical_unit' ? [
                { key: 'tips', label: 'Dicas', icon: Lightbulb, count: unit?.tips ? 1 : 0, target: 1 }
              ] : []),
              { key: 'assessments', label: 'Avaliações', icon: CheckCircle2, count: unit?.assessments?.activities?.length || 0, target: unit?.assessments?.activities?.length || 2 },
              { key: 'qa', label: 'Q&A', icon: HelpCircle, count: unit?.qa?.questions?.length || 0, target: Math.max(unit?.qa?.questions?.length || 0, 6) },
              { key: 'assessments-solving', label: 'Gabarito Ivo', icon: Brain, count: unit?.solve_assessments ? Object.keys(unit.solve_assessments).length : 0, target: Math.max(unit?.assessments?.activities?.length || 0, 1) }
            ].map(({ key, label, icon: Icon, count, target }) => (
              <div key={key} className="text-center space-y-2">
                <div className="flex items-center justify-center">
                  {getStatusIcon(sectionStatuses[key as keyof typeof sectionStatuses])}
                </div>
                <div>
                  <div className="text-lg font-semibold">{count}/{target}</div>
                  <div className="text-xs text-muted-foreground">{label}</div>
                </div>
                <Progress 
                  value={(count / target) * 100} 
                  className="h-1"
                />
              </div>
            ))}

          </div>
        </CardContent>
      </Card>

      {/* Content Sections Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Detalhes do Conteúdo</CardTitle>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Regenerar Seção
              </Button>
              <Button size="sm" variant="outline">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          
          <Tabs value={activeSection} onValueChange={setActiveSection} className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
              <TabsTrigger value="vocabulary" className="text-xs">Vocab</TabsTrigger>
              <TabsTrigger value="sentences" className="text-xs">Sentenças</TabsTrigger>
              {unit?.unit_type === 'grammar_unit' && (
                <TabsTrigger value="grammar" className="text-xs">Gramática</TabsTrigger>
              )}
              <TabsTrigger value="aims" className="text-xs">Objetivos</TabsTrigger>
              {unit?.unit_type === 'lexical_unit' && (
                <TabsTrigger value="tips" className="text-xs">Dicas</TabsTrigger>
              )}
              <TabsTrigger value="assessments" className="text-xs">Avaliações</TabsTrigger>
              <TabsTrigger value="qa" className="text-xs">Q&A</TabsTrigger>
              <TabsTrigger value="assessments-solving" className="text-xs">Gabarito Ivo</TabsTrigger>
            </TabsList>

            {/* Vocabulary Section */}
            <TabsContent value="vocabulary" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Vocabulário ({vocabularyItems.length}/{unit.vocabulary?.total_count || 25})
                </h3>
                <Badge variant="outline" className={`${getStatusColor(sectionStatuses.vocabulary)} text-white border-0`}>
                  {sectionStatuses.vocabulary === 'completed' ? 'Completo' : 'Pendente'}
                </Badge>
              </div>
              
              <div className="space-y-4">
                {vocabularyItems.length > 0 ? vocabularyItems.map((word: any, index: number) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="text-lg font-semibold text-primary">{word.word}</h4>
                          <Badge variant="secondary" className="text-xs">
                            {word.word_class}
                          </Badge>
                          <Button size="sm" variant="ghost" className="p-1 h-auto">
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-sm text-muted-foreground font-mono">
                          {word.phoneme}
                        </div>
                        
                        <div className="text-sm">
                          <strong>Definição:</strong> {word.definition}
                        </div>
                        
                        <div className="text-sm">
                          <strong>Exemplo:</strong> <em>"{word.example}"</em>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Relevância:</span>
                            <Progress value={word.context_relevance * 100} className="w-16 h-1" />
                            <span className="font-medium">{(word.context_relevance * 100).toFixed(0)}%</span>
                          </div>
                          {word.frequency_level && (
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Frequência:</span>
                              <Badge variant="outline" className="text-xs px-1 py-0">
                                {word.frequency_level}
                              </Badge>
                            </div>
                          )}
                        </div>
                        
                        {word.is_reinforcement && (
                          <div className="mt-2">
                            <Badge variant="secondary" className="text-xs">
                              <RefreshCw className="h-2 w-2 mr-1" />
                              Reforço
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-1 ml-4">
                        <Button size="sm" variant="ghost">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )) : (
                  <div className="text-center py-8">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum vocabulário encontrado</h3>
                    <p className="text-muted-foreground mb-4">Esta seção ainda não foi gerada</p>
                  </div>
                )}
              </div>
              
              {vocabularyItems.length < (unit.vocabulary?.total_count || 25) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Faltam {(unit.vocabulary?.total_count || 25) - vocabularyItems.length} palavras para completar o objetivo.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            {/* Sentences Section */}
            <TabsContent value="sentences" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" style={{ color: '#00D2FF' }} />
                  <span>Sentenças ({sentencesItems.length}/{unit.sentences?.total_count || 12})</span>
                  <Badge 
                    className="ml-2 text-xs border-none" 
                    style={{ backgroundColor: '#00D2FF', color: '#1A1F29' }}
                  >
                    {sentencesItems.length}
                  </Badge>
                </h3>
                <Badge variant="outline" className={`${getStatusColor(sectionStatuses.sentences)} text-white border-0`}>
                  {sectionStatuses.sentences === 'completed' ? 'Completo' : 'Pendente'}
                </Badge>
              </div>
              
              <div className="space-y-4">
                {sentencesItems.length > 0 ? sentencesItems.map((sentence: any, index: number) => (
                  <Card key={index} className="p-4 border" style={{ borderColor: '#3A4553' }}>
                    <div className="space-y-4">
                      {/* Sentence Header */}
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-3 mb-2">
                            <Badge 
                              className="text-xs border-none font-medium mt-1" 
                              style={{ backgroundColor: '#3B82F6', color: 'white' }}
                            >
                              #{index + 1}
                            </Badge>
                            <p className="text-base font-medium leading-relaxed">{sentence.text}</p>
                          </div>
                          
                          {sentence.context_situation && (
                            <div 
                              className="p-3 rounded-lg border mt-3"
                              style={{
                                backgroundColor: '#232A37',
                                borderColor: '#F59E0B',
                                color: '#A0A8B8'
                              }}
                            >
                              <h6 className="text-xs font-medium mb-1 flex items-center gap-1" style={{ color: '#F59E0B' }}>
                                <Target className="h-3 w-3" />
                                CONTEXTO DE USO:
                              </h6>
                              <p className="text-sm italic">{sentence.context_situation}</p>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 hover:bg-ivo-surface-hover transition-colors"
                            style={{ color: '#A0A8B8' }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 hover:bg-ivo-surface-hover transition-colors"
                            style={{ color: '#FF4757' }}
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      {/* Sentence Meta Info */}
                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        {/* Complexity Level */}
                        {sentence.complexity_level && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: '#6B7280' }}>Complexidade:</span>
                            <Badge 
                              className="text-xs border-none"
                              style={{ 
                                backgroundColor: sentence.complexity_level === 'basic' ? '#10B981' : 
                                                sentence.complexity_level === 'intermediate' ? '#F59E0B' : '#EF4444',
                                color: 'white'
                              }}
                            >
                              {sentence.complexity_level}
                            </Badge>
                          </div>
                        )}
                        
                        {/* Phonetic Features */}
                        {sentence.phonetic_features && sentence.phonetic_features.length > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs" style={{ color: '#6B7280' }}>Características fonéticas:</span>
                            <div className="flex flex-wrap gap-1">
                              {sentence.phonetic_features.map((feature: string, idx: number) => (
                                <Badge 
                                  key={idx}
                                  className="text-xs border-none"
                                  style={{ backgroundColor: '#FF4757', color: 'white' }}
                                >
                                  <Volume2 className="h-3 w-3 mr-1" />
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Vocabulary Used */}
                        {sentence.vocabulary_used && sentence.vocabulary_used.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs" style={{ color: '#6B7280' }}>Vocabulário:</span>
                            <div className="flex flex-wrap gap-1">
                              {sentence.vocabulary_used.slice(0, 4).map((word: string, idx: number) => (
                                <Badge 
                                  key={idx} 
                                  className="text-xs border-none"
                                  style={{ backgroundColor: '#00D2FF', color: '#1A1F29', fontSize: '10px' }}
                                >
                                  {word}
                                </Badge>
                              ))}
                              {sentence.vocabulary_used.length > 4 && (
                                <Badge 
                                  className="text-xs border"
                                  style={{ 
                                    backgroundColor: 'transparent', 
                                    borderColor: '#3A4553', 
                                    color: '#A0A8B8' 
                                  }}
                                >
                                  +{sentence.vocabulary_used.length - 4}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4" style={{ color: '#6B7280' }} />
                    <h3 className="text-lg font-semibold mb-2">Nenhuma sentença encontrada</h3>
                    <p className="text-muted-foreground mb-4">Esta seção ainda não foi gerada</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Grammar Section - Only for grammar_unit */}
            {unit?.unit_type === 'grammar_unit' && (
              <TabsContent value="grammar" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <BookOpen className="h-5 w-5" style={{ color: '#10B981' }} />
                  <span>Gramática</span>
                  <Badge 
                    className="ml-2 text-xs border-none" 
                    style={{ backgroundColor: '#10B981', color: 'white' }}
                  >
                    SISTEMA
                  </Badge>
                </h3>
                <Badge variant="outline" className={`${getStatusColor(sectionStatuses.grammar)} text-white border-0`}>
                  {sectionStatuses.grammar === 'completed' ? 'Completo' : 'Pendente'}
                </Badge>
              </div>
              
              {grammarData ? (
                <Card className="p-6 border" style={{ borderColor: '#3A4553' }}>
                  <div className="space-y-6">
                    {/* Grammar Point Header */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-3">
                        <BookOpen className="h-6 w-6" style={{ color: '#10B981' }} />
                        <h4 className="font-semibold text-xl text-primary">
                          {grammarData.grammar_point}
                        </h4>
                      </div>
                      
                      {grammarData.strategy && (
                        <div className="mb-4">
                          <Badge 
                            className="text-sm border-none font-medium"
                            style={{ backgroundColor: '#3B82F6', color: 'white' }}
                          >
                            <Target className="h-3 w-3 mr-1" />
                            Estratégia: {grammarData.strategy}
                          </Badge>
                        </div>
                      )}
                      
                      {grammarData.systematic_explanation && (
                        <div 
                          className="p-4 rounded-lg border"
                          style={{
                            backgroundColor: '#232A37',
                            borderColor: '#10B981',
                            color: '#A0A8B8'
                          }}
                        >
                          <h6 className="text-sm font-medium mb-2 flex items-center gap-1" style={{ color: '#10B981' }}>
                            <Eye className="h-3 w-3" />
                            EXPLICAÇÃO SISTEMÁTICA:
                          </h6>
                          <p className="text-sm leading-relaxed">{grammarData.systematic_explanation}</p>
                        </div>
                      )}
                    </div>
                    
                    {/* Usage Rules */}
                    {grammarData.usage_rules && grammarData.usage_rules.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-lg flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" style={{ color: '#3B82F6' }} />
                          <span>Regras de Uso</span>
                          <Badge 
                            className="ml-2 text-xs border-none"
                            style={{ backgroundColor: '#3B82F6', color: 'white' }}
                          >
                            {grammarData.usage_rules.length}
                          </Badge>
                        </h5>
                        <div className="space-y-2">
                          {grammarData.usage_rules.map((rule: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-3">
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mt-0.5"
                                style={{ backgroundColor: '#3B82F6', color: 'white' }}
                              >
                                {idx + 1}
                              </div>
                              <p className="text-sm leading-relaxed flex-1">{rule}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Examples */}
                    {grammarData.examples && grammarData.examples.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-lg flex items-center gap-2">
                          <Play className="h-4 w-4" style={{ color: '#00D2FF' }} />
                          <span>Exemplos Práticos</span>
                          <Badge 
                            className="ml-2 text-xs border-none"
                            style={{ backgroundColor: '#00D2FF', color: '#1A1F29' }}
                          >
                            {grammarData.examples.length}
                          </Badge>
                        </h5>
                        <div className="grid gap-3">
                          {grammarData.examples.map((example: string, idx: number) => (
                            <div 
                              key={idx} 
                              className="p-3 rounded-lg border"
                              style={{
                                backgroundColor: '#232A37',
                                borderColor: '#00D2FF'
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <Badge 
                                  className="text-xs border-none mt-0.5"
                                  style={{ backgroundColor: '#00D2FF', color: '#1A1F29' }}
                                >
                                  #{idx + 1}
                                </Badge>
                                <p className="text-sm font-medium" style={{ color: '#A0A8B8' }}>{example}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* L1 Interference Notes */}
                    {grammarData.l1_interference_notes && grammarData.l1_interference_notes.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-lg flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" style={{ color: '#F59E0B' }} />
                          <span>Interferências L1 (Português → Inglês)</span>
                          <Badge 
                            className="ml-2 text-xs border-none"
                            style={{ backgroundColor: '#F59E0B', color: 'white' }}
                          >
                            ATENÇÃO
                          </Badge>
                        </h5>
                        <div className="space-y-2">
                          {grammarData.l1_interference_notes.map((note: string, idx: number) => (
                            <div 
                              key={idx} 
                              className="p-3 rounded-lg border-l-4"
                              style={{
                                backgroundColor: '#232A37',
                                borderLeftColor: '#F59E0B'
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <AlertCircle className="h-4 w-4 mt-0.5" style={{ color: '#F59E0B' }} />
                                <p className="text-sm leading-relaxed" style={{ color: '#A0A8B8' }}>{note}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Common Mistakes */}
                    {grammarData.common_mistakes && grammarData.common_mistakes.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-lg flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" style={{ color: '#EF4444' }} />
                          <span>Erros Comuns</span>
                          <Badge 
                            className="ml-2 text-xs border-none"
                            style={{ backgroundColor: '#EF4444', color: 'white' }}
                          >
                            {grammarData.common_mistakes.length} CORREÇÕES
                          </Badge>
                        </h5>
                        <div className="space-y-4">
                          {grammarData.common_mistakes.map((mistake: any, idx: number) => (
                            <div 
                              key={idx} 
                              className="p-4 rounded-lg border"
                              style={{
                                backgroundColor: '#232A37',
                                borderColor: '#3A4553'
                              }}
                            >
                              <div className="space-y-3 text-sm">
                                {/* Incorrect Example */}
                                <div 
                                  className="p-3 rounded border-l-4"
                                  style={{
                                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                    borderLeftColor: '#EF4444'
                                  }}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium" style={{ color: '#EF4444' }}>❌ Incorreto:</span>
                                  </div>
                                  <span className="line-through" style={{ color: '#A0A8B8' }}>{mistake.mistake}</span>
                                </div>
                                
                                {/* Correct Example */}
                                <div 
                                  className="p-3 rounded border-l-4"
                                  style={{
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    borderLeftColor: '#10B981'
                                  }}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium" style={{ color: '#10B981' }}>✅ Correto:</span>
                                  </div>
                                  <span style={{ color: '#A0A8B8' }}>{mistake.correction}</span>
                                </div>
                                
                                {/* Explanation */}
                                <div 
                                  className="p-3 rounded border"
                                  style={{
                                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                    borderColor: '#3B82F6'
                                  }}
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <Lightbulb className="h-3 w-3" style={{ color: '#3B82F6' }} />
                                    <span className="font-medium text-xs" style={{ color: '#3B82F6' }}>EXPLICAÇÃO:</span>
                                  </div>
                                  <p className="italic leading-relaxed" style={{ color: '#A0A8B8' }}>
                                    {mistake.explanation}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4" style={{ color: '#6B7280' }} />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma gramática encontrada</h3>
                  <p className="text-muted-foreground mb-4">Esta seção ainda não foi gerada</p>
                </div>
              )}
              </TabsContent>
            )}

            {/* Aims Section */}
            <TabsContent value="aims" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Objetivos de Aprendizagem
                </h3>
                <Badge variant="outline" className={`${getStatusColor(sectionStatuses.aims)} text-white border-0`}>
                  {sectionStatuses.aims === 'completed' ? 'Completo' : 'Pendente'}
                </Badge>
              </div>
              
              {unit?.main_aim ? (
                <Card className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold text-lg text-primary mb-2">
                        Objetivo Principal
                      </h4>
                      <p className="text-sm leading-relaxed">
                        {unit?.main_aim}
                      </p>
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Objetivos de Aprendizagem</h3>
                  <p className="text-muted-foreground mb-4">Esta seção ainda não foi gerada</p>
                </div>
              )}
            </TabsContent>

            {/* Tips Section - Only for lexical_unit */}
            {unit?.unit_type === 'lexical_unit' && (
              <TabsContent value="tips" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="h-5 w-5" style={{ color: '#F59E0B' }} />
                  <span>Dicas de Aprendizagem</span>
                  <Badge 
                    className="ml-2 text-xs border-none" 
                    style={{ backgroundColor: '#F59E0B', color: 'white' }}
                  >
                    ESTRATÉGIA
                  </Badge>
                </h3>
                <Badge variant="outline" className={`${getStatusColor(sectionStatuses.tips)} text-white border-0`}>
                  {sectionStatuses.tips === 'completed' ? 'Completo' : 'Pendente'}
                </Badge>
              </div>
              
              {unit?.tips ? (
                <Card className="p-6 border" style={{ borderColor: '#3A4553' }}>
                  <div className="space-y-6">
                    {/* Main Strategy */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Lightbulb className="h-6 w-6" style={{ color: '#F59E0B' }} />
                        <h4 className="font-semibold text-xl text-primary">
                          {unit?.tips?.title}
                        </h4>
                      </div>
                      
                      <div className="mb-4">
                        <Badge 
                          className="text-sm border-none font-medium"
                          style={{ backgroundColor: '#3B82F6', color: 'white' }}
                        >
                          <Target className="h-3 w-3 mr-1" />
                          Estratégia: {unit?.tips?.strategy}
                        </Badge>
                      </div>
                      
                      <div 
                        className="p-4 rounded-lg border"
                        style={{
                          backgroundColor: '#232A37',
                          borderColor: '#F59E0B',
                          color: '#A0A8B8'
                        }}
                      >
                        <h6 className="text-sm font-medium mb-2 flex items-center gap-1" style={{ color: '#F59E0B' }}>
                          <Eye className="h-3 w-3" />
                          EXPLICAÇÃO DA ESTRATÉGIA:
                        </h6>
                        <p className="text-sm leading-relaxed">{unit?.tips?.explanation}</p>
                      </div>
                    </div>
                    
                    {/* Examples */}
                    {unit?.tips?.examples && unit?.tips?.examples?.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-lg flex items-center gap-2">
                          <Play className="h-4 w-4" style={{ color: '#10B981' }} />
                          <span>Exemplos Práticos</span>
                          <Badge 
                            className="ml-2 text-xs border-none"
                            style={{ backgroundColor: '#10B981', color: 'white' }}
                          >
                            {unit?.tips?.examples?.length}
                          </Badge>
                        </h5>
                        <div className="grid gap-3">
                          {unit?.tips?.examples?.map((example: string, idx: number) => (
                            <div 
                              key={idx} 
                              className="p-3 rounded-lg border"
                              style={{
                                backgroundColor: '#232A37',
                                borderColor: '#10B981'
                              }}
                            >
                              <div className="flex items-start gap-2">
                                <Badge 
                                  className="text-xs border-none mt-0.5"
                                  style={{ backgroundColor: '#10B981', color: 'white' }}
                                >
                                  #{idx + 1}
                                </Badge>
                                <p className="text-sm" style={{ color: '#A0A8B8' }}>{example}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Practice Suggestions */}
                    {unit?.tips?.practice_suggestions && unit?.tips?.practice_suggestions?.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-lg flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" style={{ color: '#3B82F6' }} />
                          <span>Sugestões de Prática</span>
                          <Badge 
                            className="ml-2 text-xs border-none"
                            style={{ backgroundColor: '#3B82F6', color: 'white' }}
                          >
                            {unit?.tips?.practice_suggestions?.length}
                          </Badge>
                        </h5>
                        <div className="space-y-2">
                          {unit?.tips?.practice_suggestions?.map((suggestion: string, idx: number) => (
                            <div key={idx} className="flex items-start gap-3">
                              <div 
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mt-0.5"
                                style={{ backgroundColor: '#3B82F6', color: 'white' }}
                              >
                                {idx + 1}
                              </div>
                              <p className="text-sm leading-relaxed flex-1">{suggestion}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Memory Techniques */}
                    {unit?.tips?.memory_techniques && unit?.tips?.memory_techniques?.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-lg flex items-center gap-2">
                          <RefreshCw className="h-4 w-4" style={{ color: '#FF4757' }} />
                          <span>Técnicas de Memorização</span>
                          <Badge 
                            className="ml-2 text-xs border-none"
                            style={{ backgroundColor: '#FF4757', color: 'white' }}
                          >
                            ESPECIAIS
                          </Badge>
                        </h5>
                        <div className="space-y-3">
                          {unit?.tips?.memory_techniques?.map((technique: string, idx: number) => (
                            <div 
                              key={idx} 
                              className="p-4 rounded-lg border-l-4"
                              style={{
                                backgroundColor: '#232A37',
                                borderLeftColor: '#FF4757'
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <RefreshCw className="h-4 w-4 mt-0.5" style={{ color: '#FF4757' }} />
                                <p className="text-sm leading-relaxed" style={{ color: '#A0A8B8' }}>{technique}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Vocabulary Coverage */}
                    {unit?.tips?.vocabulary_coverage && unit?.tips?.vocabulary_coverage?.length > 0 && (
                      <div className="space-y-3">
                        <h5 className="font-medium text-lg flex items-center gap-2">
                          <Sparkles className="h-4 w-4" style={{ color: '#00D2FF' }} />
                          <span>Vocabulário Abordado</span>
                          <Badge 
                            className="ml-2 text-xs border-none"
                            style={{ backgroundColor: '#00D2FF', color: '#1A1F29' }}
                          >
                            {unit?.tips?.vocabulary_coverage?.length} palavras
                          </Badge>
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {unit?.tips?.vocabulary_coverage?.slice(0, 12).map((word: string, idx: number) => (
                            <Badge 
                              key={idx} 
                              className="text-xs border-none"
                              style={{ backgroundColor: '#00D2FF', color: '#1A1F29' }}
                            >
                              {word}
                            </Badge>
                          ))}
                          {unit?.tips?.vocabulary_coverage && unit?.tips?.vocabulary_coverage?.length > 12 && (
                            <Badge 
                              className="text-xs border"
                              style={{ 
                                backgroundColor: 'transparent', 
                                borderColor: '#3A4553', 
                                color: '#A0A8B8' 
                              }}
                            >
                              +{unit?.tips?.vocabulary_coverage?.length - 12} mais
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Selection Rationale */}
                    {unit?.tips?.selection_rationale && (
                      <div 
                        className="p-4 rounded-lg border"
                        style={{
                          backgroundColor: '#232A37',
                          borderColor: '#6B7280'
                        }}
                      >
                        <h6 className="text-sm font-medium mb-2 flex items-center gap-1" style={{ color: '#A0A8B8' }}>
                          <AlertCircle className="h-3 w-3" />
                          JUSTIFICATIVA DA SELEÇÃO:
                        </h6>
                        <p className="text-sm italic leading-relaxed" style={{ color: '#6B7280' }}>
                          {unit?.tips?.selection_rationale}
                        </p>
                      </div>
                    )}
                  </div>
                </Card>
              ) : (
                <div className="text-center py-8">
                  <Lightbulb className="h-12 w-12 mx-auto mb-4" style={{ color: '#6B7280' }} />
                  <h3 className="text-lg font-semibold mb-2">Dicas de Aprendizagem</h3>
                  <p className="text-muted-foreground mb-4">Esta seção ainda não foi gerada</p>
                </div>
              )}
              </TabsContent>
            )}

            {/* Assessments Section */}
            <TabsContent value="assessments" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" style={{ color: '#FF4757' }} />
                  <span>Avaliações ({unit.assessments?.activities?.length || 0})</span>
                  <Badge 
                    className="ml-2 text-xs border-none" 
                    style={{ backgroundColor: '#FF4757', color: 'white' }}
                  >
                    EXERCÍCIOS
                  </Badge>
                </h3>
                <Badge variant="outline" className={`${getStatusColor(sectionStatuses.assessments)} text-white border-0`}>
                  {sectionStatuses.assessments === 'completed' ? 'Completo' : 'Pendente'}
                </Badge>
              </div>
              
              {loadingAssessments ? (
                <div className="text-center py-8">
                  <div 
                    className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
                    style={{ borderColor: '#FF4757' }}
                  ></div>
                  <p className="text-sm" style={{ color: '#A0A8B8' }}>Carregando detalhes dos exercícios...</p>
                </div>
              ) : detailedAssessments.length > 0 ? (
                <div className="space-y-6">
                  {/* Assessment Overview */}
                  <Card className="p-4 border" style={{ borderColor: '#3A4553', backgroundColor: '#232A37' }}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5" style={{ color: '#FF4757' }} />
                        <h4 className="font-semibold text-lg">Exercícios Interativos</h4>
                      </div>
                      <Badge 
                        className="text-sm border-none font-medium"
                        style={{ backgroundColor: '#10B981', color: 'white' }}
                      >
                        {detailedAssessments.length} atividades
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {detailedAssessments.map((activity, idx) => (
                        <div key={idx} className="text-center">
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2"
                            style={{ backgroundColor: '#FF4757' }}
                          >
                            <span className="text-white font-semibold">{idx + 1}</span>
                          </div>
                          <Badge 
                            className="text-xs border-none"
                            style={{ 
                              backgroundColor: activity.type === 'CLOZE_TEST' ? '#3B82F6' :
                                              activity.type === 'MULTIPLE_CHOICE' ? '#10B981' :
                                              activity.type === 'GAP_FILL' ? '#F59E0B' :
                                              activity.type === 'TRUE_FALSE' ? '#00D2FF' :
                                              activity.type === 'REORDER' ? '#FF4757' :
                                              activity.type === 'TRANSFORMATION' ? '#8B5CF6' : '#6B7280',
                              color: 'white'
                            }}
                          >
                            {activity.type}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    
                    <div 
                      className="p-3 rounded-lg border text-sm"
                      style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderColor: '#3B82F6',
                        color: '#A0A8B8'
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Lightbulb className="h-3 w-3" style={{ color: '#3B82F6' }} />
                        <span className="font-medium text-xs" style={{ color: '#3B82F6' }}>INSTRUÇÕES:</span>
                      </div>
                      <p>Os exercícios abaixo são interativos e foram adaptados para o contexto da unidade. Clique em cada um para explorar o conteúdo completo.</p>
                    </div>
                  </Card>

                  {/* Individual Assessments */}
                  {detailedAssessments.map((activity, index) => (
                    <div key={index} className="assessment-item">
                      <AssessmentRenderer 
                        assessment={activity}
                        isInteractive={true}
                      />
                    </div>
                  ))}
                </div>
              ) : unit.assessments?.activities && unit.assessments.activities.length > 0 ? (
                <div className="space-y-4">
                  <div 
                    className="p-4 border rounded-lg"
                    style={{
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      borderColor: '#F59E0B'
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 mt-0.5" style={{ color: '#F59E0B' }} />
                      <div>
                        <p className="text-sm font-medium mb-1" style={{ color: '#F59E0B' }}>
                          Conteúdo Básico Disponível
                        </p>
                        <p className="text-sm" style={{ color: '#A0A8B8' }}>
                          Exercícios identificados mas sem detalhamento completo. Mostrando estrutura básica:
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {unit?.assessments?.activities?.map((activity: any, index: number) => (
                    <div key={index} className="assessment-item-basic">
                      <AssessmentRenderer 
                        assessment={activity}
                        isInteractive={false}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ backgroundColor: '#232A37', border: '2px solid #3A4553' }}
                  >
                    <CheckCircle2 className="h-10 w-10" style={{ color: '#6B7280' }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Nenhuma avaliação encontrada</h3>
                  <p className="text-muted-foreground mb-4">Esta seção ainda não foi gerada</p>
                  <div className="flex items-center justify-center gap-2 text-xs" style={{ color: '#6B7280' }}>
                    <Clock className="h-3 w-3" />
                    <span>Aguardando criação de exercícios</span>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Q&A Section */}
            <TabsContent value="qa" className="space-y-4 mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-blue-600" />
                  Q&A ({unit.qa?.questions?.length || 0})
                </h3>
                <Badge variant="outline" className={`${getStatusColor(sectionStatuses.qa)} text-white border-0`}>
                  {sectionStatuses.qa === 'completed' ? 'Completo' : 'Pendente'}
                </Badge>
              </div>
              
              {unit?.qa?.questions && unit?.qa?.questions?.length > 0 ? (
                <div className="space-y-6">
                  {/* Progression Info */}
                  {unit?.qa?.difficulty_progression && (
                    <div className="p-4 rounded-lg border" style={{
                      backgroundColor: '#232A37',
                      borderColor: '#3A4553',
                      color: '#A0A8B8'
                    }}>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4" style={{ color: '#3B82F6' }} />
                        <span className="font-medium text-white">Informações da Seção Q&A</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-white font-medium">Progressão:</span> 
                          <Badge className="ml-2" style={{ backgroundColor: '#3B82F6', color: 'white', border: 'none' }}>
                            {unit?.qa?.difficulty_progression}
                          </Badge>
                        </div>
                        {unit?.qa?.vocabulary_integration && unit?.qa?.vocabulary_integration?.length > 0 && (
                          <div>
                            <span className="text-white font-medium">Vocabulário integrado:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {unit?.qa?.vocabulary_integration?.map((word: string, idx: number) => (
                                <Badge key={idx} variant="secondary" style={{ 
                                  backgroundColor: '#00D2FF', 
                                  color: '#1A1F29', 
                                  fontSize: '11px',
                                  border: 'none'
                                }}>
                                  {word}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Student Questions */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-lg flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" style={{ color: '#3B82F6' }} />
                      <span>Perguntas para Estudantes</span>
                      <Badge 
                        className="ml-2 text-xs border-none" 
                        style={{ backgroundColor: '#3B82F6', color: 'white' }}
                      >
                        {unit?.qa?.questions?.length}
                      </Badge>
                    </h4>
                    {unit?.qa?.questions?.map((question, index) => {
                      const cognitiveLevel = unit.qa?.cognitive_levels?.[index] || 'understand'
                      const answer = unit.qa?.answers?.[index]
                      const pedagogicalNote = unit.qa?.pedagogical_notes?.[index]
                      
                      // Color coding for Bloom's taxonomy using IVO palette
                      const getCognitiveColor = (level: string) => {
                        const colors: Record<string, { bg: string; color: string }> = {
                          'remember': { bg: '#10B981', color: 'white' }, // IVO success
                          'understand': { bg: '#3B82F6', color: 'white' }, // IVO info
                          'apply': { bg: '#F59E0B', color: 'white' }, // IVO warning
                          'analyze': { bg: '#FF4757', color: 'white' }, // IVO accent primary
                          'evaluate': { bg: '#EF4444', color: 'white' }, // IVO error
                          'create': { bg: '#00D2FF', color: '#1A1F29' } // IVO accent secondary
                        }
                        return colors[level] || colors.understand
                      }

                      return (
                        <Card key={index} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <h5 className="font-semibold text-base text-primary flex-1">
                                {typeof question === 'string' ? question : question.question}
                              </h5>
                              <Badge 
                                className="text-xs border-none font-medium"
                                style={{ 
                                  backgroundColor: getCognitiveColor(cognitiveLevel).bg,
                                  color: getCognitiveColor(cognitiveLevel).color
                                }}
                              >
                                {cognitiveLevel}
                              </Badge>
                            </div>
                            
                            {answer && (
                              <div 
                                className="mt-3 p-3 rounded-lg border"
                                style={{
                                  backgroundColor: '#232A37',
                                  borderColor: '#10B981'
                                }}
                              >
                                <h6 className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: '#10B981' }}>
                                  <CheckCircle className="h-3 w-3" />
                                  RESPOSTA MODELO (Professor):
                                </h6>
                                <p className="text-sm" style={{ color: '#A0A8B8' }}>{answer}</p>
                              </div>
                            )}

                            {pedagogicalNote && (
                              <div 
                                className="mt-3 p-3 rounded-lg border"
                                style={{
                                  backgroundColor: '#232A37',
                                  borderColor: '#F59E0B'
                                }}
                              >
                                <h6 className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: '#F59E0B' }}>
                                  <Lightbulb className="h-3 w-3" />
                                  NOTA PEDAGÓGICA:
                                </h6>
                                <p className="text-sm" style={{ color: '#A0A8B8' }}>{pedagogicalNote}</p>
                              </div>
                            )}
                          </div>
                        </Card>
                      )
                    })}
                  </div>

                  {/* Pronunciation Questions Section */}
                  {unit?.qa?.pronunciation_questions && unit.qa.pronunciation_questions.length > 0 && (
                    <div className="space-y-4">
                      <h4 className="font-semibold text-lg flex items-center gap-2">
                        <Volume2 className="h-4 w-4" style={{ color: '#FF4757' }} />
                        <span>Exercícios de Pronúncia</span>
                        <Badge 
                          className="ml-2 text-xs border-none" 
                          style={{ backgroundColor: '#FF4757', color: 'white' }}
                        >
                          {unit?.qa?.pronunciation_questions?.length}
                        </Badge>
                      </h4>
                      {unit?.qa?.pronunciation_questions?.map((question: string, index: number) => {
                        const phoneticNote = unit.qa?.phonetic_awareness?.[index]
                        
                        return (
                          <Card 
                            key={index} 
                            className="p-4 border"
                            style={{ borderColor: '#FF4757' }}
                          >
                            <div className="space-y-3">
                              <h5 className="font-semibold text-base" style={{ color: '#FF4757' }}>
                                <Volume2 className="h-4 w-4 inline mr-2" />
                                {question}
                              </h5>
                              
                              {phoneticNote && (
                                <div 
                                  className="p-3 rounded-lg border"
                                  style={{
                                    backgroundColor: '#232A37',
                                    borderColor: '#00D2FF'
                                  }}
                                >
                                  <h6 className="text-xs font-medium mb-2 flex items-center gap-1" style={{ color: '#00D2FF' }}>
                                    <Volume2 className="h-3 w-3" />
                                    CONSCIÊNCIA FONÉTICA:
                                  </h6>
                                  <p className="text-sm" style={{ color: '#A0A8B8' }}>{phoneticNote}</p>
                                </div>
                              )}
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Perguntas e Respostas</h3>
                  <p className="text-muted-foreground mb-4">Esta seção ainda não foi gerada</p>
                </div>
              )}
            </TabsContent>

            {/* Assessments Solving Section */}
            <TabsContent value="assessments-solving" className="space-y-4 mt-6">
              <AssessmentsSolvingStep 
                unit={unit}
                onStepComplete={() => {
                  console.log('Assessment solving step completed')
                }}
              />
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}