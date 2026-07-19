"use client"
export const dynamic = 'force-dynamic'

import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Play, Calendar, X } from "lucide-react"
import { useEffect, useState } from "react"
import { LoadingSkeleton } from "@/components/ui/states"
import { getWorkouts, createWorkout } from "@/server/actions/workouts"
import { Workout } from "@/types/database"

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newType, setNewType] = useState("")
  const [newDuration, setNewDuration] = useState("")

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const last7DaysWorkouts = workouts.filter(w => new Date(w.date) >= sevenDaysAgo)
  const uniqueDaysCount = new Set(last7DaysWorkouts.map(w => new Date(w.date).toDateString())).size
  const weeklyProgress = Math.min(uniqueDaysCount, 5)

  const todayStr = new Date().toDateString()
  const hasWorkoutToday = workouts.some(w => new Date(w.date).toDateString() === todayStr)

  async function loadWorkouts() {
    const res = await getWorkouts()
    if (res.success && res.data) {
      setWorkouts(res.data)
    } else {
      setError(res.error || "Failed to load workouts")
    }
    setLoading(false)
  }

  useEffect(() => {
    loadWorkouts()
  }, [])

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newType || !newDuration) return
    
    if (hasWorkoutToday) {
      alert("You already logged a workout today.")
      setShowModal(false)
      return
    }

    setIsSubmitting(true)
    try {
      const res = await createWorkout({
        type: newType,
        duration_min: parseInt(newDuration, 10),
        date: new Date().toISOString(),
        exercises: [],
        intensity: 'Medium',
        notes: null
      })
      if (res.success) {
        setShowModal(false)
        setNewType("")
        setNewDuration("")
        loadWorkouts()
      } else {
        alert("Failed to log workout")
      }
    } catch {
      alert("Error")
    } finally {
      setIsSubmitting(false)
    }
  }

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
          <h1 className="font-playfair text-4xl font-bold mb-2">Workouts</h1>
          <p className="text-text-secondary font-sans text-lg">
            Plan and track your exercise routines.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> New Plan
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[var(--card-bg)] rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative border border-[var(--border-color)]"
          >
            <div className="p-6 border-b border-[var(--border-color)] flex items-center justify-between">
              <h2 className="font-playfair text-2xl font-bold">New Plan</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePlan} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Workout Type</label>
                <input 
                  type="text" 
                  className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary" 
                  value={newType} 
                  onChange={(e) => setNewType(e.target.value)} 
                  placeholder="e.g. Upper Body Power"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duration (min)</label>
                <input 
                  type="number" 
                  className="w-full h-12 px-4 rounded-xl border border-[var(--border-color)] bg-[var(--bg-sidebar)] text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary" 
                  value={newDuration} 
                  onChange={(e) => setNewDuration(e.target.value)} 
                  placeholder="45"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Plan"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

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
      ) : workouts.length === 0 ? (
        <div className="bg-[var(--card-bg)] rounded-2xl p-8 text-center border border-[var(--border-color)]">
          <p className="text-[var(--text-secondary)] mb-4">
            No workouts yet
          </p>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[var(--accent-primary)] text-white px-6 py-2 rounded-full inline-block"
          >
            Create Workout
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <Card className="lg:col-span-2 bg-gradient-to-br from-panel-accent/40 to-panel-accent/10 border-panel-accent/30 overflow-hidden relative">
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -z-10 translate-x-1/3 translate-y-1/3"></div>
              <CardContent className="p-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--card-bg)]/80 text-sm font-bold text-[var(--text-primary)] mb-6 shadow-sm border border-[var(--border-color)]">
                  <Calendar className="w-4 h-4" /> Latest Plan
                </div>
                <h2 className="font-playfair text-3xl font-bold mb-2">{workouts[0]?.type || "Workout"}</h2>
                <p className="text-text-secondary mb-8 max-w-md">
                  Estimated time: {workouts[0]?.duration_min || 45} minutes. Intensity: {workouts[0]?.intensity || "Medium"}.
                </p>
                <Button className="gap-2 px-8" onClick={async () => {
                  if (hasWorkoutToday) {
                    alert("You already logged a workout today.")
                    return
                  }
                  if (workouts.length > 0) {
                    setIsSubmitting(true)
                    try {
                      const res = await createWorkout({
                        type: workouts[0].type,
                        duration_min: workouts[0].duration_min,
                        date: new Date().toISOString(),
                        exercises: workouts[0].exercises || [],
                        intensity: workouts[0].intensity || 'Medium',
                        notes: null
                      })
                      if (res.success) loadWorkouts()
                    } finally {
                      setIsSubmitting(false)
                    }
                  } else {
                    setShowModal(true)
                  }
                }}>
                  <Play className="w-4 h-4 fill-current" /> {isSubmitting ? "Starting..." : "Start Workout"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Weekly Goal</h3>
                <div className="flex items-end gap-2 mb-2">
                  <span className="font-fredoka text-4xl font-bold text-accent-primary">
                    {weeklyProgress}
                  </span>
                  <span className="text-text-secondary mb-1">/ 5 days</span>
                </div>
                <div className="flex gap-1 h-2 mb-6">
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = new Date()
                    d.setDate(d.getDate() - (6 - i))
                    const hasWorkout = workouts.some(w => new Date(w.date).toDateString() === d.toDateString())
                    return (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-full ${hasWorkout ? 'bg-accent-primary' : 'bg-[var(--border-color)]'}`} 
                      />
                    )
                  })}
                </div>
                <div className="flex justify-between text-[10px] font-bold text-text-secondary uppercase tracking-tighter">
                  {Array.from({ length: 7 }, (_, i) => {
                    const d = new Date()
                    d.setDate(d.getDate() - (6 - i))
                    const hasWorkout = workouts.some(w => new Date(w.date).toDateString() === d.toDateString())
                    return (
                      <span key={i} className={hasWorkout ? "text-accent-primary" : ""}>
                        {d.toLocaleDateString('en-US', { weekday: 'narrow' })}
                      </span>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="font-playfair text-2xl font-bold mb-6">Recent Activity</h2>
          
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {workouts.slice(1).map((workout) => (
              <motion.div variants={item} key={workout.id}>
                <Card className="hover:border-panel-accent/50 transition-colors">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg">{workout.type}</h4>
                      <p className="text-sm text-text-secondary mt-1">{new Date(workout.date).toLocaleDateString()} • {workout.duration_min} minutes</p>
                    </div>
                    <Button variant="outline" className="bg-[var(--card-bg)] border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-panel-accent)]/20 h-9 px-4 text-sm font-medium">
                      Repeat
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </DashboardLayout>
  )
}
