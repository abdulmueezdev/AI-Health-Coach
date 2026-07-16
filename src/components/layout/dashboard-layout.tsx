"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { 
  LayoutDashboard, 
  Utensils, 
  Dumbbell, 
  CheckCircle, 
  LineChart, 
  MessageSquare, 
  Settings 
} from "lucide-react"

import { cn } from "@/lib/utils"

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Meals", href: "/meals", icon: Utensils },
  { name: "Workouts", href: "/workouts", icon: Dumbbell },
  { name: "Habits", href: "/habits", icon: CheckCircle },
  { name: "Progress", href: "/progress", icon: LineChart },
  { name: "Coach", href: "/coach", icon: MessageSquare },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  insightPanel?: React.ReactNode
}

export function DashboardLayout({ children, insightPanel }: DashboardLayoutProps) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-canvas text-text-primary selection:bg-accent-primary selection:text-white">
      {/* Sidebar: ~80px icon-only nav rail */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[80px] flex-col items-center border-r border-gray-200/50 bg-sidebar py-8 sm:flex shadow-sm">
        <Link href="/dashboard" className="mb-12 flex h-12 w-12 items-center justify-center rounded-full bg-accent-primary text-white font-fredoka font-bold text-xl hover:scale-105 transition-transform">
          V
        </Link>
        <nav className="flex flex-1 flex-col items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "group relative flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200",
                  isActive ? "bg-accent-primary text-white shadow-md" : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"
                )}
                title={item.name}
              >
                <item.icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                {/* Active Indicator Pill - Optional, currently using full background */}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto">
          <Link 
            href="/settings"
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200",
              pathname === "/settings" ? "bg-accent-primary text-white shadow-md" : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"
            )}
            title="Settings"
          >
            <Settings className="h-6 w-6" />
          </Link>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center overflow-x-auto hide-scrollbar border-t border-gray-200 bg-sidebar sm:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex w-full min-w-max px-2">
          {[...navItems, { name: "Settings", href: "/settings", icon: Settings }].map((item) => {
            const isActive = pathname === item.href
            return (
              <Link 
                key={item.name} 
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center p-2 min-w-[72px] min-h-[44px] transition-colors",
                  isActive ? "text-accent-primary" : "text-text-secondary hover:text-text-primary"
                )}
              >
                <item.icon className="h-5 w-5 mb-1" strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className={cn(
        "flex-1 overflow-y-auto pt-6 pb-24 sm:pt-8 sm:pb-8 sm:pl-[80px] transition-all duration-300",
        insightPanel ? "lg:pr-[360px]" : ""
      )}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {children}

          {/* Mobile Insight Panel Accordion */}
          {insightPanel && (
            <div className="mt-8 block lg:hidden">
              <details className="group rounded-2xl bg-panel-accent/30 border border-panel-accent/20 backdrop-blur-sm overflow-hidden mb-8">
                <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-playfair text-lg font-bold outline-none">
                  <span>AI Insights & Details</span>
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="p-4 pt-0">
                  {insightPanel}
                </div>
              </details>
            </div>
          )}
        </div>
      </main>

      {/* Insight Panel: ~360px, tinted #C3DEDD */}
      {insightPanel && (
        <aside className="fixed inset-y-0 right-0 z-30 hidden w-[360px] flex-col border-l border-panel-accent/20 bg-panel-accent/30 lg:flex backdrop-blur-sm">
          <div className="h-full overflow-y-auto p-6">
            {insightPanel}
          </div>
        </aside>
      )}
    </div>
  )
}
