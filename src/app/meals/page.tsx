"use client"
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Camera, Plus, Clock, Flame, Search, Check, ChevronDown } from "lucide-react"
import { EmptyState, LoadingSkeleton, ErrorState } from "@/components/ui/states"
import { createMeal, analyzeAndSaveMealPhoto, getMealsDashboardData } from "@/server/actions/meals"
import { searchFoods } from "@/server/actions/usda-food"
import { Meal } from "@/types/database"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export default function MealsPage() {
  const [meals, setMeals] = useState<Meal[]>([])
  const [todayCalories, setTodayCalories] = useState(0)
  const [dailyGoal, setDailyGoal] = useState(2500)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isManualLogOpen, setIsManualLogOpen] = useState(false)

  // Manual Log State
  const [searchQuery, setSearchQuery] = useState("")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [searchResults, setSearchResults] = useState<any[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedFood, setSelectedFood] = useState<any | null>(null)
  const [portionSize, setPortionSize] = useState("100")
  const [mealType, setMealType] = useState("Snack")
  const [isSearching, setIsSearching] = useState(false)
  const [comboboxOpen, setComboboxOpen] = useState(false)
  const [toast, setToast] = useState<{msg: string, type: 'error'} | null>(null)

  const [useManualEntry, setUseManualEntry] = useState(false)
  const [manualName, setManualName] = useState("")
  const [manualCalories, setManualCalories] = useState("")
  const [manualProtein, setManualProtein] = useState("")
  const [manualCarbs, setManualCarbs] = useState("")
  const [manualFat, setManualFat] = useState("")
  const [manualPortion, setManualPortion] = useState("1 serving")

  const showToast = (msg: string) => {
    setToast({ msg, type: 'error' })
    setTimeout(() => setToast(null), 4000)
  }

  const loadData = async () => {
    try {
      setLoading(true)
      const res = await getMealsDashboardData()
      if (res.success && res.data) {
        setMeals(res.data.meals)
        setTodayCalories(res.data.todayCalories)
        setDailyGoal(res.data.dailyGoal)
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
    loadData()
  }, [])

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 3) {
        setIsSearching(true)
        const results = await searchFoods(searchQuery)
        setSearchResults(results.usdaResults || [])
        setIsSearching(false)
      } else {
        setSearchResults([])
      }
    }, 500)

    return () => clearTimeout(delayDebounceFn)
  }, [searchQuery])

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsSubmitting(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('photo', file)

      const res = await analyzeAndSaveMealPhoto(formData)

      if (res.error) {
        setToast({ msg: res.error, type: 'error' })
        setTimeout(() => setToast(null), 5000)
        return
      }

      loadData()
    } catch {
      setToast({ msg: 'Something went wrong. Please try again.', type: 'error' })
      setTimeout(() => setToast(null), 5000)
    } finally {
      setIsSubmitting(false)
      if (e.target) e.target.value = ''
    }
  }

  const handleManualSubmit = async () => {
    setIsSubmitting(true)
    try {
      let description = ""
      let calories = 0
      let protein = 0
      let carbs = 0
      let fat = 0
      let portion = "medium"

      if (useManualEntry) {
        if (!manualName || !manualCalories) return
        description = manualName
        calories = parseInt(manualCalories) || 0
        protein = parseInt(manualProtein) || 0
        carbs = parseInt(manualCarbs) || 0
        fat = parseInt(manualFat) || 0
        portion = manualPortion || "1 serving"
      } else {
        if (!selectedFood || !portionSize) return
        const ratio = parseFloat(portionSize) / 100
        description = selectedFood.name
        calories = Math.round((selectedFood.caloriesPer100g || 0) * ratio)
        protein = Math.round((selectedFood.proteinPer100g || 0) * ratio)
        carbs = Math.round((selectedFood.carbsPer100g || 0) * ratio)
        fat = Math.round((selectedFood.fatPer100g || 0) * ratio)
        portion = `${portionSize}g`
      }

      const res = await createMeal({
        description,
        calories_estimate: calories,
        macros: { 
          protein, 
          carbs, 
          fat,
          portion_estimate: portion,
          confidence: 'high',
          meal_type: mealType
        },
        source: 'manual',
        photo_url: null,
        logged_at: new Date().toISOString(),
      })

      if (res.success) {
        setIsManualLogOpen(false)
        setSelectedFood(null)
        setSearchQuery("")
        setPortionSize("100")
        setMealType("Snack")
        setUseManualEntry(false)
        setManualName("")
        setManualCalories("")
        setManualProtein("")
        setManualCarbs("")
        setManualFat("")
        setManualPortion("1 serving")
        loadData()
      } else {
        showToast("Failed to log meal: " + res.error)
      }
    } catch {
      showToast("Error logging meal")
    } finally {
      setIsSubmitting(false)
    }
  }

  const progressPercentage = Math.min(Math.round((todayCalories / dailyGoal) * 100), 100)

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
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl bg-red-600 text-white text-sm shadow-lg">
          {toast.msg}
        </div>
      )}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="font-playfair text-4xl font-bold mb-2">Meals</h1>
          <p className="text-text-secondary font-sans text-lg">
            Track your nutrition and log new meals.
          </p>
        </div>
        <div className="flex gap-3">
          <Input type="file" accept="image/*" className="hidden" id="meal-photo" onChange={handlePhotoUpload} disabled={isSubmitting} />
          <Button onClick={() => document.getElementById('meal-photo')?.click()} disabled={isSubmitting} className="gap-2 bg-accent-primary hover:bg-accent-primary/90 text-white">
            <Camera className="w-4 h-4" /> {isSubmitting ? "Analyzing..." : "Log Photo"}
          </Button>
          <Dialog open={isManualLogOpen} onOpenChange={setIsManualLogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Plus className="w-4 h-4" /> Manual
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Log a Meal</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {useManualEntry ? (
                  <>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Food Name</label>
                      <Input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="e.g. Shawarma" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Calories*</label>
                        <Input type="number" value={manualCalories} onChange={e => setManualCalories(e.target.value)} placeholder="0" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Portion</label>
                        <Input value={manualPortion} onChange={e => setManualPortion(e.target.value)} placeholder="1 serving" />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="grid gap-2">
                        <label className="text-[10px] uppercase text-text-secondary">Protein (g)</label>
                        <Input type="number" value={manualProtein} onChange={e => setManualProtein(e.target.value)} placeholder="0" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-[10px] uppercase text-text-secondary">Carbs (g)</label>
                        <Input type="number" value={manualCarbs} onChange={e => setManualCarbs(e.target.value)} placeholder="0" />
                      </div>
                      <div className="grid gap-2">
                        <label className="text-[10px] uppercase text-text-secondary">Fat (g)</label>
                        <Input type="number" value={manualFat} onChange={e => setManualFat(e.target.value)} placeholder="0" />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Meal Type</label>
                      <select 
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        value={mealType} 
                        onChange={e => setMealType(e.target.value)}
                      >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Snack">Snack</option>
                      </select>
                    </div>
                  </>
                ) : (
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Search Food (USDA)</label>
                  <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={comboboxOpen}
                        className="justify-between w-full font-normal"
                      >
                        {selectedFood ? selectedFood.name : "Search food..."}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[380px] p-0" align="start">
                      <Command>
                        <CommandInput 
                          placeholder="Search foods..." 
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {isSearching ? "Searching..." : (
                              searchQuery.length > 2 ? (
                                <div className="p-4 text-center">
                                  <p className="text-gray-400 text-sm mb-3">
                                    No exact match in USDA database.
                                  </p>
                                  <button 
                                    onClick={() => {
                                      setUseManualEntry(true)
                                      setManualName(searchQuery)
                                      setComboboxOpen(false)
                                    }}
                                    className="text-accent-primary text-sm font-medium hover:underline"
                                  >
                                    Enter manually instead →
                                  </button>
                                </div>
                              ) : "No foods found."
                            )}
                          </CommandEmpty>
                          <CommandGroup>
                            {searchResults.map((food) => (
                              <CommandItem
                                key={food.fdcId}
                                value={food.name}
                                onSelect={() => {
                                  setSelectedFood(food)
                                  setComboboxOpen(false)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedFood?.fdcId === food.fdcId ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{food.name}</span>
                                  <span className="text-xs text-muted-foreground">{food.caloriesPer100g} kcal / 100g</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                
                )}
                {/* End conditional rendering */}
                {!useManualEntry && selectedFood && (
                  <>
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Portion Size (grams)</label>
                      <Input
                        type="number"
                        value={portionSize}
                        onChange={(e) => setPortionSize(e.target.value)}
                        placeholder="e.g. 100"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">Meal Type</label>
                      <select 
                        className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={mealType} 
                        onChange={e => setMealType(e.target.value)}
                      >
                        <option value="Breakfast">Breakfast</option>
                        <option value="Lunch">Lunch</option>
                        <option value="Dinner">Dinner</option>
                        <option value="Snack">Snack</option>
                      </select>
                    </div>

                    <div className="bg-[var(--bg-panel-accent)]/10 p-3 rounded-lg flex justify-between text-sm">
                      <div className="text-center">
                        <div className="text-text-secondary text-xs">Calories</div>
                        <div className="font-bold">{Math.round((selectedFood.caloriesPer100g || 0) * (parseFloat(portionSize) / 100))}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-text-secondary text-xs">Protein</div>
                        <div className="font-bold">{Math.round((selectedFood.proteinPer100g || 0) * (parseFloat(portionSize) / 100))}g</div>
                      </div>
                      <div className="text-center">
                        <div className="text-text-secondary text-xs">Carbs</div>
                        <div className="font-bold">{Math.round((selectedFood.carbsPer100g || 0) * (parseFloat(portionSize) / 100))}g</div>
                      </div>
                      <div className="text-center">
                        <div className="text-text-secondary text-xs">Fat</div>
                        <div className="font-bold">{Math.round((selectedFood.fatPer100g || 0) * (parseFloat(portionSize) / 100))}g</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="ghost" onClick={() => setIsManualLogOpen(false)}>Cancel</Button>
                <Button onClick={handleManualSubmit} disabled={isSubmitting || (!useManualEntry && (!selectedFood || !portionSize)) || (useManualEntry && (!manualName || !manualCalories))}>
                  {isSubmitting ? "Saving..." : "Save Meal"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {!loading && !error && (
        <Card className="mb-8 border-none bg-gradient-to-br from-[var(--bg-panel-accent)] to-[var(--bg-sidebar)] overflow-hidden relative">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
          <CardContent className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h2 className="text-lg font-medium text-[var(--text-secondary)] mb-1">Today&apos;s Intake</h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-playfair font-bold text-[var(--text-primary)]">{todayCalories}</span>
                  <span className="text-xl text-[var(--text-secondary)]">/ {dailyGoal} kcal</span>
                </div>
              </div>
              
              <div className="w-full md:w-1/2">
                <div className="flex justify-between text-sm mb-2 font-medium">
                  <span className="text-[var(--text-primary)]">Progress</span>
                  <span className="text-[var(--text-secondary)]">{dailyGoal - todayCalories} kcal remaining</span>
                </div>
                <div className="h-4 bg-[var(--card-bg)] rounded-full overflow-hidden border border-[var(--border-color)]">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={cn(
                      "h-full rounded-full",
                      progressPercentage > 100 ? "bg-red-500" : "bg-accent-primary"
                    )}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        <h2 className="font-playfair text-2xl font-bold">Recent Meals</h2>
        
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
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {meals.map((meal) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const mealAny = meal as any
              const protein = meal.macros?.protein ?? mealAny.protein
              const carbs = meal.macros?.carbs ?? mealAny.carbs
              const fat = meal.macros?.fat ?? mealAny.fat

              const displayProtein = protein !== undefined && protein !== null ? `${protein}g` : "—"
              const displayCarbs = carbs !== undefined && carbs !== null ? `${carbs}g` : "—"
              const displayFat = fat !== undefined && fat !== null ? `${fat}g` : "—"

              return (
              <motion.div variants={item} key={meal.id}>
                <Card className="hover:border-accent-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent-primary/5 group h-full">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row h-full">
                      {meal.photo_url ? (
                        <div className="w-full sm:w-1/3 h-48 sm:h-auto relative overflow-hidden bg-[var(--bg-sidebar)]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={meal.photo_url} 
                            alt={meal.description} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent sm:hidden" />
                          <div className="absolute bottom-3 left-3 sm:hidden flex gap-2">
                            <span className="bg-black/50 backdrop-blur-md text-white text-xs px-2 py-1 rounded-md border border-white/10 shadow-sm flex items-center gap-1">
                              <Flame className="w-3 h-3 text-orange-400" /> {meal.calories_estimate} kcal
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full sm:w-1/3 h-48 sm:h-auto bg-[var(--bg-sidebar)] flex items-center justify-center border-r border-[var(--border-color)]">
                          <div className="w-16 h-16 rounded-full bg-[var(--card-bg)] flex items-center justify-center border border-[var(--border-color)]">
                            <Search className="w-6 h-6 text-[var(--text-secondary)] opacity-50" />
                          </div>
                        </div>
                      )}
                      
                      <div className="p-5 flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="text-xs font-semibold text-accent-primary uppercase tracking-wider mb-1">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {((meal.macros as any)?.meal_type) || 'Snack'}
                              </div>
                              <h4 className="font-bold text-lg leading-tight text-[var(--text-primary)] line-clamp-2">
                                {meal.description}
                              </h4>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--text-secondary)] mb-4">
                            <span className="flex items-center gap-1.5 bg-[var(--bg-panel-accent)]/10 px-2 py-1 rounded-md">
                              <Clock className="w-3.5 h-3.5" /> 
                              {new Date(meal.logged_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                            {((meal.macros as any)?.portion_estimate) && (
                              <span className="flex items-center gap-1.5 px-2 py-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-secondary)] opacity-50"></span>
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {((meal.macros as any)?.portion_estimate)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center gap-2 mb-3 hidden sm:flex">
                            <span className="text-xl font-bold font-playfair text-[var(--text-primary)]">
                              {meal.calories_estimate}
                            </span>
                            <span className="text-sm text-[var(--text-secondary)]">kcal</span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[var(--border-color)]">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Protein</span>
                              <span className="text-sm font-medium text-[var(--text-primary)]">{displayProtein}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Carbs</span>
                              <span className="text-sm font-medium text-[var(--text-primary)]">{displayCarbs}</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Fat</span>
                              <span className="text-sm font-medium text-[var(--text-primary)]">{displayFat}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )})}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}
