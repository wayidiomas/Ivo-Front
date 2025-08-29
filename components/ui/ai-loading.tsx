'use client'

import { useEffect, useState } from 'react'
import { Loader2, Sparkles, Brain, Zap } from 'lucide-react'

interface AILoadingProps {
  title?: string
  subtitle?: string
  progress?: number
  estimatedTime?: number // in seconds
}

const loadingMessages = [
  "Criando estrutura da unidade...",
  "Analisando contexto da unidade...",
  "Definindo objetivos pedagógicos...",
  "Gerando vocabulário personalizado...",
  "Criando sentenças contextualizadas...",
  "Desenvolvendo estratégias pedagógicas...",
  "Elaborando avaliações adaptativas...",
  "Finalizando unidade completa..."
]

export function AILoading({ 
  title = "Gerando conteúdo com IA", 
  subtitle = "Isso pode levar até 5 minutos",
  progress,
  estimatedTime = 300 
}: AILoadingProps) {
  const [currentMessage, setCurrentMessage] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    // Cycle through messages every 8 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % loadingMessages.length)
    }, 8000)

    // Track elapsed time
    const timeInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1)
    }, 1000)

    return () => {
      clearInterval(messageInterval)
      clearInterval(timeInterval)
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    if (progress !== undefined) return progress
    return Math.min((elapsedTime / estimatedTime) * 100, 95) // Never reach 100% until complete
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Animated AI Icon */}
          <div className="relative mx-auto w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 animate-pulse"></div>
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white animate-spin" />
            </div>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-white mb-2">
            {title}
          </h3>
          
          {/* Subtitle */}
          <p className="text-slate-300 mb-6">
            {subtitle}
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2 mb-4">
            <div 
              className="bg-gradient-to-r from-primary to-accent h-2 rounded-full transition-all duration-1000"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>

          {/* Progress Info */}
          <div className="flex justify-between text-sm text-slate-400 mb-6">
            <span>{Math.round(getProgressPercentage())}% concluído</span>
            <span>{formatTime(elapsedTime)} / {formatTime(estimatedTime)}</span>
          </div>

          {/* Current Message */}
          <div className="bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 rounded-lg p-4">
            <div className="flex items-center justify-center space-x-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm text-white font-medium">
                {loadingMessages[currentMessage]}
              </span>
            </div>
          </div>

          {/* Time Warning */}
          {elapsedTime > 120 && (
            <div className="mt-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-center justify-center space-x-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-yellow-200">
                  Processando conteúdo complexo - quase terminando...
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}