'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  BookOpen, 
  GraduationCap, 
  Activity,
  TrendingUp,
  Plus,
  Users,
  Play,
  MoreHorizontal,
  Sparkles,
  FileText,
  Loader2
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { AiGenerateButton } from "@/components/courses/ai-generate-button"
import { dashboardService, DashboardStats, RecentUnit } from "@/lib/api/dashboard"

export default function DashboardPage() {
  const router = useRouter()
  
  // Estado para dados reais da API
  const [stats, setStats] = useState<DashboardStats[]>([])
  const [recentUnits, setRecentUnits] = useState<RecentUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const hasFetched = useRef(false)

  const handleAiGenerate = () => {
    router.push('/units/create')
  }

  // Função para buscar dados da API
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const dashboardData = await dashboardService.getAllDashboardData(30, 3)

      if (dashboardData.stats.success && dashboardData.stats.data?.stats) {
        // Mapear stats para formato esperado pelo frontend
        const mappedStats = dashboardData.stats.data.stats.map((stat: any, index: number) => {
          const iconMap = [GraduationCap, BookOpen, Activity, Users]
          const colorMap = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500']
          
          return {
            ...stat,
            IconComponent: iconMap[index] || Activity,
            color: colorMap[index] || 'bg-gray-500'
          }
        })
        setStats(mappedStats)
      }

      if (dashboardData.units.success && dashboardData.units.data?.recent_units) {
        setRecentUnits(dashboardData.units.data.recent_units)
      }

    } catch (err) {
      console.error('Erro ao carregar dashboard:', err)
      setError('Erro ao carregar dados. Tentando novamente...')
      
      // Fallback para dados mockados em caso de erro
      setStats([
        {
          title: "Total de Cursos",
          value: "--",
          description: "Carregando...",
          trend: "stable",
          change_percentage: 0,
          period_data: {}
        },
        {
          title: "Livros Criados",
          value: "--",
          description: "Carregando...",
          trend: "stable",
          change_percentage: 0,
          period_data: {}
        },
        {
          title: "Unidades Geradas",
          value: "--",
          description: "Carregando...",
          trend: "stable",
          change_percentage: 0,
          period_data: {}
        }
      ].map((stat, index) => {
        const iconMap = [GraduationCap, BookOpen, Activity]
        const colorMap = ['bg-blue-500', 'bg-green-500', 'bg-purple-500']
        return { ...stat, IconComponent: iconMap[index], color: colorMap[index] }
      }))
      
      setRecentUnits([])
    } finally {
      setLoading(false)
    }
  }

  // useEffect para carregar dados
  useEffect(() => {
    if (!hasFetched.current) {
      hasFetched.current = true
      fetchDashboardData()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Gerencie seus cursos de inglês e acompanhe o progresso.
          </p>
        </div>
        <div className="w-40 flex justify-end">
          <AiGenerateButton onClick={handleAiGenerate} />
        </div>
      </div>

      {/* Connection Status - Clean Ivo Style */}
      {error && (
        <div className="border-orange-500/20 bg-orange-500/10 dark:border-orange-500/30 dark:bg-orange-500/15 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Activity className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-foreground">Conectando com servidor</p>
                <p className="text-xs text-muted-foreground">Aguarde enquanto carregamos seus dados...</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchDashboardData}
              disabled={loading}
              className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Conectando...
                </>
              ) : (
                "Tentar novamente"
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Loading skeletons
          Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 animate-pulse" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
              </CardContent>
            </Card>
          ))
        ) : (
          stats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              {/* Linha decorativa colorida no topo */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${stat.color}`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.IconComponent className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center">
                  {stat.trend === 'up' && <TrendingUp className="mr-1 h-3 w-3 text-green-500" />}
                  {stat.trend === 'down' && <TrendingUp className="mr-1 h-3 w-3 text-red-500 rotate-180" />}
                  {stat.trend === 'stable' && <Activity className="mr-1 h-3 w-3 text-gray-500" />}
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Recent Units - Netflix Style */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Últimas Unidades Trabalhadas</h2>
          <Link href="/units">
            <Button variant="ghost" className="text-sm">
              Ver todas as unidades
            </Button>
          </Link>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            // Loading skeletons para unidades
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="relative aspect-video bg-gray-200 animate-pulse">
                  <div className="absolute top-3 left-3">
                    <div className="h-5 w-8 bg-gray-300 rounded animate-pulse" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <div className="h-5 w-16 bg-gray-300 rounded animate-pulse" />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="h-5 bg-gray-300 rounded animate-pulse mb-1" />
                    <div className="h-4 bg-gray-300 rounded animate-pulse w-3/4 mb-1" />
                    <div className="h-3 bg-gray-300 rounded animate-pulse w-1/2" />
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                    </div>
                    <div className="h-2 bg-gray-200 rounded animate-pulse" />
                  </div>
                  <div className="flex justify-between pt-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : recentUnits.length > 0 ? (
            recentUnits.map((unit) => (
            <Card key={unit.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative aspect-video overflow-hidden bg-muted">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
                <div className="absolute top-3 left-3 z-20">
                  <Badge variant={unit.status === 'review' ? 'secondary' : 'default'}>
                    {unit.level}
                  </Badge>
                </div>
                <div className="absolute top-3 right-3 z-20">
                  <Badge variant="outline" className="bg-black/20 text-white border-white/20">
                    {unit.type === 'lexical_unit' ? 'Vocabulário' : 'Gramática'}
                  </Badge>
                </div>
                <div className="absolute bottom-3 left-3 right-3 z-20 text-white">
                  <h3 className="font-semibold text-lg leading-tight">{unit.title}</h3>
                  <p className="text-sm text-white/80 mt-1">{unit.courseName}</p>
                  <p className="text-xs text-white/60">{unit.bookName}</p>
                </div>
                {/* Icon baseado no tipo */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  {unit.type === 'lexical_unit' ? 
                    <BookOpen className="h-16 w-16 text-primary/20" /> :
                    <FileText className="h-16 w-16 text-primary/20" />
                  }
                </div>
              </div>
              
              <CardContent className="p-4 space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center">
                      <Sparkles className="w-4 h-4 mr-1" />
                      {unit.vocabulary} palavras
                    </span>
                    <span className="flex items-center">
                      <Activity className="w-4 h-4 mr-1" />
                      {unit.sentences} sentenças
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{unit.progress}%</span>
                    </div>
                    <Progress value={unit.progress} className="h-2" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-muted-foreground">
                    <div>Trabalhado {unit.lastWorked}</div>
                    <div>{unit.timeSpent}</div>
                  </div>
                  <Link href={`/units/${unit.id}`}>
                    <Button size="sm" className="h-8">
                      <Play className="w-3 h-3 mr-1" />
                      Continuar
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            ))
          ) : (
            // Estado vazio - nenhuma unidade encontrada
            <div className="col-span-full">
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Nenhuma unidade recente</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Comece criando seu primeiro curso e unidades para vê-los aqui.
                  </p>
                  <Button onClick={() => router.push('/units/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Criar primeira unidade
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}