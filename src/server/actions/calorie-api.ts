'use server'

const CALORIE_API_BASE = 'https://api.api-ninjas.com/v1'

export async function searchFoods(query: string) {
  console.error('CALORIE_API_DEBUG: searchFoods called with query:', query)
  
  if (!query || query.length < 2) {
    console.error('CALORIE_API_DEBUG: Query too short, returning empty')
    return { foods: [] }
  }
  
  try {
    const apiKey = process.env.CALORIE_API_KEY
    console.error('CALORIE_API_DEBUG: API key present?', !!apiKey)
    console.error('CALORIE_API_DEBUG: API key length:', apiKey?.length || 0)
    
    if (!apiKey) {
      console.error('CALORIE_API_DEBUG: API key MISSING')
      return { error: 'API key not configured', foods: [] }
    }
    
    const url = `${CALORIE_API_BASE}/nutrition?query=${encodeURIComponent(query)}`
    console.error('CALORIE_API_DEBUG: Fetching URL:', url)
    
    // NOTE: Removed next: { revalidate: 0 } — this can break external fetches
    const res = await fetch(url, {
      headers: { 'X-Api-Key': apiKey }
    })
    
    console.error('CALORIE_API_DEBUG: Response status:', res.status)
    
    if (res.status === 429) {
      console.error('CALORIE_API_DEBUG: Rate limited')
      return { error: 'Rate limit reached. Try again.', foods: [] }
    }
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('CALORIE_API_DEBUG: Response not OK. Status:', res.status, 'Body:', errorText.substring(0, 500))
      return { error: 'Search failed. Try again.', foods: [] }
    }
    
    const data = await res.json()
    console.error('CALORIE_API_DEBUG: Response keys:', Object.keys(data))
    console.error('CALORIE_API_DEBUG: items count:', data.items?.length)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const foods = data.items?.map((food: any) => ({
      id: food.name.toLowerCase().replace(/\s+/g, '-'),
      name: food.name,
      brand: null,
      caloriesPer100g: food.calories || 0,
      proteinPer100g: food.protein_g || 0,
      carbsPer100g: food.carbohydrates_total_g || 0,
      fatPer100g: food.fat_total_g || 0,
      servingSize: `${food.serving_size_g || 100}g`,
    })) || []
    
    console.error('CALORIE_API_DEBUG: Mapped foods count:', foods.length)
    return { foods }
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    // Log the FULL error including e.cause which contains the real network error
    console.error('CALORIE_API_DEBUG: CATCH ERROR message:', e.message)
    console.error('CALORIE_API_DEBUG: CATCH ERROR cause:', e.cause)
    console.error('CALORIE_API_DEBUG: CATCH ERROR cause message:', e.cause?.message)
    console.error('CALORIE_API_DEBUG: CATCH ERROR stack:', e.stack)
    return { error: 'Search failed. Check connection.', foods: [] }
  }
}
