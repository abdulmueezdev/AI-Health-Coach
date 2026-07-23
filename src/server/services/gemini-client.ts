import { GoogleGenerativeAI } from '@google/generative-ai'

let genAI: GoogleGenerativeAI | null = null
let model: ReturnType<GoogleGenerativeAI['getGenerativeModel']> | null = null

function getModel() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set')
    }
    genAI = new GoogleGenerativeAI(apiKey)
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  }
  return model!
}

export async function analyzeImage(imageBase64: string): Promise<{
  description: string
  calories: number
  macros: { protein: number; carbs: number; fat: number }
}> {
  const model = getModel()

  const prompt = `Analyze this meal photo. Return ONLY a valid JSON object matching this schema exactly, with no markdown formatting or other text:
{
  "description": "A short, accurate description of the food",
  "calories": <estimated total calories as number>,
  "macros": {
    "protein": <estimated protein in grams as number>,
    "carbs": <estimated carbs in grams as number>,
    "fat": <estimated fat in grams as number>
  }
}`

  let mimeType = "image/jpeg"
  let base64Data = imageBase64
  
  if (imageBase64.startsWith('data:')) {
    const matches = imageBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/)
    if (matches && matches.length === 3) {
      mimeType = matches[1]
      base64Data = matches[2]
    }
  }

  const imageParts = [
    {
      inlineData: {
        data: base64Data,
        mimeType
      }
    }
  ]

  const result = await model.generateContent([prompt, ...imageParts])
  const response = await result.response
  const text = response.text()
  
  // Clean markdown backticks if Gemini includes them
  const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim()
  
  try {
    return JSON.parse(cleanedText)
  } catch {
    throw new Error('Failed to parse Gemini response as JSON: ' + cleanedText)
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function analyzeImageFromUrl(url: string, prompt: string): Promise<any> {
  const model = getModel()
  const res = await fetch(url)
  const arrayBuffer = await res.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const base64Data = buffer.toString('base64')
  
  const mimeType = res.headers.get('content-type') || 'image/jpeg'

  const imageParts = [
    {
      inlineData: {
        data: base64Data,
        mimeType
      }
    }
  ]

  const result = await model.generateContent([prompt, ...imageParts])
  return result
}
