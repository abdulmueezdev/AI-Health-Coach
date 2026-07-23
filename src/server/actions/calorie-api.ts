'use server'

const CALORIE_API_BASE = 'https://api.calorieapi.com/api/v1'

export async function searchFoods(query: string) {
  console.error('CALORIE_API_DEBUG: searchFoods called with query:', query)
  
  if (!query || query.length < 2) {
    console.error('CALORIE_API_DEBUG: Query too short, returning empty')
    return { foods: [] }
  }
  
  try {
    const apiKey = process.env.CALORIE_API_KEY
    console.error('CALORIE_API_DEBUG: API key present?', !!apiKey)
    
    if (!apiKey) {
      console.error('CALORIE_API_DEBUG: API key MISSING — check Vercel env vars')
      return { error: 'API key not configured', foods: [] }
    }
    
    const url = `${CALORIE_API_BASE}/search/foods?q=${encodeURIComponent(query)}&limit=10`
    console.error('CALORIE_API_DEBUG: Fetching URL:', url)
    
    const res = await fetch(url, {
      headers: { 'X-API-Key': apiKey },
      next: { revalidate: 0 }
    })
    
    console.error('CALORIE_API_DEBUG: Response status:', res.status)
    
    if (res.status === 429) {
      console.error('CALORIE_API_DEBUG: Rate limited')
      return { error: 'Rate limit reached. Try again.', foods: [] }
    }
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('CALORIE_API_DEBUG: Response not OK. Status:', res.status, 'Body:', errorText)
      return { error: 'Search failed. Try again.', foods: [] }
    }
    
    const data = await res.json()
    console.error('CALORIE_API_DEBUG: Response body keys:', Object.keys(data))
    console.error('CALORIE_API_DEBUG: data.results type:', typeof data.results, 'isArray:', Array.isArray(data.results))
    console.error('CALORIE_API_DEBUG: data.results length:', data.results?.length)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const foods = data.results?.map((food: any) => ({
      id: food.id,
      name: food.name,
      brand: food.brand_name || null,
      caloriesPer100g: food.calories || 0,
      proteinPer100g: food.protein_g || 0,
      carbsPer100g: food.carbohydrates_g || 0,
      fatPer100g: food.fat_g || 0,
      servingSize: food.serving_size || '100g',
    })) || []
    
    console.error('CALORIE_API_DEBUG: Mapped foods count:', foods.length)
    return { foods }
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error('CALORIE_API_DEBUG: CATCH ERROR:', e.message, e.stack)
    return { error: 'Search failed. Check connection.', foods: [] }
  }
}
