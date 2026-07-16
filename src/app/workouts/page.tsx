"use client"
export const dynamic = 'force-dynamic'

import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Play, Calendar, X } from "lucide-react"
import { useEffect, useState } from "react"
import { EmptyState, LoadingSkeleton, ErrorState } from "@/components/ui/states"
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
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
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
                  className="w-full h-12 px-4 rounded-xl border border-gray-200" 
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
                  className="w-full h-12 px-4 rounded-xl border border-gray-200" 
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
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : workouts.length === 0 ? (
        <EmptyState 
          title="No workouts planned" 
          description="Create your first workout plan to start tracking your exercise journey."
          actionText="Create Plan"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <Card className="lg:col-span-2 bg-gradient-to-br from-panel-accent/40 to-panel-accent/10 border-panel-accent/30 overflow-hidden relative">
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-white/20 rounded-full blur-3xl -z-10 translate-x-1/3 translate-y-1/3"></div>
              <CardContent className="p-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 text-sm font-bold text-teal-800 mb-6">
                  <Calendar className="w-4 h-4" /> Latest Plan
                </div>
                <h2 className="font-playfair text-3xl font-bold mb-2">{workouts[0]?.type || "Workout"}</h2>
                <p className="text-text-secondary mb-8 max-w-md">
                  Estimated time: {workouts[0]?.duration_min || 45} minutes. Intensity: {workouts[0]?.intensity || "Medium"}.
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
                  <span className="font-fredoka text-4xl font-bold text-accent-primary">3</span>
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
                    <Button variant="outline" className="bg-white h-9 px-4 text-sm font-medium">
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
