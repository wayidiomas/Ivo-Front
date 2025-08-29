'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2, RefreshCw } from 'lucide-react'

interface AIErrorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  onRetry: () => void
  isRetrying?: boolean
  errorType?: 'timeout' | 'generation' | 'server'
}

export function AIErrorDialog({ 
  open, 
  onOpenChange, 
  title, 
  description, 
  onRetry, 
  isRetrying = false,
  errorType = 'generation'
}: AIErrorDialogProps) {
  
  const getErrorMessage = () => {
    switch (errorType) {
      case 'timeout':
        return "A geração está demorando mais que o esperado. Isso pode acontecer quando nossos modelos de IA estão processando conteúdo complexo."
      case 'server':
        return "Ocorreu um erro interno no servidor. Nossa equipe foi notificada automaticamente."
      default:
        return "Não foi possível gerar o conteúdo solicitado. Isso pode acontecer devido à complexidade do material ou sobrecarga temporária dos modelos de IA."
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-red-200/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-red-700">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            {title}
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-3">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200/50 rounded-lg p-4">
            <p className="text-sm text-red-800 leading-relaxed">
              {getErrorMessage()}
            </p>
            {errorType === 'timeout' && (
              <p className="text-xs text-red-600 mt-2 font-medium">
                💡 Dica: Tente novamente em alguns minutos ou simplifique o contexto da unidade
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isRetrying}
            className="border-gray-300 hover:bg-gray-50"
          >
            Cancelar
          </Button>
          
          <Button 
            onClick={onRetry}
            disabled={isRetrying}
            className="bg-gradient-to-r from-primary to-accent text-white border-0 hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            {isRetrying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando novamente...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Gerar Novamente
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}