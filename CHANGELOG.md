# Changelog

## [1.0.1] - 2026-07-16

### Security & Storage Hardening (Phase 7)
- **Supabase Storage Signed URLs**: Meal photos now use private bucket storage with short-lived signed URLs instead of raw public URLs. RLS policies enforce user isolation.
- **Email Confirmation Re-enabled**: Signup now requires email confirmation before first login. Added `/verify-email` page with resend functionality and 60-second rate limiting. Updated middleware to handle confirmation callbacks and block unconfirmed users.
- **Font Licensing Resolved**: Replaced personal-use-only fonts (Zodiak, Comico) with open-source OFL-licensed alternatives (Fredoka, Playfair Display) via Google Fonts. Updated all 16 component files, `globals.css`, `tailwind.config.ts`, and `README.md`.

### Technical Details
- 9 commits across Phase 7
- Zero build errors, zero TypeScript errors
- All changes pushed to `origin/main`
