# Vitalis (AI Health Coach) - AI Context & Memory

This document contains the critical context, architecture, and recent progress for the Vitalis project. 
**When starting a new session, the AI should read this file first to get fully up to speed.**

## 1. Project Overview & Tech Stack
* **Project Name**: Vitalis (AI Health Coach)
* **Framework**: Next.js 14 (App Router)
* **Language**: TypeScript
* **Styling & UI**: Tailwind CSS, Framer Motion, Lucide React (Icons), Custom UI components in `src/components/ui/`
* **Backend & Auth**: Supabase (Postgres Database, Auth, and Storage)
* **Data Fetching**: Next.js Server Actions (located in `src/server/actions/`)

## 2. Current State & Recent Accomplishments (v1.0.6.1)
The application currently has a working authentication flow and core user dashboards.
Recently completed features:
* **Dashboard UI Refinement**: Re-designed the Recommended Actions to be interactive "One-Click Actions" with tactical hover states, icons (`Coffee`, `Footprints`, `Wind`), and inline `Loader2` spinners.
* **Quick Actions Integration**:
  * "Extend fast by 30m" creates a default 400-calorie Break-fast meal via `createMeal`.
  * "15m Outdoor walk" logs a 15-minute Cardio workout via `createWorkout`.
  * "Deep breathing session" checks for an existing habit via Supabase client, and either creates the habit or increments the streak via `logHabitCompletion`.
* **Toast Notification System**: Built-in stateful toast notifications triggered on successful or failed Quick Actions.
* **Database Fixes**: Fixed timezone/date-string formatting bugs (enforced `YYYY-MM-DD` for `date` Postgres columns instead of ISO timestamps).

## 3. Key Files & Directory Structure
* `src/app/dashboard/page.tsx`: The main user dashboard. Contains `handleQuickAction` logic and complex UI state.
* `src/server/actions/meals.ts`: Server actions for logging and fetching meals.
* `src/server/actions/workouts.ts`: Server actions for logging and fetching workouts.
* `src/server/actions/habits.ts`: Server actions for habits and streaks.
* `src/lib/supabase/client.ts` & `src/lib/supabase/server.ts`: Supabase initialization clients.
* `src/lib/hooks/useUser.ts`: Hook providing `{ user, profile }` globally.

## 4. Known Issues & Operational Rules
* **Strict Types**: The project uses strict TypeScript. For example, `createMeal` requires all non-optional fields like `photo_url` (which can be `null`).
* **Environment Instability**: The local dev server's Supabase connection sometimes experiences connection timeouts. If a database request fails during testing, assume it might be a temporary network timeout rather than a code logic error.
* **Aesthetics**: Follow the high-agency frontend design rules (from the `design-taste-frontend` skill). Avoid generic colors, use rich aesthetics, subtle animations, and proper empty states.
* **Testing / Verification**: Use `npm run build && npx tsc --noEmit` to verify type safety and build success after making changes. Note that the Playwright headless browser environment in the agent sandbox is currently unable to take screenshots due to driver issues, so visual verification must be done via code inspection or by the human CTO.
