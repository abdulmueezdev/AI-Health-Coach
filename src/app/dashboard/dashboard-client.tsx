/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { motion, Variants } from "framer-motion"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

export default function DashboardClient({ 
  name, 
  profile, 
  user, 
  meals, 
  workouts, 
  habits, 
  snapshots 
}: any) {
  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }

  const item: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const now = new Date();
  
  const mealsToday = meals?.filter((m: any) => {
    if (!m.logged_at) return false;
    const d = new Date(m.logged_at);
    return d >= todayStart && d <= now;
  }) || [];
  
  const caloriesToday = mealsToday.reduce((sum: any, m: any) => sum + (m.calories_estimate || 0), 0);
  const calorieGoal = profile?.target_calories || 2500;

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const workoutsThisWeek = workouts?.filter((w: any) => new Date(w.date) >= startOfWeek) || [];
  
  const totalStreak = habits?.reduce((sum: any, h: any) => sum + (h.streak_count || 0), 0) || 0;

  const sortedSnapshots = [...(snapshots || [])].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const latestWeight = sortedSnapshots[0];
  const lastWeekSnapshot = sortedSnapshots.find((s: any) => {
    const daysDiff = (new Date(sortedSnapshots[0].date).getTime() - new Date(s.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysDiff >= 7;
  });
  const weightChange = latestWeight && lastWeekSnapshot 
    ? latestWeight.weight - lastWeekSnapshot.weight 
    : 0;

  const habitsData = habits.map((h: any) => {
    const today = new Date().toISOString().split('T')[0]
    const completedToday = h.last_completed_at ? h.last_completed_at.startsWith(today) : false
    return { name: h.name, completed_today: completedToday }
  })

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 sm:mb-10"
      >
        <h1 className="font-playfair text-3xl sm:text-4xl font-bold mb-2">
          Good Morning, {name}
        </h1>
        <div className="text-[var(--text-secondary)] font-sans text-base sm:text-lg">
          <p className="text-[var(--text-secondary)]">
            {workoutsThisWeek.length >= 3 
              ? `Crushing it! ${workoutsThisWeek.length} workouts this week.` 
              : workoutsThisWeek.length >= 1 
                ? `Great start! ${workoutsThisWeek.length} workouts this week.`
                : "Let's get moving! Log your first activity."
            }
          </p>
        </div>
      </motion.div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-10"
      >
        {/* Stat Card 1: Calories */}
        <motion.div variants={item} className="sm:col-span-2 md:col-span-3">
          {mealsToday.length > 0 ? (
            <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-fredoka text-[var(--text-primary)]">Calories Today</h3>
                <span className="text-sm text-[var(--status-positive)] font-medium">
                  {Math.round((caloriesToday / calorieGoal) * 100)}% of goal
                </span>
              </div>
              <div className="text-4xl font-fredoka text-[var(--text-primary)] mb-2">
                {caloriesToday}
                <span className="text-lg text-[var(--text-secondary)] font-normal"> / {calorieGoal} kcal</span>
              </div>
              <div className="w-full h-3 bg-[var(--border-color)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent-primary)] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((caloriesToday / calorieGoal) * 100, 100)}%` }}
                />
              </div>
              <p className="text-sm text-[var(--text-secondary)] mt-3">
                {caloriesToday > calorieGoal 
                  ? "You've hit your target! 🔥" 
                  : `${calorieGoal - caloriesToday} kcal remaining`}
              </p>
            </div>
          ) : (
            <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)] text-center">
              <h3 className="text-lg font-fredoka text-[var(--text-primary)] mb-3 text-left">Calories Today</h3>
              <p className="text-[var(--text-secondary)] mb-4">No meals logged today</p>
              <Link href="/meals" className="inline-block bg-[var(--accent-primary)] text-white px-4 py-2 rounded-full text-sm">
                Log a Meal
              </Link>
            </div>
          )}
        </motion.div>

        {/* Stat Card 2: Workouts */}
        <motion.div variants={item}>
          <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)] h-full">
            <h3 className="text-base font-fredoka text-[var(--text-primary)] mb-3">Weekly Workouts</h3>
            {workoutsThisWeek.length > 0 ? (
              <>
                <div className="text-3xl font-fredoka text-[var(--text-primary)] mb-1">
                  {workoutsThisWeek.length}<span className="text-lg text-[var(--text-secondary)]">/5</span>
                </div>
                <div className="flex gap-1 mt-3">
                  {['M','T','W','T','F','S','S'].map((day, i) => {
                    const hasWorkout = workoutsThisWeek.some((w: any) => {
                      const d = new Date(w.date);
                      return d.getDay() === (i + 1) % 7; 
                    });
                    return (
                      <div 
                        key={day + i} 
                        className={`flex-1 h-8 rounded-md flex items-center justify-center text-xs font-medium ${
                          hasWorkout 
                            ? 'bg-[var(--accent-primary)] text-white' 
                            : 'bg-[var(--border-color)] text-[var(--text-secondary)]'
                        }`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">No workouts this week</p>
            )}
          </div>
        </motion.div>

        {/* Stat Card 3: Active Streaks */}
        <motion.div variants={item}>
          <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)] h-full">
            <h3 className="text-base font-fredoka text-[var(--text-primary)] mb-3">Active Streaks</h3>
            {totalStreak > 0 ? (
              <div className="flex items-center gap-3">
                <div className="text-4xl">🔥</div>
                <div>
                  <div className="text-3xl font-fredoka text-[var(--accent-primary)]">{totalStreak}</div>
                  <div className="text-sm text-[var(--text-secondary)]">days total</div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">No streaks yet. Start a habit!</p>
            )}
          </div>
        </motion.div>

        {/* Stat Card 4: Weight */}
        <motion.div variants={item}>
          <div className="bg-[var(--card-bg)] rounded-3xl p-6 border border-[var(--border-color)] h-full">
            <h3 className="text-base font-fredoka text-[var(--text-primary)] mb-3">Weight</h3>
            {latestWeight ? (
              <>
                <div className="text-3xl font-fredoka text-[var(--text-primary)]">
                  {latestWeight.weight} <span className="text-lg text-[var(--text-secondary)]">lbs</span>
                </div>
                {weightChange !== 0 && (
                  <div className={`text-sm font-medium mt-2 ${
                    weightChange < 0 ? 'text-[var(--status-positive)]' : 'text-[var(--status-warning)]'
                  }`}>
                    {weightChange > 0 ? '↑' : '↓'} {Math.abs(weightChange).toFixed(1)} lbs vs last week
                  </div>
                )}
              </>
            ) : (
              <p className="text-sm text-[var(--text-secondary)]">No weight logged</p>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Habits Section */}
      <motion.div 
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        className="space-y-4"
      >
        <h2 className="font-playfair text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Today&apos;s Habits</h2>
        {habitsData.length === 0 ? (
          <p className="text-[var(--text-secondary)] text-sm">No habits created yet. Go to Habits to set one up!</p>
        ) : (
          habitsData.map((habit: any, i: number) => {
            const completed = habit.completed_today ? 100 : 0
            const color = habit.completed_today ? "bg-[var(--status-positive)]" : "bg-[var(--accent-primary)]"
            return (
              <motion.div variants={item} key={i}>
                <Card className="group hover:border-[var(--accent-primary)]/50 border-[var(--border-color)] bg-[var(--card-bg)] transition-colors cursor-pointer">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-sm text-[var(--text-primary)]">{habit.name}</span>
                        <span className="text-xs text-[var(--text-secondary)]">{habit.completed_today ? "Done" : "Pending"}</span>
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
  )
}
