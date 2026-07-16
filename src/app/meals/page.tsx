"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Plus, Clock, Flame, X } from "lucide-react"
import { EmptyState, LoadingSkeleton, ErrorState } from "@/components/ui/states"
import { getMeals, createMeal, uploadMealPhoto } from "@/server/actions/meals"
import { Meal } from "@/types/database"

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [showManualLog, setShowManualLog] = useState(false)
  const [newMealName, setNewMealName] = useState("")
  const [newMealCalories, setNewMealCalories] = useState("")
  const [newMealType, setNewMealType] = useState("Snack")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadMeals = async () => {
    try {
      setLoading(true)
      const res = await getMeals()
      if (res.success && res.data) {
        setMeals(res.data)
      } else {
        setError(res.error || "Failed to load meals")
      }
    } catch {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMeals()
  }, [])

  const handleManualLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMealName || !newMealCalories) return
    setIsSubmitting(true)
    try {
      const res = await createMeal({
        description: newMealName, // using description as name
        calories_estimate: parseInt(newMealCalories, 10),
        macros: { protein: 0, carbs: 0, fat: 0 },
        source: 'manual',
        photo_url: null,
        logged_at: new Date().toISOString(),
      })
      if (res.success) {
        setShowManualLog(false)
        setNewMealName("")
        setNewMealCalories("")
        setNewMealType("Snack")
        loadMeals()
      } else {
        alert("Failed to log meal: " + res.error)
      }
    } catch {
      alert("Error logging meal")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('image', file)
      
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)

      const [analyzeRes, uploadRes] = await Promise.all([
        fetch('/api/meals/analyze', {
          method: 'POST',
          body: formData
        }).then(r => r.json()),
        uploadMealPhoto(uploadFormData)
      ])

      if (analyzeRes.error) throw new Error(analyzeRes.error)
      if (!uploadRes.success) throw new Error(uploadRes.error)

      const createRes = await createMeal({
        description: analyzeRes.description || 'Analyzed Meal',
        calories_estimate: analyzeRes.calories_estimate || 0,
        macros: analyzeRes.macros || { protein: 0, carbs: 0, fat: 0 },
        source: 'photo',
        photo_url: uploadRes.data || null,
        logged_at: new Date().toISOString(),
      })

      if (createRes.success) {
        loadMeals()
      } else {
        throw new Error(createRes.error)
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : String(err) || "Failed to process photo")
    } finally {
      setIsSubmitting(false)
      if (e.target) e.target.value = ''
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
          <h1 className="font-zodiak text-4xl font-bold mb-2">Meals</h1>
          <p className="text-text-secondary font-sans text-lg">
            Track your nutrition and log new meals.
          </p>
        </div>
        <Button className="gap-2">
          <Camera className="w-4 h-4" /> Log Photo
        </Button>
      </div>

      <Card className="mb-8 border-dashed bg-gray-50/50">
        <CardContent className="p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
          <div className="w-16 h-16 rounded-full bg-accent-primary/10 text-accent-primary flex items-center justify-center mb-4">
            <Camera className="w-8 h-8" />
          </div>
          <h3 className="font-zodiak text-xl font-bold mb-2">Upload Meal Photo</h3>
          <p className="text-text-secondary text-sm mb-6 max-w-sm">
            Snap a picture of your food and our AI will estimate the calories and macros automatically.
          </p>
          <div className="flex items-center gap-4">
            <Input type="file" accept="image/*" className="hidden" id="meal-photo" onChange={handlePhotoUpload} disabled={isSubmitting} />
            <Button asChild variant="outline" disabled={isSubmitting}>
              <label htmlFor="meal-photo" className="cursor-pointer">Choose Photo</label>
            </Button>
            <Button onClick={() => setShowManualLog(true)}>
              <Plus className="w-4 h-4 mr-2" /> Manual Log
            </Button>
          </div>
        </CardContent>
      </Card>

      {showManualLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-sidebar">
              <h3 className="font-zodiak text-xl font-bold">Log a Meal</h3>
              <button onClick={() => setShowManualLog(false)} className="text-text-secondary hover:text-text-primary p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleManualLog} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Meal Name</label>
                <Input 
                  value={newMealName} 
                  onChange={e => setNewMealName(e.target.value)} 
                  placeholder="e.g. Grilled Chicken Salad" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Estimated Calories</label>
                <Input 
                  type="number" 
                  value={newMealCalories} 
                  onChange={e => setNewMealCalories(e.target.value)} 
                  placeholder="e.g. 450" 
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select 
                  className="w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={newMealType} 
                  onChange={e => setNewMealType(e.target.value)}
                >
                  <option value="Breakfast">Breakfast</option>
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snack">Snack</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowManualLog(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Meal"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <div className="space-y-6">
        <h2 className="font-zodiak text-2xl font-bold">Recent Meals</h2>
        
        {loading ? (
          <LoadingSkeleton />
        ) : error ? (
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        ) : meals.length === 0 ? (
          <EmptyState 
            title="No meals logged today" 
            description="Start tracking your nutrition by uploading a photo of your food. Our AI will handle the calories and macros."
            actionText="Upload Photo"
            onAction={() => document.getElementById('meal-photo')?.click()}
          />
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {meals.map((meal) => (
              <motion.div variants={item} key={meal.id}>
                <Card className="hover:border-panel-accent/50 transition-colors">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {meal.photo_url && (
                        <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                          <img src={meal.photo_url} alt={meal.description} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-lg">{meal.description}</h4>
                      <div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(meal.logged_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {meal.calories_estimate} kcal</span>
                      </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full">
                      {meal.source}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
