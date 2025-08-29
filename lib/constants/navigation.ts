import { 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Settings, 
  BarChart3, 
  Users, 
  Search,
  Home
} from "lucide-react"
import { NavigationSection } from "@/lib/types/domain.types"

export const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    title: "Principal",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: Home,
        requiresAuth: true
      },
      {
        label: "Cursos",
        href: "/courses",
        icon: GraduationCap,
        requiresAuth: true
      },
      {
        label: "Livros",
        href: "/books", 
        icon: BookOpen,
        requiresAuth: true
      },
      {
        label: "Unidades",
        href: "/units",
        icon: FileText,
        requiresAuth: true
      }
    ]
  },
  {
    title: "Ferramentas",
    items: [
      {
        label: "Busca Global",
        href: "/search",
        icon: Search,
        requiresAuth: true
      },
      {
        label: "Analytics",
        href: "/analytics", 
        icon: BarChart3,
        requiresAuth: true,
        roles: ["admin", "manager"]
      }
    ]
  },
  {
    title: "Configurações",
    items: [
      {
        label: "Usuários",
        href: "/users",
        icon: Users,
        requiresAuth: true,
        roles: ["admin"]
      },
      {
        label: "Configurações",
        href: "/settings",
        icon: Settings,
        requiresAuth: true
      }
    ]
  }
]

export const CEFR_LEVELS = [
  { label: "A1 - Iniciante", value: "A1" },
  { label: "A2 - Elementar", value: "A2" },
  { label: "B1 - Intermediário", value: "B1" },
  { label: "B2 - Intermediário Superior", value: "B2" },
  { label: "C1 - Avançado", value: "C1" },
  { label: "C2 - Proficiente", value: "C2" }
]

export const LANGUAGE_VARIANTS = [
  { label: "Inglês Americano", value: "american_english" },
  { label: "Inglês Britânico", value: "british_english" },
  { label: "Inglês Australiano", value: "australian_english" },
  { label: "Inglês Canadense", value: "canadian_english" },
  { label: "Inglês Sul-Africano", value: "south_african_english" }
]

export const UNIT_TYPES = [
  { label: "Unidade Lexical", value: "lexical_unit" },
  { label: "Unidade Gramatical", value: "grammar_unit" }
]

export const VOCABULARY_LEVELS = [
  { label: "Básico", value: "basic" },
  { label: "Intermediário", value: "intermediate" },
  { label: "Avançado", value: "advanced" }
]

export const SENTENCE_COMPLEXITY = [
  { label: "Simples", value: "simple" },
  { label: "Moderado", value: "moderate" },
  { label: "Complexo", value: "complex" }
]

export const WORD_CLASSES = [
  { label: "Substantivo", value: "noun" },
  { label: "Verbo", value: "verb" },
  { label: "Adjetivo", value: "adjective" },
  { label: "Advérbio", value: "adverb" },
  { label: "Preposição", value: "preposition" },
  { label: "Pronome", value: "pronoun" },
  { label: "Conjunção", value: "conjunction" },
  { label: "Interjeição", value: "interjection" }
]

export const ASSESSMENT_TYPES = [
  { label: "Cloze Test", value: "CLOZE_TEST" },
  { label: "Gap Fill", value: "GAP_FILL" },
  { label: "Reordenação", value: "REORDER" },
  { label: "Transformação", value: "TRANSFORMATION" },
  { label: "Múltipla Escolha", value: "MULTIPLE_CHOICE" },
  { label: "Verdadeiro/Falso", value: "TRUE_FALSE" },
  { label: "Matching", value: "MATCHING" }
]

export const BLOOM_LEVELS = [
  { label: "Lembrar", value: "remember" },
  { label: "Entender", value: "understand" },
  { label: "Aplicar", value: "apply" },
  { label: "Analisar", value: "analyze" },
  { label: "Avaliar", value: "evaluate" },
  { label: "Criar", value: "create" }
]

export const TIPS_STRATEGIES = [
  { label: "Afixação", value: "affixation" },
  { label: "Substantivos Compostos", value: "compound_nouns" },
  { label: "Colocações", value: "collocations" },
  { label: "Expressões Fixas", value: "fixed_expressions" },
  { label: "Idiomas", value: "idioms" },
  { label: "Chunks", value: "chunks" }
]

export const GRAMMAR_STRATEGIES = [
  { label: "Explicação Sistemática", value: "systematic_explanation" },
  { label: "Prevenção L1→L2", value: "l1_interference_prevention" }
]