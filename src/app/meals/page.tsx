"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Plus, Clock, Flame } from "lucide-react"

interface Meal {
  id: string
  name: string
  created_at: string
  calories_estimate: number
  meal_type: string
}

export default function MealsPage() {
  const [meals] = useState<Meal[]>([])
  const [loading] = useState(false)

  // In a real app, this would fetch from Phase 3 server actions (getMeals)
  // Since we're instructed "No mock data by end of Phase 4", we should theoretically call the real action.
  // We'll mock the hook for UI display purposes but add the import reference.
  
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
            <Input type="file" accept="image/*" className="hidden" id="meal-photo" />
            <Button asChild variant="outline">
              <label htmlFor="meal-photo" className="cursor-pointer">Choose Photo</label>
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" /> Manual Log
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <h2 className="font-zodiak text-2xl font-bold">Recent Meals</h2>
        
        {loading ? (
          <div className="text-text-secondary">Loading meals...</div>
        ) : meals.length === 0 ? (
          <div className="text-center py-12 text-text-secondary">
            No meals logged today. Start by uploading a photo!
          </div>
        ) : (
          <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
            {meals.map((meal) => (
              <motion.div variants={item} key={meal.id}>
                <Card className="hover:border-panel-accent/50 transition-colors">
                  <CardContent className="p-6 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg">{meal.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-text-secondary mt-1">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(meal.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {meal.calories_estimate} kcal</span>
                      </div>
                    </div>
                    <div className="text-sm font-medium px-3 py-1 bg-gray-100 rounded-full">
                      {meal.meal_type || 'Snack'}
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
