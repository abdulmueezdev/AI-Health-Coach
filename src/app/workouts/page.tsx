"use client"
export const dynamic = 'force-dynamic'

import { motion, AnimatePresence } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Play, Calendar, X } from "lucide-react"
import { useEffect, useState } from "react"
import { LoadingSkeleton } from "@/components/ui/states"
import { getWorkouts, createWorkout } from "@/server/actions/workouts"
import { Workout } from "@/types/database"
import { WorkoutTimer } from "@/components/workout/WorkoutTimer"

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newType, setNewType] = useState("")
  const [newDuration, setNewDuration] = useState("")
  const [newIntensity, setNewIntensity] = useState("Medium")
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null)

  const handleCompleteWorkout = async (actualDurationSeconds: number) => {
    if (!activeWorkout) return;
    
    if (actualDurationSeconds < 60) {
      alert('Workout must be at least 1 minute long.')
      return
    }

    const actualDurationMin = Math.round(actualDurationSeconds / 60);
    const maxDuration = (activeWorkout?.duration_min || 60) + 30;
    const finalDuration = Math.min(actualDurationMin, maxDuration);

    console.log('4. Timer completed, duration:', actualDurationSeconds)
    console.log('5. Creating workout with duration:', finalDuration)
    setIsSubmitting(true);
    try {
      const res = await createWorkout({
        type: activeWorkout.type,
        duration_min: finalDuration,
        date: new Date().toISOString().split('T')[0],
        exercises: activeWorkout.exercises || [],
        intensity: activeWorkout.intensity || 'Medium',
        notes: null
      });
      if (res.success) loadWorkouts();
    } finally {
      setIsSubmitting(false);
      setActiveWorkout(null);
    }
  };

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const last7DaysWorkouts = workouts.filter(w => new Date(w.date) >= sevenDaysAgo)
  const uniqueDaysCount = new Set(last7DaysWorkouts.map(w => new Date(w.date).toDateString())).size
  const weeklyProgress = Math.min(uniqueDaysCount, 5)



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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowModal(false) }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newType || !newDuration) return
    


    setIsSubmitting(true)
    try {
      const res = await createWorkout({
        type: newType,
        duration_min: parseInt(newDuration, 10),
        date: new Date().toISOString().split('T')[0],
        exercises: [],
        intensity: newIntensity,
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
                <h2 className="font-playfair text-2xl font-bold text-white">New Plan</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleCreatePlan} className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">Workout Type</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl text-white px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:border-[#EF5B4B] focus:ring-1 focus:ring-[#EF5B4B]" 
                    value={newType} 
                    onChange={(e) => setNewType(e.target.value)} 
                    placeholder="e.g. Upper Body Power"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">Duration (min)</label>
                  <input 
                    type="number" 
                    className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl text-white px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:border-[#EF5B4B] focus:ring-1 focus:ring-[#EF5B4B]" 
                    value={newDuration} 
                    onChange={(e) => setNewDuration(e.target.value)} 
                    placeholder="45"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">Intensity</label>
                  <select 
                    value={newIntensity} 
                    onChange={(e) => setNewIntensity(e.target.value)}
                    className="bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl text-white px-4 py-2.5 w-full focus:border-[#EF5B4B] focus:ring-1 focus:ring-[#EF5B4B]"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" className="bg-transparent border border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a] rounded-xl px-6 py-2.5 transition-colors flex-1" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="bg-[#EF5B4B] hover:bg-[#d94a3a] text-white rounded-xl px-6 py-2.5 font-medium transition-colors flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save Plan"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeWorkout && (
        <WorkoutTimer
          workoutName={activeWorkout.type}
          estimatedDuration={activeWorkout.duration_min}
          onComplete={handleCompleteWorkout}
          onCancel={() => setActiveWorkout(null)}
        />
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
                <Button className="gap-2 px-8" onClick={() => {
                  console.log('1. Button clicked')
                  // removed hasWorkoutToday check
                  if (workouts.length > 0) {
                    console.log('2. Setting active workout:', workouts[0])
                    console.log('3. Timer opened')
                    setActiveWorkout(workouts[0])
                  } else {
                    console.log('2. Setting active workout (default)')
                    console.log('3. Timer opened')
                    setActiveWorkout({
                      id: 'new',
                      user_id: 'user_1',
                      type: 'Full Body Workout',
                      duration_min: 45,
                      date: new Date().toISOString(),
                      exercises: [],
                      intensity: 'Medium',
                      notes: null
                    })
                  }
                }}>
                  <Play className="w-4 h-4 fill-current" /> {isSubmitting ? "Starting..." : "Start Workout"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[var(--card-bg)] border-[var(--border-color)]">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-4">Quick Stats</h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] mb-1">Weekly Workouts</p>
                    <div className="flex items-end gap-2">
                      <span className="font-fredoka text-3xl font-bold text-[var(--accent-primary)]">
                        {weeklyProgress}
                      </span>
                      <span className="text-[var(--text-secondary)] mb-1 font-medium">/ 5 target</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] mb-1">Total Duration</p>
                    <div className="flex items-end gap-2">
                      <span className="font-fredoka text-3xl font-bold text-[var(--text-primary)]">
                        {last7DaysWorkouts.reduce((acc, w) => acc + (w.duration_min || 0), 0)}
                      </span>
                      <span className="text-[var(--text-secondary)] mb-1 font-medium">min</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-[var(--text-secondary)] mb-1">Est. Calories Burned</p>
                    <div className="flex items-end gap-2">
                      <span className="font-fredoka text-3xl font-bold text-[var(--text-primary)]">
                        {last7DaysWorkouts.reduce((acc, w) => acc + ((w.duration_min || 0) * 8), 0)}
                      </span>
                      <span className="text-[var(--text-secondary)] mb-1 font-medium">kcal</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <h2 className="font-playfair text-2xl font-bold mb-6">Recent Activity</h2>
          
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {workouts.map((workout) => (
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
