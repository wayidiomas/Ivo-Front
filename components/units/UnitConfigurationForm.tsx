"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Settings, 
  BookOpen,
  Upload,
  X,
  Image as ImageIcon,
  RefreshCw,
  Sparkles,
  Brain,
  Save,
  Target,
  HelpCircle
} from "lucide-react"
import { Unit, CEFRLevel, LanguageVariant, UnitType } from "@/lib/types/api.types"

interface UnitConfigurationFormProps {
  unit: Unit
  onSave: (updatedUnit: Partial<Unit>) => void
  isEditing: boolean
  showStatus?: boolean
}

export default function UnitConfigurationForm({ unit, onSave, isEditing, showStatus = true }: UnitConfigurationFormProps) {
  const [formData, setFormData] = useState<Partial<Unit>>(unit)
  const [isDirty, setIsDirty] = useState(false)

  // Update form when unit changes
  useEffect(() => {
    setFormData(unit)
    setIsDirty(false)
  }, [unit])

  const handleChange = (field: keyof Unit, value: any) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    setIsDirty(true)
    
    // Auto-save: propagar mudanças imediatamente para o componente pai
    onSave(newFormData)
  }

  const handleSave = () => {
    onSave(formData)
    setIsDirty(false)
  }

  const handleReset = () => {
    setFormData(unit)
    setIsDirty(false)
  }

  // Handle image upload
  const handleImageUpload = (files: FileList | null) => {
    if (!files) return
    
    const newImages = Array.from(files).slice(0, 2) // Limit to 2 images
    // In real app, convert to ImageInfo format or upload to server
    console.log('Images to upload:', newImages)
    setIsDirty(true)
  }

  const removeImage = (index: number) => {
    const newImages = [...(unit.images || [])]
    newImages.splice(index, 1)
    handleChange('images', newImages)
  }

  if (!isEditing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-accent" />
            Configuração da Unidade
          </CardTitle>
          <CardDescription>
            Clique em "Editar" para modificar as configurações
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Modo de visualização. Use o botão "Editar" para fazer alterações.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
      
      {/* Save/Cancel Actions */}
      {isDirty && (
        <Card className="bg-muted/50 backdrop-blur-sm border-0 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 p-[1px]">
            <div className="h-full w-full bg-muted/90 backdrop-blur-sm"></div>
          </div>
          <CardContent className="pt-6 relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-foreground/80">
                <RefreshCw className="h-4 w-4" />
                <span className="text-sm font-medium">Alterações não salvas</span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleReset}
                  className="border-border/60 text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-all duration-200"
                >
                  Reverter
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleSave} 
                  className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Basic Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Configuração da Unidade
          </CardTitle>
          <CardDescription>
            Configure os parâmetros básicos da unidade
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Unit Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título da Unidade (Opcional)</Label>
            <Input
              id="title"
              placeholder="Ex: Unit 5: Business Presentations"
              value={formData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          {/* Context */}
          <div className="space-y-2">
            <Label htmlFor="context">Contexto da Unidade</Label>
            <Textarea
              id="context"
              placeholder="Descreva o contexto e tema da unidade..."
              value={formData.context || ''}
              onChange={(e) => handleChange('context', e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              O contexto define o tema e cenário da unidade para geração de conteúdo
            </p>
          </div>

          {/* CEFR Level and Unit Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-2">
              <Label>Nível CEFR</Label>
              <Select 
                value={formData.cefr_level || ''} 
                onValueChange={(value: CEFRLevel) => handleChange('cefr_level', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o nível" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">A1</Badge>
                      <span>Básico</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="A2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">A2</Badge>
                      <span>Pré-Intermediário</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="B1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">B1</Badge>
                      <span>Intermediário</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="B2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">B2</Badge>
                      <span>Intermediário Superior</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="C1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">C1</Badge>
                      <span>Avançado</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="C2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">C2</Badge>
                      <span>Proficiente</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tipo de Unidade</Label>
              <Select 
                value={formData.unit_type || ''} 
                onValueChange={(value: UnitType) => handleChange('unit_type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="lexical_unit">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Unidade Lexical
                    </div>
                  </SelectItem>
                  <SelectItem value="grammar_unit">
                    <div className="flex items-center gap-2">
                      <Brain className="h-4 w-4" />
                      Unidade Gramatical
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>


          {/* Images Upload */}
          <div className="space-y-3">
            <Label>Imagens da Unidade (Máximo 2)</Label>
            
            {/* Current Images */}
            {unit.images && unit.images.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                {unit.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-muted rounded-lg border flex items-center justify-center relative overflow-hidden">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground ml-2">
                        {image.filename}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 text-center">
                      {(image.size / 1024 / 1024).toFixed(1)} MB
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            {(!unit.images || unit.images.length < 2) && (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <label htmlFor="images" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium">Clique para adicionar imagens</span>
                    <span className="text-xs text-muted-foreground">
                      PNG, JPG ou GIF (máx. 10MB cada)
                    </span>
                  </div>
                </label>
                <input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files)}
                />
              </div>
            )}
          </div>

          {/* Main Aim */}
          <div className="space-y-2">
            <Label htmlFor="main_aim">Objetivo Principal (Opcional)</Label>
            <Textarea
              id="main_aim"
              placeholder="Descreva o objetivo principal desta unidade..."
              value={formData.main_aim || ''}
              onChange={(e) => handleChange('main_aim', e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

        </CardContent>
      </Card>

      {/* Target Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-green-600" />
            Configuração de Metas
          </CardTitle>
          <CardDescription>
            Configure quantidades alvo para geração de conteúdo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Vocabulary Target Count (API: target_count para vocabulary) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Meta de Vocabulário</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Número exato de palavras que serão geradas pela IA (5-50)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm text-muted-foreground">
                {(formData as any).vocabulary_target_count || 15} palavras
              </span>
            </div>
            <Slider
              value={[(formData as any).vocabulary_target_count || 15]}
              onValueChange={([value]) => handleChange('vocabulary_target_count' as any, value)}
              max={50}
              min={5}
              step={1}
              className="w-full"
            />
          </div>

          {/* Sentences Target Count (API: target_count para sentences) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Meta de Sentenças</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Número exato de sentenças contextuais que serão geradas (3-20)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm text-muted-foreground">
                {(formData as any).sentences_target_count || 10} sentenças
              </span>
            </div>
            <Slider
              value={[(formData as any).sentences_target_count || 10]}
              onValueChange={([value]) => handleChange('sentences_target_count' as any, value)}
              max={20}
              min={3}
              step={1}
              className="w-full"
            />
          </div>

          {/* QA Target Count (API: target_count para qa) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Meta de Perguntas Q&A</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Número de perguntas e respostas pedagógicas baseadas na taxonomia de Bloom (2-15)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm text-muted-foreground">
                {(formData as any).qa_target_count || 8} perguntas
              </span>
            </div>
            <Slider
              value={[(formData as any).qa_target_count || 8]}
              onValueChange={([value]) => handleChange('qa_target_count' as any, value)}
              max={15}
              min={2}
              step={1}
              className="w-full"
            />
          </div>

          {/* Assessment Count (API: assessment_count para assessments) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Quantidade de Avaliações</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Número de atividades avaliativas (cloze, gap-fill, múltipla escolha, etc.) (1-5)</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <span className="text-sm text-muted-foreground">
                {(formData as any).assessment_count || 2} atividades
              </span>
            </div>
            <Slider
              value={[(formData as any).assessment_count || 2]}
              onValueChange={([value]) => handleChange('assessment_count' as any, value)}
              max={5}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          {/* Is Revision Unit (API: is_revision_unit para vocabulary) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Unidade de Revisão</Label>
                <Tooltip>
                  <TooltipTrigger>
                    <HelpCircle className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Permite buscar vocabulário de outros livros do curso durante a geração, útil para unidades de revisão</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Switch
                checked={(formData as any).is_revision_unit || false}
                onCheckedChange={(checked) => handleChange('is_revision_unit' as any, checked)}
                className="data-[state=checked]:bg-destructive"
              />
            </div>
          </div>

        </CardContent>
      </Card>



      {/* Status and Quality */}
      {showStatus && (
        <Card>
          <CardHeader>
            <CardTitle>Status e Qualidade</CardTitle>
            <CardDescription>
              Informações sobre o estado atual da unidade
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Status</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="capitalize">
                  {unit.status ? unit.status.replace('_', ' ') : 'Indefinido'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Sequência: #{unit.sequence_order}
                </span>
              </div>
            </div>
            
            {unit.quality_score && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Qualidade</Label>
                <div className="mt-1">
                  <span className="text-2xl font-bold text-green-600">
                    {unit.quality_score.toFixed(1)}
                  </span>
                  <span className="text-sm text-muted-foreground ml-1">/10</span>
                </div>
              </div>
            )}
          </div>

          {/* Strategies and Vocabulary Taught */}
          {unit.strategies_used && unit.strategies_used.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Estratégias Utilizadas</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {unit.strategies_used.map((strategy, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {strategy}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {unit.vocabulary_taught && unit.vocabulary_taught.length > 0 && (
            <div>
              <Label className="text-sm font-medium text-muted-foreground">
                Vocabulário Ensinado ({unit.vocabulary_taught.length} palavras)
              </Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {unit.vocabulary_taught.slice(0, 10).map((word, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {word}
                  </Badge>
                ))}
                {unit.vocabulary_taught.length > 10 && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    +{unit.vocabulary_taught.length - 10} mais
                  </Badge>
                )}
              </div>
            </div>
          )}

        </CardContent>
      </Card>
      )}

      </div>
    </TooltipProvider>
  )
}