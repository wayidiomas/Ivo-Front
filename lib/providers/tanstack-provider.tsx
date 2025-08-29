"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { useState, type ReactNode } from "react"

interface TanStackProviderProps {
  children: ReactNode
}

export function TanStackProvider({ children }: TanStackProviderProps) {
  const [queryClient] = useState(() => 
    new QueryClient({
      defaultOptions: {
        queries: {
          // Stale time para cache das queries
          staleTime: 5 * 60 * 1000, // 5 minutos
          // Cache time 
          gcTime: 10 * 60 * 1000, // 10 minutos (era cacheTime)
          // Retry configuration
          retry: (failureCount, error: any) => {
            // Não retry em erros 404 ou 403
            if (error?.response?.status === 404 || error?.response?.status === 403) {
              return false
            }
            // Máximo 3 tentativas para outros erros
            return failureCount < 3
          },
          retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          // Refetch on window focus apenas em produção
          refetchOnWindowFocus: process.env.NODE_ENV === 'production',
        },
        mutations: {
          // Retry para mutations
          retry: 1,
          retryDelay: 1000,
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools 
        initialIsOpen={false} 
        position="bottom"
        buttonPosition="bottom-right"
      />
    </QueryClientProvider>
  )
}