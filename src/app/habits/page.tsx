"use client"

import { useState } from "react"
import { motion, Variants } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export default function HabitsPage() {
  const [habits, setHabits] = useState([
    { id: 1, name: "Drink 3L Water", streak: 12, completed: true, color: "bg-blue-500", light: "bg-blue-50" },
    { id: 2, name: "Read 10 pages", streak: 4, completed: false, color: "bg-indigo-500", light: "bg-indigo-50" },
    { id: 3, name: "Stretch", streak: 1, completed: false, color: "bg-teal-500", light: "bg-teal-50" },
  ])

  const toggleHabit = (id: number) => {
    setHabits(habits.map(h => {
      if (h.id === id) {
        return { ...h, completed: !h.completed, streak: h.completed ? h.streak - 1 : h.streak + 1 }
      }
      return h
    }))
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item: Variants = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-zodiak text-4xl font-bold mb-2">Habits</h1>
          <p className="text-text-secondary font-sans text-lg">
            Build consistency with daily tracking.
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" /> Add Habit
        </Button>
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {habits.map((habit) => (
          <motion.div variants={item} key={habit.id}>
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-xl mb-1">{habit.name}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-text-secondary">Current Streak:</span>
                      <span className="font-comico font-bold text-accent-primary">{habit.streak} {habit.streak === 1 ? 'day' : 'days'}</span>
                    </div>
                  </div>
                  
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleHabit(habit.id)}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm",
                      habit.completed ? habit.color + " text-white" : habit.light + " text-gray-400 border border-gray-200"
                    )}
                  >
                    <Check className="w-6 h-6" strokeWidth={habit.completed ? 3 : 2} />
                  </motion.button>
                </div>
                
                <div className="mt-6 flex gap-1 h-12">
                  {[...Array(7)].map((_, i) => {
                    const isActive = i < 4 || (i === 4 && habit.completed);
                    return (
                      <div 
                        key={i} 
                        className={cn(
                          "flex-1 rounded-sm transition-colors",
                          isActive ? habit.color : "bg-gray-100"
                        )} 
                        title={isActive ? "Completed" : "Missed"}
                      />
                    )
                  })}
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold text-text-secondary uppercase tracking-tighter">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </DashboardLayout>
  )
}
