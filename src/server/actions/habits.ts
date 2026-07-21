'use server'

import { createClient } from '@/lib/supabase/server'
import { Habit } from '@/types/database'

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

export async function logHabitCompletion(habitId: string): Promise<TypedActionResponse<{ status: string, streak: number }>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const today = new Date().toISOString().split('T')[0]

  const { data: existing } = await supabase
    .from('habit_logs')
    .select('id')
    .eq('habit_id', habitId)
    .eq('user_id', user.id)
    .gte('completed_at', today + 'T00:00:00')
    .lte('completed_at', today + 'T23:59:59')
    .single()

  if (existing) {
    await supabase.from('habit_logs').delete().eq('id', existing.id)

    const { data: habit } = await supabase.from('habits').select('streak_count').eq('id', habitId).single()
    const newStreak = Math.max(0, (habit?.streak_count || 1) - 1)

    await supabase.from('habits').update({
      streak_count: newStreak,
      last_completed_at: null
    }).eq('id', habitId)

    return { success: true, data: { status: 'removed', streak: newStreak } }
  }

  const { data: habit } = await supabase.from('habits').select('streak_count, last_completed_at').eq('id', habitId).single()

  const newStreak = (habit?.streak_count || 0) + 1

  await supabase.from('habits').update({
    streak_count: newStreak,
    last_completed_at: new Date().toISOString()
  }).eq('id', habitId)

  await supabase.from('habit_logs').insert({
    habit_id: habitId,
    user_id: user.id,
    completed_at: new Date().toISOString()
  })

  return { success: true, data: { status: 'added', streak: newStreak } }
}
