"use client"

import { Header } from "@/components/layout/header"
import { Sidebar } from "@/components/layout/sidebar"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { useState } from "react"
import { useRequireAuth } from "@/lib/contexts/auth-context"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { isLoading } = useRequireAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="text-sm text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex min-h-screen relative">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 z-40 ${
        isCollapsed ? 'md:w-16' : 'md:w-56'
      }`}>
        <div className="flex flex-col flex-grow border-r bg-card overflow-y-auto">
          <Sidebar isCollapsed={isCollapsed} onCollapsedChange={setIsCollapsed} />
        </div>
      </aside>

      {/* External Toggle Button - Connected Tab */}
      <div className={`hidden md:block fixed top-20 z-50 transition-all duration-300 ${
        isCollapsed ? 'left-12' : 'left-52'
      }`}>
        <Button
          onClick={() => setIsCollapsed(!isCollapsed)}
          variant="ghost"
          size="sm"
          className="h-10 w-8 rounded-l-none rounded-r-md bg-card hover:bg-accent border border-border shadow-sm hover:shadow-md"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Main content area */}
      <div className={`flex flex-col flex-1 transition-all duration-300 ${
        isCollapsed ? 'md:pl-16' : 'md:pl-56'
      }`}>
        <Header />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}