'use server'

import { createClient } from '@/lib/supabase/server'
import { Goal } from '@/types/database'

export type TypedActionResponse<T> = {
  success: boolean
  error?: string
  data?: T
}

export async function createGoal(data: Omit<Goal, 'id' | 'user_id' | 'status'>): Promise<TypedActionResponse<Goal>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: goal, error } = await supabase.from('goals').insert({
    ...data,
    status: 'active',
    user_id: user.id
  }).select().single()

  if (error) return { success: false, error: error.message }
  return { success: true, data: goal as Goal }
}

export async function getGoals(): Promise<TypedActionResponse<Goal[]>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: goals, error } = await supabase.from('goals').select('*').eq('user_id', user.id).order('target_date', { ascending: true })
  
  if (error) return { success: false, error: error.message }
  return { success: true, data: goals as Goal[] }
}

export async function updateGoal(id: string, updates: Partial<Omit<Goal, 'id' | 'user_id'>>): Promise<TypedActionResponse<Goal>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: goal, error } = await supabase.from('goals').update(updates).eq('id', id).eq('user_id', user.id).select().single()

  if (error) return { success: false, error: error.message }
  return { success: true, data: goal as Goal }
}

export async function deleteGoal(id: string): Promise<TypedActionResponse<void>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('goals').delete().eq('id', id).eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
