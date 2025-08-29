"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { 
  BookOpen, 
  GraduationCap, 
  Activity,
  Plus,
  Search,
  ArrowLeft,
  Loader2,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { CreateBookDialog } from "@/components/books/create-book-dialog"
import { BookActions } from "@/components/books/book-actions"
import { booksApi, type Book } from "@/lib/api/books"
import { coursesApi, type Course } from "@/lib/api/courses"

const CEFR_LEVELS_MAP = {
  'A1': { label: 'A1 - Iniciante', color: 'bg-green-500' },
  'A2': { label: 'A2 - Básico', color: 'bg-green-600' },
  'B1': { label: 'B1 - Intermediário', color: 'bg-blue-500' },
  'B2': { label: 'B2 - Intermediário Alto', color: 'bg-blue-600' },
  'C1': { label: 'C1 - Avançado', color: 'bg-purple-500' },
  'C2': { label: 'C2 - Proficiente', color: 'bg-purple-600' },
} as const

export default function CourseBooksPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  
  const [course, setCourse] = useState<Course | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const loadCourseAndBooks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Carregar dados do curso
      const courseResponse = await coursesApi.getCourse(courseId)
      setCourse(courseResponse.data.course)
      
      // Carregar books do curso
      const booksResponse = await booksApi.listBooksByCourse(courseId, {
        page: 1,
        size: 50,
        include_units: true
      })
      
      setBooks(booksResponse.data)
    } catch (err) {
      console.error('Erro ao carregar curso e books:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (courseId) {
      loadCourseAndBooks()
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

  // Filtrar books baseado na busca
  const filteredBooks = books.filter(book => 
    book.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.target_level.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Preparar níveis disponíveis para o curso
  const availableLevels = course ? course.target_levels.map(level => ({
    value: level,
    label: CEFR_LEVELS_MAP[level as keyof typeof CEFR_LEVELS_MAP]?.label || level
  })) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-muted-foreground">Carregando books...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Erro ao carregar dados</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <div className="flex gap-2">
          <Button onClick={loadCourseAndBooks} variant="outline">
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

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Curso não encontrado</h3>
        <Button onClick={() => router.push('/courses')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar aos cursos
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/courses')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cursos
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">{course.name}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Books do Curso</h1>
          <p className="text-muted-foreground">
            Gerencie os books do curso "{course.name}" - Níveis: {course.target_levels.join(', ')}
          </p>
        </div>
        {course && (
          <CreateBookDialog 
            course={course} 
            onBookCreated={handleBookCreated} 
          />
        )}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input 
          placeholder="Buscar books..." 
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Books Stats */}
      {books.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="flex items-center p-6">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Books</p>
                <p className="text-2xl font-bold">{books.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Activity className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Total Unidades</p>
                <p className="text-2xl font-bold">{books.reduce((sum, book) => sum + book.unit_count, 0)}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <GraduationCap className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Níveis Cobertos</p>
                <p className="text-2xl font-bold">{new Set(books.map(b => b.target_level)).size}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center p-6">
              <Plus className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Vocabulário</p>
                <p className="text-2xl font-bold">{books.reduce((sum, book) => sum + (book.vocabulary_count || 0), 0)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {filteredBooks.length === 0 && searchQuery === "" && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum book encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Comece criando o primeiro book para este curso
          </p>
          {course && (
            <CreateBookDialog 
              course={course} 
              onBookCreated={handleBookCreated} 
            />
          )}
        </div>
      )}

      {/* No Results State */}
      {filteredBooks.length === 0 && searchQuery !== "" && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum book encontrado</h3>
          <p className="text-muted-foreground mb-4">
            Tente ajustar sua busca por "{searchQuery}"
          </p>
          <Button onClick={() => setSearchQuery("")} variant="outline">
            Limpar busca
          </Button>
        </div>
      )}

      {/* Books Grid */}
      {filteredBooks.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredBooks.map((book) => {
            const levelInfo = CEFR_LEVELS_MAP[book.target_level as keyof typeof CEFR_LEVELS_MAP]
            
            return (
              <Card key={book.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <div className="absolute top-3 left-3 z-20">
                    <Badge className={levelInfo?.color || 'bg-gray-500'}>
                      {book.target_level}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 z-20">
                    <BookActions
                      book={book}
                      availableLevels={availableLevels}
                      onBookUpdated={handleBookUpdated}
                      onBookDeleted={handleBookDeleted}
                    />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 z-20 text-white">
                    <h3 className="font-semibold text-lg leading-tight mb-1">{book.name}</h3>
                    <p className="text-sm text-white/80 line-clamp-2">
                      {book.description || 'Sem descrição'}
                    </p>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/5 flex items-center justify-center">
                    <BookOpen className="h-16 w-16 text-blue-500/20" />
                  </div>
                </div>
                
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <Activity className="w-4 h-4 mr-1" />
                        {book.unit_count} unidades
                      </span>
                      <span className="flex items-center">
                        Sequência: #{book.sequence_order}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center">
                        <GraduationCap className="w-4 h-4 mr-1" />
                        {book.vocabulary_count || 0} palavras
                      </span>
                      <span>{levelInfo?.label || book.target_level}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(book.updated_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}