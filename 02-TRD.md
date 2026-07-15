# Technical Requirements Document (TRD)

## Frontend Framework

**Next.js (App Router) + TypeScript.** Matches the builder's existing pipeline (same stack used for the Sovereign project), and aligns with the Vercel-hosted, Vercel-AI-SDK-adjacent tooling referenced in the original project brief.

## Backend Framework

Next.js server actions / API routes running on Vercel. No separate backend service — Supabase handles persistence and auth, and Next.js server-side code is the only layer that talks to the LLM provider (API keys never touch the client).

## Database

**Supabase (Postgres), free tier.** See the Backend Schema document for tables. Kept intentionally lean to stay inside the free tier's storage and row limits.

## State Management

React state/hooks for local UI state. For server data (meals, workouts, habits, progress), a lightweight fetch/cache layer (e.g. a query-caching library) is recommended over a heavier global-state library — this app doesn't need Redux-level complexity. **Open item:** confirm against the framework's approved library list once `fullcontext_framework.md` is available, since the doc handed over explicitly says not to add unauthorized libraries.

## Styling Approach

**Tailwind CSS**, driven by a design-token system produced in Stitch from the Dribbble reference (see UI/UX Design Brief) — colors, radii, spacing, and type scale defined as tokens first, then implemented as Tailwind config, not hand-picked per component.

## Authentication Provider

**Supabase Auth** (email/password to start; social providers optional later). Onboarding wizard runs immediately after first sign-in, before dashboard access.

## Hosting / Deployment

**Vercel**, matching the "publish on GitHub and Vercel" requirement and the free-tier constraint.

## Third-Party APIs

- **ResponsiveVoice** — all text-to-speech output. Browser/developer API only, no local TTS, no local voice models.
- **Google AI Studio (Gemini API)** — the hosted LLM, used for both coaching text and meal-photo vision analysis. This was Claude's recommendation from the free-tier comparison earlier in this project (native multimodal support, permanent free tier, no card required) — **treat this as the current default, not yet a hard lock**, since it hasn't been explicitly confirmed back. Default models: Gemini Flash for general use, Flash-Lite where higher throughput is needed; avoid Pro-tier models, which moved to paid-only access in April 2026.
- The AI call is isolated behind a single service module (one file/function) so the provider can be swapped (e.g. to OpenRouter, which fronts 300+ models behind one gateway, or Groq for latency-sensitive text-only replies) without touching the rest of the app. This satisfies the "provider-agnostic" requirement from the original project brief without adding OpenRouter's overhead on day one.

## Constraints Carried Over From the Framework Handoff

> `PROPOSED CHANGE:` `fullcontext_framework.md` IS supplied. All skill names and MCP server names are confirmed. The previous note about it missing has been overridden.

The handoff document names a master context file, `fullcontext_framework.md`, as the source of truth for available MCP servers, the Stitch skill registry, and motion libraries.

## Hard Constraints (from the project brief and the framework handoff)

- Free-tier friendly across every service used.
- Hosted AI only — no local inference, no local TTS, no GPU dependency.
- No doxing: no personal identifiers, contact info, or hidden identifying data in any prompt, log, or generated output — enforced at the API-call layer, not left to the model's judgment.
- Stitch-first: UI is designed in Stitch before any component code is generated.
