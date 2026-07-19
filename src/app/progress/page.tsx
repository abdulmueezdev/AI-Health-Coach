"use client"
export const dynamic = 'force-dynamic'

import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingDown, TrendingUp } from "lucide-react"
import { useState, useEffect } from "react"
import { LoadingSkeleton } from "@/components/ui/states"
import { getSnapshots, createSnapshot } from "@/server/actions/progress"
import { ProgressSnapshot } from "@/types/database"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function ProgressPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [snapshots, setSnapshots] = useState<ProgressSnapshot[]>([])
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M'>('1M')
  const [showModal, setShowModal] = useState(false)

  const [weightInput, setWeightInput] = useState('')
  const [bodyFatInput, setBodyFatInput] = useState('')
  const [notesInput, setNotesInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function loadData() {
    setLoading(true)
    const res = await getSnapshots()
    if (res.success && res.data) {
      setSnapshots(res.data)
    } else {
      setError(res.error || 'Failed to load snapshots')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const now = new Date()
  const filterDate = new Date()
  if (timeRange === '1W') filterDate.setDate(now.getDate() - 7)
  if (timeRange === '1M') filterDate.setMonth(now.getMonth() - 1)
  if (timeRange === '3M') filterDate.setMonth(now.getMonth() - 3)

  // snapshots are sorted descending from DB, so we reverse for charting to get chronological order
  const filtered = snapshots
    .filter(s => new Date(s.date) >= filterDate && s.weight !== null)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const isEmpty = snapshots.length === 0

  const latestWeight = filtered.length > 0 ? (filtered[filtered.length - 1].weight || 0) : 0
  const oldestWeight = filtered.length > 0 ? (filtered[0].weight || latestWeight) : latestWeight
  const diff = latestWeight - oldestWeight
  const isDown = diff <= 0

  let pathD = ""
  let minWeight = 0
  let maxWeight = 0
  
  if (filtered.length > 0) {
    minWeight = Math.min(...filtered.map(s => s.weight || 0))
    maxWeight = Math.max(...filtered.map(s => s.weight || 0))
    const range = maxWeight - minWeight || 1 // avoid div by 0
    
    pathD = filtered.map((s, i) => {
      const x = filtered.length === 1 ? 50 : (i / (filtered.length - 1)) * 100
      const normalizedWeight = ((s.weight || 0) - minWeight) / range
      const y = 90 - (normalizedWeight * 80) // map to 10-90 Y range
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(" ")
  }

  const handleLogWeight = async () => {
    if (!weightInput) return
    setIsSubmitting(true)
    const res = await createSnapshot({
      weight: parseFloat(weightInput),
      body_stat: bodyFatInput ? { body_fat_percentage: parseFloat(bodyFatInput), notes: notesInput } : { notes: notesInput },
      date: new Date().toISOString()
    })
    setIsSubmitting(false)
    if (res.success) {
      setShowModal(false)
      setWeightInput('')
      setBodyFatInput('')
      setNotesInput('')
      loadData()
    } else {
      alert(res.error)
    }
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-playfair text-4xl font-bold mb-2">Progress</h1>
          <p className="text-text-secondary font-sans text-lg">
            Visualize your journey and milestones.
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" /> Log Weight
        </Button>
      </div>

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
      ) : isEmpty ? (
        <div className="bg-[var(--card-bg)] rounded-2xl p-8 text-center border border-[var(--border-color)]">
          <p className="text-[var(--text-secondary)] mb-4">
            No progress data
          </p>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-[var(--accent-primary)] text-white px-6 py-2 rounded-full inline-block"
          >
            Log Weight
          </button>
        </div>
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
                  <span className="font-fredoka text-3xl font-bold text-text-primary">{latestWeight.toFixed(1)} <span className="text-lg font-sans text-text-secondary">lbs</span></span>
                  <span className={`flex items-center text-sm font-medium px-2 py-1 rounded-full ${isDown ? 'text-status-positive bg-status-positive/10' : 'text-status-negative bg-status-negative/10'}`}>
                    {isDown ? <TrendingDown className="w-4 h-4 mr-1" /> : <TrendingUp className="w-4 h-4 mr-1" />}
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)} lbs
                  </span>
                </div>
              </div>
              <div className="flex bg-[var(--bg-sidebar)] border border-[var(--border-color)] p-1 rounded-lg">
                {(['1W', '1M', '3M'] as const).map(tr => (
                  <button 
                    key={tr}
                    onClick={() => setTimeRange(tr)}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${timeRange === tr ? 'bg-[var(--card-bg)] border border-[var(--border-color)] shadow-sm text-[var(--text-primary)]' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    {tr}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length > 0 ? (
              <div className="relative w-full h-64 bg-[var(--bg-sidebar)] rounded-xl overflow-hidden p-4 border border-[var(--border-color)]">
                <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    d={pathD} 
                    fill="none" 
                    stroke="#3FAE71" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  
                  {filtered.map((s, i) => {
                    const x = filtered.length === 1 ? 50 : (i / (filtered.length - 1)) * 100
                    const normalizedWeight = ((s.weight || 0) - minWeight) / (maxWeight - minWeight || 1)
                    const y = 90 - (normalizedWeight * 80)
                    return (
                      <circle key={i} cx={x} cy={y} r="1.5" fill="#3FAE71" />
                    )
                  })}
                </svg>
                
                <div className="absolute bottom-4 left-4 right-4 flex justify-between text-xs text-text-secondary font-medium">
                  {filtered.length > 0 && <span>{new Date(filtered[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}</span>}
                  {filtered.length > 1 && <span>{new Date(filtered[filtered.length - 1].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})}</span>}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center bg-[var(--bg-sidebar)] rounded-xl border border-[var(--border-color)]">
                <p className="text-text-secondary">No data for this time range.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--card-bg)] w-full max-w-md rounded-xl shadow-xl border border-[var(--border-color)] p-6">
            <h2 className="text-xl font-bold mb-4">Log Progress</h2>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (lbs)</Label>
                <Input 
                  id="weight" 
                  type="number" 
                  step="0.1" 
                  value={weightInput} 
                  onChange={(e) => setWeightInput(e.target.value)} 
                  placeholder="e.g. 185.0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bodyFat">Body Fat % (optional)</Label>
                <Input 
                  id="bodyFat" 
                  type="number" 
                  step="0.1" 
                  value={bodyFatInput} 
                  onChange={(e) => setBodyFatInput(e.target.value)} 
                  placeholder="e.g. 15.5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Input 
                  id="notes" 
                  value={notesInput} 
                  onChange={(e) => setNotesInput(e.target.value)} 
                  placeholder="How are you feeling?"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 rounded-full bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border-color)] hover:bg-[var(--bg-panel-accent)]/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting || !weightInput}
                  onClick={handleLogWeight}
                  className="px-6 py-2 rounded-full bg-[var(--accent-primary)] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Log'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
