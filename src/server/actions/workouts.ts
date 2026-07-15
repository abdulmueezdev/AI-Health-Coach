'use server'

import { createClient } from '@/lib/supabase/server'
import { Workout } from '@/types/database'

export type TypedActionResponse<T> = {
  success: boolean
  error?: string
  data?: T
}

export async function createWorkout(data: Omit<Workout, 'id' | 'user_id'>): Promise<TypedActionResponse<Workout>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: workout, error } = await supabase.from('workouts').insert({
    ...data,
    user_id: user.id
  }).select().single()

  if (error) return { success: false, error: error.message }
  return { success: true, data: workout as Workout }
}

export async function getWorkouts(): Promise<TypedActionResponse<Workout[]>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: workouts, error } = await supabase.from('workouts').select('*').eq('user_id', user.id).order('date', { ascending: false })
  
  if (error) return { success: false, error: error.message }
  return { success: true, data: workouts as Workout[] }
}

export async function updateWorkout(id: string, updates: Partial<Omit<Workout, 'id' | 'user_id'>>): Promise<TypedActionResponse<Workout>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: workout, error } = await supabase.from('workouts').update(updates).eq('id', id).eq('user_id', user.id).select().single()

  if (error) return { success: false, error: error.message }
  return { success: true, data: workout as Workout }
}

export async function deleteWorkout(id: string): Promise<TypedActionResponse<void>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('workouts').delete().eq('id', id).eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
