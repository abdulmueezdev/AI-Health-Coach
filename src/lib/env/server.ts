import { z } from 'zod';

const serverEnvSchema = z.object({
  SUPABASE_URL: z.string().url("Must be a valid URL"),
  SUPABASE_ANON_KEY: z.string().min(1, "Supabase Anon Key is required"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, "Supabase Service Role Key is required"),
  GEMINI_API_KEY: z.string().min(1, "Gemini API Key is required"),
  GROQ_API_KEY: z.string().min(1, "Groq API Key is required"),
  RESPONSIVE_VOICE_KEY: z.string().min(1, "ResponsiveVoice Key is required"),
});

export const serverEnv = serverEnvSchema.parse({
  SUPABASE_URL: process.env.SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GROQ_API_KEY: process.env.GROQ_API_KEY,
  RESPONSIVE_VOICE_KEY: process.env.RESPONSIVE_VOICE_KEY,
});
