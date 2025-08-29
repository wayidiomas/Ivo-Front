"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  BookOpen, 
  GraduationCap, 
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  FileText,
  Users,
  Calendar,
  Activity,
  Loader2
} from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { booksApi } from "@/lib/api/books"
import Link from "next/link"
import { CreateBookGlobalDialog } from "@/components/books/create-book-global-dialog"
import { BookActionsGlobal } from "@/components/books/book-actions-global"

// Tipos para os dados da API
interface BookFromAPI {
  id: string
  name: string
  description?: string
  target_level: string
  sequence_order: number
  unit_count: number
  vocabulary_count: number
  vocabulary_coverage: string[]
  created_at: string
  updated_at: string
  course_id: string
  course_name: string
  course_language_variant: string
  status: string
}

export default function BooksPage() {
  const [books, setBooks] = useState<BookFromAPI[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [stats, setStats] = useState({
    totalBooks: 0,
    activeBooks: 0,
    totalUnits: 0,
    totalVocabulary: 0
  })
  
  // Função para carregar books da API
  const loadBooks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const params: any = {
        page: 1,
        size: 100, // Por enquanto, carregar todos
        include_stats: true,
        sort_by: 'updated_at',
        sort_order: 'desc' as const
      }
      
      // Aplicar filtros
      if (searchTerm.trim()) params.search = searchTerm.trim()
      if (selectedCourse && selectedCourse !== 'all') params.course_id = selectedCourse
      // Status é calculado no frontend por enquanto
      
      const response = await booksApi.listAllBooks(params)
      
      let filteredBooks = response.data
      
      // Filtrar por status no frontend (temporário)
      if (selectedStatus && selectedStatus !== 'all' && selectedStatus !== '') {
        filteredBooks = response.data.filter(book => {
          const status = book.unit_count > 0 ? 'active' : 'draft'
          return status === selectedStatus
        })
      }
      
      setBooks(filteredBooks)
      
      // Calcular estatísticas
      const totalBooks = filteredBooks.length
      const activeBooks = filteredBooks.filter(book => book.unit_count > 0).length
      const totalUnits = filteredBooks.reduce((acc, book) => acc + book.unit_count, 0)
      const totalVocabulary = filteredBooks.reduce((acc, book) => acc + (book.vocabulary_count || 0), 0)  // DADOS REAIS!
      
      setStats({
        totalBooks,
        activeBooks,
        totalUnits,
        totalVocabulary  // Agora é real da API!
      })
      
    } catch (err) {
      console.error('Erro ao carregar books:', err)
      setError('Não foi possível carregar os books. Verifique se a API está rodando.')
      setBooks([])
    } finally {
      setLoading(false)
    }
  }
  
  // Carregar na montagem do componente
  useEffect(() => {
    loadBooks()
  }, [])
  
  // Recarregar quando filtros mudarem (com debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadBooks()
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchTerm, selectedCourse, selectedStatus])
  
  // Handler para quando um novo book é criado
  const handleBookCreated = (newBook: BookFromAPI) => {
    // Adicionar o novo book à lista e recarregar para atualizar estatísticas
    setBooks(prev => [newBook, ...prev])
    loadBooks() // Recarregar para ter dados atualizados das estatísticas
  }

  // Handler para quando um book é atualizado
  const handleBookUpdated = (updatedBook: BookFromAPI) => {
    setBooks(prev => prev.map(book => 
      book.id === updatedBook.id ? updatedBook : book
    ))
  }

  // Handler para quando um book é deletado
  const handleBookDeleted = (bookId: string) => {
    setBooks(prev => prev.filter(book => book.id !== bookId))
  }
  
  // Cursos únicos para o filtro (extraídos dos books)
  const uniqueCourses = Array.from(new Set(books.map(book => book.course_name)))
    .map(courseName => {
      const book = books.find(b => b.course_name === courseName)
      return {
        id: book?.course_id || '',
        name: courseName
      }
    })
  
  // Estatísticas para os cards
  const statsData = [
    { label: "Total de Livros", value: stats.totalBooks, icon: BookOpen },
    { label: "Livros Ativos", value: stats.activeBooks, icon: Activity },
    { label: "Total de Unidades", value: stats.totalUnits, icon: FileText },
    { label: "Vocabulário Total", value: stats.totalVocabulary, icon: GraduationCap }
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Biblioteca de Livros</h1>
          <p className="text-muted-foreground">
            Gerencie todos os livros organizados por curso
          </p>
        </div>
        <CreateBookGlobalDialog onBookCreated={handleBookCreated} />
      </div>

      {/* Loading State para Stats */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2 text-muted-foreground">Carregando estatísticas...</span>
        </div>
      )}
      
      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-red-500 mb-4">❌ {error}</div>
          <Button onClick={loadBooks} variant="outline">
            Tentar novamente
          </Button>
        </div>
      )}
      
      {/* Quick Stats */}
      {!loading && !error && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsData.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.label}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Encontre livros específicos usando os filtros abaixo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por título do livro..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
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

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
              </SelectContent>
            </Select>


            <Button 
              variant="outline"
              onClick={() => {
                setSearchTerm('')
                setSelectedCourse('all')
                setSelectedStatus('all')
              }}
            >
              <Filter className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Books Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Livros</CardTitle>
          <CardDescription>
            {books.length} livros encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>Lista completa de livros organizados por curso</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Título do Livro</TableHead>
                <TableHead>Curso</TableHead>
                <TableHead className="text-center">Unidades</TableHead>
                <TableHead className="text-center">Vocabulário</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-center">Última Atualização</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {books.map((book) => {
                const displayStatus = book.unit_count > 0 ? 'active' : 'draft'
                const lastUpdated = new Date(book.updated_at).toLocaleDateString('pt-BR')
                const realVocabulary = book.vocabulary_count || 0  // DADOS REAIS da API!
                
                return (
                <TableRow key={book.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{book.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="font-medium">{book.course_name}</div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Link href={`/books/${book.id}/units`}>
                      <Badge 
                        variant="outline" 
                        className="font-mono cursor-pointer hover:bg-primary/10 transition-colors"
                      >
                        {book.unit_count}
                      </Badge>
                    </Link>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-mono">
                      {realVocabulary}
                    </Badge>
                  </TableCell>
                  
                  
                  <TableCell className="text-center">
                    <Badge variant={
                      displayStatus === 'active' ? 'default' : 'outline'
                    }>
                      {displayStatus === 'active' ? 'Ativo' : 'Rascunho'}
                    </Badge>
                  </TableCell>
                  
                  <TableCell className="text-center text-sm text-muted-foreground">
                    <div className="flex items-center justify-center">
                      <Calendar className="mr-1 h-3 w-3" />
                      {lastUpdated}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <BookActionsGlobal 
                      book={book}
                      onBookUpdated={handleBookUpdated}
                      onBookDeleted={handleBookDeleted}
                    />
                  </TableCell>
                </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}