import { chatCompletion } from './groq-client'
import { analyzeImage, analyzeImageFromUrl } from './gemini-client'

export interface AIService {
  chat(prompt: string, context?: string): Promise<string>
  analyzeMealPhoto(imageBase64: string): Promise<{
    description: string
    calories: number
    macros: { protein: number; carbs: number; fat: number }
  }>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  analyzeImage(url: string, prompt: string): Promise<any>
  generateSummary(history: string): Promise<string>
}

export const aiService: AIService = {
  chat: async (prompt: string, context?: string) => {
    return chatCompletion(prompt, context)
  },
  analyzeMealPhoto: async (imageBase64: string) => {
    return analyzeImage(imageBase64)
  },
  analyzeImage: async (url: string, prompt: string) => {
    return analyzeImageFromUrl(url, prompt)
  },
  generateSummary: async (history: string) => {
    const systemPrompt = "You are an AI health coach analyzing a user's recent history. Generate a concise profile summary highlighting their progress, active habits, and current trends."
    return chatCompletion(`User History:\n${history}\n\nPlease generate the summary.`, systemPrompt)
  }
}
