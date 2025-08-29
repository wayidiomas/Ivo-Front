"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu"
import { 
  BookOpen, 
  GraduationCap, 
  Activity,
  Plus,
  Users,
  Play,
  Search,
  Filter,
  SortAsc,
  Loader2,
  ChevronDown
} from "lucide-react"
import Link from "next/link"
import { CreateCourseDialog } from "@/components/courses/create-course-dialog"
import { AiGenerateButton } from "@/components/courses/ai-generate-button"
import { CourseActions } from "@/components/courses/course-actions"
import { coursesApi, type Course } from "@/lib/api/courses"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    language_variant: '',
    target_level: '',
    methodology: ''
  })
  const [sortBy, setSortBy] = useState('updated_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [pagination, setPagination] = useState({
    page: 1,
    size: 20,
    total: 0
  })
  const router = useRouter()

  const loadCourses = async (resetPage = false) => {
    try {
      setLoading(true)
      setError(null)
      
      const currentPage = resetPage ? 1 : pagination.page
      
      const params: any = {
        page: currentPage,
        size: pagination.size,
        include_stats: true,
        sort_by: sortBy,
        sort_order: sortOrder
      }
      
      // Adicionar filtros apenas se preenchidos
      if (searchTerm.trim()) params.search = searchTerm.trim()
      if (filters.language_variant) params.language_variant = filters.language_variant
      if (filters.target_level) params.target_level = filters.target_level
      if (filters.methodology) params.methodology = filters.methodology
      
      const response = await coursesApi.listCourses(params)
      
      setCourses(response.data)
      setPagination(prev => ({
        ...prev,
        page: currentPage,
        total: response.pagination.total_count || 0
      }))
    } catch (err) {
      console.error('Erro ao carregar cursos:', err)
      setError('Não foi possível carregar os cursos. Verifique se a API está rodando.')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])
  
  // Efeito para recarregar quando filtros mudarem
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '' || Object.values(filters).some(f => f !== '')) {
        loadCourses(true) // Reset para página 1 quando filtrar
      }
    }, 500) // Debounce de 500ms
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm, filters])
  
  // Efeito para recarregar quando ordenação mudar
  useEffect(() => {
    if (courses.length > 0) { // Só recarregar se já tiver dados
      loadCourses(true)
    }
  }, [sortBy, sortOrder])
  
  // Efeito para recarregar quando página mudar
  useEffect(() => {
    if (courses.length > 0) { // Só recarregar se já tiver dados
      loadCourses(false) // Não resetar página
    }
  }, [pagination.page])

  const handleCourseCreated = (newCourse: any) => {
    console.log('Novo curso criado:', newCourse)
    // Recarregar a lista de cursos após criação
    loadCourses()
  }

  const handleCourseUpdated = (updatedCourse: Course) => {
    setCourses(prev => prev.map(course => 
      course.id === updatedCourse.id ? updatedCourse : course
    ))
  }

  const handleCourseDeleted = (courseId: string) => {
    setCourses(prev => prev.filter(course => course.id !== courseId))
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Todos os Cursos</h1>
          <p className="text-muted-foreground">
            Gerencie e organize todos os seus cursos de inglês
          </p>
        </div>
        <CreateCourseDialog onCourseCreated={handleCourseCreated} />
      </div>


      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input 
            placeholder="Buscar cursos..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {/* Dropdown de Filtros */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filtros
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {/* Filtro por Nível CEFR */}
              <div className="p-2">
                <label className="text-sm font-medium">Nível CEFR</label>
                <select 
                  className="w-full mt-1 p-2 border rounded"
                  value={filters.target_level}
                  onChange={(e) => setFilters(prev => ({ ...prev, target_level: e.target.value }))}
                >
                  <option value="">Todos os níveis</option>
                  <option value="A1">A1 - Básico</option>
                  <option value="A2">A2 - Pré-intermediário</option>
                  <option value="B1">B1 - Intermediário</option>
                  <option value="B2">B2 - Intermediário superior</option>
                  <option value="C1">C1 - Avançado</option>
                  <option value="C2">C2 - Proficiente</option>
                </select>
              </div>
              
              {/* Filtro por Variante do Idioma */}
              <div className="p-2">
                <label className="text-sm font-medium">Variante do Idioma</label>
                <select 
                  className="w-full mt-1 p-2 border rounded"
                  value={filters.language_variant}
                  onChange={(e) => setFilters(prev => ({ ...prev, language_variant: e.target.value }))}
                >
                  <option value="">Todas as variantes</option>
                  <option value="american_english">Inglês Americano</option>
                  <option value="british_english">Inglês Britânico</option>
                  <option value="australian_english">Inglês Australiano</option>
                  <option value="canadian_english">Inglês Canadense</option>
                  <option value="indian_english">Inglês Indiano</option>
                </select>
              </div>
              
              <DropdownMenuSeparator />
              <div className="p-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setSearchTerm('')
                    setFilters({ language_variant: '', target_level: '', methodology: '' })
                  }}
                >
                  Limpar Filtros
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Dropdown de Ordenação */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <SortAsc className="mr-2 h-4 w-4" />
                Ordenar
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={`${sortBy}_${sortOrder}`} onValueChange={(value) => {
                const [field, order] = value.split('_')
                setSortBy(field)
                setSortOrder(order)
              }}>
                <DropdownMenuRadioItem value="created_at_desc">Mais recentes</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="created_at_asc">Mais antigos</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name_asc">Nome (A-Z)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="name_desc">Nome (Z-A)</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="updated_at_desc">Recém atualizados</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-muted-foreground">Carregando cursos...</span>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-red-500 mb-4">❌ {error}</div>
          <Button onClick={() => loadCourses()} variant="outline">
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && courses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum curso encontrado</h3>
          <p className="text-muted-foreground mb-4">Comece criando seu primeiro curso</p>
          <CreateCourseDialog onCourseCreated={handleCourseCreated} />
        </div>
      )}

      {/* Courses Grid */}
      {!loading && !error && courses.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.map((course) => {
            // Calcular completion rate baseado nos campos diretos de Course
            const completionRate = course.completion_rate || 0
            
            return (
            <Card key={course.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
            <div className="relative aspect-video overflow-hidden bg-muted">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <div className="absolute top-3 left-3 z-20">
<Badge variant="default">
                  {course.target_levels[0]}-{course.target_levels[course.target_levels.length - 1]}
                </Badge>
              </div>
              <div className="absolute top-3 right-3 z-20">
                <CourseActions
                  course={course}
                  onCourseUpdated={handleCourseUpdated}
                  onCourseDeleted={handleCourseDeleted}
                />
              </div>
              <div className="absolute bottom-3 left-3 right-3 z-20 text-white">
<h3 className="font-semibold text-lg leading-tight mb-1">{course.name}</h3>
                <p className="text-sm text-white/80">
                  {course.language_variant === 'american_english' ? 'Inglês Americano' : 
                   course.language_variant === 'british_english' ? 'Inglês Britânico' : 
                   course.language_variant === 'australian_english' ? 'Inglês Australiano' : 
                   course.language_variant}
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <GraduationCap className="h-16 w-16 text-primary/20" />
              </div>
            </div>
            
            <CardContent className="p-4 space-y-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
<span className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-1" />
                    {course.total_books || 0} livros
                  </span>
                  <span className="flex items-center">
                    <Activity className="w-4 h-4 mr-1" />
                    {course.total_units || 0} unidades
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2">
<span className="text-xs text-muted-foreground">
                  {new Date(course.updated_at).toLocaleDateString('pt-BR')}
                </span>
                <div className="flex gap-2">
                  <Link href={`/courses/${course.id}/books`}>
                    <Button size="sm" variant="outline" className="h-8">
                      <BookOpen className="w-3 h-3 mr-1" />
                      Books
                    </Button>
                  </Link>
                  <Link href={`/courses/${course.id}`}>
                    <Button size="sm" className="h-8">
                      <Play className="w-3 h-3 mr-1" />
                      Abrir
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
            </Card>
            )
          })}
        </div>
      )}
      
      {/* Paginação */}
      {!loading && !error && courses.length > 0 && pagination.total > pagination.size && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {((pagination.page - 1) * pagination.size) + 1} a {Math.min(pagination.page * pagination.size, pagination.total)} de {pagination.total} cursos
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))} 
              disabled={pagination.page <= 1}
            >
              Anterior
            </Button>
            
            <div className="flex items-center space-x-1">
              {[...Array(Math.min(5, Math.ceil(pagination.total / pagination.size)))].map((_, i) => {
                const pageNum = i + 1
                return (
                  <Button
                    key={pageNum}
                    variant={pagination.page === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPagination(prev => ({ ...prev, page: pageNum }))}
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPagination(prev => ({ ...prev, page: Math.min(Math.ceil(pagination.total / pagination.size), prev.page + 1) }))} 
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.size)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}