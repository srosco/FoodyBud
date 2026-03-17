# FoodyBud — Backend Deployment, Auth & PWA Design

**Date:** 2026-03-17
**Status:** Approved

## Context

FoodyBud is a personal nutrition tracker (Angular 17 frontend + NestJS backend + PostgreSQL). Currently the entire stack runs locally. The goal is to make it accessible from a smartphone outside the home network, add a secure auth foundation scalable to multiple users, and ship it as an installable PWA.

---

## 1. Infrastructure & Hosting

All services are free tier.

| Layer | Service | URL pattern |
|---|---|---|
| Frontend (PWA) | Netlify | `https://foodybud.netlify.app` |
| Backend (NestJS) | Render (free web service) | `https://foodybud-api.onrender.com` |
| Database (PostgreSQL) | Neon (serverless free) | `postgres://...@...neon.tech/neondb?sslmode=require` |

**Render free tier note:** Service spins down after 15 min of inactivity. First request after inactivity has a ~30-50s cold start. Acceptable for personal use. A keep-alive ping can be added later if needed.

**Netlify SPA routing:** A `_redirects` file (`/* /index.html 200`) handles Angular client-side routing.

**CI/CD:** Every `git push master` triggers automatic redeploy on both Render and Netlify.

**Local dev unchanged:** Docker Postgres + `localhost:3000` backend + `localhost:4200` frontend. `environment.ts` vs `environment.prod.ts` controls API URL.

---

## 2. Authentication Backend (NestJS)

### New modules

```
src/auth/
  auth.module.ts
  auth.controller.ts     POST /auth/register, POST /auth/login
  auth.service.ts        bcrypt hashing, JWT signing
  jwt.strategy.ts        extracts userId from Bearer token
  jwt-auth.guard.ts      global guard — all routes protected by default
  public.decorator.ts    @Public() decorator to exempt specific routes

src/users/
  user.entity.ts         id (uuid), email (unique), passwordHash, createdAt
  users.module.ts
  users.service.ts       findByEmail(), create()
```

### Token strategy

- Access token JWT: `{ sub: userId, email }`, 7-day expiry (personal use, simplicity)
- Stored in Angular `localStorage`
- No refresh token for now — easy to add later

### Entity changes

Every existing entity (`Food`, `Recipe`, `Meal`, `Activity`, `Goal`) receives:

```typescript
@ManyToOne(() => User)
@JoinColumn({ name: 'user_id' })
user: User;

@Column({ name: 'user_id' })
userId: string;
```

Every service method filters queries by `userId` extracted from the JWT payload via the guard.

### Database migration

- Dev: `synchronize: true` (TypeORM auto-creates columns)
- Prod (Neon): `migrationsRun: true` already configured — generate a migration before first deploy

---

## 3. Authentication Frontend (Angular)

### New files

```
src/app/core/
  services/auth.service.ts           login(), register(), logout(), token in localStorage
  interceptors/auth.interceptor.ts   adds "Authorization: Bearer <token>" to all requests
  guards/auth.guard.ts               redirects to /login if no valid token

src/app/features/auth/
  login/login.component.ts           email + password form
  register/register.component.ts     email + password + confirm form
```

### Routing

```typescript
{ path: '', canActivate: [AuthGuard], children: [ ...existing routes ] },
{ path: 'login',    component: LoginComponent },
{ path: 'register', component: RegisterComponent },
```

### User flow

```
App opens → AuthGuard checks localStorage token
  ├─ valid token   → Dashboard
  └─ no token      → /login
        ├─ login OK    → store token → Dashboard
        └─ no account  → /register  → store token → Dashboard
```

### Style

Login and register pages use the same design system as the rest of the app:
- Background: `var(--bg)`
- Card: `var(--surface)`, `var(--border)`
- Inputs: custom styled (no `mat-form-field`)
- Submit: FAB-style fixed button at bottom (`var(--primary)`)
- Typography: same font tokens, tabular nums on inputs

---

## 4. PWA Setup

```bash
ng add @angular/pwa
```

### `manifest.webmanifest`

```json
{
  "name": "FoodyBud",
  "short_name": "FoodyBud",
  "theme_color": "#4CAF50",
  "background_color": "#F5F5F5",
  "display": "standalone",
  "start_url": "/"
}
```

### `ngsw-config.json` caching strategy

- Angular shell (JS/CSS): `performance` (cache-first)
- Static assets (icons, fonts): `performance`
- API calls (`/api/**`): not cached (always fresh data)

### `environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://foodybud-api.onrender.com'
};
```

### Install experience

- Android Chrome: automatic install banner
- iOS Safari: manual "Add to Home Screen" (Apple limitation)
- Launches full-screen, no browser chrome, home screen icon

---

## 5. Deployment Flow (one-time setup)

### Step 1 — Neon
1. Create project at neon.tech
2. Copy the `DATABASE_URL` (SSL included)

### Step 2 — Render
1. Connect GitHub repo → select `mfp-backend`
2. Build: `npm install && npm run build`
3. Start: auto-read from `Procfile` (`node dist/main.js`)
4. Environment variables:
   ```
   DATABASE_URL=<neon_url>
   JWT_SECRET=<long_random_string>
   NODE_ENV=production
   FRONTEND_URL=https://foodybud.netlify.app
   PORT=3000
   ```

### Step 3 — Netlify
1. Connect GitHub repo → select `mfp-frontend`
2. Build: `npm run build`
3. Publish directory: `dist/mfp-frontend/browser`
4. Add `public/_redirects`: `/* /index.html 200`

---

## Out of scope (future)

- Refresh tokens
- OAuth / social login
- Push notifications
- Keep-alive ping for Render cold start
- Multi-tenant data isolation beyond userId filtering
