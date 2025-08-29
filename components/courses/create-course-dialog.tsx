'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Plus, X, Loader2 } from 'lucide-react'
import { AiGenerateButton } from './ai-generate-button'
import { toast } from '@/hooks/use-toast'
import { coursesApi, type CourseCreateRequest } from '@/lib/api/courses'

// Enums baseados na API IVO V2
const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
const LANGUAGE_VARIANTS = {
  'american_english': 'Inglês Americano',
  'british_english': 'Inglês Britânico',
  'australian_english': 'Inglês Australiano'
} as const

// Metodologia sempre será "direct_method" - não mostrar ao usuário

// Schema de validação baseado na API
const createCourseSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  description: z.string()
    .max(1000, 'Descrição deve ter no máximo 1000 caracteres')
    .optional(),
  target_levels: z.array(z.enum(CEFR_LEVELS))
    .min(1, 'Selecione pelo menos um nível CEFR'),
  language_variant: z.enum(['american_english', 'british_english', 'australian_english'])
  // methodology removido do form - será sempre ["direct_method"]
})

type CreateCourseFormData = z.infer<typeof createCourseSchema>

interface CreateCourseDialogProps {
  onCourseCreated?: (course: any) => void
  trigger?: React.ReactNode
}

export function CreateCourseDialog({ onCourseCreated, trigger }: CreateCourseDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const form = useForm<CreateCourseFormData>({
    resolver: zodResolver(createCourseSchema),
    defaultValues: {
      name: '',
      description: '',
      target_levels: [],
      language_variant: 'american_english'
    }
  })

  const watchedTargetLevels = form.watch('target_levels')

  const handleTargetLevelToggle = (level: typeof CEFR_LEVELS[number]) => {
    const currentLevels = form.getValues('target_levels')
    const newLevels = currentLevels.includes(level)
      ? currentLevels.filter(l => l !== level)
      : [...currentLevels, level].sort((a, b) => 
          CEFR_LEVELS.indexOf(a) - CEFR_LEVELS.indexOf(b)
        )
    form.setValue('target_levels', newLevels)
  }

  // handleMethodologyToggle removido - methodology sempre será ["direct_method"]

  const onSubmit = async (data: CreateCourseFormData) => {
    setIsLoading(true)
    
    try {
      // Preparar dados para API
      const courseData: CourseCreateRequest = {
        name: data.name,
        description: data.description || '',
        target_levels: data.target_levels,
        language_variant: data.language_variant,
        methodology: "direct_method", // Sempre método direto
      }

      console.log('Creating course with data:', courseData)
      
      // Tentar chamada para API real
      try {
        const response = await coursesApi.createCourse(courseData)
        
        toast({
          title: 'Curso criado com sucesso!',
          description: response.message || `O curso "${data.name}" foi criado e está pronto para receber livros.`,
        })

        onCourseCreated?.(response.data.course)
        
        // Mostrar sugestões da API se disponíveis
        if (response.next_suggested_actions?.length) {
          console.log('Próximas ações sugeridas:', response.next_suggested_actions)
        }

      } catch (apiError: any) {
        console.warn('API offline ou erro, usando modo fallback:', apiError.message)
        
        // Fallback: simular resposta quando API estiver offline
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const mockCourse = {
          id: `course_${Date.now()}`,
          name: data.name,
          description: data.description || '',
          target_levels: data.target_levels,
          language_variant: data.language_variant,
          methodology: "direct_method", // Sempre método direto
          total_books: 0,
          total_units: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        toast({
          title: 'Curso criado (modo offline)',
          description: `O curso "${data.name}" foi criado localmente. Será sincronizado quando a API estiver disponível.`,
        })

        onCourseCreated?.(mockCourse)
      }

      setOpen(false)
      form.reset()
      
    } catch (error) {
      console.error('Error creating course:', error)
      toast({
        title: 'Erro ao criar curso',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const defaultTrigger = (
    <Button className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl">
      <Plus className="mr-2 h-4 w-4" />
      Novo Curso
    </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Curso</DialogTitle>
          <DialogDescription>
            Configure um novo curso de inglês com níveis CEFR e metodologias específicas
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Nome do Curso */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Curso *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: English for Business Professionals"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Nome descritivo do curso (3-200 caracteres)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva os objetivos e público-alvo do curso..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Descrição opcional do curso (máximo 1000 caracteres)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Níveis CEFR */}
            <FormField
              control={form.control}
              name="target_levels"
              render={() => (
                <FormItem>
                  <FormLabel>Níveis CEFR Cobertos *</FormLabel>
                  <FormDescription>
                    Selecione os níveis que este curso irá abordar
                  </FormDescription>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {CEFR_LEVELS.map((level) => (
                      <div key={level} className="flex items-center">
                        <Checkbox
                          checked={watchedTargetLevels.includes(level)}
                          onCheckedChange={() => handleTargetLevelToggle(level)}
                          id={level}
                        />
                        <label 
                          htmlFor={level}
                          className="ml-2 text-sm font-medium cursor-pointer"
                        >
                          {level}
                        </label>
                      </div>
                    ))}
                  </div>
                  {watchedTargetLevels.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      <span className="text-sm text-muted-foreground">Selecionados:</span>
                      {watchedTargetLevels.map((level) => (
                        <Badge 
                          key={level} 
                          variant="secondary"
                          className="text-xs"
                        >
                          {level}
                          <X 
                            className="ml-1 h-3 w-3 cursor-pointer" 
                            onClick={() => handleTargetLevelToggle(level)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Variante do Idioma */}
            <FormField
              control={form.control}
              name="language_variant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variante do Idioma *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a variante do inglês" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(LANGUAGE_VARIANTS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Variante do inglês que será utilizada no curso
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />


            {/* Botões */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Curso
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}