import { cn } from "@/lib/utils"

interface IvoLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeMap = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12', 
  lg: 'w-16 h-16',
  xl: 'w-20 h-20'
}

export function IvoLogo({ className, size = 'md' }: IvoLogoProps) {
  return (
    <div className={cn(
      "inline-flex items-center justify-center rounded-2xl shadow-lg",
      "bg-gradient-to-r from-primary to-accent",
      sizeMap[size],
      className
    )}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-3/5 h-3/5 fill-white"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Letter I */}
        <rect x="15" y="20" width="8" height="60" />
        <rect x="10" y="20" width="18" height="8" />
        <rect x="10" y="72" width="18" height="8" />
        
        {/* Letter V */}
        <polygon points="35,20 42,20 50,65 58,20 65,20 52,80 48,80" />
        
        {/* Letter O */}
        <path d="M 75 20 
                 Q 90 20 90 35
                 L 90 65
                 Q 90 80 75 80
                 Q 60 80 60 65
                 L 60 35
                 Q 60 20 75 20
                 Z
                 M 75 28
                 Q 68 28 68 35
                 L 68 65  
                 Q 68 72 75 72
                 Q 82 72 82 65
                 L 82 35
                 Q 82 28 75 28
                 Z" />
      </svg>
    </div>
  )
}