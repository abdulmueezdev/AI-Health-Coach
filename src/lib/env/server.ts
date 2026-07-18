import { z } from 'zod';

const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url("Must be a valid URL").optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  RESPONSIVE_VOICE_KEY: z.string().optional(),
});

const isBuild = process.env.npm_lifecycle_event === 'build' || process.env.NEXT_PHASE === 'phase-production-build';

const parsed = isBuild
  ? {
      success: true as const,
      data: {
        SUPABASE_URL: 'https://placeholder.supabase.co',
        SUPABASE_ANON_KEY: 'placeholder',
        SUPABASE_SERVICE_ROLE_KEY: 'placeholder',
        GEMINI_API_KEY: 'placeholder',
        GROQ_API_KEY: 'placeholder',
        RESPONSIVE_VOICE_KEY: 'placeholder',
      } as unknown as z.infer<typeof serverEnvSchema>,
    }
  : serverEnvSchema.safeParse({
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      GEMINI_API_KEY: process.env.GEMINI_API_KEY,
      GROQ_API_KEY: process.env.GROQ_API_KEY,
      RESPONSIVE_VOICE_KEY: process.env.RESPONSIVE_VOICE_KEY,
    });

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables');
}

export const serverEnv = parsed.data;
