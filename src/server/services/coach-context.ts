import { createClient } from '@/lib/supabase/server'
import { Profile, Meal, Workout, Habit, AiInteraction, AiProfileSummary } from '@/types/database'

export async function assembleCoachContext(userId: string): Promise<{
  profile: Profile
  recentMeals: Meal[]
  recentWorkouts: Workout[]
  habits: Habit[]
  recentInteractions: AiInteraction[]
  profileSummary: AiProfileSummary | null
}> {
  const supabase = createClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: profile },
    { data: recentMeals },
    { data: recentWorkouts },
    { data: habits },
    { data: recentInteractions },
    { data: profileSummary }
  ] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).single(),
    supabase.from('meals').select('*').eq('user_id', userId).gte('logged_at', sevenDaysAgo).order('logged_at', { ascending: false }),
    supabase.from('workouts').select('*').eq('user_id', userId).gte('date', sevenDaysAgo).order('date', { ascending: false }),
    supabase.from('habits').select('*').eq('user_id', userId),
    supabase.from('ai_interactions').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
    supabase.from('ai_profile_summary').select('*').eq('user_id', userId).maybeSingle()
  ])

  // Strip PII
  const cleanProfile = profile ? {
    goal_type: profile.goal_type,
    starting_weight: profile.starting_weight,
    target_weight: profile.target_weight,
    height: profile.height,
    activity_level: profile.activity_level
  } : null

  return {
    profile: cleanProfile as Profile,
    recentMeals: recentMeals || [],
    recentWorkouts: recentWorkouts || [],
    habits: habits || [],
    recentInteractions: recentInteractions || [],
    profileSummary: profileSummary || null
  }
}
