"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  Loader2,
  Target,
  Activity,
  Brain
} from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { unitsApi } from "@/lib/api/units"
import type { Unit } from "@/lib/types/api.types"
import { booksApi } from "@/lib/api/books"
import Link from "next/link"

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

interface BookWithUnits {
  id: string
  name: string
  course_name: string
  course_id: string
  target_level: string
  unit_count: number
  vocabulary_count: number
}

export default function UnitsPage() {
  const [books, setBooks] = useState<BookWithUnits[]>([])
  const [allUnits, setAllUnits] = useState<Unit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [courseFilter, setCourseFilter] = useState('all')
  const [levelFilter, setLevelFilter] = useState('all')

  const loadAllUnitsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Primeiro, carregar todos os books
      const booksResponse = await booksApi.listAllBooks({
        page: 1,
        size: 100,
        include_stats: true,
        sort_by: 'updated_at',
        sort_order: 'desc'
      })
      
      const booksData = booksResponse.data
      setBooks(booksData)

      // Depois, carregar units de todos os books que têm unidades
      const allUnitsArray: Unit[] = []
      
      for (const book of booksData) {
        if (book.unit_count > 0) {
          try {
            const unitsResponse = await unitsApi.listUnitsByBook(book.id, {
              page: 1,
              size: 50,
              sort_by: 'sequence_order',
              sort_order: 'asc'
            })
            
            // Adicionar informações do book em cada unit
            const unitsWithBookInfo = unitsResponse.data.map(unit => ({
              ...unit,
              book_name: book.name,
              course_name: book.course_name,
              course_id: book.course_id
            }))
            
            allUnitsArray.push(...unitsWithBookInfo)
          } catch (err) {
            console.warn(`Erro ao carregar units do book ${book.id}:`, err)
          }
        }
      }
      
      setAllUnits(allUnitsArray)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError('Não foi possível carregar os dados. Verifique se a API está rodando.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAllUnitsData()
  }, [])

  // Filtrar units baseado nos filtros
  const filteredUnits = allUnits.filter(unit => {
    const matchesSearch = unit.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.context?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.book_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unit.course_name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter
    const matchesType = typeFilter === 'all' || unit.unit_type === typeFilter
    const matchesCourse = courseFilter === 'all' || unit.course_id === courseFilter
    const matchesLevel = levelFilter === 'all' || unit.cefr_level === levelFilter
    
    return matchesSearch && matchesStatus && matchesType && matchesCourse && matchesLevel
  })

  // Opções para filtros
  const uniqueCourses = Array.from(new Set(allUnits.map(unit => unit.course_name))).map(courseName => {
    const unit = allUnits.find(u => u.course_name === courseName)
    return {
      id: unit?.course_id || '',
      name: courseName || ''
    }
  }).filter(course => course.name)

  const uniqueLevels = Array.from(new Set(allUnits.map(unit => unit.cefr_level))).filter(Boolean)

  // Estatísticas
  const stats = {
    total: allUnits.length,
    completed: allUnits.filter(u => u.status === 'completed').length,
    creating: allUnits.filter(u => u.status === 'creating').length,
    pending: allUnits.filter(u => u.status === 'assessments_pending').length,
    totalBooks: books.filter(b => b.unit_count > 0).length,
    totalVocabulary: books.reduce((sum, book) => sum + book.vocabulary_count, 0)
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
        <Button onClick={loadAllUnitsData} variant="outline">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Unidades</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todas as unidades de todos os books
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/books">
            <Button variant="outline">
              <BookOpen className="mr-2 h-4 w-4" />
              Ver Books
            </Button>
          </Link>
          <Link href="/units/create">
            <Button className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Plus className="mr-2 h-4 w-4" />
              Nova Unidade
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Unidades</CardTitle>
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
            <CardTitle className="text-sm font-medium">Em Criação</CardTitle>
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
                  placeholder="Buscar por título, contexto, book ou curso..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={courseFilter} onValueChange={setCourseFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filtrar por curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                {uniqueCourses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Nível" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos níveis</SelectItem>
                {uniqueLevels.map((level) => (
                  <SelectItem key={level} value={level}>
                    {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos status</SelectItem>
                <SelectItem value="creating">Criando</SelectItem>
                <SelectItem value="assessments_pending">Pendente</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="error">Com erro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos tipos</SelectItem>
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
                setCourseFilter('all')
                setLevelFilter('all')
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
      {allUnits.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma unidade encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Comece criando books e depois adicione unidades
          </p>
          <Button onClick={() => window.location.href = '/books'} variant="outline">
            <BookOpen className="mr-2 h-4 w-4" />
            Ver Books
          </Button>
        </div>
      )}

      {/* No Results State */}
      {allUnits.length > 0 && filteredUnits.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Search className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhuma unidade encontrada</h3>
          <p className="text-muted-foreground mb-4">
            Tente ajustar seus filtros de busca
          </p>
          <Button onClick={() => {
            setSearchTerm('')
            setCourseFilter('all')
            setLevelFilter('all')
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
              <Card key={unit.id} className="group overflow-hidden hover:shadow-lg transition-all duration-300 h-[340px] flex flex-col">
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <CardTitle className="text-sm line-clamp-2 leading-tight">
                        {unit.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 flex-wrap">
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
                    <Button size="icon" variant="ghost" className="h-8 w-8 flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-3">
                    <CardDescription className="text-xs line-clamp-3 leading-relaxed">
                      {unit.context}
                    </CardDescription>
                    
                    {/* Hierarchical path */}
                    <div className="text-xs text-muted-foreground flex items-center space-x-1">
                      <GraduationCap className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{unit.course_name}</span>
                      <span className="flex-shrink-0">→</span>
                      <BookOpen className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{unit.book_name}</span>
                    </div>
                    
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