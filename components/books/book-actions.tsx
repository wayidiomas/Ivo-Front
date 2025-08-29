'use client'

import { useState } from 'react'
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
import { booksApi, type Book, type BookCreateRequest } from '@/lib/api/books'

interface BookActionsProps {
  book: Book
  availableLevels: Array<{ value: string; label: string }>
  onBookUpdated: (updatedBook: Book) => void
  onBookDeleted: (bookId: string) => void
}

export function BookActions({ book, availableLevels, onBookUpdated, onBookDeleted }: BookActionsProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editData, setEditData] = useState<BookCreateRequest>({
    name: book.name,
    description: book.description || '',
    target_level: book.target_level as BookCreateRequest['target_level']
  })

  const handleEdit = async () => {
    if (!editData.name.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'O nome do book é obrigatório.',
        variant: 'destructive',
      })
      return
    }

    if (editData.name.length < 3) {
      toast({
        title: 'Erro de validação',
        description: 'O nome do book deve ter pelo menos 3 caracteres.',
        variant: 'destructive',
      })
      return
    }

    setIsEditing(true)
    
    try {
      const response = await booksApi.updateBook(book.id, {
        name: editData.name.trim(),
        description: editData.description?.trim() || '',
        target_level: editData.target_level
      })

      toast({
        title: 'Book atualizado com sucesso!',
        description: `O book "${editData.name}" foi atualizado.`,
      })

      onBookUpdated(response.data.book)
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
        description: error instanceof Error ? error.message : 'Não foi possível deletar o book. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleEditDialogOpen = (open: boolean) => {
    setShowEditDialog(open)
    if (open) {
      // Reset form data when opening
      setEditData({
        name: book.name,
        description: book.description || '',
        target_level: book.target_level as BookCreateRequest['target_level']
      })
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" className="h-8 w-8 bg-black/20 hover:bg-black/40">
            <MoreHorizontal className="h-4 w-4 text-white" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit3 className="mr-2 h-4 w-4" />
            Renomear book
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
      <Dialog open={showEditDialog} onOpenChange={handleEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Renomear Book
            </DialogTitle>
            <DialogDescription>
              Digite o novo nome e informações para o book "{book.name}".
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-book-name">Nome do Book *</Label>
              <Input
                id="edit-book-name"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nome do book..."
                maxLength={200}
                disabled={isEditing}
              />
              <p className="text-xs text-muted-foreground">
                {editData.name.length}/200 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-book-description">Descrição</Label>
              <Textarea
                id="edit-book-description"
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descrição do book..."
                maxLength={1000}
                rows={3}
                disabled={isEditing}
              />
              <p className="text-xs text-muted-foreground">
                {editData.description?.length || 0}/1000 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-target-level">Nível CEFR *</Label>
              <Select
                value={editData.target_level}
                onValueChange={(value) => setEditData(prev => ({ 
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
              disabled={isEditing || !editData.name.trim()}
              className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isEditing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar alterações'
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
              e todas as suas unidades ({book.unit_count} unidades) serão permanentemente removidas.
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