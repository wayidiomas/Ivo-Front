'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Zap, Brain, Stars } from 'lucide-react'

interface AiGenerateButtonProps {
  onClick?: () => void
  disabled?: boolean
  isLoading?: boolean
}

export function AiGenerateButton({ onClick, disabled = false, isLoading = false }: AiGenerateButtonProps) {
  const [isAnimating, setIsAnimating] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [sparklePositions, setSparklePositions] = useState<Array<{x: number, y: number, delay: number}>>([])

  // Generate random sparkle positions
  useEffect(() => {
    const positions = Array.from({ length: 4 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }))
    setSparklePositions(positions)
  }, [])

  // Auto animate and expand every 4 seconds
  useEffect(() => {
    if (!isLoading && !disabled) {
      const interval = setInterval(() => {
        setIsAnimating(true)
        setIsExpanded(true)
        setTimeout(() => {
          setIsAnimating(false)
          setIsExpanded(false)
        }, 3000)
      }, 6000)
      return () => clearInterval(interval)
    }
  }, [isLoading, disabled])

  const handleClick = () => {
    if (!disabled && !isLoading) {
      setIsAnimating(true)
      setIsExpanded(true)
      setTimeout(() => {
        onClick?.()
      }, 1000)
    }
  }

  return (
    <div className="relative flex-shrink-0" style={{ maxWidth: '160px', overflow: 'hidden' }}>
      {/* CSS Animation Styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-6px) rotate(180deg); }
        }
        
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0) rotate(0deg); }
          50% { opacity: 1; transform: scale(1) rotate(180deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(20, 184, 166, 0.4); }
          70% { box-shadow: 0 0 0 20px rgba(20, 184, 166, 0); }
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes expand {
          0% { width: 40px; border-radius: 20px; }
          100% { width: 160px; border-radius: 20px; }
        }
        
        .ai-button {
          background: linear-gradient(
            45deg,
            hsl(var(--primary)),
            hsl(var(--accent)), 
            #8B5CF6,
            hsl(var(--primary))
          );
          background-size: 300% 300%;
          animation: gradient-shift 3s ease infinite;
          transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          max-width: 100%;
          box-sizing: border-box;
        }
        
        .ai-button:hover {
          background: linear-gradient(
            45deg,
            #ef4444,
            #dc2626,
            #b91c1c,
            #ef4444
          );
          background-size: 300% 300%;
          animation: gradient-shift 1.5s ease infinite;
        }
        
        .ai-button.animating {
          animation: gradient-shift 0.8s ease infinite, pulse-glow 2s ease-out;
        }
        
        .ai-button.expanded {
          width: 160px !important;
        }
        
        .ai-button.collapsed {
          width: 40px !important;
        }
        
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        
        .shimmer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.3),
            transparent
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        
        .sparkle-container {
          pointer-events: none;
        }
        
        .sparkle {
          position: absolute;
          color: rgba(255, 255, 255, 0.9);
          animation: sparkle 1.8s ease-in-out infinite;
        }
      `}</style>

      {/* Floating Sparkles - only when expanded */}
      {isExpanded && (
        <div className="absolute inset-0 sparkle-container">
          {sparklePositions.map((pos, i) => (
            <div
              key={i}
              className="sparkle"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                animationDelay: `${pos.delay}s`,
                animationDuration: `${1.5 + Math.random()}s`
              }}
            >
              {i % 4 === 0 && <Sparkles className="w-2 h-2" />}
              {i % 4 === 1 && <Stars className="w-1.5 h-1.5" />}
              {i % 4 === 2 && <Zap className="w-2 h-2" />}
              {i % 4 === 3 && <Brain className="w-1.5 h-1.5" />}
            </div>
          ))}
        </div>
      )}

      {/* Main Button */}
      <Button
        onClick={handleClick}
        disabled={disabled || isLoading}
        className={`
          ai-button
          ${isAnimating ? 'animating' : ''}
          ${isExpanded ? 'expanded' : 'collapsed'}
          ${isLoading || isAnimating ? 'shimmer' : ''}
          relative text-white border-0 font-semibold text-sm h-10 px-0
          transition-all duration-600 ease-out transform hover:scale-105 active:scale-95
          shadow-lg hover:shadow-xl rounded-full
          disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
          flex items-center justify-center overflow-hidden
        `}
        style={{ 
          width: isExpanded ? '160px' : '40px',
          minWidth: isExpanded ? '160px' : '40px'
        }}
      >
        {/* Icon with Float Animation */}
        <div className={`relative flex-shrink-0 ${isExpanded ? 'mr-2' : ''}`}>
          <div style={{ animation: 'float 3s ease-in-out infinite' }}>
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </div>
        </div>

        {/* Button Text - only show when expanded */}
        <span 
          className={`relative z-10 transition-opacity duration-300 whitespace-nowrap ${
            isExpanded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            width: isExpanded ? 'auto' : '0px',
            overflow: 'hidden'
          }}
        >
          {isLoading ? 'Gerando...' : 'Gere com a IVO'}
        </span>

        {/* Animated Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 rounded-full" />
        
        {/* Pulse Effect */}
        {(isAnimating || isLoading) && (
          <div className="absolute inset-0 bg-white/5 animate-pulse rounded-full" />
        )}
      </Button>

    </div>
  )
}