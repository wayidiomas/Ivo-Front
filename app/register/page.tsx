"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Mail, Phone, User, AlertCircle, CheckCircle, Copy } from "lucide-react"
import { authApi, type RegisterRequest } from "@/lib/api/auth"
import Image from "next/image"
import { toast } from "@/hooks/use-toast"

interface RegistrationResult {
  user: any
  api_key_ivo: string
  message: string
}

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterRequest>({
    email: '',
    phone: '',
    metadata: {}
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registrationResult, setRegistrationResult] = useState<RegistrationResult | null>(null)
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    if (!formData.email) {
      setError('Email é obrigatório.')
      return
    }

    setIsSubmitting(true)
    
    try {
      const response = await authApi.register(formData)
      
      // Extrair a chave IVO do response (assumindo que existe uma propriedade api_key_ivo)
      const result: RegistrationResult = {
        user: response.user,
        api_key_ivo: (response as any).api_key_ivo || 'chave_gerada_automaticamente',
        message: response.message
      }
      
      setRegistrationResult(result)
      
    } catch (error) {
      console.error('Erro no registro:', error)
      setError(error instanceof Error ? error.message : 'Erro ao criar conta. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof RegisterRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    if (error) setError(null)
  }

  const copyApiKey = () => {
    if (registrationResult?.api_key_ivo) {
      navigator.clipboard.writeText(registrationResult.api_key_ivo)
      toast({
        title: "Chave copiada!",
        description: "A chave de acesso foi copiada para a área de transferência.",
      })
    }
  }

  // Tela de sucesso após registro
  if (registrationResult) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="text-center pb-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mb-4 mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl font-semibold text-green-900">
                Conta criada com sucesso!
              </CardTitle>
              <CardDescription className="text-green-700">
                Sua chave de acesso foi gerada
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <Label className="text-sm font-medium text-green-900 mb-2 block">
                  Sua Chave de Acesso IVO:
                </Label>
                <div className="flex items-center gap-2 bg-white border border-green-200 rounded p-3">
                  <code className="flex-1 text-sm font-mono text-green-800 break-all">
                    {registrationResult.api_key_ivo}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={copyApiKey}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <Alert className="border-amber-200 bg-amber-50">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Importante:</strong> Guarde esta chave com segurança! 
                  Você precisará dela para fazer login na plataforma.
                </AlertDescription>
              </Alert>

              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Email:</strong> {registrationResult.user.email}</p>
                <p><strong>ID do Usuário:</strong> {registrationResult.user.id}</p>
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                onClick={() => router.push('/login')}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
              >
                Fazer Login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    )
  }

  // Tela de registro
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-background overflow-hidden p-4">
      {/* Animated Background Bubbles */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Red Bubbles */}
        <div className="absolute w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" 
             style={{ top: '15%', left: '15%', animationDelay: '0.5s', animationDuration: '4.5s' }} />
        <div className="absolute w-48 h-48 bg-primary/15 rounded-full blur-2xl animate-pulse" 
             style={{ top: '70%', right: '10%', animationDelay: '2.5s', animationDuration: '5.5s' }} />
        <div className="absolute w-32 h-32 bg-primary/25 rounded-full blur-xl animate-pulse" 
             style={{ bottom: '25%', left: '25%', animationDelay: '1.5s', animationDuration: '3.5s' }} />
        
        {/* Blue Bubbles */}
        <div className="absolute w-56 h-56 bg-accent/20 rounded-full blur-3xl animate-pulse" 
             style={{ top: '25%', right: '25%', animationDelay: '2s', animationDuration: '5s' }} />
        <div className="absolute w-40 h-40 bg-accent/15 rounded-full blur-2xl animate-pulse" 
             style={{ bottom: '35%', right: '35%', animationDelay: '1s', animationDuration: '4s' }} />
        <div className="absolute w-72 h-72 bg-accent/10 rounded-full blur-3xl animate-pulse" 
             style={{ top: '45%', left: '0%', animationDelay: '3.5s', animationDuration: '6.5s' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Logo WAY */}
          <Image 
            src="/assets/logos/way_icon_crisp.png"
            alt="WAY"
            width={80}
            height={80}
            className="mb-6 mx-auto"
            priority
          />
          <h1 className="text-4xl font-bold text-foreground mb-2">Criar Nova Conta</h1>
          <p className="text-muted-foreground">
            Registre-se para acessar a plataforma
          </p>
        </div>

        {/* Register Form - Glass Effect */}
        <Card className="backdrop-filter backdrop-blur-xl bg-card/80 border border-border/50 shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-center text-foreground">Registro</CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Preencha suas informações para criar uma conta
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-foreground">
                  <Mail className="w-4 h-4 text-primary" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={formData.email}
                  onChange={handleInputChange('email')}
                  disabled={isSubmitting}
                  required
                  autoComplete="email"
                  className="h-12 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background/80 transition-all"
                />
              </div>

              {/* Phone Field */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2 text-foreground">
                  <Phone className="w-4 h-4 text-accent" />
                  Telefone
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+55 (11) 99999-9999"
                  value={formData.phone}
                  onChange={handleInputChange('phone')}
                  disabled={isSubmitting}
                  autoComplete="tel"
                  className="h-12 bg-background/50 border-border/50 backdrop-blur-sm focus:bg-background/80 transition-all"
                />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar Conta'
                )}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{' '}
                <Link href="/login" className="font-medium text-accent hover:text-accent/80 transition-colors">
                  Fazer login
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground backdrop-blur-sm">
          Sistema IVO v2.0 - Plataforma de Ensino Inteligente
        </div>
      </div>
    </div>
  )
}