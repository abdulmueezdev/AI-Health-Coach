'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type OnboardingData = {
  goalType: string
  startingWeight: number
  targetWeight: number
  height: number
  activityLevel: string
  displayName: string
}

export async function completeOnboarding(data: OnboardingData) {
  const supabase = createClient()
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  // 1. Create Profile
  const { error: profileError } = await supabase.from('profiles').insert({
    user_id: user.id,
    display_name: data.displayName,
    goal_type: data.goalType,
    starting_weight: data.startingWeight,
    target_weight: data.targetWeight,
    height: data.height,
    activity_level: data.activityLevel,
  })

  if (profileError) {
    return { success: false, error: profileError.message }
  }

  // 2. Create Initial Goal
  const { error: goalError } = await supabase.from('goals').insert({
    user_id: user.id,
    type: data.goalType,
    target_value: data.targetWeight,
    status: 'active',
  })

  if (goalError) {
    return { success: false, error: 'Profile saved but failed to save initial goal: ' + goalError.message }
  }

  // Redirect to dashboard on success
  redirect('/dashboard')
}
