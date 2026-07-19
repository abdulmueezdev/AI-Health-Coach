"use client"
export const dynamic = 'force-dynamic'

import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingDown } from "lucide-react"
import { useState } from "react"
import { EmptyState, LoadingSkeleton, ErrorState } from "@/components/ui/states"

export default function ProgressPage() {
  const [loading] = useState(false)
  const [error] = useState<string | null>(null)
  const [isEmpty] = useState(false)

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-playfair text-4xl font-bold mb-2">Progress</h1>
          <p className="text-text-secondary font-sans text-lg">
            Visualize your journey and milestones.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Log Weight
        </Button>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : isEmpty ? (
        <EmptyState 
          title="No progress data" 
          description="Log your weight to start visualizing your journey and milestones."
          actionText="Log Weight"
          onAction={() => console.log('Log weight clicked')}
        />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="font-bold text-xl mb-1">Weight Trend</h3>
                <div className="flex items-center gap-2">
                  <span className="font-fredoka text-3xl font-bold text-text-primary">184.2 <span className="text-lg font-sans text-text-secondary">lbs</span></span>
                  <span className="flex items-center text-sm font-medium text-status-positive bg-status-positive/10 px-2 py-1 rounded-full">
                    <TrendingDown className="w-4 h-4 mr-1" /> -4.2 lbs
                  </span>
                </div>
              </div>
              <div className="flex bg-[var(--bg-sidebar)] border border-[var(--border-color)] p-1 rounded-lg">
                <button className="px-4 py-1.5 text-sm font-medium rounded-md text-text-secondary hover:text-text-primary transition-colors">1W</button>
                <button className="px-4 py-1.5 text-sm font-medium rounded-md bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm text-[var(--text-primary)]">1M</button>
                <button className="px-4 py-1.5 text-sm font-medium rounded-md text-text-secondary hover:text-text-primary transition-colors">3M</button>
              </div>
            </div>

            {/* Pure CSS SVG Chart Representation */}
            <div className="relative w-full h-64 bg-[var(--bg-sidebar)] rounded-xl overflow-hidden p-4 border border-[var(--border-color)]">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <motion.path 
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  d="M 0 20 L 25 25 L 50 35 L 75 45 L 100 55" 
                  fill="none" 
                  stroke="#3FAE71" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                
                {/* Data points */}
                <circle cx="0" cy="20" r="1.5" fill="#3FAE71" />
                <circle cx="25" cy="25" r="1.5" fill="#3FAE71" />
                <circle cx="50" cy="35" r="1.5" fill="#3FAE71" />
                <circle cx="75" cy="45" r="1.5" fill="#3FAE71" />
                <circle cx="100" cy="55" r="1.5" fill="#3FAE71" />
              </svg>
              
              <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs text-text-secondary font-medium">
                <span>WK 1</span>
                <span>WK 2</span>
                <span>WK 3</span>
                <span>WK 4</span>
                <span>NOW</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      )}
    </DashboardLayout>
  )
}
