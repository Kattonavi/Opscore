<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:auth-phase-1-status -->
## Auth Phase 1 (Login + Session + Guards) — Status

**Plan:** `docs/feature/auth-phase-1-plan.md`

**Decisions:**
- Root API modules in `/api/auth` and `/api/user` with shared client
- `features/auth` remains for auth UI + store + hooks
- Client-side AuthGuard replaces cookie-based middleware (backend returns token only)
- Colors use `--chart-N` CSS variables from `:root` (not `@theme inline`)
- i18n reads locale from cookie in `useEffect`, never in SSR initializer

**Done:**
- ✅ Next.js 16 migration: `middleware.ts` → `proxy.ts`, `turbopack.root` in config
- ✅ Root API modules (`/api/client.ts`, `/api/auth`, `/api/user`, `/api/types`)
- ✅ Zustand auth store with persist + localStorage
- ✅ AuthGuard (hydration-aware client route guard)
- ✅ Login page with quick access test users (6 roles with chart colors)
- ✅ i18n with ES/EN/PT locales, language selector in login
- ✅ Theme toggle (dark/light) in login
- ✅ Eye icon toggle for password visibility
- ✅ Entrance animations (fade-in-up, fade-in-down, fade-in)
- ✅ Submit button hover effect (scale + shadow + brightness)
- ✅ Enhanced UserMenu dropdown (gradient avatar, role, destructive logout)
- ✅ `--chart-6` added to globals.css for Usuario test user
- ✅ i18n hydration fixed (no document.cookie in SSR useState)
- ✅ SSR build fixes: `satisfies Partial<AuthState>` and AuthGuard hydration in useEffect
- ✅ Commit & pushed to origin/main

**Pending:**
- Backend `.gitignore` stash
<!-- END:auth-phase-1-status -->
