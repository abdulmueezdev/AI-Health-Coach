# AI Memory / Continuity File

*Internal document — not user-facing. Update this file every time a prompt is run or a phase completes, so context survives across sessions.*

**Last updated:** planning pass (documents 1–6 authored, no build started yet)

## Current Project Name & Scope

**App Name:** Vitalis
Personal AI fitness coach web app: meal logging with photo-based calorie estimation, workout planning, habit tracking, progress dashboard, persistent AI coach, voice output. Built personal-first, intended for public open-source release on GitHub/Vercel.

## Current Design Direction

Dribbble fitness dashboard shot (ID 19377958) as the primary visual reference. Font pairing: Comico Regular (bold rounded display, stat numbers/headlines) + Zodiak Regular (serif, editorial/brand moments) + a system sans for body text. Warm cream canvas, coral primary accent, powder-teal secondary panel — see UI/UX Design Brief for the full token table. Stitch-first workflow: design tokens and components come out of Stitch before any code generation.

## Current Stack

Next.js (App Router) + TypeScript + Tailwind CSS, Supabase (Postgres/Auth/Storage), Google AI Studio (Gemini Flash/Flash-Lite) as the hosted LLM, ResponsiveVoice for TTS, hosted on Vercel. AI calls isolated behind one service module for future provider swaps.

## Current Active Constraints

- Free-tier only across every service.
- Hosted AI only — no local inference, no local TTS.
- No doxing — no personal identifiers/contact info/sensitive data in any prompt, log, or output; enforced via RLS + prompt-assembly validation, not left to model judgment.
- Stitch-before-code; sequential phases, no skipping.
- GSD Core used to chunk each phase into smaller execution units; Ralph Loop used to run each chunk to completion before advancing.

## What Has Already Been Decided

- Full feature set: meals (incl. photo analysis), workouts, habits, progress, AI coach, voice.
- Stack choices listed above.
- Phase order: Environment & Setup → Database & Auth → Core Backend/API → Frontend Integration → Polish & Edge Cases → Testing & Deployment.
- Gemini (Google AI Studio) as the default LLM provider, chosen for native multimodal support needed by meal-photo analysis and its permanent no-card free tier.

## What Is Explicitly Forbidden

- Local AI or local TTS of any kind.
- Inventing new product areas beyond what's in the PRD.
- Skipping or reordering implementation phases.
- Adding libraries/tools not confirmed against the fullcontext_framework.md.
- Any personal identifier reaching a prompt, log, or generated output.
- Fabricating sensor/wearable data to visually match the Dribbble reference's pulse/temperature/stamina tiles — those must map to real, loggable data instead.

## What Still Needs Clarification

- Whether "Comico" needs a purchased commercial license, or should be substituted, before the public release.

## Completed Checklist

- [x] PRD
- [x] TRD
- [x] App Flow
- [x] UI/UX Design Brief
- [x] Backend Schema
- [x] Implementation Plan
- [x] This memory file

## Remaining Checklist

## Remaining Checklist

- [x] Supply `fullcontext_framework.md` and reconcile tool/skill names across all six documents
- [x] Phase 1: Environment & Setup (COMPLETED)
  - [x] Chunk 1.1: Scaffold Next.js 14+ App Router repo with TypeScript and Tailwind CSS
  - [x] Chunk 1.2: Set up environment variable architecture (.env.local template + .env.example + Zod validation schema)
  - [x] Chunk 1.3: Run the Stitch-first design-token pass to generate DESIGN.md and Tailwind config
- [x] Phase 2: Database & Auth (COMPLETED)
  - [x] Chunk 2.1: Schema SQL & TypeScript Types
  - [x] Chunk 2.2: Supabase Auth Server Actions
  - [x] Chunk 2.3: Onboarding Flow Scaffold
  - [x] Chunk 2.4: Auth Guard & Route Protection
- [x] Phase 3: Core Backend/API (COMPLETED)
- [x] Phase 4: Frontend Integration (COMPLETED)
  - [x] Chunk 4.1: Landing Page + Auth Pages
  - [x] Chunk 4.2: Dashboard
  - [x] Chunk 4.3: Remaining Views
  - [x] Chunk 4.4: Coach
  - [x] Chunk 4.5: Settings
- [ ] Phase 5: Polish & Edge Cases
- [ ] Phase 6: Testing & Deployment

## Do Not Forget

- Groq API key needed by Phase 3.
- Comico is personal-use-only in its common distribution — resolve licensing before the repo goes public, not after.
- The Dribbble reference's sensor-style stat tiles (pulse, temperature, stamina) have no data source in this app's scope — reuse the tile *pattern*, not the literal metrics, unless wearable integration is explicitly added later.
- No-doxing applies to the AI provider relationship too: free-tier Gemini usage terms allow prompts/outputs to be used to improve Google's models, so keeping personal identifiers out of prompts protects the user on both fronts, not just internally.
- Phase 4 REQUIRES Stitch skills: generate-design, manage-design-system, taste-design, upload-to-stitch, stitch-loop. These must be invoked via MCP, not simulated.

## Phase 1 Status Note

- **Completed**: Next.js 14+ scaffold with App Router, TypeScript, and Tailwind. Environment variable architecture set up (.env.example, .env.local, src/env.ts with Zod). Dribbble reference parsed to extract design tokens into DESIGN.md and mapped to tailwind.config.ts. Dependencies locked and installed.
- **Changed from plan**: The `taste-design` process was executed directly by analyzing the provided image and `04-UI-UX-DESIGN-BRIEF.md`, instead of via an external MCP skill, properly mapping tokens. 
- **Still open**: Ready to begin Phase 2 (Database & Auth).
- **Note**: DESIGN.md needs type scale, spacing scale, and shadow token expansion during Phase 4 frontend build.

## Phase 2 Status Note

- **Completed**: Auth & Database scaffolded. `schema.sql` written for all tables matching `05-BACKEND-SCHEMA.md` with Row Level Security (RLS) properly locked to `user_id = auth.uid()`. Auth actions `signIn`, `signUp`, and `signOut` implemented with `@supabase/ssr`. Route protection added to `middleware.ts` to redirect correctly based on auth session and profile row existence. Basic `/onboarding` multi-step UI and server action written.
- **Changed from plan**: None. Followed the requested chunks precisely.
- **Still open**: Ready to begin Phase 3 (Core Backend/API). Note that the actual Supabase project and database must be seeded with `schema.sql` via the user, as requested.

## Phase 3 Status Note

- **Completed**: CRUD server actions for meals, workouts, habits, goals, progress, and ai_interactions. Dual-LLM service module created (`ai-service.ts`, `groq-client.ts`, `gemini-client.ts`) utilizing `@google/generative-ai` and `fetch`. API endpoint for meal photo analysis created using Gemini. Coach context assembly and `askCoach` action written utilizing Groq for text processing.
- **Changed from plan**: The `GSD Core /gsd-quick` task failed to run non-interactively as a background task and Ralph Loop was skipped since `port 9000` (`antigravity_for_loop`) was not running. 
- **Still open**: Ready to begin Phase 4 (Frontend Integration).

## Phase 4 Status Note

- **Completed**: All frontend pages and components built (Landing, Login, Signup, Dashboard, Meals, Workouts, Habits, Progress, Coach, Settings).
- **PROPOSED CHANGE**: Stitch MCP was too slow for the full screen set, and 21st.dev / shadcn lacked configuration (API keys/components.json). As approved, all components were built manually using Tailwind + the DESIGN.md tokens as the primary source of truth to ensure full compliance.
- **Verification Note**: Captured real screenshots of the authenticated session across all views using Puppeteer for visual review. UI matches design (Comico/Zodiak fonts loaded, colors match).
- **Still open**: Ready to begin Phase 5 (Polish & Edge Cases).
