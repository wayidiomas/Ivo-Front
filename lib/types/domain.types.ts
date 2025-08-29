// ============= UI STATE TYPES =============

export interface UIState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  currentPage: string
  isLoading: boolean
  loadingMessage?: string
}

export interface LoadingState {
  isLoading: boolean
  message?: string
  progress?: number
  substeps?: string[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
  isCurrentPage?: boolean
}

// ============= FORM TYPES =============

export interface FormField {
  name: string
  label: string
  type: 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'checkbox' | 'radio' | 'file'
  placeholder?: string
  required?: boolean
  options?: Array<{ label: string; value: string }>
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}

export interface WizardStep {
  id: string
  title: string
  icon: string
  component: React.ComponentType<any>
  fields: FormField[]
  validation?: any // Zod schema
}

// ============= TABLE TYPES =============

export interface TableColumn<T = any> {
  key: string
  label: string
  sortable?: boolean
  filterable?: boolean
  width?: string
  render?: (value: any, row: T) => React.ReactNode
}

export interface TableFilter {
  key: string
  label: string
  type: 'text' | 'select' | 'multiselect' | 'date'
  options?: Array<{ label: string; value: string }>
}

export interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

export interface TableState<T = any> {
  data: T[]
  loading: boolean
  error?: string
  pagination: {
    page: number
    limit: number
    total: number
    hasNext: boolean
    hasPrevious: boolean
  }
  sorting: SortConfig[]
  filters: Record<string, any>
  selectedRows: Set<string>
}

// ============= EDITOR TYPES =============

export interface EditorState {
  currentStep: number
  totalSteps: number
  unitId: string
  isDirty: boolean
  isSaving: boolean
  errors: Record<string, string>
}

export interface VocabularyEditorState {
  words: Array<{
    id: string
    word: string
    phoneme: string
    definition: string
    example: string
    word_class: string
    context_relevance: number
    is_reinforcement: boolean
    isSelected: boolean
    isDirty: boolean
  }>
  selectedWords: Set<string>
  filterClass: string
  searchTerm: string
  isRegenerating: boolean
}

// ============= NOTIFICATION TYPES =============

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message?: string
  duration?: number
  actions?: Array<{
    label: string
    action: () => void
  }>
  timestamp: Date
}

// ============= NAVIGATION TYPES =============

export interface NavigationItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  children?: NavigationItem[]
  requiresAuth?: boolean
  roles?: string[]
}

export interface NavigationSection {
  title: string
  items: NavigationItem[]
}

// ============= SEARCH TYPES =============

export interface SearchResult {
  type: 'course' | 'book' | 'unit'
  id: string
  title: string
  subtitle?: string
  description?: string
  href: string
  metadata?: Record<string, any>
  score?: number
}

export interface SearchState {
  query: string
  results: SearchResult[]
  isSearching: boolean
  recentSearches: string[]
  filters: {
    type?: 'course' | 'book' | 'unit'
    cefrLevel?: string
    unitType?: string
  }
}

// ============= PREFERENCES TYPES =============

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system'
  language: 'pt-BR' | 'en-US'
  defaultCEFRLevel: string
  defaultLanguageVariant: string
  autoSave: boolean
  autoSaveInterval: number
  showAdvancedOptions: boolean
  keyboardShortcuts: boolean
  notifications: {
    browser: boolean
    email: boolean
    regeneration: boolean
    errors: boolean
  }
}

// ============= ANALYTICS TYPES =============

export interface AnalyticsEvent {
  event: string
  category: 'navigation' | 'creation' | 'editing' | 'generation' | 'export'
  action: string
  label?: string
  value?: number
  metadata?: Record<string, any>
  timestamp: Date
}

export interface UsageStats {
  totalUnitsCreated: number
  totalWordsGenerated: number
  totalPDFsExported: number
  averageQualityScore: number
  mostUsedCEFRLevel: string
  mostUsedUnitType: 'lexical_unit' | 'grammar_unit'
  timeSpent: number
  lastActivity: Date
}

// ============= EXPORT TYPES =============

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'json'
  version: 'student' | 'teacher'
  sections: Array<'vocabulary' | 'sentences' | 'aims' | 'strategy' | 'assessments' | 'qa'>
  includeAnswers: boolean
  includeMetadata: boolean
  template?: string
}

export interface ExportJob {
  id: string
  unitId: string
  options: ExportOptions
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  downloadUrl?: string
  error?: string
  createdAt: Date
  completedAt?: Date
}

// ============= KEYBOARD SHORTCUT TYPES =============

export interface KeyboardShortcut {
  key: string
  description: string
  action: () => void
  category: 'navigation' | 'editing' | 'generation' | 'general'
  enabled: boolean
}

// ============= DRAG & DROP TYPES =============

export interface DragItem {
  id: string
  type: 'vocabulary-word' | 'sentence' | 'assessment'
  data: any
}

export interface DropZone {
  id: string
  type: string
  accepts: string[]
  onDrop: (item: DragItem) => void
}

// ============= WEBSOCKET TYPES =============

export interface WebSocketMessage {
  type: 'generation_progress' | 'generation_complete' | 'generation_error' | 'unit_updated'
  unitId: string
  data: any
  timestamp: Date
}

export interface GenerationProgress {
  step: string
  progress: number
  message: string
  substeps?: string[]
  estimatedTimeRemaining?: number
}