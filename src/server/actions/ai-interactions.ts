'use server'

import { createClient } from '@/lib/supabase/server'
import { AiInteraction } from '@/types/database'

export type TypedActionResponse<T> = {
  success: boolean
  error?: string
  data?: T
}

export async function logInteraction(data: Omit<AiInteraction, 'id' | 'user_id' | 'created_at'>): Promise<TypedActionResponse<AiInteraction>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: interaction, error } = await supabase.from('ai_interactions').insert({
    ...data,
    user_id: user.id
  }).select().single()

  if (error) return { success: false, error: error.message }
  return { success: true, data: interaction as AiInteraction }
}

export async function getRecentInteractions(limit: number = 20): Promise<TypedActionResponse<AiInteraction[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: interactions, error } = await supabase.from('ai_interactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(limit)
  
  if (error) return { success: false, error: error.message }
  return { success: true, data: interactions as AiInteraction[] }
}
