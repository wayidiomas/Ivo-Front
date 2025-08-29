"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  GripVertical,
  ArrowRight,
  Lightbulb,
  Link,
  Shuffle
} from "lucide-react"

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Assessment {
  id?: string
  title: string
  type: string
  instructions: string
  content: any
  answer_key?: any
  difficulty_level: string
  estimated_time?: number
  skills_assessed?: string[]
}

interface AssessmentRendererProps {
  assessment: Assessment
  isInteractive?: boolean
}

// Componente para itens arrastáveis no exercício de reordenação
function SortableItem({ id, children, disabled }: { id: string; children: React.ReactNode; disabled?: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        bg-background border rounded-lg p-3 flex items-center gap-3 
        ${disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
        ${disabled ? 'opacity-60' : 'hover:border-primary/50'}
        transition-colors
      `}
    >
      <GripVertical className={`h-4 w-4 ${disabled ? 'text-muted-foreground/50' : 'text-muted-foreground'}`} />
      {children}
    </div>
  )
}

export default function AssessmentRenderer({ assessment, isInteractive = false }: AssessmentRendererProps) {
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)
  
  // State específico para exercícios de reordenação
  const [reorderItems, setReorderItems] = useState<any[]>([])
  
  // Sensors para drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleSubmit = () => {
    setIsSubmitted(true)
    setShowFeedback(true)
  }

  const handleReset = () => {
    setAnswers({})
    setIsSubmitted(false)
    setShowFeedback(false)
    // Reset reorder items
    const assessmentType = assessment.type?.toUpperCase()
    if ((assessmentType === 'REORDER' || assessmentType === 'REORDERING') && assessment.content?.scrambled_items) {
      const itemsWithIds = assessment.content.scrambled_items.map((item: any, index: number) => ({
        id: `item_${index}`,
        originalIndex: index,
        text: item
      }))
      setReorderItems(itemsWithIds)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setReorderItems((items) => {
        const oldIndex = items.findIndex((item: any) => item.id === active.id)
        const newIndex = items.findIndex((item: any) => item.id === over?.id)
        
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  // Initialize reorder items when assessment changes
  useEffect(() => {
    const assessmentType = assessment.type?.toUpperCase()
    if ((assessmentType === 'REORDER' || assessmentType === 'REORDERING') && assessment.content?.scrambled_items) {
      const itemsWithIds = assessment.content.scrambled_items.map((item: any, index: number) => ({
        id: `item_${index}`,
        originalIndex: index,
        text: item
      }))
      setReorderItems(itemsWithIds)
    }
  }, [assessment])

  const renderClozeTest = () => {
    const { text, blanks, gaps } = assessment.content
    const gapsList = blanks || gaps || []
    
    if (!text || !gapsList || gapsList.length === 0) {
      return (
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-red-600 text-sm">Estrutura de conteúdo inválida para CLOZE_TEST</div>
          <pre className="text-xs mt-2 bg-muted p-2 rounded overflow-auto">
            {JSON.stringify(assessment.content, null, 2)}
          </pre>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-base leading-relaxed">
            {text.split('_____').map((part: string, index: number) => (
              <span key={index}>
                {part}
                {index < gapsList.length && (
                  <Input
                    className="inline-flex w-32 mx-2"
                    placeholder={`Lacuna ${index + 1}`}
                    value={answers[`blank_${index}`] || ''}
                    onChange={(e) => setAnswers({...answers, [`blank_${index}`]: e.target.value})}
                    disabled={isSubmitted}
                  />
                )}
              </span>
            ))}
          </div>
        </div>

        {showFeedback && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Respostas:</h4>
            {gapsList.map((gapAnswer: any, index: number) => {
              const userAnswer = answers[`blank_${index}`]
              // Se gaps é um array de strings, cada string é a resposta correta
              const correctAnswer = typeof gapAnswer === 'string' ? gapAnswer : 
                                   gapAnswer.correct_answer || gapAnswer.answer || gapAnswer.correct
              const isCorrect = userAnswer?.toLowerCase() === correctAnswer?.toLowerCase()
              
              return (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {isCorrect ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>Lacuna {index + 1}:</span>
                  <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                    {userAnswer || '(vazio)'}
                  </span>
                  {!isCorrect && correctAnswer && (
                    <>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <span className="text-green-600">{correctAnswer}</span>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  const renderMultipleChoice = () => {
    const { questions } = assessment.content
    const answerKey = assessment.answer_key || {}
    
    if (!questions || questions.length === 0) {
      return (
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-red-600 text-sm">Nenhuma questão encontrada para MULTIPLE_CHOICE</div>
          <pre className="text-xs mt-2 bg-muted p-2 rounded overflow-auto">
            {JSON.stringify(assessment.content, null, 2)}
          </pre>
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {questions.map((question: any, qIndex: number) => {
          const questionText = question.question || question.text || question.prompt || ''
          const questionOptions = question.options || []
          
          // API retorna answer_key como { "1": "a", "2": "b" } onde "a"=index 0
          const answerKeyIndex = answerKey[`${qIndex + 1}`] || answerKey[qIndex]
          let correctAnswer = ''
          if (answerKeyIndex && questionOptions.length > 0) {
            const letterToIndex = { 'a': 0, 'b': 1, 'c': 2, 'd': 3 }
            const correctIndex = letterToIndex[answerKeyIndex.toLowerCase() as keyof typeof letterToIndex] ?? parseInt(answerKeyIndex)
            correctAnswer = questionOptions[correctIndex] || questionOptions[0]
          }
          
          if (!questionText || questionOptions.length === 0) {
            return (
              <div key={qIndex} className="p-4 bg-muted/50 rounded-lg">
                <div className="text-red-600 text-sm">
                  Erro: Estrutura de questão inválida no índice {qIndex}
                </div>
                <pre className="text-xs mt-2 bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(question, null, 2)}
                </pre>
              </div>
            )
          }
          
          return (
            <div key={qIndex} className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-3">{questionText}</h4>
                
                <RadioGroup 
                  value={answers[`question_${qIndex}`]} 
                  onValueChange={(value) => setAnswers({...answers, [`question_${qIndex}`]: value})}
                  disabled={isSubmitted}
                >
                  {questionOptions.map((option: any, oIndex: number) => (
                    <div key={oIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`q${qIndex}_o${oIndex}`} />
                      <Label htmlFor={`q${qIndex}_o${oIndex}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {showFeedback && correctAnswer && (
                <div className="p-3 rounded-lg border-l-4 border-l-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    {answers[`question_${qIndex}`] === correctAnswer ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium">
                      Resposta correta: {correctAnswer}
                    </span>
                  </div>
                  {question.explanation && (
                    <p className="text-sm text-muted-foreground">{question.explanation}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderGapFill = () => {
    const { sentences, options } = assessment.content
    const answerKey = assessment.answer_key || {}
    
    if (!sentences || sentences.length === 0) {
      return (
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-red-600 text-sm">Nenhuma sentença encontrada para GAP_FILL</div>
          <pre className="text-xs mt-2 bg-muted p-2 rounded overflow-auto">
            {JSON.stringify(assessment.content, null, 2)}
          </pre>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {sentences.map((sentence: any, index: number) => {
          // API real: sentences[] + options[][] (arrays paralelos)
          const sentenceText = typeof sentence === 'string' ? sentence : sentence.text || sentence.content || ''
          const sentenceOptions = options && options[index] ? options[index] : []
          const correctAnswer = answerKey[`${index + 1}`] || answerKey[index]
          
          if (!sentenceText) {
            return (
              <div key={index} className="p-4 bg-muted/50 rounded-lg">
                <div className="text-red-600 text-sm">
                  Erro: Estrutura de sentença inválida no índice {index}
                </div>
                <pre className="text-xs mt-2 bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify({ sentence, options: sentenceOptions }, null, 2)}
                </pre>
              </div>
            )
          }
          
          return (
            <div key={index} className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">#{index + 1}</span>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                {sentenceText.split('_____').map((part: string, partIndex: number) => (
                  <span key={partIndex} className="flex items-center gap-2">
                    {part}
                    {partIndex === 0 && (
                      sentenceOptions.length > 0 ? (
                        <Select 
                          value={answers[`gap_${index}`]} 
                          onValueChange={(value) => setAnswers({...answers, [`gap_${index}`]: value})}
                          disabled={isSubmitted}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Escolha" />
                          </SelectTrigger>
                          <SelectContent>
                            {sentenceOptions.map((option: any, optIndex: number) => (
                              <SelectItem key={optIndex} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          className="inline-flex w-32 mx-1"
                          placeholder={`Gap ${index + 1}`}
                          value={answers[`gap_${index}`] || ''}
                          onChange={(e) => setAnswers({...answers, [`gap_${index}`]: e.target.value})}
                          disabled={isSubmitted}
                        />
                      )
                    )}
                  </span>
                ))}
              </div>

              {showFeedback && correctAnswer && (
                <div className="mt-3 flex items-center gap-2">
                  {answers[`gap_${index}`] === correctAnswer ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className="text-sm">
                    Resposta correta: <strong>{correctAnswer}</strong>
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderTrueFalse = () => {
    const { statements, text } = assessment.content
    const answerKey = assessment.answer_key || {}
    
    if (!statements || statements.length === 0) {
      return (
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-red-600 text-sm">Nenhuma afirmação encontrada para TRUE_FALSE</div>
          <pre className="text-xs mt-2 bg-muted p-2 rounded overflow-auto">
            {JSON.stringify(assessment.content, null, 2)}
          </pre>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Texto base opcional */}
        {text && (
          <div className="p-4 bg-muted/30 rounded-lg border-l-4 border-l-blue-500">
            <h4 className="font-medium text-sm mb-2">Texto base:</h4>
            <p className="text-sm">{text}</p>
          </div>
        )}
        
        {statements.map((statement: any, index: number) => {
          // API: statements é array de strings, answer_key tem as respostas
          const statementText = typeof statement === 'string' ? statement : statement.statement || statement.text || statement.content || ''
          const correctAnswer = answerKey[`${index + 1}`] || answerKey[index] // "true" ou "false" como string
          
          if (!statementText) {
            return (
              <div key={index} className="p-4 bg-muted/50 rounded-lg">
                <div className="text-red-600 text-sm">
                  Erro: Estrutura de afirmação inválida no índice {index}
                </div>
                <pre className="text-xs mt-2 bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(statement, null, 2)}
                </pre>
              </div>
            )
          }
          
          return (
            <div key={index} className="p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                <p className="font-medium">{statementText}</p>
              </div>
              
              <RadioGroup 
                value={answers[`statement_${index}`]} 
                onValueChange={(value) => setAnswers({...answers, [`statement_${index}`]: value})}
                disabled={isSubmitted}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id={`s${index}_true`} />
                  <Label htmlFor={`s${index}_true`}>Verdadeiro</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id={`s${index}_false`} />
                  <Label htmlFor={`s${index}_false`}>Falso</Label>
                </div>
              </RadioGroup>

              {showFeedback && correctAnswer && (
                <div className="mt-3 p-3 rounded-lg border-l-4 border-l-primary/20 bg-primary/5">
                  <div className="flex items-center gap-2 mb-2">
                    {answers[`statement_${index}`] === correctAnswer ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm font-medium">
                      Correto: {correctAnswer === "true" ? 'Verdadeiro' : 'Falso'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderReorder = () => {
    const { scrambled_items, correct_order } = assessment.content
    const answerKey = assessment.answer_key || {}
    
    // Debug: uncomment if needed
    // console.log('🔄 REORDER Debug:', { scrambled_items, correct_order, reorderItems })
    
    if (!scrambled_items || scrambled_items.length === 0) {
      return (
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-red-600 text-sm">Nenhum item encontrado para REORDER</div>
          <pre className="text-xs mt-2 bg-muted p-2 rounded overflow-auto">
            {JSON.stringify(assessment.content, null, 2)}
          </pre>
        </div>
      )
    }

    // Converter API structure para format necessário pelo drag-and-drop
    // API: scrambled_items = ["word1", "word2"] + correct_order = [1, 0]
    // Frontend: precisa de items com id único
    const itemsWithIds = scrambled_items.map((item: any, index: number) => ({
      id: `item_${index}`,
      originalIndex: index,
      text: item
    }))

    // Converter correct_order de índices para IDs
    const correctOrderIds = correct_order ? correct_order.map((index: number) => `item_${index}`) : []

    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/20">
          <div className="flex items-center gap-2 mb-3">
            <Shuffle className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Arraste os itens para a ordem correta:</span>
          </div>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={(reorderItems.length > 0 ? reorderItems : itemsWithIds).map((item: any) => item.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {(reorderItems.length > 0 ? reorderItems : itemsWithIds).map((item: any, index: number) => (
                  <SortableItem key={item.id} id={item.id} disabled={isSubmitted}>
                    <div className="flex-1">
                      <span className="text-sm font-medium mr-2">#{index + 1}</span>
                      <span>{item.text}</span>
                    </div>
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {showFeedback && (
          <div className="space-y-3">
            <div className="p-4 rounded-lg border-l-4 border-l-primary/20 bg-primary/5">
              <h4 className="font-medium text-sm mb-3">Resultado:</h4>
              <div className="space-y-2">
                {(reorderItems.length > 0 ? reorderItems : itemsWithIds).map((item: any, index: number) => {
                  const isCorrectPosition = correctOrderIds && correctOrderIds[index] === item.id
                  return (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      {isCorrectPosition ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>Posição {index + 1}:</span>
                      <span className={isCorrectPosition ? "text-green-600" : "text-red-600"}>
                        {item.text}
                      </span>
                    </div>
                  )
                })}
              </div>
              
              {correctOrderIds.length > 0 && (
                <div className="mt-4 pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Ordem correta:</p>
                  <div className="space-y-1">
                    {correctOrderIds.map((itemId: any, index: number) => {
                      const item = itemsWithIds.find((i: any) => i.id === itemId)
                      return (
                        <div key={itemId} className="text-sm text-green-600">
                          {index + 1}. {item?.text}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* Mostrar resposta final da answer_key se disponível */}
              {answerKey["1"] && (
                <div className="mt-4 pt-3 border-t">
                  <p className="text-sm font-medium mb-2">Resultado esperado:</p>
                  <p className="text-sm text-green-600 italic">"{answerKey["1"]}"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  const renderTransformation = () => {
    const { transformations } = assessment.content
    const answerKey = assessment.answer_key || {}
    
    if (!transformations || transformations.length === 0) {
      return (
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-red-600 text-sm">Nenhuma transformação encontrada para TRANSFORMATION</div>
          <pre className="text-xs mt-2 bg-muted p-2 rounded overflow-auto">
            {JSON.stringify(assessment.content, null, 2)}
          </pre>
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {transformations.map((transformation: any, index: number) => {
          // API: transformations[].original + transformations[].target
          // answer_key como backup/confirmação
          const originalText = transformation.original || transformation.text || ''
          const targetText = transformation.target || transformation.expected_answer || transformation.correct_answer
          const answerKeyText = answerKey[`${index + 1}`] || answerKey[index]
          const correctAnswer = targetText || answerKeyText
          const userAnswer = answers[`transformation_${index}`] || ''
          
          if (!originalText) {
            return (
              <div key={index} className="p-4 bg-muted/50 rounded-lg">
                <div className="text-red-600 text-sm">
                  Erro: Estrutura de transformação inválida no índice {index}
                </div>
                <pre className="text-xs mt-2 bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify(transformation, null, 2)}
                </pre>
              </div>
            )
          }

          return (
            <div key={index} className="p-4 bg-muted/50 rounded-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
                  <span className="text-sm font-medium">Transforme a frase mantendo o significado:</span>
                </div>
                
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Frase original:</span>
                  <p className="mt-1 p-3 bg-background rounded border italic">
                    "{originalText}"
                  </p>
                </div>
                
                {/* Instrução opcional (pode não estar na API) */}
                {transformation.instruction && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Instrução:</span>
                    <p className="mt-1 text-sm">{transformation.instruction}</p>
                  </div>
                )}
                
                <div>
                  <Label htmlFor={`transformation_${index}`} className="text-sm font-medium">
                    Sua transformação:
                  </Label>
                  <Input
                    id={`transformation_${index}`}
                    placeholder="Digite a frase transformada..."
                    value={userAnswer}
                    onChange={(e) => setAnswers({...answers, [`transformation_${index}`]: e.target.value})}
                    disabled={isSubmitted}
                    className="mt-2"
                  />
                </div>
              </div>

              {showFeedback && correctAnswer && (
                <div className="mt-4 p-3 rounded-lg border-l-4 border-l-primary/20 bg-primary/5">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      {/* Comparação simples para transformações (pode ser melhorada) */}
                      {userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim() ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="text-sm font-medium text-green-600">Resposta modelo:</span>
                    </div>
                    <p className="text-sm text-green-600 font-medium">
                      "{correctAnswer}"
                    </p>
                    <div className="flex items-start gap-2 mt-2">
                      <span className="text-sm font-medium">Sua resposta:</span>
                      <span className="text-sm">
                        "{userAnswer || '(não respondido)'}"
                      </span>
                    </div>
                    
                    {/* Mostrar diferença se disponível em answer_key */}
                    {targetText && answerKeyText && targetText !== answerKeyText && (
                      <div className="mt-2 p-2 bg-muted/30 rounded text-xs">
                        <span className="font-medium">Alternativa (answer_key):</span> "{answerKeyText}"
                      </div>
                    )}
                    
                    {transformation.explanation && (
                      <div className="mt-3 pt-2 border-t">
                        <span className="text-sm font-medium text-muted-foreground">Explicação:</span>
                        <p className="text-sm text-muted-foreground mt-1">{transformation.explanation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderMatching = () => {
    const { left_column, right_column } = assessment.content
    const answerKey = assessment.answer_key || {}
    
    if (!left_column || !right_column) {
      return (
        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="text-red-600 text-sm">Estrutura de conteúdo inválida para MATCHING</div>
          <pre className="text-xs mt-2 bg-muted p-2 rounded overflow-auto">
            {JSON.stringify(assessment.content, null, 2)}
          </pre>
        </div>
      )
    }

    // Converter API structure para format necessário pelo frontend
    // API: left_column = ["word1", "word2"] + right_column = ["def1", "def2"]
    // Frontend: precisa de objetos com IDs para Select
    const leftItems = left_column.map((item: any, index: number) => ({
      id: `left_${index}`,
      text: typeof item === 'string' ? item : item.text || item.content || '',
      originalText: typeof item === 'string' ? item : item.text || item.content || ''
    }))

    const rightItems = right_column.map((item: any, index: number) => ({
      id: `right_${index}`,
      text: typeof item === 'string' ? item : item.text || item.content || '',
      originalText: typeof item === 'string' ? item : item.text || item.content || ''
    }))

    return (
      <div className="space-y-4">
        <div className="p-4 bg-muted/10 rounded-lg border-2 border-dashed border-muted-foreground/20">
          <div className="flex items-center gap-2 mb-4">
            <Link className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Conecte os itens correspondentes:</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Coluna A</h4>
              {leftItems.map((item: any, index: number) => (
                <div key={index} className="p-3 bg-background border rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary">#{index + 1}</span>
                    <span className="text-sm">{item.text}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Coluna B</h4>
              {leftItems.map((_: any, leftIndex: number) => (
                <div key={leftIndex} className="p-3 bg-background border rounded-lg">
                  <Select 
                    value={answers[`match_${leftIndex}`]} 
                    onValueChange={(value) => setAnswers({...answers, [`match_${leftIndex}`]: value})}
                    disabled={isSubmitted}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={`Escolha para #${leftIndex + 1}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {rightItems.map((item: any) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {showFeedback && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Resultado:</h4>
            {leftItems.map((leftItem: any, index: number) => {
              const userAnswerId = answers[`match_${index}`]
              const selectedRightItem = rightItems.find((item: any) => item.id === userAnswerId)
              
              // API usa answer_key: {"word1": "definition1"} 
              // Encontrar resposta correta baseada no texto original
              const correctRightText = answerKey[leftItem.originalText]
              const correctRightItem = rightItems.find((item: any) => item.originalText === correctRightText)
              const isCorrect = selectedRightItem?.originalText === correctRightText
              
              return (
                <div key={index} className="flex items-center gap-2 text-sm p-2 rounded border-l-4 border-l-muted">
                  {isCorrect ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span>#{index + 1} {leftItem.text}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className={isCorrect ? "text-green-600" : "text-red-600"}>
                    {selectedRightItem?.text || '(não selecionado)'}
                  </span>
                  {!isCorrect && correctRightItem && (
                    <>
                      <span className="text-muted-foreground text-xs">Correto:</span>
                      <span className="text-green-600">{correctRightItem.text}</span>
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}
        
        {/* Debug: mostrar answer_key para desenvolvimento */}
        {showFeedback && Object.keys(answerKey).length > 0 && (
          <div className="mt-4 p-3 bg-muted/30 rounded text-xs">
            <span className="font-medium">Answer Key (debug):</span>
            <pre className="mt-1">{JSON.stringify(answerKey, null, 2)}</pre>
          </div>
        )}
      </div>
    )
  }

  const renderContent = () => {
    switch (assessment.type?.toUpperCase()) {
      case 'CLOZE_TEST':
        return renderClozeTest()
      case 'MULTIPLE_CHOICE':
        return renderMultipleChoice()
      case 'GAP_FILL':
        return renderGapFill()
      case 'TRUE_FALSE':
        return renderTrueFalse()
      case 'REORDER':
      case 'REORDERING':
        return renderReorder()
      case 'TRANSFORMATION':
        return renderTransformation()
      case 'MATCHING':
        return renderMatching()
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Tipo de exercício não suportado: {assessment.type}</p>
            <p className="text-sm mt-2">Conteúdo bruto:</p>
            <pre className="text-xs mt-2 p-2 bg-muted rounded text-left overflow-auto">
              {JSON.stringify(assessment.content, null, 2)}
            </pre>
          </div>
        )
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-lg">{assessment.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {assessment.type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {assessment.difficulty_level}
              </Badge>
              {assessment.estimated_time && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>~{assessment.estimated_time} min</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mt-2">
          {assessment.instructions}
        </p>

        {assessment.skills_assessed && assessment.skills_assessed.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-muted-foreground">Habilidades:</span>
            {assessment.skills_assessed.map((skill: any, idx: number) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <Separator />
      
      <CardContent className="pt-6">
        {renderContent()}
        
        {isInteractive && (
          <div className="flex gap-2 mt-6 pt-4 border-t">
            {!isSubmitted ? (
              <Button onClick={handleSubmit} className="bg-gradient-to-r from-primary to-accent">
                Verificar Respostas
              </Button>
            ) : (
              <Button onClick={handleReset} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Tentar Novamente
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}