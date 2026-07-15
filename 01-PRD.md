# Product Requirements Document (PRD)

**Project:** Personal AI Fitness Coach Web App (working title — see note below)
**Status:** Planning / pre-build
**Prepared for:** Antigravity execution, under the Stitch-first / GSD Core / Ralph Loop workflow

---

## App Name

**Working title only — not yet decided.** Doc requires a name field, so options are offered for consideration; none of these are locked:

- *Vitalis*
- *Ascend Coach*
- *Forma*

Pick one, combine ideas, or supply your own before Phase 4 (Frontend Integration), since the name touches the logo, metadata, and repo naming.

## Tagline

TBD — pending app name. Working direction: something that signals "a coach that remembers you," e.g. *"The coach that actually knows your history."*

## Problem Statement

Most fitness-tracking apps are logging tools, not coaches — they store data but don't reason over it. The user has to interpret their own charts and decide what to do next. This product closes that gap: it keeps the same structured data (meals, workouts, habits, progress) that any tracker would, but adds a persistent AI layer that reads that history back as context on every interaction, so its coaching, meal suggestions, and reminders stay grounded in what actually happened rather than generic advice. Meal logging is the biggest daily-friction point in existing trackers (manual search + portion math), so photo-based calorie estimation removes that friction. Voice output removes the "phone screen at the gym" friction.

## Target Users

- **Primary:** the builder's own personal use — the app's default account/demo experience.
- **Secondary:** any public user who signs up after the open-source release. The product must work correctly for a brand-new account with zero history, not just for the primary user's seeded data.

## Core Features

1. **Auth & onboarding** — sign up/in, goal selection, baseline profile (starting weight, target, activity level).
2. **Meal logging** — manual entry, and photo upload → AI vision estimate of food items + calories/macros, saved to history.
3. **Workout planning** — routines, exercises, sets/reps/duration, and progression over time.
4. **Habit tracking** — recurring habits with streaks and completion logging.
5. **Progress dashboard** — charts and summary cards: weight trend, calories in/out, activity volume, streak %, habit adherence.
6. **AI coach** — a persistent conversational assistant that has access to the user's own stored history (via context, not fine-tuning) and can summarize progress, explain trends, suggest next actions, and answer coaching questions.
7. **Voice interaction** — ResponsiveVoice reads coach replies, summaries, and reminders aloud, with play/pause/stop/replay controls. No local TTS.

> **Design-reference note:** the Dribbble dashboard used as the visual reference (see UI/UX brief) shows stat tiles like *Pulse (bpm)*, *Temperature*, and *Stamina %* — these read as live wearable/sensor data. This app has no sensor integration in scope. The tile *pattern* (icon + status tag + big number + label) is being reused, but populated with data the app can actually produce: weight delta, calories burned/logged, habit streak %, self-rated energy, hydration if logged manually, etc. Flagging this now so Phase 4 doesn't quietly invent fake sensor readings to match the reference visually.

## Nice-to-Have Features

- Live camera capture for meal photos (not just file upload).
- A small curated knowledge layer from public fitness datasets to make early coaching responses feel less generic before much personal history exists.
- Data export (CSV/JSON) for the user's own records.
- A settings panel to change AI provider/model without a redeploy.

## User Stories

- As a user, I want to snap a photo of my meal so I don't have to manually search and log every ingredient.
- As a user, I want the coach to reference my actual last week of workouts when it suggests what to do next, not generic advice.
- As a user, I want to hear my daily summary spoken aloud so I can get it while getting ready, not just staring at a screen.
- As a new public user, I want onboarding to work the same way it does for the original builder, with no leftover personal data or assumptions from the demo account.
- As a user, I want a clear signal when the AI or voice layer fails, instead of a silent broken feature.

## Success Metrics

- The app runs entirely within Supabase's free tier and the chosen hosted LLM's free tier for personal daily use.
- The coach's responses visibly reference the user's actual stored history (not generic boilerplate) in normal use.
- Meal-photo estimates are usable as a starting point (not necessarily lab-accurate) without manual correction most of the time.
- A brand-new sign-up can complete onboarding → first meal log → first coach interaction with no personal data from the builder's account visible anywhere.
- No personally identifying information appears in any AI prompt, log, or generated output (see no-doxing rule across every document in this set).
