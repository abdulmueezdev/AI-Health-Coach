"use client"

import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Play, Calendar } from "lucide-react"

export default function WorkoutsPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-zodiak text-4xl font-bold mb-2">Workouts</h1>
          <p className="text-text-secondary font-sans text-lg">
            Plan and track your exercise routines.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <Card className="lg:col-span-2 bg-gradient-to-br from-panel-accent/40 to-panel-accent/10 border-panel-accent/30 overflow-hidden relative">
          <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -z-10 translate-x-1/3 translate-y-1/3"></div>
          <CardContent className="p-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 text-sm font-bold text-teal-800 mb-6">
              <Calendar className="w-4 h-4" /> Today&apos;s Plan
            </div>
            <h2 className="font-zodiak text-3xl font-bold mb-2">Upper Body Power</h2>
            <p className="text-text-secondary mb-8 max-w-md">
              Focus on chest, back, and shoulders. Estimated time: 45 minutes.
            </p>
            <Button className="gap-2 px-8">
              <Play className="w-4 h-4 fill-current" /> Start Workout
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4">Weekly Goal</h3>
            <div className="flex items-end gap-2 mb-2">
              <span className="font-comico text-4xl font-bold text-accent-primary">3</span>
              <span className="text-text-secondary mb-1">/ 5 days</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
              <div className="bg-accent-primary h-2 rounded-full" style={{ width: '60%' }}></div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-text-secondary">
              <div className="text-accent-primary">M</div>
              <div className="text-accent-primary">T</div>
              <div className="text-accent-primary">W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
              <div>S</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="font-zodiak text-2xl font-bold mb-6">Recent Activity</h2>
      
      <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
        {[1, 2].map((i) => (
          <motion.div variants={item} key={i}>
            <Card className="hover:border-panel-accent/50 transition-colors">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg">Full Body HIIT</h4>
                  <p className="text-sm text-text-secondary mt-1">2 days ago • 30 minutes • 320 kcal</p>
                </div>
                <Button variant="outline" size="sm" className="bg-white">
                  Repeat
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </DashboardLayout>
  )
}
