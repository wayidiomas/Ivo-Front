'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MoreHorizontal, Edit3, Trash2, Loader2, BookOpen } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { booksApi, type BookCreateRequest } from '@/lib/api/books'
import { coursesApi, type Course } from '@/lib/api/courses'

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

interface BookActionsGlobalProps {
  book: BookFromAPI
  onBookUpdated: (updatedBook: BookFromAPI) => void
  onBookDeleted: (bookId: string) => void
}

const CEFR_LEVELS = [
  { value: 'A1', label: 'A1 - Iniciante' },
  { value: 'A2', label: 'A2 - Básico' },
  { value: 'B1', label: 'B1 - Intermediário' },
  { value: 'B2', label: 'B2 - Intermediário Alto' },
  { value: 'C1', label: 'C1 - Avançado' },
  { value: 'C2', label: 'C2 - Proficiente' },
] as const

export function BookActionsGlobal({ book, onBookUpdated, onBookDeleted }: BookActionsGlobalProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState<BookCreateRequest>({
    name: book.name,
    description: book.description || '',
    target_level: book.target_level as BookCreateRequest['target_level']
  })

  // Carregar cursos quando abrir o dialog de edição
  const loadCourses = async () => {
    try {
      const response = await coursesApi.listCourses({
        page: 1,
        size: 100,
        sort_by: 'name',
        sort_order: 'asc'
      })
      setCourses(response.data)
      
      // Encontrar e selecionar o curso atual do book
      const currentCourse = response.data.find(c => c.id === book.course_id)
      if (currentCourse) {
        setSelectedCourse(currentCourse)
      }
    } catch (error) {
      console.error('Erro ao carregar cursos:', error)
      toast({
        title: 'Erro ao carregar cursos',
        description: 'Não foi possível carregar a lista de cursos.',
        variant: 'destructive',
      })
    }
  }

  // Filtrar apenas os níveis disponíveis no curso selecionado
  const availableLevels = selectedCourse 
    ? CEFR_LEVELS.filter(level => selectedCourse.target_levels.includes(level.value))
    : []

  const handleEdit = async () => {
    if (!selectedCourse) {
      toast({
        title: 'Erro de validação',
        description: 'Selecione um curso.',
        variant: 'destructive',
      })
      return
    }

    if (!formData.name.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'O nome do book é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    setIsEditing(true)
    
    try {
      const response = await booksApi.updateBook(book.id, {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        target_level: formData.target_level
      })

      toast({
        title: 'Book atualizado com sucesso!',
        description: `O book "${formData.name}" foi atualizado.`,
      })

      // Callback para atualizar a lista
      const updatedBook = {
        ...book,
        ...response.data.book,
        course_name: selectedCourse.name,
        course_language_variant: selectedCourse.language_variant,
        vocabulary_count: book.vocabulary_count, // Manter count atual
        status: book.status // Manter status atual
      }
      onBookUpdated(updatedBook)
      setShowEditDialog(false)
      
    } catch (error) {
      console.error('Erro ao atualizar book:', error)
      toast({
        title: 'Erro ao atualizar book',
        description: error instanceof Error ? error.message : 'Não foi possível atualizar o book. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsEditing(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      await booksApi.deleteBook(book.id)

      toast({
        title: 'Book deletado com sucesso!',
        description: `O book "${book.name}" foi removido.`,
      })

      onBookDeleted(book.id)
      setShowDeleteAlert(false)
      
    } catch (error) {
      console.error('Erro ao deletar book:', error)
      toast({
        title: 'Erro ao deletar book',
        description: 'Não foi possível deletar o book. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCourseChange = (courseId: string) => {
    const course = courses.find(c => c.id === courseId)
    setSelectedCourse(course || null)
    // Reset target_level to first available level of the selected course
    if (course && course.target_levels.length > 0) {
      setFormData(prev => ({ 
        ...prev, 
        target_level: course.target_levels[0] as BookCreateRequest['target_level']
      }))
    }
  }

  const handleEditDialogOpen = () => {
    setShowEditDialog(true)
    loadCourses()
    // Reset form data
    setFormData({
      name: book.name,
      description: book.description || '',
      target_level: book.target_level as BookCreateRequest['target_level']
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEditDialogOpen}>
            <Edit3 className="mr-2 h-4 w-4" />
            Editar book
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowDeleteAlert(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar book
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de Editar */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Editar Book
            </DialogTitle>
            <DialogDescription>
              Edite as informações do book "{book.name}".
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-select">Curso *</Label>
              <Select
                value={selectedCourse?.id || ""}
                onValueChange={handleCourseChange}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um curso" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name} ({course.target_levels.join(', ')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-book-name">Nome do Book *</Label>
              <Input
                id="edit-book-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                maxLength={200}
                disabled={isEditing}
              />
              <p className="text-xs text-muted-foreground">
                {formData.name.length}/200 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-book-description">Descrição</Label>
              <Textarea
                id="edit-book-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                maxLength={1000}
                rows={3}
                disabled={isEditing}
              />
              <p className="text-xs text-muted-foreground">
                {(formData.description || '').length}/1000 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-target-level">Nível CEFR *</Label>
              {availableLevels.length > 0 ? (
                <Select
                  value={formData.target_level}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    target_level: value as BookCreateRequest['target_level']
                  }))}
                  disabled={isEditing}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : selectedCourse ? (
                <p className="text-sm text-red-600">
                  Nenhum nível CEFR disponível para este curso.
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Selecione um curso primeiro para ver os níveis disponíveis.
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowEditDialog(false)}
              disabled={isEditing}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleEdit}
              disabled={isEditing || !formData.name.trim() || !selectedCourse || availableLevels.length === 0}
              className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isEditing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog de Deletar */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja deletar este book?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O book "<strong>{book.name}</strong>" 
              e todas as suas unidades serão permanentemente removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deletando...
                </>
              ) : (
                'Sim, deletar book'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}