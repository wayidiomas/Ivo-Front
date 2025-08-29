"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  GraduationCap,
  BookOpen,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Play,
  Edit,
  Clock,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Calendar,
  Layers,
  ArrowLeft,
  Loader2,
  Brain,
  Activity,
  Target
} from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { CreateUnitDialog } from "@/components/units/create-unit-dialog"
import { unitsApi } from "@/lib/api/units"
import type { Unit } from "@/lib/types/api.types"
import { booksApi, type Book } from "@/lib/api/books"
import { coursesApi, type Course } from "@/lib/api/courses"

const STATUS_MAP = {
  'creating': { label: 'Criando', color: 'bg-blue-500', icon: Loader2 },
  'assessments_pending': { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  'completed': { label: 'Concluído', color: 'bg-green-500', icon: CheckCircle },
  'error': { label: 'Erro', color: 'bg-red-500', icon: AlertCircle },
} as const

const UNIT_TYPE_MAP = {
  'lexical_unit': { label: 'Lexical', color: 'bg-purple-100 text-purple-800', icon: GraduationCap },
  'grammar_unit': { label: 'Grammar', color: 'bg-blue-100 text-blue-800', icon: Layers },
  'functional_unit': { label: 'Functional', color: 'bg-green-100 text-green-800', icon: Target },
  'mixed_unit': { label: 'Mixed', color: 'bg-orange-100 text-orange-800', icon: Activity },
} as const

export default function BookUnitsPage() {
  const params = useParams()
  const router = useRouter()
  const bookId = params.id as string
  
  const [book, setBook] = useState<Book | null>(null)
  const [course, setCourse] = useState<Course | null>(null)
  const [units, setUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Carregar dados do book
      const bookResponse = await booksApi.getBook(bookId, { include_units: true })
      const bookData = bookResponse.data.book
      setBook(bookData)
      
      // Carregar dados do course
      if (bookData.course_id) {
        const courseResponse = await coursesApi.getCourse(bookData.course_id)
        setCourse(courseResponse.data.course)
      }
      
      // Carregar units do book
      const unitsResponse = await unitsApi.listUnitsByBook(bookId, {
        page: 1,
        size: 50,
        sort_by: 'sequence_order',
        sort_order: 'asc'
      })
      
      setUnits(unitsResponse.data)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (bookId) {
      loadData()
    }
  }, [bookId])

  const handleUnitCreated = (newUnit: Unit) => {
    setUnits(prev => [...prev, newUnit])
    loadData() // Recarregar para atualizar estatísticas
  }

  // Filtrar units baseado nos filtros
  const filteredUnits = units.filter(unit => {
    const matchesSearch = (unit.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (unit.context?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter
    const matchesType = typeFilter === 'all' || unit.unit_type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  // Estatísticas
  const stats = {
    total: units.length,
    completed: units.filter(u => u.status === 'completed').length,
    creating: units.filter(u => u.status === 'creating').length,
    pending: units.filter(u => u.status === 'assessments_pending').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-muted-foreground">Carregando unidades...</span>
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
          <Button onClick={loadData} variant="outline">
            Tentar novamente
          </Button>
          <Button onClick={() => router.push('/books')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar aos books
          </Button>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">Book não encontrado</h3>
        <Button onClick={() => router.push('/books')} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar aos books
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
              onClick={() => router.push('/books')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Books
            </Button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">{book.name}</span>
            {course && (
              <>
                <span className="text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">{course.name}</span>
              </>
            )}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Unidades do Book</h1>
          <p className="text-muted-foreground">
            Gerencie as unidades do book "{book.name}" - Nível: {book.target_level}
          </p>
        </div>
        <CreateUnitDialog
          bookId={bookId}
          bookName={book.name}
          onUnitCreated={handleUnitCreated}
        />
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Unidades</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Criando</CardTitle>
            <Loader2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.creating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Encontre unidades específicas usando os filtros abaixo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por título ou contexto..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="creating">Criando</SelectItem>
                <SelectItem value="assessments_pending">Pendente</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="error">Com erro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="lexical_unit">Lexical</SelectItem>
                <SelectItem value="grammar_unit">Grammar</SelectItem>
                <SelectItem value="functional_unit">Functional</SelectItem>
                <SelectItem value="mixed_unit">Mixed</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setStatusFilter('all')
                setTypeFilter('all')
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredUnits.length === 0 && searchTerm === "" && statusFilter === 'all' && typeFilter === 'all' && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma unidade encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Comece criando a primeira unidade para este book
          </p>
          <CreateUnitDialog
            bookId={bookId}
            bookName={book.name}
            onUnitCreated={handleUnitCreated}
          />
        </div>
      )}

      {/* No Results State */}
      {filteredUnits.length === 0 && (searchTerm !== "" || statusFilter !== 'all' || typeFilter !== 'all') && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma unidade encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Tente ajustar seus filtros de busca
          </p>
          <Button onClick={() => {
            setSearchTerm('')
            setStatusFilter('all')
            setTypeFilter('all')
          }} variant="outline">
            Limpar filtros
          </Button>
        </div>
      )}

      {/* Units Grid */}
      {filteredUnits.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredUnits.map((unit) => {
            const statusInfo = STATUS_MAP[unit.status as keyof typeof STATUS_MAP] || STATUS_MAP.error
            const typeInfo = UNIT_TYPE_MAP[unit.unit_type as keyof typeof UNIT_TYPE_MAP] || UNIT_TYPE_MAP.lexical_unit
            const StatusIcon = statusInfo.icon
            const TypeIcon = typeInfo.icon
            
            return (
              <Card key={unit.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-sm line-clamp-2">
                        {unit.title}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={`text-xs ${statusInfo.color} text-white`}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {statusInfo.label}
                        </Badge>
                        <Badge variant="outline" className={`text-xs ${typeInfo.color}`}>
                          <TypeIcon className="mr-1 h-3 w-3" />
                          {typeInfo.label}
                        </Badge>
                      </div>
                    </div>
                    <Button size="icon" variant="ghost" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <CardDescription className="text-xs line-clamp-3">
                    {unit.context}
                  </CardDescription>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Target className="w-3 h-3 mr-1" />
                        Nível {unit.cefr_level}
                      </span>
                      <span className="flex items-center">
                        <Layers className="w-3 h-3 mr-1" />
                        #{unit.sequence_order}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {new Date(unit.created_at).toLocaleDateString('pt-BR')}
                      </span>
                      {unit.quality_score && (
                        <span className="flex items-center">
                          <Sparkles className="w-3 h-3 mr-1" />
                          {unit.quality_score}/100
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    <Link href={`/units/${unit.id}`} className="flex-1">
                      <Button size="sm" className="w-full h-8">
                        <Play className="w-3 h-3 mr-1" />
                        Abrir
                      </Button>
                    </Link>
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