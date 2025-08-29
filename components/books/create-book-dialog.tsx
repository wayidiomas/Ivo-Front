'use client'

import { useState } from 'react'
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
import { booksApi, type BookCreateRequest, type Book } from '@/lib/api/books'
import type { Course } from '@/lib/api/courses'

interface CreateBookDialogProps {
  course: Course
  onBookCreated?: (newBook: Book) => void
}

const CEFR_LEVELS = [
  { value: 'A1', label: 'A1 - Iniciante' },
  { value: 'A2', label: 'A2 - Básico' },
  { value: 'B1', label: 'B1 - Intermediário' },
  { value: 'B2', label: 'B2 - Intermediário Alto' },
  { value: 'C1', label: 'C1 - Avançado' },
  { value: 'C2', label: 'C2 - Proficiente' },
] as const

export function CreateBookDialog({ course, onBookCreated }: CreateBookDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<BookCreateRequest>({
    name: '',
    description: '',
    target_level: 'A1'
  })

  // Filtrar apenas os níveis disponíveis no curso
  const availableLevels = CEFR_LEVELS.filter(level => 
    course.target_levels.includes(level.value)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
      const response = await booksApi.createBook(course.id, {
        name: formData.name.trim(),
        description: formData.description?.trim() || '',
        target_level: formData.target_level
      })

      toast({
        title: 'Book criado com sucesso!',
        description: `O book "${formData.name}" foi adicionado ao curso "${course.name}".`,
      })

      // Callback para atualizar a lista
      if (onBookCreated) {
        onBookCreated(response.data.book)
      }

      // Reset form and close dialog
      setFormData({
        name: '',
        description: '',
        target_level: availableLevels[0]?.value || 'A1'
      })
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
      if (!newOpen) {
        // Reset form when closing
        setTimeout(() => {
          setFormData({
            name: '',
            description: '',
            target_level: availableLevels[0]?.value || 'A1'
          })
        }, 100)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl">
          <Plus className="mr-2 h-4 w-4" />
          Novo Book
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Criar Novo Book
          </DialogTitle>
          <DialogDescription>
            Crie um novo book no curso "{course.name}". 
            {availableLevels.length > 0 && (
              <>
                <br />
                Níveis disponíveis: {availableLevels.map(l => l.label).join(', ')}
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            ) : (
              <p className="text-sm text-red-600">
                Nenhum nível CEFR disponível para este curso.
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
              disabled={isSubmitting || !formData.name.trim() || availableLevels.length === 0}
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