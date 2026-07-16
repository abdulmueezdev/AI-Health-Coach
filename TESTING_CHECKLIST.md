# Vitalis v1.0.1 Manual Testing Checklist

## Automated Tests (Completed by Agent)
- [x] Landing page renders (200 OK)
- [x] Font sweep: zero Zodiak/Comico references across all pages
- [x] Middleware redirects unauthenticated users from `/dashboard` → `/login`
- [x] Dashboard renders for authenticated users
- [x] Dev server starts successfully

## Manual Tests Required Before Release
- [ ] Sign up with a NEW email at `/signup`
- [ ] Verify redirect to `/verify-email` (NOT auto-logged in)
- [ ] Verify "Check your email" message is visible
- [ ] Verify "Resend" button exists and has 60s cooldown
- [ ] Try to log in BEFORE confirming email
- [ ] Verify redirect back to `/verify-email` with email pre-filled
- [ ] Confirm email via Supabase dashboard (or test email inbox)
- [ ] Verify redirect to `/onboarding` after confirmation
- [ ] Complete onboarding and verify redirect to `/dashboard`
- [ ] Log a meal, log a workout, create a habit — all should save
- [ ] Open coach chat and verify it references actual data
- [ ] Test on mobile (iPhone 14 Pro emulation) — bottom nav, insight panel

## Known Limitations
- Automated testing of email flow is blocked by Next.js Server Action context requirements
- Playwright driver download failed (CDN issue)
- chrome-devtools-mcp requires manual session management for multi-user flows
