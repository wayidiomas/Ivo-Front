"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import Link from "next/link"
import { Home, ArrowLeft } from "lucide-react"
import { useTheme } from "next-themes"

export default function NotFound() {
  const { theme } = useTheme()
  
  const iconSrc = (theme === 'light') 
    ? '/assets/logos/way_app_icon_transparent.png'  // for-white version
    : '/assets/logos/way_icon_crisp.png'             // crisp version
  
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8 text-center space-y-6">
          {/* Subtle WAY icon */}
          <div className="flex justify-center">
<Image 
              src={iconSrc}
              alt="WAY"
              width={48}
              height={48}
              className="h-12 w-12 opacity-20"
            />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-muted-foreground">404</h1>
            <h2 className="text-2xl font-semibold">Página não encontrada</h2>
            <p className="text-muted-foreground">
              A página que você está procurando não existe ou foi movida.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Ir ao Dashboard
              </Link>
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}