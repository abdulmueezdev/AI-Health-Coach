'use server'

const CALORIE_API_BASE = 'https://api.calorieapi.com/api/v1'

export async function searchFoods(query: string) {
  if (!query || query.length < 2) {
    return { foods: [] }
  }
  
  try {
    const apiKey = process.env.CALORIE_API_KEY
    if (!apiKey) {
      return { error: 'API key not configured', foods: [] }
    }
    
    const url = `${CALORIE_API_BASE}/search/foods?q=${encodeURIComponent(query)}&limit=10`
    
    const res = await fetch(url, {
      headers: { 'X-API-Key': apiKey },
      next: { revalidate: 0 }
    })
    
    if (res.status === 429) {
      return { error: 'Rate limit reached. Try again.', foods: [] }
    }
    
    if (!res.ok) {
      return { error: 'Search failed. Try again.', foods: [] }
    }
    
    const data = await res.json()
    
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
    
    return { foods }
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error('DEBUG ERROR - Calorie API fetch failed:', e.message)
    return { error: 'Search failed. Check connection.', foods: [] }
  }
}
