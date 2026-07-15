# Backend Schema (Supabase / Postgres)

All tables live in the `public` schema and reference `auth.users` for identity. Every table has Row Level Security enabled with a policy scoped to `auth.uid() = user_id`, so one user can never read or write another user's rows — this is the technical backbone of the "no doxing / no leakage between users" rule, not just a prompt-level guideline.

## Tables

### `profiles`
| Field | Type | Notes |
|---|---|---|
| `user_id` | uuid, PK, FK → auth.users.id | |
| `display_name` | text | |
| `goal_type` | text | e.g. lose weight, gain weight, maintain |
| `starting_weight` | numeric | |
| `target_weight` | numeric | |
| `height` | numeric | |
| `activity_level` | text | |
| `created_at` | timestamptz, default now() | |

### `meals`
| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `user_id` | uuid, FK → profiles.user_id | indexed |
| `logged_at` | timestamptz | indexed, with `user_id` |
| `photo_url` | text, nullable | Supabase Storage path, private bucket |
| `description` | text | |
| `calories_estimate` | integer | |
| `macros` | jsonb | protein/carbs/fat breakdown |
| `source` | enum(`photo`, `manual`) | |

### `workouts`
| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `user_id` | uuid, FK → profiles.user_id | indexed |
| `date` | date | indexed, with `user_id` |
| `type` | text | |
| `exercises` | jsonb | array of {name, sets, reps, weight} |
| `duration_min` | integer | |
| `intensity` | text | |
| `notes` | text | |

### `habits`
| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `user_id` | uuid, FK → profiles.user_id | |
| `name` | text | |
| `frequency` | text | e.g. daily, 3x/week |
| `streak_count` | integer, default 0 | |
| `last_completed_at` | timestamptz, nullable | |

### `habit_logs`
| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `habit_id` | uuid, FK → habits.id | |
| `user_id` | uuid, FK → profiles.user_id | redundant but kept for simpler RLS policies |
| `completed_at` | timestamptz | |

### `goals`
| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `user_id` | uuid, FK → profiles.user_id | |
| `type` | text | |
| `target_value` | numeric | |
| `target_date` | date, nullable | |
| `status` | text | active / completed / abandoned |

### `progress_snapshots`
| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `user_id` | uuid, FK → profiles.user_id | indexed, with `date` |
| `date` | date | |
| `weight` | numeric, nullable | |
| `body_stat` | jsonb, nullable | open-ended, e.g. self-rated energy |

### `ai_interactions`
| Field | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `user_id` | uuid, FK → profiles.user_id | indexed |
| `role` | enum(`user`, `assistant`) | |
| `content` | text | never store raw personal identifiers here — see no-doxing rule |
| `created_at` | timestamptz | |

### `ai_profile_summary`
| Field | Type | Notes |
|---|---|---|
| `user_id` | uuid, PK, FK → profiles.user_id | one row per user |
| `summary_text` | text | compressed long-term memory of habits/preferences, regenerated periodically rather than replaying full history every call |
| `updated_at` | timestamptz | |

## Relationships

All tables key off `profiles.user_id`, which itself is 1:1 with `auth.users.id`. `habit_logs` additionally keys off `habits.id`.

## Roles & Permissions

- Standard authenticated Supabase role only — no custom role system needed at this scale.
- Row Level Security policy on every table above: `user_id = auth.uid()` for select/insert/update/delete.
- The service-role key (which bypasses RLS) is never used from client code — only from trusted server-side functions, and only where strictly necessary (e.g. background summary regeneration).

## Security Rules

- RLS enabled on every table without exception.
- Meal photos stored in a **private** Supabase Storage bucket; access via short-lived signed URLs, never public URLs.
- No personal identifiers (real name, contact info, location, etc.) should ever be written into `ai_interactions.content` or sent to the LLM provider — enforce this by stripping/validating at the API layer that assembles prompts, not by hoping the model omits it.

## Indexes

- `meals(user_id, logged_at)`
- `workouts(user_id, date)`
- `progress_snapshots(user_id, date)`
- `habit_logs(habit_id, completed_at)`
