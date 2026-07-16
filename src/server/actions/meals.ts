'use server'

import { createClient } from '@/lib/supabase/server'
import { Meal } from '@/types/database'

export type TypedActionResponse<T> = {
  success: boolean
  error?: string
  data?: T
}

export async function uploadMealPhoto(formData: FormData): Promise<TypedActionResponse<string>> {
  const file = formData.get('file') as File | null
  if (!file) return { success: false, error: 'No file provided' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Generate a unique file path within the user's folder
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${user.id}/${fileName}`

  const { error } = await supabase.storage
    .from('meal-photos')
    .upload(filePath, file)

  if (error) return { success: false, error: error.message }
  return { success: true, data: filePath }
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
  
  // Generate signed URLs for meals with a photo_url
  const mealsWithSignedUrls = await Promise.all(
    (meals as Meal[]).map(async (meal) => {
      if (meal.photo_url && !meal.photo_url.startsWith('http')) {
        const { data } = await supabase.storage
          .from('meal-photos')
          .createSignedUrl(meal.photo_url, 3600) // 1 hour expiry
        
        if (data) {
          return { ...meal, photo_url: data.signedUrl }
        }
      }
      return meal
    })
  )

  return { success: true, data: mealsWithSignedUrls }
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

