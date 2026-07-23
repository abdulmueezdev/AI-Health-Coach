'use server'

import { createClient } from '@/lib/supabase/server'
import { aiService } from '@/server/services/ai-service'
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

export async function analyzeAndSaveMealPhoto(formData: FormData) {
  console.log('=== PHOTO DEBUG START ===')
  
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  console.log('DEBUG 1 - User:', user?.id ? 'found' : 'MISSING')
  
  if (!user) return { error: 'Not authenticated' }

  const file = formData.get('photo') as File
  console.log('DEBUG 2 - File:', file?.name, 'Size:', file?.size, 'Type:', file?.type)
  
  if (!file) return { error: 'No photo provided' }

  try {
    // 1. Upload to Supabase Storage
    const path = `${user.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
    console.log('DEBUG 3 - Upload path:', path)
    const { error: uploadError } = await supabase.storage
      .from('meal-photos')
      .upload(path, file, { contentType: file.type })
    
    console.log('DEBUG 4 - Upload result:', uploadError ? `ERROR: ${uploadError.message}` : 'success')
    if (uploadError) throw uploadError

    // 2. Get signed URL (60 seconds for Gemini)
    const { data: signedData, error: signedError } = await supabase.storage
      .from('meal-photos')
      .createSignedUrl(path, 60)
    
    console.log('DEBUG 5 - Signed URL:', signedData?.signedUrl ? 'generated' : 'FAILED', signedError ? `ERROR: ${signedError.message}` : '')
    const signedUrl = signedData?.signedUrl
    if (!signedUrl) throw new Error('Failed to generate signed URL')

    // 3. Call Gemini with ENHANCED prompt for accuracy
    const prompt = `
You are a professional nutritionist analyzing a food photograph.

TASK: Identify the food items visible and estimate nutritional content.

RULES:
- Be SPECIFIC: "grilled chicken breast" not "chicken". "steamed jasmine rice" not "rice".
- Estimate portion size by visual reference (compare to standard objects like a fist, palm, or deck of cards).
- If multiple items, describe the MAIN item and list visible sides.
- If the image is not food, blurry, or unidentifiable, return {"error": "not_food"}.

RESPONSE FORMAT (JSON only, no markdown):
{
  "food_name": "specific descriptive name",
  "description": "what's visible in the photo",
  "portion_estimate_grams": number,
  "confidence": "high" | "medium" | "low",
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "meal_type": "Breakfast" | "Lunch" | "Dinner" | "Snack",
  "notes": "cooking method, visible ingredients, or concerns"
}
`

    console.log('DEBUG 6 - Calling Gemini with model: gemini-2.0-flash')
    const result = await aiService.analyzeImage(signedUrl, prompt)
    console.log('DEBUG 7 - Gemini raw response:', result?.response ? 'received' : 'EMPTY')
    
    const text = result.response.text()
    console.log('DEBUG 8 - Gemini text length:', text?.length)
    console.log('DEBUG 9 - Gemini text preview:', text?.substring(0, 200))
    
    // 4. Parse JSON robustly
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON found in response')
    
    const analysis = JSON.parse(jsonMatch[0])
    
    if (analysis.error === 'not_food') {
      return { error: 'This does not appear to be food. Please try again or enter manually.' }
    }

    // 5. Save to database
    const { error: dbError } = await supabase.from('meals').insert({
      user_id: user.id,
      photo_url: path,
      description: analysis.food_name,
      calories_estimate: analysis.calories,
      macros: {
        protein: analysis.protein_g,
        carbs: analysis.carbs_g,
        fat: analysis.fat_g,
        portion_estimate: analysis.portion_estimate_grams ? `${analysis.portion_estimate_grams}g` : 'medium',
        confidence: analysis.confidence || 'medium',
        meal_type: analysis.meal_type || 'Snack',
      },
      source: 'photo',
      logged_at: new Date().toISOString(),
    })

    if (dbError) throw dbError

    return { 
      success: true, 
      meal: {
        food_name: analysis.food_name,
        calories: analysis.calories,
        portion: analysis.portion_estimate_grams,
        confidence: analysis.confidence,
        protein: analysis.protein_g,
        carbs: analysis.carbs_g,
        fat: analysis.fat_g,
      }
    }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error('Gemini analysis error:', e)
    
    // Check for rate limit
    if (e?.message?.includes('429') || e?.status === 429) {
      return { 
        error: 'Photo analysis is temporarily unavailable due to high demand. Please enter your meal manually or try again in a minute.' 
      }
    }
    
    return { 
      error: 'Could not analyze this photo. Please log your meal manually.' 
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function calculateDailyCalories(profile: any) {
  if (!profile) return 2500 // fallback
  
  // Activity multiplier
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  }
  
  // Simplified: weight × 22 × activity_multiplier
  const baseWeight = profile.starting_weight || 70
  const activityLevel = profile.activity_level || 'moderate'
  const tdee = Math.round(baseWeight * 22 * (multipliers[activityLevel] || 1.55))
  
  // Adjust for goal
  if (profile.goal_type === 'lose weight') return tdee - 500
  if (profile.goal_type === 'gain weight') return tdee + 300
  return tdee // maintain
}

export async function getMealsDashboardData() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()

  const dailyGoal = calculateDailyCalories(profile)

  // Fetch meals
  const today = new Date().toISOString().split('T')[0]
  const { data: meals, error } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .order('logged_at', { ascending: false })

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

  const todayMeals = mealsWithSignedUrls.filter(m => new Date(m.logged_at).toISOString().startsWith(today))
  const todayCalories = todayMeals.reduce((sum, m) => sum + (m.calories_estimate || 0), 0)

  return { 
    success: true, 
    data: {
      meals: mealsWithSignedUrls,
      todayCalories,
      dailyGoal
    }
  }
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

