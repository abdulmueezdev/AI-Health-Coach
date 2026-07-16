# Changelog

## [1.0.2] - 2026-07-16

### User Experience (Phase 8, Item 1)
- **Dark Mode Toggle**: Added full dark mode support using `next-themes` + CSS custom properties + Tailwind `darkMode: 'class'`.
  - System preference respected by default (`prefers-color-scheme`)
  - Toggle button in sidebar (desktop + mobile) and Settings page
  - Smooth color transitions across all pages
  - Zero component file changes required — pure CSS variable architecture
  - All design tokens mapped: bg-canvas, bg-sidebar, bg-panel-accent, text-primary, text-secondary, card-bg
- **Fonts**: Verified Fredoka + Playfair Display render correctly in both light and dark modes

### Technical Details
- 8 commits across dark mode implementation
- Zero build errors, zero TypeScript errors
- Client-side visual testing verified via chrome-devtools-mcp
- All changes pushed to `origin/main`

## [1.0.1] - 2026-07-16

### Security & Storage Hardening (Phase 7)
- **Supabase Storage Signed URLs**: Meal photos now use private bucket storage with short-lived signed URLs instead of raw public URLs. RLS policies enforce user isolation.
- **Email Confirmation Re-enabled**: Signup now requires email confirmation before first login. Added `/verify-email` page with resend functionality and 60-second rate limiting. Updated middleware to handle confirmation callbacks and block unconfirmed users.
- **Font Licensing Resolved**: Replaced personal-use-only fonts (Zodiak, Comico) with open-source OFL-licensed alternatives (Fredoka, Playfair Display) via Google Fonts. Updated all 16 component files, `globals.css`, `tailwind.config.ts`, and `README.md`.

### Technical Details
- 9 commits across Phase 7
- Zero build errors, zero TypeScript errors
- All changes pushed to `origin/main`
