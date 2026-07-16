# Vercel Environment Variables — Copy-Paste Ready

## Step 1: Add These in Vercel Dashboard
Go to: https://vercel.com/dashboard → Select Project → Settings → Environment Variables

### Production Environment (Required)

| Name | Value | Environment |
|------|-------|-------------|
| NEXT_PUBLIC_SUPABASE_URL | https://gvhszzielsrmjshwvftc.supabase.co | Production |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | [paste from .env.local] | Production |
| SUPABASE_SERVICE_ROLE_KEY | [paste from .env.local] | Production |
| GEMINI_API_KEY | [paste from .env.local] | Production |
| GROQ_API_KEY | [paste from .env.local] | Production |
| RESPONSIVE_VOICE_KEY | [paste from .env.local] | Production |

### Preview Environment (Optional but Recommended)
Copy all Production variables to Preview environment too.

### Development Environment (Optional)
Copy all Production variables to Development environment too.

## Step 2: Supabase Dashboard Settings
Go to: https://supabase.com/dashboard/project/gvhszzielsrmjshwvftc

### Authentication → URL Configuration
| Setting | Value |
|---------|-------|
| Site URL | https://[your-vercel-domain].vercel.app |
| Redirect URLs | https://[your-vercel-domain].vercel.app/auth/callback |

### Authentication → Providers → Email
| Setting | Value |
|---------|-------|
| Confirm email | ✅ ENABLED |
| Secure email change | ✅ ENABLED |

### Storage → Buckets
| Bucket | Privacy | RLS |
|--------|---------|-----|
| meal-photos | Private | ✅ Enabled |

## Step 3: Build Settings (Vercel)
| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | npm run build |
| Output Directory | .next |
| Install Command | npm install |
| Development Command | npm run dev |

## Step 4: Deploy
1. Push `main` branch to GitHub (already done)
2. Vercel auto-deploys on push
3. Verify build succeeds in Vercel dashboard
4. Test the live URL
