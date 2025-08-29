/**
 * PDF Generator - Sistema completo de geração de PDFs educacionais
 * Usa @react-pdf/renderer para criar PDFs profissionais estilo Cambridge
 */

import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font, pdf, Image } from '@react-pdf/renderer'
import { Unit } from '@/lib/types/api.types'

// Helper para renderizar valores de forma segura
const safeRender = (value: any): string => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') {
    // Para objetos complexos, extrair informações úteis
    if (Array.isArray(value)) {
      return value.map(v => typeof v === 'string' ? v : JSON.stringify(v)).join(', ')
    }
    // Para objetos com as keys do erro, extrair conteúdo significativo
    if (value.next_steps || value.areas_for_improvement) {
      const parts = []
      if (value.next_steps) parts.push(`Next: ${Array.isArray(value.next_steps) ? value.next_steps.join(', ') : value.next_steps}`)
      if (value.areas_for_improvement) parts.push(`Improve: ${Array.isArray(value.areas_for_improvement) ? value.areas_for_improvement.join(', ') : value.areas_for_improvement}`)
      if (value.strengths_demonstrated) parts.push(`Strengths: ${Array.isArray(value.strengths_demonstrated) ? value.strengths_demonstrated.join(', ') : value.strengths_demonstrated}`)
      return parts.join(' | ')
    }
    return JSON.stringify(value)
  }
  return String(value)
}

// Usar fontes system que funcionam bem com React-PDF
// Não precisamos registrar fontes externas - usar fontes padrão do sistema
// Font.register é opcional para fontes básicas

// Cambridge Style Colors & Layout
const cambridgeStyles = StyleSheet.create({
  // === LAYOUT BASE ===
  page: {
    fontFamily: 'Helvetica', // Fonte nativa do React-PDF
    fontSize: 10,
    lineHeight: 1.4,
    padding: 30,
    backgroundColor: '#ffffff',
  },
  
  // === HEADERS & TITLES ===
  mainTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: '#003f7f', // Cambridge Blue
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  
  courseInfo: {
    fontSize: 14,
    color: '#0066cc', // Cambridge Light Blue
    textAlign: 'center',
    marginBottom: 20,
  },
  
  sectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#003f7f',
    padding: 12,
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'left',
  },
  
  subsectionHeader: {
    fontSize: 12,
    fontWeight: 600,
    color: '#003f7f',
    marginTop: 10,
    marginBottom: 6,
    borderBottom: '1px solid #0066cc',
    paddingBottom: 2,
  },
  
  // === CONTENT CONTAINERS ===
  contentSection: {
    marginBottom: 25,
  },
  
  infoBox: {
    backgroundColor: '#f8f9fa',
    border: '1px solid #0066cc',
    borderRadius: 4,
    padding: 10,
    marginBottom: 10,
  },
  
  highlightBox: {
    backgroundColor: '#fff3cd',
    border: '1px solid #ffc107',
    borderLeft: '4px solid #cc0000', // Cambridge Red
    padding: 10,
    marginBottom: 8,
  },
  
  // === VOCABULARY STYLES ===
  vocabularyTable: {
    border: '2px solid #003f7f',
    marginBottom: 10,
  },
  
  vocabularyHeader: {
    flexDirection: 'row',
    backgroundColor: '#003f7f',
    color: '#ffffff',
    padding: 6,
    fontWeight: 600,
  },
  
  vocabularyRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #dee2e6',
    padding: 8,
    fontSize: 9,
    minHeight: 35, // Altura mínima para evitar sobreposição
    alignItems: 'flex-start',
  },
  
  vocabularyCell: {
    padding: 6,
    fontSize: 9,
    lineHeight: 1.3,
    flexShrink: 1,
  },
  
  // === PHONETICS ===
  phoneticText: {
    fontFamily: 'Times-Roman', // Fonte nativa do React-PDF
    fontSize: 11,
    color: '#cc0000', // Cambridge Red for phonetics
    letterSpacing: 0.3,
    backgroundColor: '#fff5f5',
    padding: 2,
    borderRadius: 2,
  },
  
  // === ASSESSMENT STYLES ===
  assessmentContainer: {
    border: '2px solid #003f7f',
    marginBottom: 15,
    borderRadius: 6,
    backgroundColor: '#ffffff',
  },
  
  assessmentHeader: {
    backgroundColor: '#003f7f',
    color: '#ffffff',
    padding: 10,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    fontWeight: 700,
  },
  
  assessmentContent: {
    padding: 12,
    backgroundColor: '#fafbfc',
  },
  
  exerciseItem: {
    marginBottom: 8,
    paddingLeft: 15,
  },
  
  // === GABARITO STYLES ===
  gabaritoSection: {
    backgroundColor: '#f8fafc',
    border: '2px solid #003f7f',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    boxShadow: '0 2px 4px rgba(0,63,127,0.1)',
  },
  
  gabaritoHeader: {
    fontSize: 16,
    fontWeight: 700,
    color: '#003f7f',
    textAlign: 'center',
    marginBottom: 10,
  },
  
  gabaritoItem: {
    marginBottom: 6,
    paddingLeft: 10,
  },
  
  correctAnswer: {
    color: '#28a745',
    fontWeight: 600,
  },
  
  explanation: {
    fontSize: 9,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 2,
  },
  
  // === UTILITY CLASSES ===
  flexRow: {
    flexDirection: 'row',
  },
  
  flex1: {
    flex: 1,
  },
  
  flex2: {
    flex: 2,
  },
  
  flex3: {
    flex: 3,
  },
  
  textCenter: {
    textAlign: 'center',
  },
  
  textBold: {
    fontWeight: 600,
  },
  
  textSmall: {
    fontSize: 8,
  },
  
  marginBottom: {
    marginBottom: 10,
  },
  
  // === BLOOM TAXONOMY COLORS ===
  bloomRemember: {
    backgroundColor: '#d4edda',
    borderLeft: '4px solid #28a745',
    padding: 6,
    marginBottom: 4,
  },
  
  bloomUnderstand: {
    backgroundColor: '#fff3cd',
    borderLeft: '4px solid #ffc107',
    padding: 6,
    marginBottom: 4,
  },
  
  bloomApply: {
    backgroundColor: '#f8d7da',
    borderLeft: '4px solid #dc3545',
    padding: 6,
    marginBottom: 4,
  },
})

// Interfaces para props dos componentes
interface PDFDocumentProps {
  unitData: any
  version: 'student' | 'professor'
  theme: 'classico' | 'moderno'
}

interface VocabularyTableProps {
  vocabulary: any
  version: 'student' | 'professor'
}

interface AssessmentSectionProps {
  assessments: any
  version: 'student' | 'professor'
}

interface GabaritoSectionProps {
  solveAssessments: any
  version: 'student' | 'professor'
}

// === COMPONENTE PRINCIPAL DO DOCUMENTO ===
const PDFDocument: React.FC<PDFDocumentProps> = ({ unitData, version, theme }) => {
  const unit = unitData.pdf_data

  return (
    <Document>
      <Page size="A4" style={cambridgeStyles.page}>
        
        {/* HEADER */}
        <CambridgeCover unit={unit} version={version} />
        
        {/* OBJECTIVES */}
        <LearningObjectives unit={unit} />
        
        {/* VOCABULARY */}
        {unit.vocabulary && (
          <VocabularySection vocabulary={unit.vocabulary} version={version} />
        )}
        
        {/* SENTENCES */}
        {unit.sentences && (
          <SentencesSection sentences={unit.sentences} />
        )}
        
        {/* TIPS OU GRAMMAR (conditional) */}
        {unit.tips && <TipsSection tips={unit.tips} />}
        {unit.grammar && <GrammarSection grammar={unit.grammar} />}
        
        {/* Q&A */}
        {unit.qa && (
          <QASection qa={unit.qa} version={version} />
        )}
        
        {/* ASSESSMENTS */}
        {unit.assessments && (
          <AssessmentsSection assessments={unit.assessments} version={version} />
        )}
        
      </Page>
      
      {/* SEGUNDA PÁGINA - GABARITO */}
      {unit.solve_assessments && (
        <Page size="A4" style={cambridgeStyles.page}>
          <GabaritoSection solveAssessments={unit.solve_assessments} version={version} />
        </Page>
      )}
      
    </Document>
  )
}

// === COMPONENTES DE SEÇÃO ===

const CambridgeCover: React.FC<{ unit: any; version: string }> = ({ unit, version }) => (
  <View style={{ marginBottom: 25 }}>
    {/* Header com logo Naway */}
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, paddingBottom: 15, borderBottom: '2px solid #003f7f' }}>
      <Image 
        src="/assets/logos/way_full_logo_transparent.png" 
        style={{ width: 100, height: 35 }}
      />
      <Text style={[cambridgeStyles.mainTitle, { fontSize: 20, flex: 1, textAlign: 'center', margin: 0 }]}>
        {unit.unit_info?.title || 'English Learning Unit'}
      </Text>
      <View style={{ width: 100 }} />
    </View>
    
    {/* Course Info */}
    <View style={{ textAlign: 'center', marginBottom: 15 }}>
      <Text style={[cambridgeStyles.courseInfo, { fontSize: 16, fontWeight: 600 }]}>
        {unit.hierarchy_info?.course_name || 'English Course'}
      </Text>
      <Text style={[cambridgeStyles.courseInfo, { fontSize: 14 }]}>
        {unit.hierarchy_info?.book_name} • {unit.unit_info?.cefr_level} Level
      </Text>
    </View>
    
    {/* Context */}
    {unit.unit_info?.context && (
      <View style={[cambridgeStyles.highlightBox, { textAlign: 'center', marginBottom: 15 }]}>
        <Text style={[cambridgeStyles.textSmall, { color: '#4a5568', fontStyle: 'italic' }]}>
          {unit.unit_info?.context}
        </Text>
      </View>
    )}
    
    {/* Edition Badge */}
    <View style={{
      backgroundColor: version === 'student' ? '#e3f2fd' : '#fff3e0',
      border: `2px solid ${version === 'student' ? '#1976d2' : '#f57c00'}`,
      borderRadius: 8,
      padding: 12,
      textAlign: 'center'
    }}>
      <Text style={[cambridgeStyles.textBold, { 
        fontSize: 14, 
        color: version === 'student' ? '#1976d2' : '#f57c00',
        marginBottom: 4 
      }]}>
        {version === 'student' ? '📚 STUDENT EDITION' : '👩‍🏫 TEACHER\'S GUIDE'}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
        <Text style={cambridgeStyles.textSmall}>
          📝 Type: {unit.unit_info?.unit_type?.replace('_', ' ')}
        </Text>
        <Text style={cambridgeStyles.textSmall}>
          🌍 Variant: {unit.unit_info?.language_variant}
        </Text>
        <Text style={cambridgeStyles.textSmall}>
          📅 Generated: {new Date().toLocaleDateString('en-GB')}
        </Text>
      </View>
    </View>
  </View>
)

const LearningObjectives: React.FC<{ unit: any }> = ({ unit }) => (
  <View style={cambridgeStyles.contentSection}>
    <Text style={cambridgeStyles.sectionHeader}>🎯 LEARNING OBJECTIVES</Text>
    
    <View style={cambridgeStyles.highlightBox}>
      <Text style={cambridgeStyles.textBold}>Main Learning Objective:</Text>
      <Text style={{ marginTop: 4 }}>{unit.unit_info?.main_aim || 'No main aim defined'}</Text>
    </View>
    
    {unit.unit_info?.subsidiary_aims && unit.unit_info.subsidiary_aims.length > 0 && (
      <View>
        <Text style={cambridgeStyles.subsectionHeader}>Subsidiary Objectives:</Text>
        {unit.unit_info.subsidiary_aims.map((aim: string, index: number) => (
          <Text key={index} style={{ marginBottom: 2, paddingLeft: 10 }}>
            • {aim}
          </Text>
        ))}
      </View>
    )}
  </View>
)

const VocabularySection: React.FC<VocabularyTableProps> = ({ vocabulary, version }) => {
  const words = vocabulary.items || vocabulary.words || []
  
  return (
    <View style={cambridgeStyles.contentSection}>
      <Text style={cambridgeStyles.sectionHeader}>📚 KEY VOCABULARY</Text>
      
      <Text style={[cambridgeStyles.textSmall, { marginBottom: 10, fontStyle: 'italic', color: '#4a5568' }]}>
        Essential words and expressions for effective communication in this unit.
      </Text>
      
      <View style={[cambridgeStyles.vocabularyTable, { marginBottom: 15 }]}>
        {/* Header */}
        <View style={[cambridgeStyles.vocabularyHeader, { fontSize: 11 }]}>
          <Text style={[cambridgeStyles.vocabularyCell, cambridgeStyles.flex2, { fontWeight: 700 }]}>Word</Text>
          <Text style={[cambridgeStyles.vocabularyCell, cambridgeStyles.flex2, { fontWeight: 700 }]}>Pronunciation</Text>
          <Text style={[cambridgeStyles.vocabularyCell, cambridgeStyles.flex1, { fontWeight: 700 }]}>Part of Speech</Text>
          <Text style={[cambridgeStyles.vocabularyCell, cambridgeStyles.flex3, { fontWeight: 700 }]}>Meaning</Text>
        </View>
        
        {/* Rows */}
        {words.slice(0, 12).map((word: any, index: number) => (
          <View key={index} style={[
            cambridgeStyles.vocabularyRow, 
            { backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8f9fa' }
          ]}>
            <Text style={[cambridgeStyles.vocabularyCell, cambridgeStyles.flex2, { fontWeight: 600, color: '#1a202c' }]}>
              {word.word}
            </Text>
            <Text style={[cambridgeStyles.vocabularyCell, cambridgeStyles.flex2]}>
              {word.phoneme && word.phoneme.trim() ? (
                <Text style={cambridgeStyles.phoneticText}>
                  /{word.phoneme.trim()}/
                </Text>
              ) : (
                <Text>-</Text>
              )}
            </Text>
            <Text style={[cambridgeStyles.vocabularyCell, cambridgeStyles.flex1, { fontSize: 9, color: '#4a5568' }]}>
              {word.word_class || word.part_of_speech || 'n/a'}
            </Text>
            <Text style={[cambridgeStyles.vocabularyCell, cambridgeStyles.flex3, { fontSize: 10, lineHeight: 1.3 }]}>
              {word.definition}
            </Text>
          </View>
        ))}
      </View>
      
      {/* Example Usage Section */}
      {words.filter((w: any) => w.example).length > 0 && (
        <View style={{ marginTop: 10 }}>
          <Text style={[cambridgeStyles.subsectionHeader, { fontSize: 11, marginBottom: 6 }]}>
            💬 Example Usage
          </Text>
          <View style={{ padding: 10, backgroundColor: '#f0f8ff', borderRadius: 6, border: '1px solid #0066cc' }}>
            {words.filter((w: any) => w.example).slice(0, 4).map((word: any, index: number) => (
              <Text key={index} style={{ fontSize: 10, marginBottom: 4, lineHeight: 1.4 }}>
                <Text style={{ fontWeight: 600, color: '#003f7f' }}>{word.word}:</Text>
                <Text style={{ fontStyle: 'italic' }}> "{word.example}"</Text>
              </Text>
            ))}
          </View>
        </View>
      )}
      
      {/* Professor Notes */}
      {version === 'professor' && words.some((w: any) => w.context_relevance || w.frequency_level) && (
        <View style={{ marginTop: 10 }}>
          <Text style={[cambridgeStyles.subsectionHeader, { fontSize: 11, marginBottom: 6 }]}>
            👩‍🏫 Teaching Notes
          </Text>
          <View style={{ padding: 8, backgroundColor: '#fff3e0', borderRadius: 4 }}>
            {words.filter((w: any) => w.frequency_level).slice(0, 3).map((word: any, index: number) => (
              <Text key={index} style={{ fontSize: 9, marginBottom: 2, color: '#4a5568' }}>
                • <Text style={{ fontWeight: 600 }}>{word.word}</Text>: {word.frequency_level} frequency
                {word.context_relevance && ` • Relevance: ${word.context_relevance}`}
              </Text>
            ))}
          </View>
        </View>
      )}
    </View>
  )
}

const SentencesSection: React.FC<{ sentences: any }> = ({ sentences }) => {
  const sentenceList = sentences.sentences || []
  
  return (
    <View style={cambridgeStyles.contentSection}>
      <Text style={cambridgeStyles.sectionHeader}>💬 SENTENCES IN CONTEXT</Text>
      
      {sentenceList.slice(0, 8).map((sentence: any, index: number) => (
        <View key={index} style={{ marginBottom: 6 }}>
          <Text style={{ marginBottom: 2 }}>
            {index + 1}. {sentence.text}
          </Text>
          <Text style={cambridgeStyles.textSmall}>
            💡 Context: {sentence.context_situation} • Level: {sentence.complexity_level}
          </Text>
          {sentence.vocabulary_used && sentence.vocabulary_used.length > 0 && (
            <Text style={[cambridgeStyles.textSmall, { color: '#0066cc' }]}>
              📝 Vocabulary: {sentence.vocabulary_used.slice(0, 3).join(', ')}
            </Text>
          )}
        </View>
      ))}
    </View>
  )
}

const TipsSection: React.FC<{ tips: any }> = ({ tips }) => (
  <View style={cambridgeStyles.contentSection}>
    <Text style={cambridgeStyles.sectionHeader}>💡 LEARNING STRATEGIES</Text>
    
    <View style={cambridgeStyles.highlightBox}>
      <Text style={cambridgeStyles.textBold}>Strategy: {tips.strategy}</Text>
      <Text style={{ marginTop: 4 }}>{safeRender(tips.explanation)}</Text>
    </View>
    
    {tips.examples && tips.examples.length > 0 && (
      <View>
        <Text style={cambridgeStyles.subsectionHeader}>Examples:</Text>
        {tips.examples.map((example: string, index: number) => (
          <Text key={index} style={{ marginBottom: 2, paddingLeft: 10 }}>
            • {example}
          </Text>
        ))}
      </View>
    )}
    
    {tips.memory_techniques && tips.memory_techniques.length > 0 && (
      <View>
        <Text style={cambridgeStyles.subsectionHeader}>Memory Techniques:</Text>
        {tips.memory_techniques.map((technique: string, index: number) => (
          <Text key={index} style={{ marginBottom: 2, paddingLeft: 10 }}>
            🧠 {technique}
          </Text>
        ))}
      </View>
    )}
  </View>
)

const GrammarSection: React.FC<{ grammar: any }> = ({ grammar }) => (
  <View style={cambridgeStyles.contentSection}>
    <Text style={cambridgeStyles.sectionHeader}>🔧 GRAMMAR FOCUS</Text>
    
    <View style={cambridgeStyles.highlightBox}>
      <Text style={cambridgeStyles.textBold}>Grammar Point: {grammar.grammar_point}</Text>
      <Text style={{ marginTop: 4 }}>{safeRender(grammar.systematic_explanation)}</Text>
    </View>
    
    {grammar.usage_rules && grammar.usage_rules.length > 0 && (
      <View>
        <Text style={cambridgeStyles.subsectionHeader}>Usage Rules:</Text>
        {grammar.usage_rules.map((rule: string, index: number) => (
          <Text key={index} style={{ marginBottom: 2, paddingLeft: 10 }}>
            {index + 1}. {rule}
          </Text>
        ))}
      </View>
    )}
    
    {grammar.l1_interference_notes && grammar.l1_interference_notes.length > 0 && (
      <View>
        <Text style={cambridgeStyles.subsectionHeader}>🇧🇷 L1 Interference Notes:</Text>
        {grammar.l1_interference_notes.map((note: string, index: number) => (
          <Text key={index} style={{ marginBottom: 2, paddingLeft: 10, color: '#cc0000' }}>
            ⚠️ {note}
          </Text>
        ))}
      </View>
    )}
  </View>
)

const QASection: React.FC<{ qa: any; version: string }> = ({ qa, version }) => {
  const questions = qa.questions || []
  
  return (
    <View style={cambridgeStyles.contentSection}>
      <Text style={cambridgeStyles.sectionHeader}>❓ DISCUSSION QUESTIONS</Text>
      
      {questions.slice(0, 6).map((item: any, index: number) => {
        const bloomStyle = 
          item.bloom_level === 'remember' ? cambridgeStyles.bloomRemember :
          item.bloom_level === 'understand' ? cambridgeStyles.bloomUnderstand :
          cambridgeStyles.bloomApply
          
        return (
          <View key={index} style={[bloomStyle, { marginBottom: 6 }]}>
            <Text style={cambridgeStyles.textBold}>
              Q{index + 1}: {item.question}
            </Text>
            <Text style={{ marginTop: 2 }}>
              A: {item.answer}
            </Text>
            <Text style={[cambridgeStyles.textSmall, { marginTop: 2 }]}>
              📊 Level: {item.bloom_level} • Difficulty: {item.difficulty}
            </Text>
          </View>
        )
      })}
    </View>
  )
}

const AssessmentsSection: React.FC<AssessmentSectionProps> = ({ assessments, version }) => {
  const activities = assessments.activities || []
  
  return (
    <View style={cambridgeStyles.contentSection}>
      <Text style={cambridgeStyles.sectionHeader}>📝 ASSESSMENTS</Text>
      
      {activities.slice(0, 3).map((assessment: any, index: number) => (
        <View key={index} style={cambridgeStyles.assessmentContainer}>
          <View style={cambridgeStyles.assessmentHeader}>
            <Text style={cambridgeStyles.textBold}>
              Exercise {index + 1}: {assessment.title}
            </Text>
            <Text style={cambridgeStyles.textSmall}>
              Type: {assessment.type} • Difficulty: {assessment.difficulty_level}
            </Text>
          </View>
          
          <View style={cambridgeStyles.assessmentContent}>
            <Text style={{ marginBottom: 6 }}>
              {assessment.instructions}
            </Text>
            
            {/* Renderizar baseado no tipo */}
            <AssessmentContent assessment={assessment} version={version} />
          </View>
        </View>
      ))}
    </View>
  )
}

const AssessmentContent: React.FC<{ assessment: any; version: string }> = ({ assessment, version }) => {
  const content = assessment.content
  const maxItems = 5 // Máximo de itens por exercício para não sobrecarregar o PDF

  switch (assessment.type) {
    case 'multiple_choice':
      return (
        <View>
          {content.items?.slice(0, maxItems).map((item: any, index: number) => (
            <View key={index} style={cambridgeStyles.exerciseItem}>
              <Text style={{ marginBottom: 4, fontWeight: 600 }}>{index + 1}. {item.question}</Text>
              {item.options?.map((option: string, optIndex: number) => (
                <Text key={optIndex} style={{ paddingLeft: 20, fontSize: 9, marginBottom: 1 }}>
                  {String.fromCharCode(97 + optIndex)}) {option}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )
      
    case 'gap_fill':
      return (
        <View>
          <Text style={[cambridgeStyles.textSmall, { marginBottom: 6, fontStyle: 'italic' }]}>Complete the sentences with the appropriate words.</Text>
          {content.items?.slice(0, maxItems).map((item: any, index: number) => (
            <Text key={index} style={[cambridgeStyles.exerciseItem, { marginBottom: 6 }]}>
              {index + 1}. {item.sentence_with_gap}
            </Text>
          ))}
          {content.word_bank && (
            <View style={{ marginTop: 8, padding: 8, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
              <Text style={[cambridgeStyles.textSmall, { fontWeight: 600, marginBottom: 4 }]}>Word Bank:</Text>
              <Text style={cambridgeStyles.textSmall}>{content.word_bank.join(' • ')}</Text>
            </View>
          )}
        </View>
      )
      
    case 'true_false':
      return (
        <View>
          <Text style={[cambridgeStyles.textSmall, { marginBottom: 6, fontStyle: 'italic' }]}>Mark each statement as True (T) or False (F).</Text>
          {content.items?.slice(0, maxItems).map((item: any, index: number) => (
            <View key={index} style={[cambridgeStyles.exerciseItem, { flexDirection: 'row', alignItems: 'center' }]}>
              <Text style={{ flex: 1 }}>{index + 1}. {item.statement}</Text>
              <Text style={[cambridgeStyles.textSmall, { width: 80, textAlign: 'right' }]}>( T ) ( F )</Text>
            </View>
          ))}
        </View>
      )
      
    case 'cloze_test':
      return (
        <View>
          <Text style={[cambridgeStyles.textSmall, { marginBottom: 6, fontStyle: 'italic' }]}>Fill in the blanks with the most appropriate words.</Text>
          {content.items?.slice(0, 3).map((item: any, index: number) => (
            <View key={index} style={[cambridgeStyles.exerciseItem, { marginBottom: 8 }]}>
              <Text style={{ marginBottom: 2, fontWeight: 600 }}>Text {index + 1}:</Text>
              <Text style={{ fontSize: 10, lineHeight: 1.4 }}>{item.text_with_gaps}</Text>
            </View>
          ))}
        </View>
      )
      
    case 'reordering':
      return (
        <View>
          <Text style={[cambridgeStyles.textSmall, { marginBottom: 6, fontStyle: 'italic' }]}>Put the words/sentences in the correct order.</Text>
          {content.items?.slice(0, maxItems).map((item: any, index: number) => (
            <View key={index} style={cambridgeStyles.exerciseItem}>
              <Text style={{ marginBottom: 2, fontWeight: 600 }}>{index + 1}. Task:</Text>
              <View style={{ padding: 6, backgroundColor: '#f8f9fa', borderRadius: 4 }}>
                <Text style={cambridgeStyles.textSmall}>{item.scrambled_elements?.join(' | ') || item.elements?.join(' | ')}</Text>
              </View>
              {item.instruction && (
                <Text style={[cambridgeStyles.textSmall, { marginTop: 2, fontStyle: 'italic' }]}>({item.instruction})</Text>
              )}
            </View>
          ))}
        </View>
      )
      
    case 'transformation':
      return (
        <View>
          <Text style={[cambridgeStyles.textSmall, { marginBottom: 6, fontStyle: 'italic' }]}>Transform the sentences as instructed.</Text>
          {content.items?.slice(0, maxItems).map((item: any, index: number) => (
            <View key={index} style={cambridgeStyles.exerciseItem}>
              <Text style={{ marginBottom: 2, fontWeight: 600 }}>{index + 1}. {item.instruction || 'Transform:'}</Text>
              <Text style={[cambridgeStyles.textSmall, { marginBottom: 2, paddingLeft: 10 }]}>Original: {item.original_sentence}</Text>
              {item.prompt && (
                <Text style={[cambridgeStyles.textSmall, { paddingLeft: 10 }]}>Begin with: "{item.prompt}"</Text>
              )}
              <Text style={[cambridgeStyles.textSmall, { paddingLeft: 10, marginTop: 2 }]}>Your answer: ________________________</Text>
            </View>
          ))}
        </View>
      )
      
    case 'matching':
      return (
        <View>
          <Text style={[cambridgeStyles.textSmall, { marginBottom: 6, fontStyle: 'italic' }]}>Match the items from Column A with Column B.</Text>
          <View style={{ flexDirection: 'row', marginBottom: 6 }}>
            <View style={{ flex: 1 }}>
              <Text style={[cambridgeStyles.textSmall, { fontWeight: 600, marginBottom: 4 }]}>Column A:</Text>
              {content.items?.slice(0, Math.min(maxItems, 6)).map((item: any, index: number) => (
                <Text key={index} style={[cambridgeStyles.textSmall, { marginBottom: 2 }]}>
                  {index + 1}. {item.left_item || item.term}
                </Text>
              ))}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[cambridgeStyles.textSmall, { fontWeight: 600, marginBottom: 4 }]}>Column B:</Text>
              {content.items?.slice(0, Math.min(maxItems, 6)).map((item: any, index: number) => (
                <Text key={index} style={[cambridgeStyles.textSmall, { marginBottom: 2 }]}>
                  {String.fromCharCode(97 + index)}) {item.right_item || item.definition}
                </Text>
              ))}
            </View>
          </View>
          <Text style={[cambridgeStyles.textSmall, { marginTop: 4, fontStyle: 'italic' }]}>Write your answers: 1-___ 2-___ 3-___ 4-___ 5-___</Text>
        </View>
      )
      
    default:
      return (
        <View>
          <Text style={[cambridgeStyles.textSmall, { fontStyle: 'italic', color: '#6c757d' }]}>
            Assessment type: {assessment.type} ({content.items?.length || 0} items)
          </Text>
          {content.items && content.items.length > 0 && (
            <Text style={[cambridgeStyles.textSmall, { marginTop: 4 }]}>
              Items available for this exercise type.
            </Text>
          )}
        </View>
      )
  }
}

const GabaritoSection: React.FC<GabaritoSectionProps> = ({ solveAssessments, version }) => {
  const assessmentTypes = Object.keys(solveAssessments)
  
  return (
    <View>
      <Text style={cambridgeStyles.gabaritoHeader}>
        🧠 GABARITO IVO • Answer Key & Feedback
      </Text>
      
      <View style={[cambridgeStyles.highlightBox, { marginBottom: 15 }]}>
        <Text style={[cambridgeStyles.textBold, { color: '#003f7f', marginBottom: 4 }]}>
          🎯 Teaching Approach
        </Text>
        <Text style={cambridgeStyles.textSmall}>
          This answer key provides {version === 'professor' ? 'comprehensive guidance for instruction, including pedagogical notes and error analysis to enhance your teaching effectiveness' : 'clear explanations to support your learning journey and help you understand the reasoning behind each answer'}.
        </Text>
      </View>
      
      {assessmentTypes.map((type, index) => {
        const result = solveAssessments[type]
        
        // Detectar se é GabaritoResult ou SolveAssessmentResult
        const isGabarito = result.items && Array.isArray(result.items)
        
        return (
          <View key={index} style={cambridgeStyles.gabaritoSection}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[cambridgeStyles.textBold, { fontSize: 13, color: '#003f7f', flex: 1 }]}>
                📊 {result.assessment_title || type.replace('_', ' ').toUpperCase()}
              </Text>
              {result.total_items && (
                <Text style={[cambridgeStyles.textSmall, { color: '#6c757d' }]}>
                  {result.total_items} items
                </Text>
              )}
            </View>
            
            {result.instructions && (
              <Text style={[cambridgeStyles.textSmall, { fontStyle: 'italic', marginBottom: 8, color: '#4a5568' }]}>
                📝 Instructions: {result.instructions}
              </Text>
            )}
            
            {isGabarito ? (
              // Formato GabaritoResult
              <View>
                {result.items?.map((item: any, itemIndex: number) => (
                  <View key={itemIndex} style={[cambridgeStyles.gabaritoItem, { 
                    borderLeft: '3px solid #28a745', 
                    backgroundColor: '#f8f9fa', 
                    padding: 8,
                    marginBottom: 6,
                    borderRadius: 4 
                  }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 3 }}>
                      <Text style={[cambridgeStyles.textBold, { minWidth: 25 }]}>
                        {itemIndex + 1}.
                      </Text>
                      <Text style={{ flex: 1, fontSize: 10 }}>
                        {item.question_text}
                      </Text>
                    </View>
                    
                    <View style={{ paddingLeft: 25 }}>
                      <Text style={[cambridgeStyles.correctAnswer, { marginBottom: 3 }]}>
                        ✓ Answer: {item.correct_answer}
                      </Text>
                      
                      <Text style={[cambridgeStyles.explanation, { marginBottom: 4, lineHeight: 1.3 }]}>
                        💡 {safeRender(item.explanation)}
                      </Text>
                      
                      {item.difficulty_level && (
                        <Text style={[cambridgeStyles.textSmall, { color: '#6c757d', marginBottom: 2 }]}>
                          🔹 Difficulty: {item.difficulty_level}
                        </Text>
                      )}
                      
                      {version === 'professor' && item.skills_tested && (
                        <Text style={[cambridgeStyles.textSmall, { color: '#0066cc', marginBottom: 2 }]}>
                          🎯 Skills: {item.skills_tested.join(', ')}
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
                
                {/* Skills Overview */}
                {result.skills_overview && (
                  <View style={{ marginTop: 12, padding: 8, backgroundColor: '#e3f2fd', borderRadius: 4 }}>
                    <Text style={[cambridgeStyles.textBold, { color: '#1976d2', marginBottom: 4 }]}>
                      📋 Skills Overview
                    </Text>
                    {Object.entries(result.skills_overview).map(([skill, count]: [string, any], skillIndex: number) => (
                      <Text key={skillIndex} style={[cambridgeStyles.textSmall, { marginBottom: 1 }]}>
                        • {skill}: {safeRender(count)} {count === 1 ? 'item' : 'items'}
                      </Text>
                    ))}
                  </View>
                )}
                
                {version === 'professor' && result.teaching_notes && (
                  <View style={{ marginTop: 12, padding: 8, backgroundColor: '#fff3e0', borderRadius: 4 }}>
                    <Text style={[cambridgeStyles.textBold, { color: '#f57c00', marginBottom: 4 }]}>
                      📚 Teaching Notes
                    </Text>
                    {result.teaching_notes.map((note: string, noteIndex: number) => (
                      <Text key={noteIndex} style={[cambridgeStyles.textSmall, { marginBottom: 3, paddingLeft: 5 }]}>
                        • {safeRender(note)}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              // Formato SolveAssessmentResult (legacy ou correction data)
              <View>
                {result.total_score !== undefined && (
                  <View style={{ marginBottom: 8, padding: 8, backgroundColor: '#f0f8ff', borderRadius: 4 }}>
                    <Text style={[cambridgeStyles.textBold, { color: '#003f7f', marginBottom: 2 }]}>
                      📋 Performance Summary
                    </Text>
                    <Text style={{ fontSize: 11, marginBottom: 2 }}>
                      Score: {result.total_score}/{result.total_possible} ({result.accuracy_percentage?.toFixed(1)}%)
                    </Text>
                    <Text style={[cambridgeStyles.textSmall, { color: '#4a5568' }]}>
                      Performance Level: {safeRender(result.performance_level)}
                    </Text>
                  </View>
                )}
                
                {result.item_corrections && (
                  <View>
                    {result.item_corrections.slice(0, 8).map((correction: any, corrIndex: number) => (
                      <View key={corrIndex} style={[cambridgeStyles.gabaritoItem, { marginBottom: 6 }]}>
                        <Text style={{ fontWeight: 600, marginBottom: 2 }}>Item {corrIndex + 1}:</Text>
                        <Text style={cambridgeStyles.correctAnswer}>
                          ✓ Correct Answer: {correction.correct_answer}
                        </Text>
                        {correction.feedback && (
                          <Text style={cambridgeStyles.explanation}>
                            💬 {safeRender(correction.feedback)}
                          </Text>
                        )}
                      </View>
                    ))}
                  </View>
                )}
                
                {result.constructive_feedback && (
                  <View style={{ marginTop: 10, padding: 8, backgroundColor: '#e8f5e8', borderRadius: 4 }}>
                    <Text style={[cambridgeStyles.textBold, { color: '#2e7d32', marginBottom: 4 }]}>
                      👍 Constructive Feedback
                    </Text>
                    <Text style={[cambridgeStyles.textSmall, { lineHeight: 1.3 }]}>
                      {safeRender(result.constructive_feedback)}
                    </Text>
                  </View>
                )}
              </View>
            )}
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, paddingTop: 8, borderTop: '1px solid #e0e0e0' }}>
              <Text style={[cambridgeStyles.textSmall, { color: '#6c757d' }]}>
                🤖 AI Model: {result.ai_model_used || 'IVO Assistant'}
              </Text>
              <Text style={[cambridgeStyles.textSmall, { color: '#6c757d' }]}>
                🗺 Generated: {new Date(result.solution_timestamp || result.correction_timestamp).toLocaleDateString('pt-BR')}
              </Text>
            </View>
          </View>
        )
      })}
      
      {/* Footer com informações adicionais */}
      <View style={{ marginTop: 20, padding: 10, backgroundColor: '#f8f9fa', borderRadius: 6, textAlign: 'center' }}>
        <Text style={[cambridgeStyles.textSmall, { textAlign: 'center', color: '#6c757d' }]}>
          🎆 This gabarito was generated by IVO (Intelligent Vocabulary Organizer)
        </Text>
        <Text style={[cambridgeStyles.textSmall, { textAlign: 'center', color: '#6c757d', marginTop: 2 }]}>
          Designed to enhance {version === 'professor' ? 'teaching effectiveness' : 'learning outcomes'} through AI-powered educational insights
        </Text>
      </View>
    </View>
  )
}

// === FUNÇÃO PRINCIPAL DE GERAÇÃO ===
export const generatePDF = async (unitData: any, version: 'student' | 'professor' = 'student', theme: 'classico' | 'moderno' = 'classico'): Promise<Blob> => {
  const doc = <PDFDocument unitData={unitData} version={version} theme={theme} />
  const pdfBlob = await pdf(doc).toBlob()
  return pdfBlob
}

// === FUNÇÃO DE DOWNLOAD ===
export const downloadPDF = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

export default PDFDocument