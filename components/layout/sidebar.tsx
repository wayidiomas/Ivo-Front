'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { 
  BookOpen, 
  GraduationCap, 
  Home, 
  Menu, 
  Settings, 
  Users,
  FileText,
  BarChart3,
  Lightbulb,
  HelpCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useTheme } from "next-themes"
import { useState } from "react"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Courses",
    href: "/courses",
    icon: GraduationCap,
  },
  {
    name: "Books",
    href: "/books", 
    icon: BookOpen,
  },
  {
    name: "Units",
    href: "/units",
    icon: FileText,
  },
  {
    name: "Users",
    href: "/users",
    icon: Users,
  },
  {
    name: "Vocabulary",
    href: "/vocabulary",
    icon: Sparkles,
    comingSoon: true,
  },
]

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  isCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
}

export function Sidebar({ className, isCollapsed: externalCollapsed, onCollapsedChange }: SidebarProps) {
  const pathname = usePathname()
  const { theme } = useTheme()
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  
  // Use external collapsed state if provided, otherwise use internal
  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed
  const setIsCollapsed = onCollapsedChange || setInternalCollapsed
  
  // Use crisp logo for dark and ivo-system themes, for-white logo for light theme
  const logoSrc = (theme === 'light') 
    ? '/assets/logos/way_full_logo_transparent.png'  // for-white version
    : '/assets/logos/way_logo_crisp.png'             // crisp version
    
  const iconSrc = (theme === 'light') 
    ? '/assets/logos/way_app_icon_transparent.png'  // for-white version
    : '/assets/logos/way_icon_crisp.png'             // crisp version

  return (
    <div className={cn("pb-12 transition-all duration-300", className)}>
      <div className="space-y-4 py-4">
        <div className={cn("px-3 py-2", isCollapsed && "px-2")}>
          {/* Logo Section */}
          <div className="flex items-center justify-center mb-6 px-1">
            {isCollapsed ? (
              <Image 
                src={iconSrc}
                alt="WAY"
                width={32}
                height={32}
                className="h-8 w-8"
                priority
              />
            ) : (
              <Image 
                src={logoSrc}
                alt="WAY"
                width={160}
                height={70}
                className="h-14 w-auto max-w-full"
                priority
              />
            )}
          </div>
          
          
          {/* Navigation */}
          <div className="space-y-1">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full transition-all duration-200 group relative",
                  isCollapsed ? "justify-center px-2" : "justify-start",
                  item.comingSoon && "cursor-not-allowed opacity-60"
                )}
                asChild={!item.comingSoon}
                disabled={item.comingSoon}
                onClick={item.comingSoon ? (e) => e.preventDefault() : undefined}
              >
                {item.comingSoon ? (
                  <div className="flex items-center w-full">
                    <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                    {!isCollapsed && (
                      <>
                        <span className="transition-opacity duration-200 flex-1">
                          {item.name}
                        </span>
                        <span className="ml-2 text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                          Em Breve
                        </span>
                      </>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                        {item.name} - Em Breve
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href={item.href}>
                    <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                    {!isCollapsed && (
                      <span className="transition-opacity duration-200">
                        {item.name}
                      </span>
                    )}
                    {isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-sm rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                        {item.name}
                      </div>
                    )}
                  </Link>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface MobileSidebarProps {
  children: React.ReactNode
}

export function MobileSidebar({ children }: MobileSidebarProps) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0">
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <Sidebar />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}