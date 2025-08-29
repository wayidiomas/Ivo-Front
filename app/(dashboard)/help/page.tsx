import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  HelpCircle, 
  Search,
  Book,
  MessageSquare,
  Video,
  FileText,
  Mail,
  Phone,
  Lightbulb,
  Users,
  Zap,
  Shield,
  Headphones
} from "lucide-react"

export default function HelpPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Help Center</h1>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
              🚧 Em Breve
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">
            Central de ajuda e suporte para o IVO V2
          </p>
        </div>
      </div>

      {/* Coming Soon Main Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-green-50/50" />
        <CardHeader className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HelpCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Central de Ajuda Completa</CardTitle>
              <CardDescription className="text-base">
                Sistema integrado de suporte e documentação em desenvolvimento
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 space-y-6">
          {/* Search Bar Preview */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Como podemos ajudar você?</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Buscar na base de conhecimento... (Em breve)" 
                className="pl-10" 
                disabled
              />
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-white/50 rounded-lg border space-y-3">
              <div className="flex items-center space-x-2">
                <Book className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Base de Conhecimento</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Guias passo-a-passo</li>
                <li>• FAQs interativas</li>
                <li>• Tutoriais em vídeo</li>
                <li>• Documentação técnica</li>
              </ul>
            </div>

            <div className="p-4 bg-white/50 rounded-lg border space-y-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Suporte em Tempo Real</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Chat ao vivo</li>
                <li>• Tickets de suporte</li>
                <li>• Comunidade de usuários</li>
                <li>• Fórum de discussões</li>
              </ul>
            </div>

            <div className="p-4 bg-white/50 rounded-lg border space-y-3">
              <div className="flex items-center space-x-2">
                <Video className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Recursos Multimídia</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Webinars ao vivo</li>
                <li>• Screencast tutoriais</li>
                <li>• Cursos de treinamento</li>
                <li>• Workshops online</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-blue-50/80 rounded-lg border-l-4 border-blue-500">
            <Lightbulb className="h-5 w-5 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">Funcionalidades Planejadas</p>
              <p className="text-sm text-blue-700">
                Sistema de tickets, chat integrado, base de conhecimento searchable, e suporte multilíngue.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" disabled>
              <MessageSquare className="mr-2 h-4 w-4" />
              Abrir Chat (Em Breve)
            </Button>
            <Button variant="outline" disabled>
              <Mail className="mr-2 h-4 w-4" />
              Enviar Ticket
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Temporary Contact Options */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="mr-2 h-5 w-5 text-blue-600" />
              Contato Temporário
            </CardTitle>
            <CardDescription>
              Enquanto o Help Center está em desenvolvimento
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded">
              <Mail className="h-4 w-4 text-blue-600" />
              <div>
                <p className="font-medium">Email de Suporte</p>
                <p className="text-sm text-muted-foreground">support@ivo-v2.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded">
              <Phone className="h-4 w-4 text-green-600" />
              <div>
                <p className="font-medium">Telefone/WhatsApp</p>
                <p className="text-sm text-muted-foreground">+55 (11) 9999-9999</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5 text-purple-600" />
              Recursos Atuais
            </CardTitle>
            <CardDescription>
              Disponível agora mesmo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Documentação da API</span>
                </div>
                <Button size="sm" variant="outline">
                  Ver
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4" />
                  <span className="text-sm">Guia de Início Rápido</span>
                </div>
                <Button size="sm" variant="outline">
                  Ver
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Políticas de Privacidade</span>
                </div>
                <Button size="sm" variant="outline">
                  Ver
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview of Future Help Center */}
      <Card className="opacity-75">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Headphones className="mr-2 h-5 w-5" />
              Interface do Help Center (Preview)
            </CardTitle>
            <Badge variant="outline">Preview</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-24 bg-muted/30 rounded flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Categorias</p>
              </div>
              <div className="h-24 bg-muted/30 rounded flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Artigos Populares</p>
              </div>
              <div className="h-24 bg-muted/30 rounded flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Status do Sistema</p>
              </div>
            </div>
            <div className="h-32 bg-muted/30 rounded flex items-center justify-center">
              <p className="text-muted-foreground">Interface de Chat Integrado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}