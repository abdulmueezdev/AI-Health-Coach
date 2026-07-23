'use server'

const OPENFOODFACTS_BASE = 'https://world.openfoodfacts.org/cgi/search.pl'

export async function searchFoods(query: string) {
  console.error('CALORIE_API_DEBUG: searchFoods called with query:', query)
  
  if (!query || query.length < 2) {
    console.error('CALORIE_API_DEBUG: Query too short, returning empty')
    return { foods: [] }
  }
  
  try {
    const url = `${OPENFOODFACTS_BASE}?search_terms=${encodeURIComponent(query)}&json=1&page_size=10`
    console.error('CALORIE_API_DEBUG: Fetching URL:', url)
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'VitalisApp/1.0 (vitalis@example.com)'
      }
    })
    
    console.error('CALORIE_API_DEBUG: Response status:', res.status)
    
    if (!res.ok) {
      const errorText = await res.text()
      console.error('CALORIE_API_DEBUG: Response not OK. Status:', res.status, 'Body:', errorText.substring(0, 500))
      return { error: 'Search failed. Try again.', foods: [] }
    }
    
    const data = await res.json()
    console.error('CALORIE_API_DEBUG: products count:', data.products?.length)
    
    // OpenFoodFacts returns { products: [...] }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const foods = data.products?.map((product: any) => {
      const nutriments = product.nutriments || {}
      
      // OpenFoodFacts uses per-100g values by default
      const calories = nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0
      const protein = nutriments.proteins_100g || nutriments.proteins || 0
      const carbs = nutriments.carbohydrates_100g || nutriments.carbohydrates || 0
      const fat = nutriments.fat_100g || nutriments.fat || 0
      
      return {
        id: product.code || product.id || Math.random().toString(36).substring(7),
        name: product.product_name || product.product_name_en || 'Unknown food',
        brand: product.brands || null,
        caloriesPer100g: Math.round(calories),
        proteinPer100g: Math.round(protein * 10) / 10,
        carbsPer100g: Math.round(carbs * 10) / 10,
        fatPer100g: Math.round(fat * 10) / 10,
        servingSize: '100g',
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }).filter((food: any) => food.caloriesPer100g > 0 || food.proteinPer100g > 0 || food.carbsPer100g > 0 || food.fatPer100g > 0) || []
    
    console.error('CALORIE_API_DEBUG: Mapped foods count:', foods.length)
    return { foods }
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.error('CALORIE_API_DEBUG: CATCH ERROR:', e.message, e.cause?.message, e.stack)
    return { error: 'Search failed. Check connection.', foods: [] }
  }
}
