import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  BookOpen, 
  GraduationCap, 
  Search,
  Sparkles,
  FileText,
  Volume2,
  ChevronRight,
  Filter
} from "lucide-react"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function VocabularyPage() {
  // Dados baseados na estrutura real da API IVO V2
  const vocabularyItems = [
    {
      id: 1,
      word: "meeting",
      phoneme: "/ˈmiːtɪŋ/",
      definition: "A gathering of people for discussion or to make decisions",
      example: "We have a team meeting every Monday morning.",
      word_class: "noun",
      frequency_level: "high",
      ipa_variant: "general_american",
      context_tags: ["business", "workplace"],
      course_name: "Business English B2",
      book_name: "Professional Communication",
      unit_title: "Unit 5: Business Meetings",
      unit_sequence: 5,
      cefr_level: "B2"
    },
    {
      id: 2,
      word: "schedule",
      phoneme: "/ˈʃedʒuːl/",
      definition: "To plan for something to happen at a particular time",
      example: "I need to schedule a doctor's appointment.",
      word_class: "verb",
      frequency_level: "high", 
      ipa_variant: "general_american",
      context_tags: ["time", "planning"],
      course_name: "Business English B2", 
      book_name: "Professional Communication",
      unit_title: "Unit 5: Business Meetings",
      unit_sequence: 5,
      cefr_level: "B2"
    },
    {
      id: 3,
      word: "greet",
      phoneme: "/ɡriːt/",
      definition: "To welcome someone with words or actions",
      example: "She greeted us with a warm smile.",
      word_class: "verb",
      frequency_level: "medium",
      ipa_variant: "general_american", 
      context_tags: ["social", "communication"],
      course_name: "English for Beginners A2",
      book_name: "Social Interactions",
      unit_title: "Unit 2: Meeting People",
      unit_sequence: 2,
      cefr_level: "A2"
    },
    {
      id: 4,
      word: "presentation",
      phoneme: "/ˌprezənˈteɪʃən/",
      definition: "A speech or talk in which a new product, idea, or piece of work is shown",
      example: "The marketing team gave an excellent presentation.",
      word_class: "noun",
      frequency_level: "medium",
      ipa_variant: "general_american",
      context_tags: ["business", "communication"],
      course_name: "Business English B2",
      book_name: "Professional Communication", 
      unit_title: "Unit 6: Effective Presentations",
      unit_sequence: 6,
      cefr_level: "B2"
    },
    {
      id: 5,
      word: "collaborate",
      phoneme: "/kəˈlæbəreɪt/",
      definition: "To work together with others on a project or task",
      example: "Our teams collaborate on several international projects.",
      word_class: "verb",
      frequency_level: "medium",
      ipa_variant: "general_american",
      context_tags: ["teamwork", "cooperation"],
      course_name: "Business English B2",
      book_name: "Team Management", 
      unit_title: "Unit 3: Building Teams",
      unit_sequence: 3,
      cefr_level: "B2"
    },
    {
      id: 6,
      word: "introduce",
      phoneme: "/ˌɪntrəˈduːs/",
      definition: "To present someone by name to another person",
      example: "Let me introduce you to my colleague.",
      word_class: "verb",
      frequency_level: "high",
      ipa_variant: "general_american",
      context_tags: ["social", "formal"],
      course_name: "English for Beginners A2",
      book_name: "Social Interactions", 
      unit_title: "Unit 1: First Meetings",
      unit_sequence: 1,
      cefr_level: "A2"
    }
  ]

  const stats = [
    { 
      label: "Total de Vocabulário", 
      value: vocabularyItems.length.toLocaleString(),
      icon: Sparkles,
      color: "text-blue-600"
    },
    { 
      label: "Palavras Alta Frequência", 
      value: vocabularyItems.filter(item => item.frequency_level === 'high').length,
      icon: GraduationCap,
      color: "text-green-600"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Vocabulário</h1>
          <p className="text-muted-foreground">
            Explore vocabulário organizado por curso, livro e unidade
          </p>
        </div>
      </div>

      {/* Simplified Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Simplified Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Busca e Filtros</CardTitle>
          <CardDescription>Filtre o vocabulário por hierarquia ou características</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Buscar palavras..." 
                className="pl-10" 
              />
            </div>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Curso" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os cursos</SelectItem>
                <SelectItem value="business_b2">Business English B2</SelectItem>
                <SelectItem value="beginners_a2">English for Beginners A2</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Nível CEFR" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os níveis</SelectItem>
                <SelectItem value="A1">A1</SelectItem>
                <SelectItem value="A2">A2</SelectItem>
                <SelectItem value="B1">B1</SelectItem>
                <SelectItem value="B2">B2</SelectItem>
                <SelectItem value="C1">C1</SelectItem>
                <SelectItem value="C2">C2</SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Frequência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Vocabulary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {vocabularyItems.map((item) => (
          <Card key={item.id} className="group hover:shadow-md transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-xl font-bold">{item.word}</CardTitle>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Volume2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.phoneme}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge variant="outline" className="text-xs">
                    {item.cefr_level}
                  </Badge>
                  <Badge variant={item.frequency_level === 'high' ? 'default' : 'secondary'} className="text-xs">
                    {item.frequency_level === 'high' ? 'Alta' : item.frequency_level === 'medium' ? 'Média' : 'Baixa'}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div>
                <p className="text-sm"><strong>Definição:</strong> {item.definition}</p>
              </div>

              <div>
                <p className="text-sm"><strong>Exemplo:</strong> <em>{item.example}</em></p>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {item.word_class === 'noun' ? 'Substantivo' :
                   item.word_class === 'verb' ? 'Verbo' :
                   item.word_class === 'adjective' ? 'Adjetivo' :
                   item.word_class === 'adverb' ? 'Advérbio' :
                   item.word_class}
                </Badge>
                {item.context_tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Hierarchical Path - Simplified */}
              <div className="flex items-center text-xs text-muted-foreground space-x-1">
                <GraduationCap className="h-3 w-3" />
                <span className="truncate">{item.course_name}</span>
                <ChevronRight className="h-3 w-3" />
                <BookOpen className="h-3 w-3" />
                <span className="truncate">{item.book_name}</span>
                <ChevronRight className="h-3 w-3" />
                <FileText className="h-3 w-3" />
                <span className="truncate">Unidade {item.unit_sequence}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="flex justify-center pt-4">
        <Button variant="outline" className="w-full max-w-md">
          Carregar mais palavras
        </Button>
      </div>
    </div>
  )
}