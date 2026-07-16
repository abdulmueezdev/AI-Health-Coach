import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { aiService } from '@/server/services/ai-service'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get('image') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Data = buffer.toString('base64')
    const mimeType = file.type || 'image/jpeg'
    const imageBase64 = `data:${mimeType};base64,${base64Data}`

    const result = await aiService.analyzeMealPhoto(imageBase64)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Meal analysis error:', error)
    if (error instanceof Error && error.message.includes('429')) {
      return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
    }
    return NextResponse.json({ error: 'Failed to analyze image' }, { status: 500 })
  }
}
