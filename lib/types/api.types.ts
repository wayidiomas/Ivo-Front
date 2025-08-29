// ============= BASE TYPES =============

export interface APIResponse<T = any> {
  success: boolean
  data: T
  message?: string
  metadata?: {
    total?: number
    page?: number
    limit?: number
    has_next?: boolean
    has_previous?: boolean
  }
}

export interface PaginationParams {
  skip?: number
  limit?: number
  search?: string
}

// ============= AUTH TYPES =============

export interface LoginRequest {
  api_key_ivo: string
}

export interface LoginResponse {
  access_token: string
  refresh_token?: string
  token_type: string
  expires_at: number
  user: {
    id: string
    email: string
    name?: string
  }
}

export interface CreateUserRequest {
  email: string
  phone?: string
  metadata?: Record<string, any>
}

export interface CreateUserResponse {
  success: boolean
  data: {
    user: {
      id: string
      email: string
      phone?: string
      created_at: string
    }
    token_info: {
      access_token: string
      refresh_token?: string
      expires_at: number
    }
  }
}

// ============= COURSE TYPES =============

export interface Course {
  id: string
  name: string
  description: string
  target_levels: string[]
  language_variant: string
  methodology?: string
  created_at: string
  updated_at: string
  total_books?: number
  total_units?: number
  completion_rate?: number
}

export interface CourseCreateRequest {
  name: string
  description: string
  target_levels: string[]
  language_variant: string
  methodology?: string
}

export interface CourseResponse {
  success: boolean
  data: {
    course: Course
  }
}

export interface CoursesResponse {
  success: boolean
  data: {
    courses: Course[]
    total: number
  }
  metadata: {
    total: number
    page: number
    limit: number
    has_next: boolean
    has_previous: boolean
  }
}

// ============= BOOK TYPES =============

export interface Book {
  id: string
  course_id: string
  course_name: string
  name: string
  description: string
  target_level: string
  sequence_order: number
  created_at: string
  updated_at: string
  total_units?: number
  completion_rate?: number
}

export interface BookCreateRequest {
  course_id: string
  name: string
  description: string
  target_level: string
}

export interface BookResponse {
  success: boolean
  data: {
    book: Book
  }
}

export interface BooksResponse {
  success: boolean
  data: {
    books: Book[]
    total: number
  }
}

// ============= UNIT TYPES =============

// Real API enums
export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type LanguageVariant = 'american_english' | 'british_english' | 'australian_english'
export type UnitType = 'lexical_unit' | 'grammar_unit'
export type UnitStatus = 'creating' | 'vocab_pending' | 'sentences_pending' | 'content_pending' | 'assessments_pending' | 'completed' | 'error'

export interface ImageInfo {
  filename: string
  size: number
  content_type: string
  base64: string
  description: string
  is_primary: boolean
}

export interface Unit {
  // Core identification
  id: string
  course_id: string
  book_id: string
  sequence_order: number
  
  // Basic data
  title?: string
  main_aim?: string
  subsidiary_aims: string[]
  context?: string
  cefr_level: CEFRLevel
  language_variant: LanguageVariant
  unit_type: UnitType
  
  // Content (stored as JSONB)
  images: ImageInfo[]
  vocabulary?: VocabularySection
  sentences?: SentencesSection
  tips?: TipsSection
  grammar?: GrammarSection
  qa?: QASection
  assessments?: AssessmentsSection
  solve_assessments?: AssessmentsSolvingSection
  
  // RAG tracking
  strategies_used: string[]
  assessments_used: string[]
  vocabulary_taught: string[]
  pronunciation_focus: string[]
  
  // Status
  status: UnitStatus
  quality_score?: number
  checklist_completed: string[]
  
  // Timestamps
  created_at: string
  updated_at: string
  
  // For frontend display (computed)
  book_name?: string
  course_name?: string
}

// Real API unit creation request (uses hierarchical endpoint)
export interface UnitCreateRequest {
  // Basic unit data only - book_id goes in URL path
  context?: string // Required if no images, optional with images
  cefr_level: CEFRLevel
  language_variant: LanguageVariant
  unit_type: UnitType
  images?: File[] // Max 2 files, 10MB each - sent as image_1, image_2 in FormData
}

export interface HierarchicalUnitRequest {
  course_name: string
  book_name: string
  unit_data: {
    context: string
    cefr_level: string
    unit_type: 'lexical_unit' | 'grammar_unit'
    language_variant: string
  }
  images?: File[]
}

// ============= CONTENT TYPES =============

export interface VocabularyWord {
  id?: string
  word: string
  phoneme: string
  definition: string
  example: string
  word_class: string
  context_relevance: number
  is_reinforcement: boolean
  // Additional fields found in actual API responses
  ipa_variant?: string
  stress_pattern?: string | null
  syllable_count?: number
  frequency_level?: string
  first_introduced_unit?: string | null
  alternative_pronunciations?: string[]
}

export interface VocabularySection {
  id?: string
  unit_id?: string
  // Support both old and new structure
  words?: VocabularyWord[]
  items?: VocabularyWord[]  // Legacy structure
  total_count: number
  target_count?: number
  quality_metrics?: {
    relevance_score: number
    diversity_score: number
    level_appropriateness: number
  }
  // Additional fields found in actual API responses
  generated_at?: string
  new_words_count?: number
  phoneme_coverage?: {
    coverage_score: number
    total_unique_phonemes: number
  }
  rag_context_used?: {
    used_strategies: string[]
    progression_level: string
    taught_vocabulary: string[]
    vocabulary_density: number
  }
  context_relevance?: number
  progression_level?: string
  phonetic_complexity?: string
  pronunciation_variants?: string[]
  reinforcement_words_count?: number
  created_at?: string
}

export interface SentencesSection {
  id?: string
  unit_id?: string
  sentences: Array<{
    text: string
    vocabulary_used: string[]
    context_situation?: string
    complexity_level: string
    reinforces_previous?: string[]
    introduces_new?: string[]
    phonetic_features?: string[]
    pronunciation_notes?: string
  }>
  vocabulary_coverage: number
  contextual_coherence?: number
  progression_appropriateness?: number
  phonetic_progression?: string[]
  pronunciation_patterns?: string[]
  total_count: number
  target_count?: number
  created_at?: string
}

export interface AimsSection {
  id: string
  unit_id: string
  main_aim: {
    description: string
    learning_objectives: string[]
    assessment_criteria: string[]
  }
  subsidiary_aims: Array<{
    description: string
    learning_objectives: string[]
  }>
  created_at: string
}

export interface TipsSection {
  id?: string
  unit_id?: string
  strategy: string
  title: string
  explanation: string
  examples: string[]
  memory_techniques?: string[]
  practice_suggestions?: string[]
  vocabulary_coverage?: string[]
  selection_rationale?: string
  created_at?: string
}

export interface GrammarSection {
  id?: string
  unit_id?: string
  grammar_point: string
  strategy?: string
  systematic_explanation?: string
  usage_rules?: string[]
  examples?: string[]
  l1_interference_notes?: string[]
  common_mistakes?: Array<{
    mistake: string
    correction: string
    explanation: string
  }>
  created_at?: string
}

export interface Assessment {
  id: string
  title: string
  type: 'cloze_test' | 'gap_fill' | 'reordering' | 'transformation' | 'multiple_choice' | 'true_false' | 'matching'
  instructions: string
  content: any // Varies by type
  answer_key?: any
  difficulty_level: string
  time_limit?: number
}

export interface AssessmentsSection {
  id?: string
  unit_id?: string
  activities: Assessment[]
  total_count?: number
  assessment_count?: number // Target count for assessments
  created_at?: string
}

export interface QAQuestion {
  id: string
  question: string
  answer: string
  bloom_level: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create'
  difficulty: 'basic' | 'intermediate' | 'advanced'
  focus_area: string
}

export interface QASection {
  id?: string
  unit_id?: string
  questions: QAQuestion[]
  answers?: string[]
  cognitive_levels?: string[]
  pedagogical_notes?: string[]
  difficulty_progression?: string
  vocabulary_integration?: string[]
  pronunciation_questions?: string[]
  phonetic_awareness?: string[]
  total_count: number
  target_count: number // Target count for qa questions
  created_at?: string
}

// ============= GENERATION TYPES =============

export interface GenerationRequest {
  regenerate?: boolean
  instructions?: string
  keep_existing?: string[]
}

export interface GenerationResponse<T = any> {
  success: boolean
  data: T
  generation_metadata: {
    model_used: string
    tokens_used: number
    processing_time: number
    quality_score: number
  }
}

// ============= ERROR TYPES =============

export interface APIError {
  detail: string | Array<{
    loc: string[]
    msg: string
    type: string
  }>
  status_code: number
}

// ============= FILTER & SEARCH TYPES =============

export interface UnitsFilter {
  book_id?: string
  course_id?: string
  unit_type?: 'lexical_unit' | 'grammar_unit'
  cefr_level?: string
  status?: string
  search?: string
  skip?: number
  limit?: number
}

export interface CoursesFilter {
  target_level?: string
  language_variant?: string
  search?: string
  skip?: number
  limit?: number
}

export interface BooksFilter {
  course_id?: string
  target_level?: string
  search?: string
  skip?: number
  limit?: number
}

// ============= ASSESSMENTS SOLVING TYPES =============

export interface SolveAssessmentRequest {
  assessment_type: string
  include_student_answers?: boolean
  student_context?: string
}

export interface ItemCorrection {
  item_id: string
  student_answer: string
  correct_answer: string
  result: 'correct' | 'incorrect' | 'partially_correct'
  score_earned: number
  score_total: number
  feedback: string
  l1_interference?: string
}

export interface ErrorAnalysis {
  most_common_errors: string[]
  l1_interference_patterns: string[]
  recurring_mistakes: string[]
  error_frequency: Record<string, number>
}

export interface ConstructiveFeedback {
  strengths_demonstrated: string[]
  areas_for_improvement: string[]
  study_recommendations: string[]
  next_steps: string[]
}

export interface PedagogicalNotes {
  class_performance_patterns: string[]
  remedial_activities: string[]
  differentiation_needed: string[]
  followup_assessments: string[]
}

export interface SolveAssessmentResult {
  total_score: number
  total_possible: number
  performance_level: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement'
  cefr_demonstration: 'above' | 'at' | 'below'
  item_corrections: ItemCorrection[]
  error_analysis: ErrorAnalysis
  constructive_feedback: ConstructiveFeedback
  pedagogical_notes: PedagogicalNotes
  assessment_type: string
  assessment_title: string
  unit_context: Record<string, any>
  accuracy_percentage: number
  correction_timestamp: string
  completion_time?: number
  ai_model_used: string
}

export interface AssessmentsSolvingSection {
  [assessmentType: string]: SolveAssessmentResult
}

// =============================================================================
// NOVOS TIPOS PARA GABARITO GENERATION
// =============================================================================

export interface GabaritoRequest {
  assessment_type: string
  include_explanations?: boolean
  difficulty_analysis?: boolean
}

export interface GabaritoItem {
  item_id: string
  question_text: string
  correct_answer: string
  explanation: string
  difficulty_level: 'easy' | 'medium' | 'hard'
  skills_tested: string[]
}

export interface GabaritoResult {
  assessment_type: string
  assessment_title: string
  total_items: number
  instructions: string
  unit_context: string
  items: GabaritoItem[]
  skills_overview: string[]
  teaching_notes: string[]
  difficulty_distribution: {
    easy: number
    medium: number
    hard: number
  }
  solution_timestamp: string
  ai_model_used: string
  processing_time: number
}

export interface GabaritoSection {
  [assessmentType: string]: GabaritoResult
}

// Tipo união para compatibilidade com ambos os formatos
export type AssessmentSolutionResult = SolveAssessmentResult | GabaritoResult

// Type guards para identificar qual formato estamos usando
export function isSolveAssessmentResult(result: any): result is SolveAssessmentResult {
  return result && typeof result === 'object' && 'total_score' in result && 'item_corrections' in result
}

export function isGabaritoResult(result: any): result is GabaritoResult {
  return result && typeof result === 'object' && 'total_items' in result && 'items' in result && Array.isArray(result.items)
}