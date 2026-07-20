"use client"
export const dynamic = 'force-dynamic'

import { useEffect, useState } from "react"
import { motion, Variants } from "framer-motion"
import { useUser } from "@/lib/hooks/useUser"
import Link from "next/link"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Flame, Target, Trophy, ArrowUpRight, Coffee, Footprints, Wind, Plus, Loader2 } from "lucide-react"
import { LoadingSkeleton, ErrorState } from "@/components/ui/states"
import { getMeals, createMeal } from "@/server/actions/meals"
import { getWorkouts, createWorkout } from "@/server/actions/workouts"
import { getHabits, createHabit, logHabitCompletion } from "@/server/actions/habits"
import { Toast } from "@/components/ui/Toast"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

// Simple CountUp component
function CountUp({ end, suffix = "", duration = 2 }: { end: number, suffix?: string, duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const updateCount = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = timestamp - startTime
      const percentage = Math.min(progress / (duration * 1000), 1)
      
      // Easing out function
      const easeOut = 1 - Math.pow(1 - percentage, 3)
      setCount(Math.floor(end * easeOut))

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(updateCount)
      }
    }

    animationFrame = requestAnimationFrame(updateCount)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration])

  return <>{count}{suffix}</>
}

export default function DashboardPage() {
  const { user, profile } = useUser()
  const router = useRouter()
  const supabase = createClient()
  console.log('DASHBOARD: Component mounted')
  console.log('DASHBOARD: User =', user)
  console.log('DASHBOARD: Profile =', profile)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error'} | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const [calories, setCalories] = useState(0)
  const [workoutsCount, setWorkoutsCount] = useState(0)
  const [habitsData, setHabitsData] = useState<{name: string, completed_today: boolean}[]>([])
  const [meals, setMeals] = useState<unknown[]>([])
  const [workouts, setWorkouts] = useState<unknown[]>([])
  const [habits, setHabits] = useState<unknown[]>([])

  console.log('=== DASHBOARD MOUNTED ===');
  console.log('User object:', user);
  console.log('Profile object:', profile);
  console.log('Profile display_name:', profile?.display_name);
  console.log('Meals array:', meals);
  console.log('Meals length:', meals?.length);
  console.log('Meals type:', typeof meals, Array.isArray(meals));
  console.log('Workouts array:', workouts);
  console.log('Workouts length:', workouts?.length);
  console.log('Workouts type:', typeof workouts, Array.isArray(workouts));
  console.log('Habits array:', habits);
  console.log('Habits length:', habits?.length);
  console.log('Habits type:', typeof habits, Array.isArray(habits));

  useEffect(() => {
    async function loadData() {
      try {
        const [mealsRes, workoutsRes, habitsRes] = await Promise.all([
          getMeals(),
          getWorkouts(),
          getHabits()
        ])
        
        if (mealsRes.error) throw new Error(mealsRes.error)
        if (workoutsRes.error) throw new Error(workoutsRes.error)
        if (habitsRes.error) throw new Error(habitsRes.error)

        const meals = mealsRes.data || []
        const workouts = workoutsRes.data || []
        const habits = habitsRes.data || []

        console.log('DASHBOARD: Meals =', meals, 'Count:', meals?.length)
        console.log('DASHBOARD: Workouts =', workouts, 'Count:', workouts?.length)
        console.log('DASHBOARD: Habits =', habits, 'Count:', habits?.length)

        setMeals(meals)
        setWorkouts(workouts)
        setHabits(habits)

        const totalCals = meals.reduce((sum, m) => sum + (m.calories_estimate || 0), 0)
        setCalories(totalCals)
        
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        const last7DaysWorkouts = workouts.filter(w => new Date(w.date) >= sevenDaysAgo)
        const uniqueDaysCount = new Set(last7DaysWorkouts.map(w => new Date(w.date).toDateString())).size
        setWorkoutsCount(Math.min(uniqueDaysCount, 5))

        setHabitsData(habits.map(h => {
          const today = new Date().toISOString().split('T')[0]
          const completedToday = h.last_completed_at ? h.last_completed_at.startsWith(today) : false
          return { name: h.name, completed_today: completedToday }
        }))

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  const handleQuickAction = async (actionType: string) => {
    if (!user) return;
    
    setLoadingAction(actionType);
    try {
      if (actionType === "fast") {
        // Log a default break-fast meal
        await createMeal({
          description: "Break-fast meal",
          calories_estimate: 400,
          macros: { protein: 20, carbs: 45, fat: 15 },
          source: "manual",
          logged_at: new Date().toISOString(),
          photo_url: null
        });
        setToast({ message: "Break-fast logged! +400 cal", type: "success" });
        router.refresh();
      } else if (actionType === "walk") {
        await createWorkout({
          type: "Outdoor walk",
          duration_min: 15,
          intensity: "low",
          exercises: [],
          date: new Date().toISOString().split('T')[0],
          notes: "Logged via Quick Action"
        });
        setToast({ message: "Outdoor Walk logged! 15 min", type: "success" });
        router.refresh();
      } else if (actionType === "breathe") {
        // First, check if "Deep breathing" habit exists
        const { data: existingHabit } = await supabase
          .from('habits')
          .select('id, streak_count')
          .eq('user_id', user.id)
          .eq('name', 'Deep breathing session')
          .single();
        
        if (existingHabit) {
          await logHabitCompletion(existingHabit.id);
          setToast({ message: `Deep breathing done! Streak: ${existingHabit.streak_count + 1}`, type: "success" });
        } else {
          // Create the habit first
          const { data: newHabit } = await createHabit({
            name: "Deep breathing session",
            frequency: "daily"
          });
          if (newHabit) {
            await logHabitCompletion(newHabit.id);
            setToast({ message: "Deep breathing habit created & logged!", type: "success" });
          }
        }
        router.refresh();
      }
    } catch (err) {
      console.error("Action failed:", err);
      setToast({ message: "Failed to log action", type: "error" });
    } finally {
      setLoadingAction(null);
      setTimeout(() => setToast(null), 3000);
    }
  }

  const insightPanel = (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-accent-primary flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-sm">Vitalis</span>
        </div>
        <h3 className="font-playfair text-lg font-bold">You&apos;re crushing it</h3>
      </div>
      
      <Card className="bg-[var(--card-bg)] border-[var(--border-color)] shadow-sm">
        <CardContent className="p-6">
          <p className="text-sm text-[var(--accent-primary)] uppercase tracking-wider font-bold mb-3">Daily Tip</p>
          <p className="font-sans text-sm text-[var(--text-secondary)] leading-relaxed">Let&apos;s keep the momentum going! Remember to stay hydrated after your workout.</p>
        </CardContent>
      </Card>
      
      <div className="space-y-3">
        <h4 className="font-sans text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mt-8 mb-4">Recommended Actions</h4>
        {[
          { id: "fast", text: "Extend fast by 30m", icon: Coffee },
          { id: "walk", text: "15m Outdoor walk", icon: Footprints },
          { id: "breathe", text: "Deep breathing session", icon: Wind }
        ].map((action, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + (i * 0.1) }}
          >
            <div 
              onClick={() => handleQuickAction(action.id)}
              className="flex items-center justify-between p-4 bg-[var(--card-bg)] rounded-xl border border-[var(--border-color)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5 active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
                  <action.icon className="w-4 h-4 text-[var(--accent-primary)]" />
                </div>
                <span className="text-[var(--text-primary)] font-medium">{action.text}</span>
              </div>
              {loadingAction === action.id ? (
                <Loader2 className="w-5 h-5 text-[var(--accent-primary)] animate-spin" />
              ) : (
                <Plus className="w-5 h-5 text-[var(--accent-primary)] group-hover:rotate-90 transition-transform" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )

  return (
    <DashboardLayout insightPanel={insightPanel}>
      {toast && <Toast message={toast.message} type={toast.type} />}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 sm:mb-10"
      >
        <h1 className="font-playfair text-3xl sm:text-4xl font-bold mb-2">
          Good Morning, {profile?.display_name || user?.user_metadata?.display_name || "there"}
        </h1>
        {!loading && !error && (
          <div className="text-[var(--text-secondary)] font-sans text-base sm:text-lg">
            {workoutsCount > 0 ? (
              <p>You&apos;re crushing it! <span className="text-[var(--status-positive)] font-bold">{workoutsCount}</span> workouts this week.</p>
            ) : (
              <p>Let&apos;s get started! Log your first workout.</p>
            )}
          </div>
        )}
      </motion.div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : (
        <>
          <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10"
      >
        {/* Stat Card 1: Calories */}
        <motion.div variants={item}>
          {meals.length === 0 ? (
            <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)] text-center h-full flex flex-col items-center justify-center">
              <p className="text-[var(--text-secondary)] mb-2">No data yet</p>
              <p className="text-sm text-[var(--text-secondary)] mb-4">Start tracking to see your progress</p>
              <Link href="/meals" className="bg-[var(--accent-primary)] text-white px-4 py-2 rounded-full text-sm">
                Get Started
              </Link>
            </div>
          ) : (
            <Card className="h-full hover:border-panel-accent/50 transition-colors cursor-default">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] flex items-center justify-center mb-4">
                  <Flame className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">Calories</h3>
                <div className="font-fredoka text-3xl font-bold text-text-primary mb-2">
                  <CountUp end={calories} /> <span className="text-base text-text-secondary font-sans font-normal">/ 2400</span>
                </div>
                <div className="text-xs font-medium px-3 py-1 bg-[var(--bg-panel-accent)]/30 text-teal-800 rounded-full mt-auto">
                  Goal: Weight Loss
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Stat Card 2: Workouts */}
        <motion.div variants={item}>
          {workouts.length === 0 ? (
            <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)] text-center h-full flex flex-col items-center justify-center">
              <p className="text-[var(--text-secondary)] mb-2">No data yet</p>
              <p className="text-sm text-[var(--text-secondary)] mb-4">Start tracking to see your progress</p>
              <Link href="/workouts" className="bg-[var(--accent-primary)] text-white px-4 py-2 rounded-full text-sm">
                Get Started
              </Link>
            </div>
          ) : (
            <Card className="h-full hover:border-panel-accent/50 transition-colors cursor-default">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-panel-accent)]/50 text-[var(--text-primary)] flex items-center justify-center mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">Workouts</h3>
                <div className="font-fredoka text-3xl font-bold text-text-primary mb-2">
                  <CountUp end={workoutsCount} /> <span className="text-base text-text-secondary font-sans font-normal">/ 5 days</span>
                </div>
                <div className="w-full mt-auto pt-4 flex gap-1 h-8 items-end justify-center">
                  {[1, 1, 1, 1, 0, 0, 0].map((active, i) => (
                    <div key={i} className={`w-full rounded-sm ${active ? 'bg-[var(--bg-panel-accent)] h-full' : 'bg-[var(--border-color)] h-1/3'}`} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Stat Card 3: Habits */}
        <motion.div variants={item}>
          {habits.length === 0 ? (
            <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)] text-center h-full flex flex-col items-center justify-center">
              <p className="text-[var(--text-secondary)] mb-2">No data yet</p>
              <p className="text-sm text-[var(--text-secondary)] mb-4">Start tracking to see your progress</p>
              <Link href="/habits" className="bg-[var(--accent-primary)] text-white px-4 py-2 rounded-full text-sm">
                Get Started
              </Link>
            </div>
          ) : (
            <Card className="h-full hover:border-panel-accent/50 transition-colors cursor-default">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--status-positive)]/10 text-[var(--status-positive)] flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-medium text-text-secondary mb-1">Active Habits</h3>
                <div className="font-fredoka text-3xl font-bold text-text-primary mb-2">
                  <CountUp end={habits.length} /> <span className="text-base text-text-secondary font-sans font-normal">tracking</span>
                </div>
                <div className="text-xs font-medium text-status-positive mt-auto flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3 rotate-90" /> On Track
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </motion.div>
      
      {/* Habits Section (Dashboard preview) */}
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="space-y-4"
      >
        <h2 className="font-playfair text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Today&apos;s Habits</h2>
        {habitsData.length === 0 ? (
          <p className="text-text-secondary text-sm">No habits created yet. Go to Habits to set one up!</p>
        ) : (
          habitsData.map((habit, i) => {
            const completed = habit.completed_today ? 100 : 0
            const color = habit.completed_today ? "bg-green-500" : "bg-blue-500"
            return (
          <motion.div variants={item} key={i}>
            <Card className="group hover:border-panel-accent/50 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-sm">{habit.name}</span>
                    <span className="text-xs text-text-secondary">{habit.completed_today ? "Done" : "Pending"}</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--border-color)] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${completed}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      viewport={{ once: true }}
                      className={`h-full rounded-full ${color}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          )
        })
      )}
      </motion.div>
        </>
      )}
    </DashboardLayout>
  )
}
