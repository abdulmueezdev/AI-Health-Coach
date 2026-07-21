import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Card, CardContent } from "@/components/ui/card"
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  let profile = null
  let displayName = null
  try {
    const { data } = await supabase
      .from('profiles')
      .select('display_name, goal_type, starting_weight, target_weight, target_calories, activity_level, height')
      .eq('user_id', user.id)
      .maybeSingle()
    profile = data
    displayName = profile?.display_name
  } catch (e) {
    console.error('Profile fetch failed:', e)
  }

  // HARD FALLBACK CHAIN
  const name = displayName || user.user_metadata?.display_name || user.email?.split('@')[0] || 'friend'

  console.log('NAME RESOLUTION:', { displayName, email: user.email, finalName: name })

  // Calories Today
  const today = new Date().toISOString().split('T')[0]
  const { data: meals } = await supabase
    .from('meals')
    .select('calories_estimate, logged_at')
    .eq('user_id', user.id)
    .gte('logged_at', `${today}T00:00:00Z`)
    .lte('logged_at', `${today}T23:59:59Z`)

  // Weekly Workouts (last 7 days)
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString()
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', weekAgo.split('T')[0])

  // Active Streaks
  const { data: habits } = await supabase
    .from('habits')
    .select('name, streak_count, last_completed_at')
    .eq('user_id', user.id)

  // Weight
  const { data: progress } = await supabase
    .from('progress_snapshots')
    .select('weight, date')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(10)

  const totalStreak = (habits || []).reduce((sum, h) => sum + (h.streak_count || 0), 0)
  const workoutsThisWeek = (workouts || []).filter((w) => new Date(w.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))

  const insightPanel = (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-[var(--accent-primary)] flex items-center justify-center text-white">
          <span className="font-playfair font-bold">V</span>
        </div>
        <h3 className="font-playfair text-lg font-bold">
          {totalStreak > 5 ? "You're on fire! 🔥" : workoutsThisWeek.length >= 3 ? "You're crushing it!" : "Let's build momentum!"}
        </h3>
      </div>
      
      <Card className="bg-[var(--card-bg)] border-[var(--border-color)] shadow-sm">
        <CardContent className="p-6">
          <p className="text-sm text-[var(--accent-primary)] uppercase tracking-wider font-bold mb-3">Daily Tip</p>
          <p className="font-sans text-sm text-[var(--text-secondary)] leading-relaxed">Let&apos;s keep the momentum going! Remember to stay hydrated after your workout.</p>
        </CardContent>
      </Card>
      
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mt-8 mb-4">
          Quick Links
        </h3>
        <Link href="/meals" className="flex items-center gap-3 p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:bg-[var(--bg-panel-accent)]/10 transition-colors">
          <span className="text-xl">🍽️</span>
          <span className="text-[var(--text-primary)] font-medium">Log a Meal</span>
          <span className="ml-auto text-[var(--text-secondary)]">→</span>
        </Link>
        <Link href="/workouts" className="flex items-center gap-3 p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:bg-[var(--bg-panel-accent)]/10 transition-colors">
          <span className="text-xl">💪</span>
          <span className="text-[var(--text-primary)] font-medium">Start Workout</span>
          <span className="ml-auto text-[var(--text-secondary)]">→</span>
        </Link>
        <Link href="/habits" className="flex items-center gap-3 p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] hover:bg-[var(--bg-panel-accent)]/10 transition-colors">
          <span className="text-xl">✅</span>
          <span className="text-[var(--text-primary)] font-medium">Check Habits</span>
          <span className="ml-auto text-[var(--text-secondary)]">→</span>
        </Link>
      </div>
    </div>
  )

  return (
    <DashboardLayout insightPanel={insightPanel}>
      <DashboardClient 
        name={name}
        profile={profile}
        user={user}
        meals={meals || []}
        workouts={workouts || []}
        habits={habits || []}
        snapshots={progress || []}
      />
    </DashboardLayout>
  )
}
