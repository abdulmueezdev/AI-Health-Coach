# Implementation Plan

Phases run **strictly in order** — no skipping ahead. Within each phase, work is broken into smaller execution chunks using **GSD Core**, and each chunk runs to completion via **Ralph Loop** (continuous execution until that chunk is done) before moving to the next chunk. A phase is not considered complete — and Ralph Loop should not advance past it — until every chunk in that phase is finished.

## Phase 1: Environment & Setup

- Scaffold the Next.js (TypeScript, Tailwind) repo.
- Set up environment variables/secrets for Supabase, the Gemini API key, and the ResponsiveVoice key — none of these ever committed to the repo.
- Run the Stitch-first design pass: feed the Dribbble reference and the Comico/Zodiak font pairing into Stitch to produce the initial design tokens (color, spacing, radius, type scale) *before* any component code exists.
- GSD Core chunking suggestion for this phase: (1) repo scaffold, (2) env/secrets wiring, (3) Stitch design-token pass.

## Phase 2: Database & Auth

- Create the Supabase project.
- Apply the schema from the Backend Schema document (all tables, RLS policies, indexes).
- Wire up Supabase Auth (sign up, log in, session handling).
- Build the onboarding flow scaffold (goals, baseline stats) that fires on a user's first authenticated session.

## Phase 3: Core Backend/API

- CRUD server actions/API routes for meals, workouts, habits, goals, and progress snapshots.
- The Gemini service abstraction: one isolated module that every AI call goes through, so swapping providers later doesn't touch the rest of the app.
- The meal-photo analysis endpoint: image in → Gemini multimodal call → food/calorie/macro estimate out → saved to `meals`.
- The coach context-assembly function: pulls recent history + the `ai_profile_summary` row into a prompt, calls the Gemini service module, logs the exchange to `ai_interactions`.

## Phase 4: Frontend Integration

- Convert the Stitch design system into real Tailwind/Next.js components.
- Build out the dashboard/overview page, meal/workout/habit pages, the progress/charts view, and the coach chat UI.
- Wire ResponsiveVoice playback controls (play/pause/stop/replay) onto coach responses.
- Connect every screen to the Phase 3 endpoints — no more mock data by the end of this phase.

## Phase 5: Polish & Edge Cases

- Loading, empty, and error states for every screen (see App Flow's edge-case list).
- Graceful handling of Gemini free-tier rate limits and any AI/voice call failure.
- Mobile responsiveness pass across all three dashboard zones.
- Micro-interaction/motion pass per the UI/UX brief (count-up numbers, chart draw-in, card entrance, button feedback).
- No-doxing audit: confirm no personal identifiers can reach a prompt, log, or output anywhere in the app.

## Phase 6: Testing & Deployment

- Manual QA of the full user journey: sign-up → onboarding → logging → coach interaction → voice playback.
- Confirm a brand-new sign-up sees zero data from the builder's personal account (RLS + UI check).
- Resolve the Comico font licensing question (commercial license or substitute) before the repo goes public.
- Deploy to Vercel; make the GitHub repo public-ready (README, `.env.example`, generic onboarding copy, no personal data anywhere in seed/demo content).
- Final check that usage patterns comfortably sit inside Supabase's and Gemini's free-tier limits.

## Open Dependency

Several execution details in this plan (exact Stitch skill invocations, MCP server names, motion tooling) are described at the capability level rather than by exact tool name, because `fullcontext_framework.md` — the master context file referenced in the handoff — wasn't included with it. Reconcile the specific names against that file once it's supplied; don't substitute an invented tool/skill name in its place.
