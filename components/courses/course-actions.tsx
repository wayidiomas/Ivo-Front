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
import { MoreHorizontal, Edit3, Trash2, Loader2 } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { coursesApi, type Course } from '@/lib/api/courses'

interface CourseActionsProps {
  course: Course
  onCourseUpdated: (updatedCourse: Course) => void
  onCourseDeleted: (courseId: string) => void
}

export function CourseActions({ course, onCourseUpdated, onCourseDeleted }: CourseActionsProps) {
  const [showRenameDialog, setShowRenameDialog] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [newName, setNewName] = useState(course.name)
  const [isRenaming, setIsRenaming] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleRename = async () => {
    if (!newName.trim() || newName === course.name) {
      setShowRenameDialog(false)
      return
    }

    setIsRenaming(true)
    
    try {
      const response = await coursesApi.updateCourse(course.id, {
        name: newName.trim(),
        description: course.description,
        target_levels: course.target_levels,
        language_variant: course.language_variant as 'american_english' | 'british_english' | 'australian_english',
        methodology: course.methodology
      })

      toast({
        title: 'Curso renomeado com sucesso!',
        description: `O curso agora se chama "${newName}".`,
      })

      onCourseUpdated(response.data.course)
      setShowRenameDialog(false)
      
    } catch (error) {
      console.error('Erro ao renomear curso:', error)
      toast({
        title: 'Erro ao renomear curso',
        description: 'Não foi possível renomear o curso. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsRenaming(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    
    try {
      await coursesApi.deleteCourse(course.id)

      toast({
        title: 'Curso deletado com sucesso!',
        description: `O curso "${course.name}" foi removido.`,
      })

      onCourseDeleted(course.id)
      setShowDeleteAlert(false)
      
    } catch (error) {
      console.error('Erro ao deletar curso:', error)
      toast({
        title: 'Erro ao deletar curso',
        description: 'Não foi possível deletar o curso. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
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
          <DropdownMenuItem onClick={() => setShowRenameDialog(true)}>
            <Edit3 className="mr-2 h-4 w-4" />
            Renomear curso
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setShowDeleteAlert(true)}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Deletar curso
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog de Renomear */}
      <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Renomear Curso</DialogTitle>
            <DialogDescription>
              Digite o novo nome para o curso "{course.name}".
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="course-name">Nome do curso</Label>
              <Input
                id="course-name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Digite o novo nome..."
                maxLength={200}
              />
              <p className="text-xs text-muted-foreground">
                {newName.length}/200 caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRenameDialog(false)}
              disabled={isRenaming}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleRename}
              disabled={isRenaming || !newName.trim() || newName === course.name}
              className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              {isRenaming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Renomeando...
                </>
              ) : (
                'Renomear'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog de Deletar */}
      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza que deseja deletar este curso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O curso "<strong>{course.name}</strong>" 
              e todos os seus livros e unidades serão permanentemente removidos.
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
                'Sim, deletar curso'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}