'use server'

import { createClient } from '@/lib/supabase/server'
import { Meal } from '@/types/database'

export type TypedActionResponse<T> = {
  success: boolean
  error?: string
  data?: T
}

export async function createMeal(data: Omit<Meal, 'id' | 'user_id'>): Promise<TypedActionResponse<Meal>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: meal, error } = await supabase.from('meals').insert({
    ...data,
    user_id: user.id
  }).select().single()

  if (error) return { success: false, error: error.message }
  return { success: true, data: meal as Meal }
}

export async function getMeals(): Promise<TypedActionResponse<Meal[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: meals, error } = await supabase.from('meals').select('*').eq('user_id', user.id).order('logged_at', { ascending: false })
  
  if (error) return { success: false, error: error.message }
  return { success: true, data: meals as Meal[] }
}

export async function updateMeal(id: string, updates: Partial<Omit<Meal, 'id' | 'user_id'>>): Promise<TypedActionResponse<Meal>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: meal, error } = await supabase.from('meals').update(updates).eq('id', id).eq('user_id', user.id).select().single()

  if (error) return { success: false, error: error.message }
  return { success: true, data: meal as Meal }
}

export async function deleteMeal(id: string): Promise<TypedActionResponse<void>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('meals').delete().eq('id', id).eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
