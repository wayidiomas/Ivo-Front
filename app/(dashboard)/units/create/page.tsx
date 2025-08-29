"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ArrowLeft,
  BookOpen,
  GraduationCap,
  Upload,
  X,
  Image as ImageIcon,
  Sparkles,
  Brain,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
  Info,
  Zap
} from "lucide-react"
import { UnitCreateRequest, CEFRLevel, LanguageVariant, UnitType } from "@/lib/types/api.types"
import { coursesApi } from "@/lib/api/courses"
import { booksApi } from "@/lib/api/books"
import { unitsApi } from "@/lib/api/units"
import { AILoading } from "@/components/ui/ai-loading"
import UnitConfigurationForm from "@/components/units/UnitConfigurationForm"

export default function CreateUnitPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Check if coming from specific course/book
  const courseId = searchParams.get('courseId')
  const bookId = searchParams.get('bookId')
  const isFromUnitsPage = !courseId && !bookId
  
  const [formData, setFormData] = useState({
    book_id: '',
    context: '',
    cefr_level: '',
    unit_type: 'lexical_unit' as 'lexical_unit' | 'grammar_unit' | 'functional_unit' | 'mixed_unit',
    language_variant: 'american_english' as 'american_english' | 'british_english' | 'australian_english' | 'canadian_english' | 'indian_english',
    images: [] as File[],
    // CAMPOS REAIS DA API (mapeados corretamente)
    vocabulary_target_count: 15,     // API: target_count (5-50) para VocabularyGenerationRequest  
    sentences_target_count: 10,      // API: target_count (3-20) para SentenceGenerationRequest
    qa_target_count: 8,              // API: target_count (2-15) para QAGenerationRequest
    assessment_count: 2,             // API: assessment_count (1-5) para AssessmentGenerationRequest
    is_revision_unit: false,         // API: is_revision_unit (boolean) para VocabularyGenerationRequest
    // CAMPOS MOCK COMENTADOS (não existem na API)
    // vocabulary_min_count: 15,
    // vocabulary_max_count: 50,
    // sentences_min_count: 20,
    // sentences_max_count: 60,
    // content_complexity: 'balanced',
    // register_level: 'neutral',
    // prioritize_frequency: true,
    // cultural_context: true,
    // auto_generate: true,
    // quality_threshold: 0.8
  })

  // Real API data
  const [courses, setCourses] = useState<any[]>([])
  const [books, setBooks] = useState<any[]>([])
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingBooks, setLoadingBooks] = useState(false)
  
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [availableBooks, setAvailableBooks] = useState<any[]>([])
  const [availableLevels, setAvailableLevels] = useState<string[]>([])
  
  // Search states for units page mode
  const [courseSearchTerm, setCourseSearchTerm] = useState('')
  const [bookSearchTerm, setBookSearchTerm] = useState('')
  const [filteredCourses, setFilteredCourses] = useState<any[]>([])
  const [filteredBooks, setFilteredBooks] = useState<any[]>([])
  const [showCourseResults, setShowCourseResults] = useState(false)
  const [showBookResults, setShowBookResults] = useState(false)

  // Load courses from API
  useEffect(() => {
    console.log('🚀 UseEffect executando para carregar cursos')
    
    const loadCourses = async () => {
      try {
        setLoadingCourses(true)
        console.log('🔄 Carregando cursos...')
        console.log('📡 coursesApi:', coursesApi)
        
        const response = await coursesApi.listCourses({
          page: 1,
          size: 100
        })
        
        console.log('📦 Response completa:', response)
        console.log('✅ Cursos carregados:', response.data)
        
        const coursesData = response.data || []
        console.log('🎯 Dados dos cursos:', coursesData)
        
        setCourses(coursesData)
        setFilteredCourses(coursesData)
      } catch (error) {
        console.error('❌ Erro ao carregar cursos:', error)
        console.error('🔍 Detalhes do erro:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          response: (error as any)?.response
        })
        setError('Erro ao carregar cursos disponíveis')
      } finally {
        setLoadingCourses(false)
      }
    }

    loadCourses()
  }, [])

  // Load books from API when needed
  const loadBooks = async (courseId?: string) => {
    try {
      setLoadingBooks(true)
      const params: any = {
        page: 1,
        size: 100
      }
      
      if (courseId) {
        params.course_id = courseId
      }
      
      const response = await booksApi.listAllBooks(params)
      setBooks(response.data)
      
      if (courseId) {
        const courseBooksOnly = response.data.filter(book => book.course_id === courseId)
        setAvailableBooks(courseBooksOnly)
        setFilteredBooks(courseBooksOnly)
      }
    } catch (error) {
      console.error('Erro ao carregar books:', error)
      setError('Erro ao carregar books disponíveis')
    } finally {
      setLoadingBooks(false)
    }
  }

  // Initialize form based on URL params and load books
  useEffect(() => {
    if (courseId && courses.length > 0) {
      const course = courses.find(c => c.id === courseId)
      if (course) {
        setSelectedCourse(courseId)
        setCourseSearchTerm(course.name)
        setAvailableLevels(course.target_levels || [])
        
        // Load books for this course
        loadBooks(courseId)
        
        if (bookId) {
          // Wait for books to be loaded, then set the book
          setTimeout(() => {
            const book = books.find(b => b.id === bookId)
            if (book) {
              setBookSearchTerm(book.name)
              setFormData(prev => ({ 
                ...prev, 
                book_id: bookId,
                cefr_level: book.target_level 
              }))
            }
          }, 100)
        }
      }
    }
  }, [courseId, bookId, courses])

  // Filter courses based on search
  useEffect(() => {
    console.log('🔍 Filtrando cursos:', { 
      courseSearchTerm, 
      coursesLength: courses?.length, 
      courses: courses?.map(c => c.name) 
    })
    
    if (courses && courses.length > 0) {
      const filtered = courses.filter(course => 
        course.name.toLowerCase().includes(courseSearchTerm.toLowerCase())
      )
      console.log('📋 Resultado da filtragem:', { 
        searchTerm: courseSearchTerm, 
        filteredCount: filtered.length,
        filteredNames: filtered.map(c => c.name)
      })
      setFilteredCourses(filtered)
      setShowCourseResults(courseSearchTerm.length > 0 && filtered.length > 0)
    }
  }, [courseSearchTerm, courses])

  // Filter books based on search
  useEffect(() => {
    if (availableBooks && availableBooks.length > 0) {
      const filtered = availableBooks.filter(book => 
        book.name.toLowerCase().includes(bookSearchTerm.toLowerCase())
      )
      setFilteredBooks(filtered)
      setShowBookResults(bookSearchTerm.length > 0 && filtered.length > 0)
    }
  }, [bookSearchTerm, availableBooks])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.search-dropdown')) {
        setShowCourseResults(false)
        setShowBookResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCourseChange = (courseId: string) => {
    setSelectedCourse(courseId)
    const course = courses.find(c => c.id === courseId)
    if (course) {
      setAvailableLevels(course.target_levels || [])
      loadBooks(courseId) // Load books from API
      setFormData(prev => ({ ...prev, book_id: '', cefr_level: '' }))
    }
  }

  const handleCourseSelect = (course: any) => {
    setSelectedCourse(course.id)
    setCourseSearchTerm(course.name)
    setShowCourseResults(false)
    setAvailableLevels(course.target_levels || [])
    loadBooks(course.id) // Load books from API
    setFormData(prev => ({ ...prev, book_id: '', cefr_level: '' }))
    setBookSearchTerm('')
  }

  const handleBookSelect = (book: any) => {
    setBookSearchTerm(book.name)
    setShowBookResults(false)
    setFormData(prev => ({ 
      ...prev, 
      book_id: book.id,
      cefr_level: book.target_level 
    }))
  }

  const handleBookChange = (bookId: string) => {
    const book = books.find(b => b.id === bookId)
    if (book) {
      setFormData(prev => ({ 
        ...prev, 
        book_id: bookId,
        cefr_level: book.target_level // Auto-select book's target level
      }))
    }
  }

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return
    const newImages = Array.from(files).slice(0, 2)
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const removeImage = (index: number) => {
    if (formData.images) {
      const newImages = [...formData.images]
      newImages.splice(index, 1)
      setFormData(prev => ({ ...prev, images: newImages }))
    }
  }

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true)
      setError(null)

      // Validation
      if (!formData.book_id) {
        setError('Por favor, selecione um livro')
        return
      }
      
      // Conditional validation: context required without images, optional with images
      if (!formData.images?.length && !formData.context?.trim()) {
        setError('É necessário fornecer um contexto OU pelo menos uma imagem.')
        return
      }
      
      if (!formData.cefr_level) {
        setError('Por favor, selecione o nível CEFR')
        return
      }

      // Prepare API request data
      const unitCreateData = {
        context: formData.context,
        cefr_level: formData.cefr_level as CEFRLevel,
        language_variant: formData.language_variant as LanguageVariant,
        unit_type: formData.unit_type as UnitType,
        images: formData.images,
        // Configurações de metas do Step 2
        vocabulary_target_count: formData.vocabulary_target_count,
        sentences_target_count: formData.sentences_target_count,
        qa_target_count: formData.qa_target_count,
        assessment_count: formData.assessment_count,
        is_revision_unit: formData.is_revision_unit
      }

      // Create unit via API (will take up to 3 minutes)
      console.log('Creating unit with real API:', unitCreateData)
      const response = await unitsApi.createUnit(formData.book_id, unitCreateData)
      
      // Redirect to unit pipeline (first tab)
      router.push(`/units/${response.data.unit.id}?tab=pipeline`)
      
    } catch (error) {
      console.error('Error creating unit:', error)
      setError('Erro ao criar unidade. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { id: 1, name: 'Informações Básicas', description: 'Curso, livro e contexto' },
    { id: 2, name: 'Configurações', description: 'Metas e preferências' },
    { id: 3, name: 'Revisão', description: 'Confirmar e criar' }
  ]

  const currentStepData = steps.find(s => s.id === currentStep)

  // Debug log on render
  console.log('🎨 Render estados:', {
    loadingCourses,
    coursesCount: courses?.length,
    courseSearchTerm,
    showCourseResults,
    filteredCoursesCount: filteredCourses?.length,
    isFromUnitsPage
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto py-8 space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Nova Unidade</h1>
              {!isFromUnitsPage && (
                <Badge variant="outline" className="text-xs">
                  {courseId && bookId ? 'Livro específico' : 'Curso específico'}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {isFromUnitsPage 
                ? 'Crie uma nova unidade de aprendizado com conteúdo personalizado'
                : 'Configurações pré-selecionadas baseadas no contexto de navegação'
              }
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                    currentStep >= step.id 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'border-muted-foreground text-muted-foreground'
                  }`}>
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="font-medium">{step.id}</span>
                    )}
                  </div>
                  <div className="ml-3 min-w-0 flex-1">
                    <div className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {step.description}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <Progress value={(currentStep / steps.length) * 100} className="h-2" />
          </CardContent>
        </Card>

        {/* Step Content */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Selecione o curso, livro, nível CEFR, variante de idioma e defina o contexto da unidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Course Selection - Dynamic based on context */}
              <div className="space-y-2">
                <Label>Curso *</Label>
                {isFromUnitsPage ? (
                  // Search mode when coming from units page
                  <div className="relative search-dropdown">
                    <Input
                      placeholder="Digite o nome do curso..."
                      value={courseSearchTerm}
                      onChange={(e) => {
                        console.log('🔤 Input onChange:', e.target.value)
                        setCourseSearchTerm(e.target.value)
                        setShowCourseResults(true)
                      }}
                      onFocus={() => {
                        console.log('🎯 Input onFocus')
                        setShowCourseResults(true)
                      }}
                    />
                    {showCourseResults && (
                      <div className="absolute top-full mt-1 w-full bg-background border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                        {filteredCourses && filteredCourses.length > 0 ? (
                          filteredCourses.map(course => (
                            <button
                              key={course.id}
                              type="button"
                              onClick={() => handleCourseSelect(course)}
                              className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2"
                            >
                              <GraduationCap className="h-4 w-4" />
                              <span className="flex-1">{course.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {course.target_levels?.join(', ') || 'Níveis não definidos'}
                              </Badge>
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            Nenhum curso encontrado
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  // Pre-filled mode when coming from course page
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      <span className="font-medium">{courseSearchTerm || 'Carregando...'}</span>
                      <Badge variant="outline" className="ml-auto">
                        Pré-selecionado
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Book Selection - Dynamic based on context */}
              <div className="space-y-2">
                <Label>Livro *</Label>
                {isFromUnitsPage ? (
                  // Search mode when coming from units page
                  <div className="relative search-dropdown">
                    <Input
                      placeholder="Digite o nome do livro..."
                      value={bookSearchTerm}
                      onChange={(e) => {
                        setBookSearchTerm(e.target.value)
                        setShowBookResults(true)
                      }}
                      onFocus={() => setShowBookResults(true)}
                      disabled={!selectedCourse}
                    />
                    {showBookResults && bookSearchTerm && selectedCourse && (
                      <div className="absolute top-full mt-1 w-full bg-background border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                        {filteredBooks && filteredBooks.filter(book => book.course_id === selectedCourse).length > 0 ? (
                          filteredBooks
                            .filter(book => book.course_id === selectedCourse)
                            .map(book => (
                              <button
                                key={book.id}
                                type="button"
                                onClick={() => handleBookSelect(book)}
                                className="w-full px-3 py-2 text-left hover:bg-muted flex items-center gap-2"
                              >
                                <BookOpen className="h-4 w-4" />
                                <span className="flex-1">{book.name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {book.target_level}
                                </Badge>
                              </button>
                            ))
                        ) : (
                          <div className="px-3 py-2 text-sm text-muted-foreground">
                            {!selectedCourse ? 'Selecione um curso primeiro' : 'Nenhum livro encontrado'}
                          </div>
                        )}
                      </div>
                    )}
                    {!selectedCourse && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Selecione um curso primeiro
                      </p>
                    )}
                  </div>
                ) : (
                  // Pre-filled mode when coming from book page
                  <div className="p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="font-medium">{bookSearchTerm || 'Carregando...'}</span>
                      <Badge variant="outline" className="ml-auto">
                        {bookId ? 'Pré-selecionado' : 'Selecionar'}
                      </Badge>
                    </div>
                    {!bookId && availableBooks && availableBooks.length > 0 && (
                      <Select 
                        value={formData.book_id} 
                        onValueChange={handleBookChange}
                      >
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Selecione um livro" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableBooks && availableBooks.map(book => (
                            <SelectItem key={book.id} value={book.id}>
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                {book.name}
                                <Badge variant="outline" className="ml-auto">
                                  {book.target_level}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}
              </div>

              {/* CEFR Level, Unit Type and Language Variant */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="space-y-2">
                  <Label>Nível CEFR *</Label>
                  <Select 
                    value={formData.cefr_level} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, cefr_level: value }))}
                    disabled={!availableLevels || availableLevels.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o nível" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableLevels && availableLevels.map(level => (
                        <SelectItem key={level} value={level}>
                          <Badge variant="outline">{level}</Badge>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Tipo de Unidade *</Label>
                  <Select 
                    value={formData.unit_type} 
                    onValueChange={(value: 'lexical_unit' | 'grammar_unit') => 
                      setFormData(prev => ({ ...prev, unit_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="lexical_unit">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Unidade Lexical
                        </div>
                      </SelectItem>
                      <SelectItem value="grammar_unit">
                        <div className="flex items-center gap-2">
                          <Brain className="h-4 w-4" />
                          Unidade Gramatical
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Variante do Idioma *</Label>
                  <Select 
                    value={formData.language_variant} 
                    onValueChange={(value: 'american_english' | 'british_english' | 'australian_english' | 'canadian_english' | 'indian_english') => 
                      setFormData(prev => ({ ...prev, language_variant: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="american_english">Inglês Americano</SelectItem>
                      <SelectItem value="british_english">Inglês Britânico</SelectItem>
                      <SelectItem value="australian_english">Inglês Australiano</SelectItem>
                      <SelectItem value="canadian_english">Inglês Canadense</SelectItem>
                      <SelectItem value="indian_english">Inglês Indiano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

              </div>

              {/* Context */}
              <div className="space-y-2">
                <Label htmlFor="context">Contexto da Unidade *</Label>
                <Textarea
                  id="context"
                  placeholder="Descreva o contexto, tema e cenário da unidade. Ex: Apresentações de negócios em ambientes profissionais com foco em confiança e clareza..."
                  value={formData.context}
                  onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  O contexto é fundamental para a geração de conteúdo relevante e coeso
                </p>
              </div>

              {/* Images */}
              <div className="space-y-3">
                <Label>Imagens da Unidade (Opcional - Máximo 2)</Label>
                
                {formData.images && formData.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-4">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-video bg-muted rounded-lg border flex items-center justify-center relative overflow-hidden">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground ml-2">
                            {image.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {(!formData.images || formData.images.length < 2) && (
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                    <label htmlFor="images" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">Clique para adicionar imagens</span>
                        <span className="text-xs text-muted-foreground">
                          PNG, JPG ou GIF (máx. 5MB cada)
                        </span>
                      </div>
                    </label>
                    <input
                      id="images"
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleImageUpload(e.target.files)}
                    />
                  </div>
                )}
              </div>

            </CardContent>
          </Card>
        )}

        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                Configurações de Conteúdo
              </CardTitle>
              <CardDescription>
                Configure metas de conteúdo e preferências de geração
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UnitConfigurationForm 
                unit={formData as any} 
                onSave={(data) => setFormData(prev => ({ ...prev, ...data } as any))}
                isEditing={true}
                showStatus={false}
              />
            </CardContent>
          </Card>
        )}

        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Revisão e Confirmação
              </CardTitle>
              <CardDescription>
                Revise as configurações e confirme a criação da unidade
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">

              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                  <h3 className="font-semibold">Informações Básicas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Curso:</span>
                      <span>{courses && courses.find(c => c.id === selectedCourse)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Livro:</span>
                      <span>{availableBooks && availableBooks.find(b => b.id === formData.book_id)?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Nível:</span>
                      <Badge variant="outline">{formData.cefr_level}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipo:</span>
                      <Badge variant="outline">
                        {formData.unit_type === 'lexical_unit' ? 'Lexical' : 'Gramática'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Idioma:</span>
                      <Badge variant="outline">
                        {formData.language_variant === 'american_english' ? 'Inglês Americano' :
                         formData.language_variant === 'british_english' ? 'Inglês Britânico' :
                         formData.language_variant === 'australian_english' ? 'Inglês Australiano' :
                         formData.language_variant === 'canadian_english' ? 'Inglês Canadense' :
                         formData.language_variant === 'indian_english' ? 'Inglês Indiano' : 
                         'Não definido'}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Metas de Conteúdo</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Vocabulário:</span>
                      <span>{formData.vocabulary_target_count} palavras</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sentenças:</span>
                      <span>{formData.sentences_target_count} sentenças</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Q&A:</span>
                      <span>{formData.qa_target_count} questões</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Avaliações:</span>
                      <span>{formData.assessment_count} exercícios</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Revisão:</span>
                      <span>{formData.is_revision_unit ? 'Sim' : 'Não'}</span>
                    </div>
                  </div>
                </div>

              </div>

              <Separator />

              {/* Context Preview */}
              <div className="space-y-2">
                <h3 className="font-semibold">Contexto da Unidade</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm leading-relaxed">{formData.context}</p>
                </div>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1 || isSubmitting}
              >
                Anterior
              </Button>
              
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="h-4 w-4" />
                <span>Passo {currentStep} de {steps.length}</span>
              </div>
              
              {currentStep < steps.length ? (
                <Button 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Próximo
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Criar Unidade
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* AI Loading Overlay para criação de unidade */}
      {isSubmitting && (
        <AILoading 
          title="Criando unidade com IA"
          subtitle="Aguarde enquanto a unidade é gerada. Isso pode levar até 5 minutos."
          estimatedTime={300} // 5 minutes
        />
      )}
    </div>
  )
}

