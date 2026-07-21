"use client"
export const dynamic = 'force-dynamic'

import { useState, useEffect } from "react"
import { motion, AnimatePresence, Variants } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { LoadingSkeleton } from "@/components/ui/states"
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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowModal(false) }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
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
    const today = new Date().toISOString().split('T')[0]
    const previousHabits = [...habits]
    
    // Optimistic UI update
    setHabits(habits.map(h => {
      if (h.id === id) {
        const completedToday = h.last_completed_at?.startsWith(today)
        if (completedToday) {
          return { ...h, last_completed_at: null, streak_count: Math.max(0, h.streak_count - 1) }
        } else {
          return { ...h, last_completed_at: new Date().toISOString(), streak_count: h.streak_count + 1 }
        }
      }
      return h
    }))
    
    // Background sync
    const res = await logHabitCompletion(id)
    if (!res.success || !res.data) {
      setHabits(previousHabits)
      showToast(res.error || "Failed to log habit completion")
    } else {
      // Sync perfectly with backend truth
      setHabits(current => current.map(h => {
        if (h.id === id) {
          return { 
            ...h, 
            streak_count: res.data!.streak, 
            last_completed_at: res.data!.status === 'added' ? new Date().toISOString() : null 
          }
        }
        return h
      }))
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

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-[#2a2a2a] rounded-2xl p-6 w-full max-w-md mx-4 border border-[#3a3a3a] shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-playfair text-2xl font-bold text-white">New Habit</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <form onSubmit={handleCreateHabit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">Habit Name</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl text-white px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:border-[#EF5B4B] focus:ring-1 focus:ring-[#EF5B4B]" 
                    value={newHabitName} 
                    onChange={(e) => setNewHabitName(e.target.value)} 
                    placeholder="e.g. Drink 2L Water"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">Frequency</label>
                  <select 
                    className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl text-white px-4 py-2.5 focus:outline-none focus:border-[#EF5B4B] focus:ring-1 focus:ring-[#EF5B4B]"
                    value={newHabitFreq}
                    onChange={(e) => setNewHabitFreq(e.target.value)}
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" className="bg-transparent border border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a] rounded-xl px-6 py-2.5 transition-colors flex-1" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="bg-[#EF5B4B] hover:bg-[#d94a3a] text-white rounded-xl px-6 py-2.5 font-medium transition-colors flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Habit"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <div className="bg-[var(--card-bg)] rounded-2xl p-8 text-center border border-[var(--border-color)]">
          <p className="text-[var(--text-secondary)] mb-2">Failed to load data</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-[var(--accent-primary)] text-white px-4 py-2 rounded-full text-sm"
          >
            Retry
          </button>
        </div>
      ) : habits.length === 0 ? (
        <div className="bg-[var(--card-bg)] rounded-2xl p-8 text-center border border-[var(--border-color)]">
          <p className="text-[var(--text-secondary)] mb-4">
            No habits tracked
          </p>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[var(--accent-primary)] text-white px-6 py-2 rounded-full inline-block"
          >
            Add Habit
          </button>
        </div>
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
                    const todayDay = (new Date().getDay() + 6) % 7; // Mon=0, Sun=6
                    const effectiveToday = isCompletedToday ? todayDay : todayDay - 1;
                    const isActive = i <= effectiveToday && (effectiveToday - i) < habit.streak_count;

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
                  {['M','T','W','T','F','S','S'].map((day, i) => (
                    <span key={i}>{day}</span>
                  ))}
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
