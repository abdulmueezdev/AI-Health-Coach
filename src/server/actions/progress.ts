'use server'

import { createClient } from '@/lib/supabase/server'
import { ProgressSnapshot } from '@/types/database'

export type TypedActionResponse<T> = {
  success: boolean
  error?: string
  data?: T
}

export async function createSnapshot(data: Omit<ProgressSnapshot, 'id' | 'user_id'>): Promise<TypedActionResponse<ProgressSnapshot>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: snapshot, error } = await supabase.from('progress_snapshots').insert({
    ...data,
    user_id: user.id
  }).select().single()

  if (error) return { success: false, error: error.message }
  return { success: true, data: snapshot as ProgressSnapshot }
}

export async function getSnapshots(): Promise<TypedActionResponse<ProgressSnapshot[]>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: snapshots, error } = await supabase.from('progress_snapshots').select('*').eq('user_id', user.id).order('date', { ascending: false })
  
  if (error) return { success: false, error: error.message }
  return { success: true, data: snapshots as ProgressSnapshot[] }
}

export async function deleteSnapshot(id: string): Promise<TypedActionResponse<void>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase.from('progress_snapshots').delete().eq('id', id).eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
