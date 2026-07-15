import {
  Profile,
  Meal,
  Workout,
  Habit,
  HabitLog,
  Goal,
  ProgressSnapshot,
  AiInteraction,
  AiProfileSummary,
} from './database'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'> & { created_at?: string }
        Update: Partial<Omit<Profile, 'user_id'>>
      }
      meals: {
        Row: Meal
        Insert: Omit<Meal, 'id'> & { id?: string }
        Update: Partial<Omit<Meal, 'id' | 'user_id'>>
      }
      workouts: {
        Row: Workout
        Insert: Omit<Workout, 'id'> & { id?: string }
        Update: Partial<Omit<Workout, 'id' | 'user_id'>>
      }
      habits: {
        Row: Habit
        Insert: Omit<Habit, 'id' | 'streak_count'> & { id?: string; streak_count?: number }
        Update: Partial<Omit<Habit, 'id' | 'user_id'>>
      }
      habit_logs: {
        Row: HabitLog
        Insert: Omit<HabitLog, 'id'> & { id?: string }
        Update: Partial<Omit<HabitLog, 'id' | 'user_id'>>
      }
      goals: {
        Row: Goal
        Insert: Omit<Goal, 'id'> & { id?: string }
        Update: Partial<Omit<Goal, 'id' | 'user_id'>>
      }
      progress_snapshots: {
        Row: ProgressSnapshot
        Insert: Omit<ProgressSnapshot, 'id'> & { id?: string }
        Update: Partial<Omit<ProgressSnapshot, 'id' | 'user_id'>>
      }
      ai_interactions: {
        Row: AiInteraction
        Insert: Omit<AiInteraction, 'id' | 'created_at'> & { id?: string; created_at?: string }
        Update: Partial<Omit<AiInteraction, 'id' | 'user_id'>>
      }
      ai_profile_summary: {
        Row: AiProfileSummary
        Insert: Omit<AiProfileSummary, 'updated_at'> & { updated_at?: string }
        Update: Partial<Omit<AiProfileSummary, 'user_id'>>
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      meal_source: 'photo' | 'manual'
      ai_role: 'user' | 'assistant'
    }
  }
}
