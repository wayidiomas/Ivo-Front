'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
import { Plus, Loader2, BookOpen } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { booksApi, type BookCreateRequest } from '@/lib/api/books'
import { coursesApi, type Course } from '@/lib/api/courses'

interface CreateBookGlobalDialogProps {
  onBookCreated?: (newBook: any) => void
}

const CEFR_LEVELS = [
  { value: 'A1', label: 'A1 - Iniciante' },
  { value: 'A2', label: 'A2 - Básico' },
  { value: 'B1', label: 'B1 - Intermediário' },
  { value: 'B2', label: 'B2 - Intermediário Alto' },
  { value: 'C1', label: 'C1 - Avançado' },
  { value: 'C2', label: 'C2 - Proficiente' },
] as const

export function CreateBookGlobalDialog({ onBookCreated }: CreateBookGlobalDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [courses, setCourses] = useState<Course[]>([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [formData, setFormData] = useState<BookCreateRequest>({
    name: '',
    description: '',
    target_level: 'A1'
  })

  // Carregar cursos quando abrir o dialog
  const loadCourses = async () => {
    try {
      setLoadingCourses(true)
      const response = await coursesApi.listCourses({
        page: 1,
        size: 100,
        sort_by: 'name',
        sort_order: 'asc'
      })
      setCourses(response.data)
    } catch (error) {
      console.error('Erro ao carregar cursos:', error)
      toast({
        title: 'Erro ao carregar cursos',
        description: 'Não foi possível carregar a lista de cursos.',
        variant: 'destructive',
      })
    } finally {
      setLoadingCourses(false)
    }
  }

  // Filtrar apenas os níveis disponíveis no curso selecionado
  const availableLevels = selectedCourse 
    ? CEFR_LEVELS.filter(level => selectedCourse.target_levels.includes(level.value))
    : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedCourse) {
      toast({
        title: 'Erro de validação',
        description: 'Selecione um curso para criar o book.',
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

    if (formData.name.length < 3) {
      toast({
        title: 'Erro de validação',
        description: 'O nome do book deve ter pelo menos 3 caracteres.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await booksApi.createBook(selectedCourse.id, {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        target_level: formData.target_level
      })

      toast({
        title: 'Book criado com sucesso!',
        description: `O book "${formData.name}" foi adicionado ao curso "${selectedCourse.name}".`,
      })

      // Callback para atualizar a lista
      if (onBookCreated) {
        // Adicionar informações do curso ao book
        const bookWithCourseInfo = {
          ...response.data.book,
          course_name: selectedCourse.name,
          course_language_variant: selectedCourse.language_variant,
          vocabulary_count: 0,
          status: 'draft'
        }
        onBookCreated(bookWithCourseInfo)
      }

      // Reset form and close dialog
      setFormData({
        name: '',
        description: '',
        target_level: 'A1'
      })
      setSelectedCourse(null)
      setOpen(false)
      
    } catch (error) {
      console.error('Erro ao criar book:', error)
      toast({
        title: 'Erro ao criar book',
        description: error instanceof Error ? error.message : 'Não foi possível criar o book. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSubmitting) {
      setOpen(newOpen)
      if (newOpen) {
        loadCourses()
      } else {
        // Reset form when closing
        setTimeout(() => {
          setFormData({
            name: '',
            description: '',
            target_level: 'A1'
          })
          setSelectedCourse(null)
        }, 100)
      }
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl">
          <Plus className="mr-2 h-4 w-4" />
          Novo Livro
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Criar Novo Book
          </DialogTitle>
          <DialogDescription>
            Selecione um curso e configure os dados do novo book.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course-select">Curso *</Label>
            {loadingCourses ? (
              <div className="flex items-center justify-center p-3 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Carregando cursos...
              </div>
            ) : (
              <Select
                value={selectedCourse?.id || ""}
                onValueChange={handleCourseChange}
                disabled={isSubmitting}
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
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-name">Nome do Book *</Label>
            <Input
              id="book-name"
              placeholder="Ex: Business Fundamentals - A2"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              maxLength={200}
              disabled={isSubmitting}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {formData.name.length}/200 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-description">Descrição</Label>
            <Textarea
              id="book-description"
              placeholder="Descreva brevemente o conteúdo e objetivos do book..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              maxLength={1000}
              rows={3}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground">
              {(formData.description || '').length}/1000 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target-level">Nível CEFR *</Label>
            {availableLevels.length > 0 ? (
              <Select
                value={formData.target_level}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  target_level: value as BookCreateRequest['target_level']
                }))}
                disabled={isSubmitting}
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
            <p className="text-xs text-muted-foreground">
              Este book será específico para o nível selecionado.
            </p>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.name.trim() || !selectedCourse || availableLevels.length === 0}
              className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Criar Book
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}