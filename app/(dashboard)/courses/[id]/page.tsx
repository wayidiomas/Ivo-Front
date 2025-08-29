"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  BookOpen, 
  GraduationCap, 
  Activity,
  Users,
  Clock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Globe,
  Target,
  CheckCircle2,
  Plus
} from "lucide-react"
import Link from "next/link"
import { CreateBookDialog } from "@/components/books/create-book-dialog"
import { BookActions } from "@/components/books/book-actions"
import { booksApi, type Book } from "@/lib/api/books"
import { coursesApi } from "@/lib/api/courses"
import type { Course } from "@/lib/types/api.types"

const CEFR_LEVELS_MAP = {
  'A1': { label: 'A1 - Iniciante', color: 'bg-green-500', description: 'Básico' },
  'A2': { label: 'A2 - Básico', color: 'bg-green-600', description: 'Elementar' },
  'B1': { label: 'B1 - Intermediário', color: 'bg-blue-500', description: 'Independente' },
  'B2': { label: 'B2 - Intermediário Alto', color: 'bg-blue-600', description: 'Independente Superior' },
  'C1': { label: 'C1 - Avançado', color: 'bg-purple-500', description: 'Proficiente' },
  'C2': { label: 'C2 - Proficiente', color: 'bg-purple-600', description: 'Domínio Pleno' },
} as const

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCourseDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Carregar dados do curso com estatísticas detalhadas
      const [courseResponse, booksResponse] = await Promise.all([
        coursesApi.getCourse(courseId, { include_books: true, include_detailed_stats: true }),
        booksApi.listBooksByCourse(courseId, { page: 1, size: 50, include_units: true })
      ])
      
      setCourse(courseResponse.data.course)
      setBooks(booksResponse.data)
    } catch (err) {
      console.error('Erro ao carregar detalhes do curso:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados do curso')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (courseId) {
      loadCourseDetails()
    }
  }, [courseId])

  const handleBookCreated = (newBook: Book) => {
    setBooks(prev => [...prev, newBook])
  }

  const handleBookUpdated = (updatedBook: Book) => {
    setBooks(prev => prev.map(book => 
      book.id === updatedBook.id ? updatedBook : book
    ))
  }

  const handleBookDeleted = (bookId: string) => {
    setBooks(prev => prev.filter(book => book.id !== bookId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-muted-foreground">Carregando curso...</span>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erro ao carregar curso</h3>
        <p className="text-muted-foreground mb-4">{error || 'Curso não encontrado'}</p>
        <div className="flex gap-2">
          <Button onClick={loadCourseDetails} variant="outline">
            Tentar novamente
          </Button>
          <Button onClick={() => router.push('/courses')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos cursos
          </Button>
        </div>
      </div>
    )
  }

  // Calcular estatísticas
  const totalUnits = books.reduce((sum, book) => sum + book.unit_count, 0)
  const totalVocabulary = books.reduce((sum, book) => sum + book.vocabulary_coverage.length, 0)
  const completionRate = course.completion_rate || (totalUnits > 0 ? Math.round((books.length / Math.max(course.target_levels.length * 3, 1)) * 100) : 0)
  const levelsUsed = [...new Set(books.map(b => b.target_level))]
  
  // Preparar níveis disponíveis para o curso
  const availableLevels = course.target_levels.map(level => ({
    value: level,
    label: CEFR_LEVELS_MAP[level as keyof typeof CEFR_LEVELS_MAP]?.label || level
  }))

  // Agrupar books por nível
  const booksByLevel = books.reduce((acc, book) => {
    const level = book.target_level
    if (!acc[level]) acc[level] = []
    acc[level].push(book)
    return acc
  }, {} as Record<string, Book[]>)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-green-500/10 rounded-lg -z-10" />
        
        {/* Animated floating bubbles */}
        <div className="absolute inset-0 -z-5">
          {/* Large bubbles */}
          <div className="absolute top-8 left-12 w-20 h-20 bg-blue-500/20 rounded-full animate-pulse blur-sm" />
          <div className="absolute top-24 right-20 w-16 h-16 bg-purple-500/15 rounded-full animate-bounce blur-sm" 
               style={{ animationDelay: '0.5s', animationDuration: '3s' }} />
          <div className="absolute bottom-16 left-40 w-24 h-24 bg-green-500/10 rounded-full animate-pulse blur-sm" 
               style={{ animationDelay: '1s' }} />
          
          {/* Medium bubbles */}
          <div className="absolute top-16 right-40 w-12 h-12 bg-yellow-500/20 rounded-full animate-bounce blur-sm" 
               style={{ animationDelay: '1.5s', animationDuration: '4s' }} />
          <div className="absolute bottom-24 right-12 w-14 h-14 bg-pink-500/15 rounded-full animate-pulse blur-sm" 
               style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/5 w-16 h-16 bg-indigo-500/10 rounded-full animate-bounce blur-sm" 
               style={{ animationDelay: '0.3s', animationDuration: '5s' }} />
          
          {/* Small bubbles */}
          <div className="absolute top-12 left-1/2 w-8 h-8 bg-cyan-500/25 rounded-full animate-pulse blur-sm" 
               style={{ animationDelay: '0.8s' }} />
          <div className="absolute bottom-12 left-20 w-6 h-6 bg-orange-500/20 rounded-full animate-bounce blur-sm" 
               style={{ animationDelay: '2.5s', animationDuration: '3.5s' }} />
          <div className="absolute top-1/3 right-1/3 w-10 h-10 bg-teal-500/15 rounded-full animate-pulse blur-sm" 
               style={{ animationDelay: '1.2s' }} />
          <div className="absolute bottom-1/4 left-2/5 w-12 h-12 bg-violet-500/12 rounded-full animate-bounce blur-sm" 
               style={{ animationDelay: '0.7s', animationDuration: '4.5s' }} />
        </div>
        
        <div className="relative p-6 md:p-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/courses')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Todos os Cursos
            </Button>
          </div>

          <div className="space-y-6">
            {/* Course Info */}
            <div className="max-w-6xl space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {course.target_levels.map(level => {
                    const levelInfo = CEFR_LEVELS_MAP[level as keyof typeof CEFR_LEVELS_MAP]
                    return (
                      <Badge key={level} className={levelInfo?.color || 'bg-gray-500'}>
                        {level}
                      </Badge>
                    )
                  })}
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {course.language_variant === 'american_english' ? 'Inglês Americano' : 
                     course.language_variant === 'british_english' ? 'Inglês Britânico' : 
                     'Inglês Australiano'}
                  </Badge>
                </div>
                
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight">{course.name}</h1>
                
                {course.description && (
                  <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
                    {course.description}
                  </p>
                )}
              </div>

              {/* Course metadata */}
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{books.length} books</span>
                </div>
                <div className="flex items-center gap-1">
                  <Activity className="w-4 h-4" />
                  <span>{totalUnits} unidades</span>
                </div>
                <div className="hidden sm:flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>{totalVocabulary} palavras</span>
                </div>
                <div className="hidden md:flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Atualizado em {new Date(course.updated_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <CreateBookDialog 
                course={course} 
                onBookCreated={handleBookCreated} 
              />
              <Link href={`/courses/${course.id}/books`}>
                <Button variant="outline" size="sm" className="w-full sm:w-auto">
                  Ver Todos os Books
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Conteúdo do Curso</h2>
          <div className="text-sm text-muted-foreground">
            {books.length} books • {totalUnits} unidades
          </div>
        </div>

        {books.length === 0 ? (
          /* Empty State */
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum book criado ainda</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Comece criando o primeiro book para estruturar o conteúdo do seu curso por níveis CEFR.
              </p>
              <CreateBookDialog 
                course={course} 
                onBookCreated={handleBookCreated} 
              />
            </CardContent>
          </Card>
        ) : (
          /* Books by Level */
          <div className="space-y-8">
            {course.target_levels.map(level => {
              const levelBooks = booksByLevel[level] || []
              const levelInfo = CEFR_LEVELS_MAP[level as keyof typeof CEFR_LEVELS_MAP]
              
              return (
                <Card key={level}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={levelInfo?.color || 'bg-gray-500'}>
                          {level}
                        </Badge>
                        <div>
                          <h3 className="text-xl font-semibold">{levelInfo?.label || level}</h3>
                          <p className="text-sm text-muted-foreground">
                            {levelInfo?.description} • {levelBooks.length} book(s)
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {levelBooks.reduce((sum, book) => sum + book.unit_count, 0)} unidades
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {levelBooks.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhum book criado para este nível ainda</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {levelBooks
                          .sort((a, b) => a.sequence_order - b.sequence_order)
                          .map((book, index) => (
                          <div key={book.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center gap-4 flex-1">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium truncate">{book.name}</h4>
                                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Activity className="w-3 h-3" />
                                    {book.unit_count} unidades
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <GraduationCap className="w-3 h-3" />
                                    {book.vocabulary_coverage.length} palavras
                                  </span>
                                  {book.unit_count > 0 && (
                                    <span className="flex items-center gap-1 text-green-600">
                                      <CheckCircle2 className="w-3 h-3" />
                                      Ativo
                                    </span>
                                  )}
                                </div>
                                {book.description && (
                                  <p className="text-sm text-muted-foreground mt-1 truncate">
                                    {book.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <BookActions
                              book={book}
                              availableLevels={availableLevels}
                              onBookUpdated={handleBookUpdated}
                              onBookDeleted={handleBookDeleted}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}