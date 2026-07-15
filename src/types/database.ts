export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Profile {
  user_id: string
  display_name: string | null
  goal_type: string | null
  starting_weight: number | null
  target_weight: number | null
  height: number | null
  activity_level: string | null
  created_at: string
}

export interface Meal {
  id: string
  user_id: string
  logged_at: string
  photo_url: string | null
  description: string
  calories_estimate: number
  macros: { protein: number; carbs: number; fat: number }
  source: 'photo' | 'manual'
}

export interface Workout {
  id: string
  user_id: string
  date: string
  type: string
  exercises: { name: string; sets: number; reps: number; weight: number }[]
  duration_min: number
  intensity: string
  notes: string | null
}

export interface Habit {
  id: string
  user_id: string
  name: string
  frequency: string
  streak_count: number
  last_completed_at: string | null
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  completed_at: string
}

export interface Goal {
  id: string
  user_id: string
  type: string
  target_value: number
  target_date: string | null
  status: 'active' | 'completed' | 'abandoned'
}

export interface ProgressSnapshot {
  id: string
  user_id: string
  date: string
  weight: number | null
  body_stat: Json | null
}

export interface AiInteraction {
  id: string
  user_id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface AiProfileSummary {
  user_id: string
  summary_text: string
  updated_at: string
}
