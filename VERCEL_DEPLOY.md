# Vercel Deployment Guide

## Step 1: Connect Repo
1. Go to https://vercel.com/new
2. Import `abdulmueezdev/AI-Health-Coach`
3. Framework preset: Next.js
4. Build command: `npm run build`
5. Output directory: Default (`.next`)

## Step 2: Environment Variables
Add these in Vercel Dashboard → Project Settings → Environment Variables:

### Client Variables (NEXT_PUBLIC_)
| Variable | Value | Source |
|----------|-------|--------|
| NEXT_PUBLIC_SUPABASE_URL | https://gvhszzielsrmjshwvftc.supabase.co | Supabase Dashboard → API |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | [your-anon-key] | Supabase Dashboard → API |

### Server Variables (Secret)
| Variable | Value | Source |
|----------|-------|--------|
| SUPABASE_SERVICE_ROLE_KEY | [your-service-role-key] | Supabase Dashboard → API (secret) |
| GEMINI_API_KEY | [your-gemini-key] | Google AI Studio |
| GROQ_API_KEY | [your-groq-key] | Groq Console |
| RESPONSIVE_VOICE_KEY | [your-responsivevoice-key] | ResponsiveVoice.org |

## Step 3: Supabase Production Settings
1. Go to https://supabase.com/dashboard/project/gvhszzielsrmjshwvftc
2. Authentication → URL Configuration:
   - Site URL: `https://[your-vercel-domain].vercel.app`
   - Redirect URLs: Add `https://[your-vercel-domain].vercel.app/auth/callback`
3. Authentication → Providers → Email → Enable "Confirm email"
4. Storage → meal-photos bucket → Verify RLS policies are active

## Step 4: Deploy
1. Push `main` branch (already done)
2. Vercel auto-deploys on every push
3. Verify build succeeds in Vercel dashboard
