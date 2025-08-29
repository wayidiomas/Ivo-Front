'use client'

import { QueryProvider } from './query-provider'
import { ThemeProvider } from './theme-provider'
import { Toaster } from './toaster'
import { AuthProvider } from '@/lib/contexts/auth-context'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="ivo-system"
      themes={["light", "dark", "ivo-system"]}
      enableSystem={false}
      disableTransitionOnChange
    >
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  )
}