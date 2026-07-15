import { serverEnv } from '@/lib/env/server';

export async function chatCompletion(prompt: string, context?: string): Promise<string> {
  const messages = []
  if (context) {
    messages.push({ role: 'system', content: context })
  }
  messages.push({ role: 'user', content: prompt })

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${serverEnv.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages,
      temperature: 0.7,
      max_tokens: 1024,
    })
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq API error: ${res.status} ${err}`)
  }

  const data = await res.json()
  return data.choices[0]?.message?.content || ''
}
