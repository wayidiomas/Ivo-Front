'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Settings, 
  User,
  Palette,
  Bell,
  Shield,
  Database,
  Globe,
  Zap,
  Key,
  Monitor,
  Lightbulb,
  Smartphone,
  Cloud,
  Lock,
  Mail,
  Languages
} from "lucide-react"
import Image from "next/image"
import { useTheme } from "next-themes"

export default function SettingsPage() {
  const { theme } = useTheme()
  
  const iconSrc = (theme === 'light') 
    ? '/assets/logos/way_app_icon_transparent.png'  // for-white version
    : '/assets/logos/way_icon_crisp.png'             // crisp version
  
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
              🚧 Em Breve
            </Badge>
          </div>
          <p className="text-muted-foreground mt-2">
            Personalize sua experiência no IVO V2
          </p>
        </div>
      </div>

      {/* Coming Soon Main Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/50 via-transparent to-blue-50/50" />
        <CardHeader className="relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-xl">Sistema de Configurações Avançado</CardTitle>
              <CardDescription className="text-base">
                Painel completo de personalização e configurações em desenvolvimento
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10 space-y-6">
          {/* Settings Categories */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-white/50 rounded-lg border space-y-3">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Perfil e Conta</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Informações pessoais</li>
                <li>• Avatar e foto de perfil</li>
                <li>• Preferências de idioma</li>
                <li>• Configuração de fuso horário</li>
              </ul>
            </div>

            <div className="p-4 bg-white/50 rounded-lg border space-y-3">
              <div className="flex items-center space-x-2">
                <Palette className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold">Aparência e Tema</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Modo escuro/claro</li>
                <li>• Cores personalizadas</li>
                <li>• Tamanho da fonte</li>
                <li>• Layout responsivo</li>
              </ul>
            </div>

            <div className="p-4 bg-white/50 rounded-lg border space-y-3">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Notificações</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Notificações push</li>
                <li>• Alertas por email</li>
                <li>• Lembretes de estudo</li>
                <li>• Atualizações do sistema</li>
              </ul>
            </div>

            <div className="p-4 bg-white/50 rounded-lg border space-y-3">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold">Privacidade e Segurança</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Autenticação 2FA</li>
                <li>• Senhas e acessos</li>
                <li>• Configurações de privacidade</li>
                <li>• Log de atividades</li>
              </ul>
            </div>

            <div className="p-4 bg-white/50 rounded-lg border space-y-3">
              <div className="flex items-center space-x-2">
                <Database className="h-5 w-5 text-orange-600" />
                <h3 className="font-semibold">Dados e Backup</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Exportar dados</li>
                <li>• Backup automático</li>
                <li>• Sincronização na nuvem</li>
                <li>• Histórico de versões</li>
              </ul>
            </div>

            <div className="p-4 bg-white/50 rounded-lg border space-y-3">
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                <h3 className="font-semibold">Performance</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Otimizações automáticas</li>
                <li>• Cache inteligente</li>
                <li>• Modo offline</li>
                <li>• Compressão de dados</li>
              </ul>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-purple-50/80 rounded-lg border-l-4 border-purple-500">
            <Lightbulb className="h-5 w-5 text-purple-600" />
            <div>
              <p className="font-medium text-purple-900">Recursos Planejados</p>
              <p className="text-sm text-purple-700">
                Sistema completo de configurações com sincronização entre dispositivos, temas personalizados, e muito mais.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" disabled>
              <Monitor className="mr-2 h-4 w-4" />
              Configurar Aparência
            </Button>
            <Button variant="outline" disabled>
              <Bell className="mr-2 h-4 w-4" />
              Gerenciar Notificações
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Current Basic Settings */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5 text-blue-600" />
              Configurações Básicas
            </CardTitle>
            <CardDescription>
              Configurações disponíveis atualmente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome de Usuário</label>
                <Input placeholder="Seu nome..." disabled />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input type="email" placeholder="seu@email.com" disabled />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Idioma da Interface</label>
                <div className="flex items-center space-x-2 p-3 bg-muted/30 rounded">
                  <Languages className="h-4 w-4" />
                  <span className="text-sm">Português (Brasil)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="mr-2 h-5 w-5 text-green-600" />
              Segurança Básica
            </CardTitle>
            <CardDescription>
              Opções de segurança essenciais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                <div className="flex items-center space-x-2">
                  <Lock className="h-4 w-4" />
                  <span className="text-sm">Alterar Senha</span>
                </div>
                <Button size="sm" variant="outline" disabled>
                  Em Breve
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-sm">Autenticação 2FA</span>
                </div>
                <Button size="sm" variant="outline" disabled>
                  Em Breve
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/30 rounded">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">Verificar Email</span>
                </div>
                <Button size="sm" variant="outline" disabled>
                  Em Breve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview of Future Settings Interface */}
      <Card className="opacity-75">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Globe className="mr-2 h-5 w-5" />
              Interface Completa (Preview)
            </CardTitle>
            <Badge variant="outline">Preview</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="h-20 bg-muted/30 rounded flex items-center justify-center">
                <p className="text-xs text-muted-foreground">Navegação</p>
              </div>
              <div className="h-20 bg-muted/30 rounded flex items-center justify-center">
                <p className="text-xs text-muted-foreground">Perfil</p>
              </div>
              <div className="h-20 bg-muted/30 rounded flex items-center justify-center">
                <p className="text-xs text-muted-foreground">Aparência</p>
              </div>
              <div className="h-20 bg-muted/30 rounded flex items-center justify-center">
                <p className="text-xs text-muted-foreground">Avançado</p>
              </div>
            </div>
            <div className="h-48 bg-muted/30 rounded flex items-center justify-center relative">
              <div className="text-center">
                <Cloud className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Painel de Configurações Dinâmico</p>
                <p className="text-sm text-muted-foreground">Com sincronização automática entre dispositivos</p>
              </div>
{/* Subtle WAY watermark */}
              <div className="absolute bottom-3 right-3">
                <Image 
                  src={iconSrc}
                  alt="WAY"
                  width={20}
                  height={20}
                  className="opacity-10"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}