import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  TrendingUp,
  Users,
  BookOpen,
  Activity,
  Clock,
  Target,
  Lightbulb
} from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
              🚧 Em Breve
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">
            Análises avançadas e insights sobre performance de aprendizado
          </p>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
        <CardHeader className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Sistema de Analytics Avançado</CardTitle>
              <CardDescription className="text-base">
                Em desenvolvimento - Lançamento previsto para próxima versão
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Análise de Usuários</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                <li>• Engajamento por usuário</li>
                <li>• Tempo médio de estudo</li>
                <li>• Progresso de aprendizado</li>
                <li>• Padrões de uso</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Performance de Conteúdo</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                <li>• Eficácia dos cursos</li>
                <li>• Taxa de conclusão</li>
                <li>• Dificuldades comuns</li>
                <li>• Conteúdo mais popular</li>
              </ul>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Tendências e Insights</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-7">
                <li>• Análise preditiva</li>
                <li>• Recomendações IA</li>
                <li>• Otimização automática</li>
                <li>• Reports personalizados</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-muted/30 rounded-lg border-l-4 border-primary">
            <Lightbulb className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium">Recursos Planejados</p>
              <p className="text-sm text-muted-foreground">
                Dashboards interativos, relatórios em PDF, integração com ferramentas externas e muito mais.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" disabled>
              <BarChart3 className="mr-2 h-4 w-4" />
              Ver Demos (Em Breve)
            </Button>
            <Button variant="outline" disabled>
              <Clock className="mr-2 h-4 w-4" />
              Agendar Notificação
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="opacity-75">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Activity className="mr-2 h-5 w-5" />
                Métricas em Tempo Real
              </CardTitle>
              <Badge variant="outline">Preview</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/30 rounded">
                  <div className="text-2xl font-bold text-muted-foreground">---</div>
                  <div className="text-sm text-muted-foreground">Usuários Ativos</div>
                </div>
                <div className="text-center p-3 bg-muted/30 rounded">
                  <div className="text-2xl font-bold text-muted-foreground">---</div>
                  <div className="text-sm text-muted-foreground">Sessões Hoje</div>
                </div>
              </div>
              <div className="h-32 bg-muted/30 rounded flex items-center justify-center">
                <p className="text-muted-foreground">Gráficos em Tempo Real</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="opacity-75">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Relatórios Inteligentes
              </CardTitle>
              <Badge variant="outline">Preview</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-2 bg-muted/30 rounded"></div>
                <div className="h-2 bg-muted/30 rounded w-3/4"></div>
                <div className="h-2 bg-muted/30 rounded w-1/2"></div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="h-12 bg-muted/30 rounded"></div>
                <div className="h-12 bg-muted/30 rounded"></div>
                <div className="h-12 bg-muted/30 rounded"></div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Insights automáticos baseados em IA
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}