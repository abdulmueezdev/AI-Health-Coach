'use server'

import { createClient } from '@/lib/supabase/server'
import { Habit, HabitLog } from '@/types/database'

export type TypedActionResponse<T> = {
  success: boolean
  error?: string
  data?: T
}

export async function createHabit(data: Omit<Habit, 'id' | 'user_id' | 'streak_count' | 'last_completed_at'>): Promise<TypedActionResponse<Habit>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: habit, error } = await supabase.from('habits').insert({
    ...data,
    user_id: user.id
  }).select().single()

  if (error) return { success: false, error: error.message }
  return { success: true, data: habit as Habit }
}

export async function getHabits(): Promise<TypedActionResponse<Habit[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: habits, error } = await supabase.from('habits').select('*').eq('user_id', user.id)
  
  if (error) return { success: false, error: error.message }
  return { success: true, data: habits as Habit[] }
}

export async function updateHabit(id: string, updates: Partial<Omit<Habit, 'id' | 'user_id'>>): Promise<TypedActionResponse<Habit>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: habit, error } = await supabase.from('habits').update(updates).eq('id', id).eq('user_id', user.id).select().single()

  if (error) return { success: false, error: error.message }
  return { success: true, data: habit as Habit }
}

export async function deleteHabit(id: string): Promise<TypedActionResponse<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('habits').delete().eq('id', id).eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function logHabitCompletion(habitId: string): Promise<TypedActionResponse<HabitLog>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const completed_at = new Date().toISOString()
  const { data: habitLog, error: logError } = await supabase.from('habit_logs').insert({
    habit_id: habitId,
    user_id: user.id,
    completed_at
  }).select().single()

  if (logError) return { success: false, error: logError.message }

  const { data: currentHabit } = await supabase
    .from('habits')
    .select('streak_count')
    .eq('id', habitId)
    .eq('user_id', user.id)
    .single()

  const currentStreak = currentHabit?.streak_count || 0

  await supabase
    .from('habits')
    .update({
      streak_count: currentStreak + 1,
      last_completed_at: completed_at
    })
    .eq('id', habitId)
    .eq('user_id', user.id)

  return { success: true, data: habitLog as HabitLog }
}
