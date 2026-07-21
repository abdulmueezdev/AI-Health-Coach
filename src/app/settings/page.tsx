import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SettingsClient from './settings-client'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()
    
  // Fetch data for Data Management
  const { data: habits } = await supabase.from('habits').select('*').eq('user_id', user.id)
  
  const { data: workouts } = await supabase.from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(10)
    
  const today = new Date().toISOString().split('T')[0]
  const { data: meals } = await supabase.from('meals')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', `${today}T00:00:00Z`)
    .lte('logged_at', `${today}T23:59:59Z`)

  return (
    <SettingsClient 
      initialProfile={profile} 
      user={user} 
      habits={habits || []}
      workouts={workouts || []}
      meals={meals || []}
    />
  )
}
