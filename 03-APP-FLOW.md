# App Flow

## Public Routes

- `/` — marketing/landing page (can double as the public-readiness "what is this" page for new sign-ups).
- `/login`
- `/signup`

## Protected Routes (require an authenticated session)

- `/onboarding` — first-run only: goals, baseline stats, preferences. Redirect here automatically if a logged-in user has no profile row yet.
- `/dashboard` — the Overview screen (hero + stat grid + insight panel from the UI/UX brief).
- `/meals` — meal log list + photo upload / manual entry.
- `/workouts` — workout planner and log.
- `/habits` — habit list, streaks, completion toggles.
- `/progress` — full charts view (weight trend, activity history, adherence).
- `/coach` — the AI coach chat, with voice playback controls on each response.
- `/settings` — profile, goals, and (later) AI-provider selection.

## Authentication Flow

1. User lands on `/` and chooses sign up or log in.
2. Supabase Auth handles credential verification and session issuance.
3. On first successful login, the app checks for a `profiles` row for that user. If none exists, redirect to `/onboarding` before anything else is reachable.
4. Onboarding writes the initial `profiles` and `goals` rows, then redirects to `/dashboard`.
5. All protected routes check for a valid session server-side; unauthenticated requests redirect to `/login`.

## Core User Journey

1. Sign up → onboarding (goals, baseline) → dashboard.
2. From the dashboard, log a meal (photo or manual), log a workout, or check off a habit.
3. Each log writes to Supabase and the relevant dashboard card/chart updates.
4. User opens `/coach`, asks a question or requests a summary; the coach assembles context from recent history + the running profile summary, calls Gemini, and returns a response.
5. User can have that response read aloud via ResponsiveVoice, with pause/stop/replay.
6. The interaction is saved (`ai_interactions`) so future coach responses can reference it.

## Error Handling & Edge Cases

- **Meal photo analysis fails or times out:** fall back to manual entry for that meal; never block the log entirely on the AI call succeeding.
- **LLM call fails or free-tier rate limit is hit:** show a clear, calm in-app message ("coach is temporarily unavailable, your data is saved") rather than a silent failure or a generic error screen. Never retry aggressively enough to burn through the daily free-tier quota.
- **Voice playback fails (ResponsiveVoice unavailable/blocked):** fall back silently to text-only display; voice is an enhancement, not a dependency for reading a response.
- **New user, empty state everywhere:** dashboard, charts, and coach must all have a sensible empty/first-run state — not a broken chart or a coach with nothing to reference.
- **Public sign-up isolation:** a new account must never see or reference the builder's personal history, seeded demo data, or any other user's data. This is a Supabase Row Level Security concern as much as a UI one — see Backend Schema.
