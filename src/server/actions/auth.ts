'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export type ActionResponse = {
  success: boolean
  error?: string
  hasSession?: boolean
}

export async function signUp(email: string, password: string, displayName: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
        },
      },
    })

    if (error) {
      return { success: false, error: error.message }
    }

    if (!data.user) {
      return { success: false, error: 'Check your email to confirm your account before logging in.' }
    }

    return { success: true, hasSession: !!data.session }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function signIn(email: string, password: string): Promise<ActionResponse> {
  try {
    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function getSession() {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (error) return null
  return session
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) return null
  return user
}
