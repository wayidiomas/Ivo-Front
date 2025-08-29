import { useState } from 'react'

interface UseAIRequestOptions {
  timeout?: number // Default 3 minutes
  onSuccess?: (data: any) => void
  onError?: (error: any, errorType: 'timeout' | 'generation' | 'server') => void
}

interface AIRequestState {
  isLoading: boolean
  error: string | null
  errorType: 'timeout' | 'generation' | 'server' | null
  data: any
}

export function useAIRequest<T>(options: UseAIRequestOptions = {}) {
  const { timeout = 180000, onSuccess, onError } = options // 3 minutes default
  
  const [state, setState] = useState<AIRequestState>({
    isLoading: false,
    error: null,
    errorType: null,
    data: null
  })

  const executeRequest = async (requestFn: () => Promise<T>) => {
    setState({ isLoading: true, error: null, errorType: null, data: null })
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)
    
    try {
      const response = await Promise.race([
        requestFn(),
        new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('TIMEOUT')), timeout)
        })
      ])
      
      clearTimeout(timeoutId)
      setState({ isLoading: false, error: null, errorType: null, data: response })
      onSuccess?.(response)
      
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      
      let errorType: 'timeout' | 'generation' | 'server' = 'generation'
      let errorMessage = 'Erro na geração de conteúdo'
      
      if (error instanceof Error) {
        if (error.message === 'TIMEOUT' || error.name === 'AbortError') {
          errorType = 'timeout'
          errorMessage = 'Timeout na geração - tentativa de 3 minutos excedida'
        } else if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
          errorType = 'server'
          errorMessage = 'Erro interno do servidor'
        } else if (error.message.includes('400') || error.message.includes('Bad Request')) {
          errorType = 'generation'
          errorMessage = 'Erro na validação dos dados enviados'
        }
      }
      
      setState({ isLoading: false, error: errorMessage, errorType, data: null })
      onError?.(error, errorType)
      
      throw error
    }
  }

  const reset = () => {
    setState({ isLoading: false, error: null, errorType: null, data: null })
  }

  return {
    ...state,
    executeRequest,
    reset
  }
}