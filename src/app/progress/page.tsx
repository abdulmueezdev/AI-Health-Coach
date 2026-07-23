"use client"
export const dynamic = 'force-dynamic'

import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "@/lib/hooks/useUser"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useState, useEffect } from "react"
import { LoadingSkeleton } from "@/components/ui/states"
import { getSnapshots, createSnapshot } from "@/server/actions/progress"
import { ProgressSnapshot } from "@/types/database"


export default function ProgressPage() {
  const { profile } = useUser()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [snapshots, setSnapshots] = useState<ProgressSnapshot[]>([])
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M'>('1M')
  const [showModal, setShowModal] = useState(false)

  const [weightInput, setWeightInput] = useState('')
  const [bodyFatInput, setBodyFatInput] = useState('')
  const [notesInput, setNotesInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState<{msg: string, type: 'error' | 'success'} | null>(null)

  const showToast = (msg: string, type: 'error' | 'success' = 'error') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 5000)
  }

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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowModal(false) }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
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
  const weightChange = latestWeight - oldestWeight
  
  const isWeightLossGoal = profile?.goal_type === 'lose weight';
  const trendIsGood = isWeightLossGoal ? weightChange <= 0 : weightChange >= 0;

  const width = 800;
  const height = 256;
  const paddingX = 60;
  const paddingY = 30;
  const yScale = (val: number) => {
    const range = maxWeight - minWeight || 1;
    const norm = (val - minWeight) / range;
    return (height - paddingY) - (norm * (height - 2 * paddingY));
  };

  let pathD = ""
  let minWeight = 0
  let maxWeight = 0
  
  if (filtered.length > 0) {
    minWeight = Math.min(...filtered.map(s => s.weight || 0))
    maxWeight = Math.max(...filtered.map(s => s.weight || 0))
    
    pathD = filtered.map((s, i) => {
      const x = filtered.length === 1 ? width / 2 : paddingX + (i / (filtered.length - 1)) * (width - 2 * paddingX);
      const y = yScale(s.weight || 0);
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
      showToast(res.error || "Failed to log progress")
    }
  }

  return (
    <DashboardLayout>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm shadow-lg ${toast.type === 'error' ? 'bg-red-600' : 'bg-green-600'}`}>
          {toast.msg}
        </div>
      )}
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
                  <span className={`flex items-center text-sm font-medium px-2 py-1 rounded-full ${trendIsGood ? 'bg-status-positive/10 text-[var(--status-positive)]' : 'bg-status-warning/10 text-[var(--status-warning)]'}`}>
                    {trendIsGood ? '↓' : '↑'} {Math.abs(weightChange).toFixed(1)} lbs
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

            {filtered.length >= 1 ? (
              <div className="relative w-full h-64 bg-[var(--bg-sidebar)] rounded-xl overflow-hidden border border-[var(--border-color)]">
                <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
                  {/* Grid Lines */}
                  {[0, 1, 2, 3, 4].map(i => (
                    <line
                      key={i}
                      x1={paddingX}
                      y1={yScale(minWeight + (maxWeight - minWeight) * (i / 4))}
                      x2={width - paddingX}
                      y2={yScale(minWeight + (maxWeight - minWeight) * (i / 4))}
                      stroke="var(--border-color)"
                      strokeWidth={1}
                      strokeDasharray="4 4"
                    />
                  ))}
                  
                  {/* Y-Axis Labels */}
                  {[0, 1, 2, 3, 4].map(i => {
                    const value = minWeight + (maxWeight - minWeight) * (i / 4);
                    return (
                      <text
                        key={`label-${i}`}
                        x={paddingX - 10}
                        y={yScale(value) + 4}
                        textAnchor="end"
                        className="text-xs fill-[var(--text-secondary)]"
                      >
                        {value.toFixed(1)}
                      </text>
                    );
                  })}

                  <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    d={pathD} 
                    fill="none" 
                    stroke="#EF5B4B" 
                    strokeWidth="4" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                  />
                  
                  {/* Data Points */}
                  {filtered.map((s, i) => {
                    const x = filtered.length === 1 ? width / 2 : paddingX + (i / (filtered.length - 1)) * (width - 2 * paddingX);
                    const y = yScale(s.weight || 0);
                    return (
                      <circle
                        key={i}
                        cx={x}
                        cy={y}
                        r={6}
                        fill="#EF5B4B"
                        stroke="var(--card-bg)"
                        strokeWidth={2}
                      />
                    )
                  })}
                </svg>
                
                <div className="absolute bottom-1 left-0 right-0 px-[60px] flex justify-between text-xs text-text-secondary font-medium">
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
                <h2 className="font-playfair text-2xl font-bold text-white">Log Progress</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <Plus className="w-6 h-6 rotate-45" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">Weight (lbs)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl text-white px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:border-[#EF5B4B] focus:ring-1 focus:ring-[#EF5B4B]" 
                    value={weightInput} 
                    onChange={(e) => setWeightInput(e.target.value)} 
                    placeholder="e.g. 185.0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">Body Fat % (optional)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl text-white px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:border-[#EF5B4B] focus:ring-1 focus:ring-[#EF5B4B]" 
                    value={bodyFatInput} 
                    onChange={(e) => setBodyFatInput(e.target.value)} 
                    placeholder="e.g. 15.5"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-300 mb-1.5 block">Notes (optional)</label>
                  <input 
                    type="text" 
                    className="w-full bg-[#1e1e1e] border border-[#3a3a3a] rounded-xl text-white px-4 py-2.5 placeholder-gray-500 focus:outline-none focus:border-[#EF5B4B] focus:ring-1 focus:ring-[#EF5B4B]" 
                    value={notesInput} 
                    onChange={(e) => setNotesInput(e.target.value)} 
                    placeholder="How are you feeling?"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" className="bg-transparent border border-[#3a3a3a] text-gray-300 hover:bg-[#3a3a3a] rounded-xl px-6 py-2.5 transition-colors flex-1" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="button" className="bg-[#EF5B4B] hover:bg-[#d94a3a] text-white rounded-xl px-6 py-2.5 font-medium transition-colors flex-1" disabled={isSubmitting || !weightInput} onClick={handleLogWeight}>
                    {isSubmitting ? "Saving..." : "Save Log"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
