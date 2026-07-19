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
    <div className="flex flex-col items-center justify-center p-12 bg-[var(--bg-canvas)] rounded-[24px] border border-[var(--border-color)] text-center min-h-[300px] w-full">
      <h3 className="font-playfair text-2xl font-bold text-[var(--text-primary)] mb-3">{title}</h3>
      <p className="font-sans text-[var(--text-secondary)] mb-6 max-w-md mx-auto">{description}</p>
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
      <div className="h-40 bg-[var(--card-bg)] rounded-[24px] w-full border border-[var(--border-color)]"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="h-32 bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)]"></div>
        <div className="h-32 bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)]"></div>
        <div className="h-32 bg-[var(--card-bg)] rounded-[24px] border border-[var(--border-color)]"></div>
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
    <div className="flex flex-col items-center justify-center p-8 bg-red-500/10 rounded-[24px] border border-red-500/20 text-center w-full min-h-[200px]">
      <h3 className="font-playfair text-xl font-bold text-red-600 dark:text-red-400 mb-2">Something went wrong</h3>
      <p className="font-sans text-red-500 dark:text-red-300 mb-6">{message}</p>
      {onRetry && (
        <button 
          onClick={onRetry} 
          className="bg-red-500/20 text-red-600 dark:text-red-400 font-sans font-medium px-5 py-2 rounded-full hover:bg-red-500/30 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  )
}
