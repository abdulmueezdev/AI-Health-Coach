import { createClient } from '@/lib/supabase/server'
import { aiService } from './ai-service'

// TODO: Call this via cron job or scheduled Edge Function
export async function regenerateSummary(userId: string): Promise<void> {
  const supabase = createClient()
  
  const [
    { data: meals },
    { data: workouts },
    { data: habits }
  ] = await Promise.all([
    supabase.from('meals').select('*').eq('user_id', userId).order('logged_at', { ascending: false }).limit(50),
    supabase.from('workouts').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(20),
    supabase.from('habits').select('*').eq('user_id', userId)
  ])

  const historyDump = JSON.stringify({
    meals: meals || [],
    workouts: workouts || [],
    habits: habits || []
  })

  const summary = await aiService.generateSummary(historyDump)

  await supabase.from('ai_profile_summary').upsert({
    user_id: userId,
    summary_text: summary,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id' })
}
