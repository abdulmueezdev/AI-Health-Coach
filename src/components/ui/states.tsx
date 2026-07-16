import React from "react"

export function EmptyState({ 
  title, 
  description, 
  actionText, 
  onAction 
}: { 
  title: string
  description: string
  actionText?: string
  onAction?: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-canvas rounded-[24px] border border-white/60 text-center min-h-[300px] w-full">
      <h3 className="font-playfair text-2xl font-bold text-brand-primary mb-3">{title}</h3>
      <p className="font-sans text-brand-secondary mb-6 max-w-md mx-auto">{description}</p>
      {actionText && onAction && (
        <button 
          onClick={onAction} 
          className="bg-accent-primary text-white font-sans font-medium px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}

export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 w-full">
      <div className="h-40 bg-white/50 rounded-[24px] w-full border border-white/30"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-32 bg-white/50 rounded-[24px] border border-white/30"></div>
        <div className="h-32 bg-white/50 rounded-[24px] border border-white/30"></div>
        <div className="h-32 bg-white/50 rounded-[24px] border border-white/30"></div>
      </div>
    </div>
  )
}

export function ErrorState({ 
  message, 
  onRetry 
}: { 
  message: string
  onRetry?: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50/50 rounded-[24px] border border-red-100 text-center w-full min-h-[200px]">
      <h3 className="font-playfair text-xl font-bold text-red-800 mb-2">Something went wrong</h3>
      <p className="font-sans text-red-600 mb-6">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="bg-red-100 text-red-800 font-sans font-medium px-5 py-2 rounded-full hover:bg-red-200 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
