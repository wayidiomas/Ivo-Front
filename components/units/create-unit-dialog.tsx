'use client'

import { useState, useCallback } from 'react'
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
import { Plus, BookOpen, Upload, X, Image } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { unitsApi, type UnitCreateRequest } from '@/lib/api/units'
import type { Unit } from '@/lib/types/api.types'
import { useAIRequest } from '@/hooks/use-ai-request'
import { AILoading } from '@/components/ui/ai-loading'
import { AIErrorDialog } from '@/components/ui/ai-error-dialog'

interface CreateUnitDialogProps {
  bookId: string
  bookName: string
  onUnitCreated?: (newUnit: Unit) => void
}

const CEFR_LEVELS = [
  { value: 'A1', label: 'A1 - Iniciante' },
  { value: 'A2', label: 'A2 - Básico' },
  { value: 'B1', label: 'B1 - Intermediário' },
  { value: 'B2', label: 'B2 - Intermediário Alto' },
  { value: 'C1', label: 'C1 - Avançado' },
  { value: 'C2', label: 'C2 - Proficiente' },
] as const

const UNIT_TYPES = [
  { value: 'lexical_unit', label: 'Unidade Lexical - Foco em léxico' },
  { value: 'grammar_unit', label: 'Unidade Gramatical - Foco em gramática' },
  { value: 'functional_unit', label: 'Unidade Funcional - Situações comunicativas' },
  { value: 'mixed_unit', label: 'Unidade Mista - Vocabulário + Gramática' },
] as const

const LANGUAGE_VARIANTS = [
  { value: 'american_english', label: 'Inglês Americano' },
  { value: 'british_english', label: 'Inglês Britânico' },
  { value: 'australian_english', label: 'Inglês Australiano' },
  { value: 'canadian_english', label: 'Inglês Canadense' },
  { value: 'indian_english', label: 'Inglês Indiano' },
] as const

export function CreateUnitDialog({ bookId, bookName, onUnitCreated }: CreateUnitDialogProps) {
  const [open, setOpen] = useState(false)
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [formData, setFormData] = useState<UnitCreateRequest>({
    context: '',
    cefr_level: 'A1',
    language_variant: 'american_english',
    unit_type: 'lexical_unit',
    images: []
  })

  const {
    isLoading,
    error,
    errorType,
    executeRequest,
    reset
  } = useAIRequest({
    timeout: 180000, // 3 minutes
    onSuccess: (response) => {
      toast({
        title: 'Unidade criada com sucesso!',
        description: `A nova unidade foi criada no book "${bookName}". Redirecionando para o pipeline...`,
      })
      
      if (onUnitCreated) {
        onUnitCreated(response.data.unit)
      }
      
      // Redirect to pipeline instead of closing
      window.location.href = `/units/${response.data.unit.id}?tab=pipeline`
    },
    onError: (error, errorType) => {
      setShowErrorDialog(true)
    }
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      setSelectedImages(prev => [...prev, ...files].slice(0, 5)) // Max 5 images
      setFormData(prev => ({ 
        ...prev, 
        images: [...(prev.images || []), ...files].slice(0, 5) 
      }))
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({ 
      ...prev, 
      images: prev.images?.filter((_, i) => i !== index) || []
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validação condicional: context obrigatório SEM imagem, opcional COM imagem
    if (!formData.images?.length && !formData.context?.trim()) {
      toast({
        title: 'Erro de validação',
        description: 'É necessário fornecer um contexto OU pelo menos uma imagem.',
        variant: 'destructive',
      })
      return
    }

    await executeRequest(() => unitsApi.createUnit(bookId, formData))
  }

  const handleRetry = async () => {
    setShowErrorDialog(false)
    reset()
    await executeRequest(() => unitsApi.createUnit(bookId, formData))
  }

  const handleClose = () => {
    if (!isLoading) {
      setOpen(false)
      setSelectedImages([])
      setFormData({
        context: '',
        cefr_level: 'A1',
        language_variant: 'american_english',
        unit_type: 'lexical_unit',
        images: []
      })
      reset()
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl">
            <Plus className="mr-2 h-4 w-4" />
            Nova Unidade
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Criar Nova Unidade
            </DialogTitle>
            <DialogDescription>
              Crie uma nova unidade no book "{bookName}". Forneça um contexto ou adicione imagens. O conteúdo será gerado via pipeline de IA.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unit-context">Contexto e Objetivos {selectedImages.length === 0 ? '*' : '(Opcional)'}</Label>
              <Textarea
                id="unit-context"
                placeholder="Descreva o contexto, objetivos e situações que a unidade deve abordar..."
                value={formData.context}
                onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                maxLength={2000}
                rows={4}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                {(formData.context || '').length}/2000 caracteres
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cefr-level">Nível CEFR *</Label>
                <Select
                  value={formData.cefr_level}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    cefr_level: value as UnitCreateRequest['cefr_level']
                  }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o nível" />
                  </SelectTrigger>
                  <SelectContent>
                    {CEFR_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language-variant">Variante do Idioma *</Label>
                <Select
                  value={formData.language_variant}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    language_variant: value as UnitCreateRequest['language_variant']
                  }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a variante" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGE_VARIANTS.map((variant) => (
                      <SelectItem key={variant.value} value={variant.value}>
                        {variant.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit-type">Tipo de Unidade *</Label>
              <Select
                value={formData.unit_type}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  unit_type: value as UnitCreateRequest['unit_type']
                }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="unit-images">Imagens (Opcional)</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  id="unit-images"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={isLoading}
                />
                <label
                  htmlFor="unit-images"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600">
                    Clique para fazer upload de imagens
                  </span>
                  <span className="text-xs text-gray-400">
                    PNG, JPG até 5MB cada (máx. 5 imagens)
                  </span>
                </label>
              </div>

              {/* Preview images */}
              {selectedImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {selectedImages.map((file, index) => (
                    <div key={index} className="relative">
                      <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                        <Image className="h-6 w-6 text-gray-400" />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                        disabled={isLoading}
                      >
                        <X className="h-3 w-3" />
                      </button>
                      <p className="text-xs text-center mt-1 truncate">
                        {file.name}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>⚡ Geração com IA:</strong> O conteúdo completo da unidade (vocabulário, frases, gramática, atividades) será gerado automaticamente. Este processo pode levar até 3 minutos.
              </p>
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || (!formData.images?.length && !formData.context?.trim())}
                className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {isLoading ? (
                  'Gerando...'
                ) : (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Criar Unidade
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Loading Overlay */}
      {isLoading && (
        <AILoading 
          title="Criando unidade com IA"
          subtitle="Gerando vocabulário, frases, gramática e atividades..."
        />
      )}

      {/* Error Dialog */}
      <AIErrorDialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}
        title="Erro na Geração da Unidade"
        description="Não foi possível criar a unidade com o conteúdo especificado."
        onRetry={handleRetry}
        isRetrying={isLoading}
        errorType={errorType || 'generation'}
      />
    </>
  )
}