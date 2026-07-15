'use server'

import { createClient } from '@/lib/supabase/server'
import { assembleCoachContext } from '../services/coach-context'
import { aiService } from '../services/ai-service'

export async function askCoach(question: string, userId: string): Promise<{ success: boolean; data?: string; error?: string; code?: string }> {
  const supabase = await createClient()
  
  // Verify auth matches userId
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.id !== userId) return { success: false, error: 'Unauthorized', code: 'UNAUTHORIZED' }

  const contextData = await assembleCoachContext(userId)
  
  const mealsSummary = contextData.recentMeals.slice(0, 5).map(m => `${m.description}: ${m.calories_estimate} cal`).join(', ') || 'None'
  const workoutsSummary = contextData.recentWorkouts.slice(0, 5).map(w => `${w.type}: ${w.duration_min} min, ${(w.exercises as unknown[])?.length || 0} exercises`).join(', ') || 'None'
  const habitsSummary = contextData.habits.slice(0, 5).map(h => `${h.name}: ${h.streak_count} day streak`).join(', ') || 'None'

  const systemPrompt = `You are Vitalis, a personal AI fitness coach.
User Profile: Goal: ${contextData.profile?.goal_type}, Activity Level: ${contextData.profile?.activity_level}

Recent Meals (last 5): ${mealsSummary}
Recent Workouts (last 5): ${workoutsSummary}
Active Habits: ${habitsSummary}
Profile Summary: ${contextData.profileSummary?.summary_text || 'No summary yet.'}

Provide an encouraging, concise, and actionable response.`

  // Log user question
  await supabase.from('ai_interactions').insert({
    user_id: userId,
    role: 'user',
    content: question
  })

  try {
    // Get AI response with timeout
    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT')), 15000)
    })

    const response = await Promise.race([
      aiService.chat(question, systemPrompt),
      timeoutPromise
    ])

    // Log AI response
    await supabase.from('ai_interactions').insert({
      user_id: userId,
      role: 'assistant',
      content: response
    })

    return { success: true, data: response }
  } catch (error: unknown) {
    console.error("AI Service Error:", error)
    
    if (error instanceof Error && error.message === 'TIMEOUT') {
      return { success: false, error: 'Request timed out. Please try again.', code: 'TIMEOUT' }
    }
    
    const err = error as { status?: number, message?: string }
    if (err?.status === 429 || err?.message?.includes('429') || err?.message?.toLowerCase().includes('rate limit')) {
      return { success: false, error: 'We are receiving too many requests right now. Please wait a moment.', code: 'RATE_LIMIT' }
    }

    return { success: false, error: 'An unexpected error occurred.', code: 'UNKNOWN_ERROR' }
  }
}
