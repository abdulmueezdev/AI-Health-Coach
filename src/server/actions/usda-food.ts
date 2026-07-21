'use server'

const USDA_API_KEY = 'DEMO_KEY' // Free tier, no signup required for DEMO_KEY
const USDA_BASE = 'https://api.nal.usda.gov/fdc/v1'

export async function searchFoods(query: string) {
  const url = `${USDA_BASE}/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(query)}&dataType=Foundation,SR%20Legacy&pageSize=10`
  try {
    const res = await fetch(url)
    const data = await res.json()
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.foods?.map((food: any) => ({
      fdcId: food.fdcId,
      name: food.description,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      caloriesPer100g: food.foodNutrients.find((n: any) => n.nutrientName === 'Energy' || n.nutrientName === 'Energy (Atwater General Factors)')?.value || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      proteinPer100g: food.foodNutrients.find((n: any) => n.nutrientName === 'Protein')?.value || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      carbsPer100g: food.foodNutrients.find((n: any) => n.nutrientName === 'Carbohydrate, by difference')?.value || 0,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fatPer100g: food.foodNutrients.find((n: any) => n.nutrientName === 'Total lipid (fat)')?.value || 0,
    })) || []
  } catch (error) {
    console.error('USDA search error:', error)
    return []
  }
}

export async function getFoodDetails(fdcId: number) {
  const url = `${USDA_BASE}/food/${fdcId}?api_key=${USDA_API_KEY}`
  try {
    const res = await fetch(url)
    return await res.json()
  } catch (error) {
    console.error('USDA details error:', error)
    return null
  }
}
