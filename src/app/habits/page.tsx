"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyState, LoadingSkeleton, ErrorState } from "@/components/ui/states"
import { getHabits, logHabitCompletion, createHabit } from "@/server/actions/habits"
import { Habit } from "@/types/database"

const THEMES = [
  { color: "bg-blue-500", light: "bg-blue-50" },
  { color: "bg-indigo-500", light: "bg-indigo-50" },
  { color: "bg-teal-500", light: "bg-teal-50" },
  { color: "bg-orange-500", light: "bg-orange-50" },
  { color: "bg-green-500", light: "bg-green-50" },
]

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newHabitName, setNewHabitName] = useState("")
  const [newHabitFreq, setNewHabitFreq] = useState("daily")
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  async function loadHabits() {
    const res = await getHabits()
    if (res.success && res.data) {
      setHabits(res.data)
    } else {
      setError(res.error || "Failed to load habits")
    }
    setLoading(false)
  }

  useEffect(() => {
    loadHabits()
  }, [])

  const handleCreateHabit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitName || !newHabitFreq) return
    setIsSubmitting(true)
    try {
      const res = await createHabit({
        name: newHabitName,
        frequency: newHabitFreq
      })
      if (res.success) {
        setShowModal(false)
        setNewHabitName("")
        setNewHabitFreq("daily")
        loadHabits()
      } else {
        alert("Failed to create habit")
      }
    } catch {
      alert("Error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 5000)
  }
  


  const toggleHabit = async (id: string) => {
    // Save previous state for revert
    const previousHabits = [...habits]
    
    // Optimistic UI update
    setHabits(habits.map(h => {
      if (h.id === id) {
        return { ...h, last_completed_at: new Date().toISOString(), streak_count: h.streak_count + 1 }
      }
      return h
    }))
    
    // Background sync
    const res = await logHabitCompletion(id)
    if (!res.success) {
      setHabits(previousHabits)
      showToast(res.error || "Failed to log habit completion")
    }
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
      <div className="relative">
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className="absolute top-0 left-1/2 z-50 bg-accent-primary/90 backdrop-blur text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium whitespace-nowrap"
            >
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex justify-between items-end mb-8 mt-4">
        <div>
          <h1 className="font-playfair text-4xl font-bold mb-2">Habits</h1>
          <p className="text-text-secondary font-sans text-lg">
            Build consistency with daily tracking.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Add Habit
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
          >
            <div className="p-6 border-b border-[var(--border-color)] bg-[var(--bg-sidebar)] flex items-center justify-between">
              <h2 className="font-playfair text-2xl font-bold">New Habit</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleCreateHabit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Habit Name</label>
                  <input 
                    type="text" 
                    className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary" 
                    value={newHabitName} 
                  onChange={(e) => setNewHabitName(e.target.value)} 
                  placeholder="e.g. Drink 2L Water"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Frequency</label>
                  <select 
                    className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
                    value={newHabitFreq}
                  onChange={(e) => setNewHabitFreq(e.target.value)}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Habit"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : habits.length === 0 ? (
        <EmptyState 
          title="No habits tracked" 
          description="Build consistency by tracking your daily goals. Add your first habit to begin."
          actionText="Add Habit"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {habits.map((habit, index) => {
            const theme = THEMES[index % THEMES.length]
            const isCompletedToday = habit.last_completed_at && new Date(habit.last_completed_at).toDateString() === new Date().toDateString()
            
            return (
          <motion.div variants={item} key={habit.id}>
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-xl mb-1">{habit.name}</h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-text-secondary">Current Streak:</span>
                      <span className="font-fredoka font-bold text-accent-primary">{habit.streak_count} {habit.streak_count === 1 ? 'day' : 'days'}</span>
                    </div>
                  </div>
                  
                  <motion.button 
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleHabit(habit.id)}
                    disabled={!!isCompletedToday}
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-colors shadow-sm",
                      isCompletedToday ? theme.color + " text-white cursor-default" : theme.light + " text-[var(--text-secondary)] border border-[var(--border-color)] dark:bg-[var(--bg-panel-accent)]/20"
                    )}
                  >
                    <Check className="w-6 h-6" strokeWidth={isCompletedToday ? 3 : 2} />
                  </motion.button>
                </div>
                
                <div className="mt-6 flex gap-1 h-12">
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = new Date()
                    d.setDate(d.getDate() - (6 - i))
                    
                    // Simple mock for past days. For a real app we'd fetch habit_logs, but we use streak_count here
                    const daysAgo = 6 - i;
                    const isActive = (isCompletedToday && daysAgo < habit.streak_count) || (!isCompletedToday && daysAgo < habit.streak_count && daysAgo > 0);

                    return (
                      <div 
                        key={i} 
                        className={cn(
                          "flex-1 rounded-sm transition-colors",
                          isActive ? theme.color : "bg-[var(--border-color)]"
                        )} 
                        title={isActive ? "Completed" : "Missed"}
                      />
                    )
                  })}
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold text-text-secondary uppercase tracking-tighter">
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = new Date()
                    d.setDate(d.getDate() - (6 - i))
                    return <span key={i}>{d.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          )})}
        </motion.div>
      )}
    </DashboardLayout>
  )
}
