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

**Render free tier note:** Service spins down after 15 min of inactivity. First request after inactivity has a ~30-50s cold start. Acceptable for personal use.

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
  public.decorator.ts    @Public() decorator to exempt /auth/login and /auth/register

src/users/
  user.entity.ts         id (uuid), email (unique), passwordHash, createdAt
  users.module.ts
  users.service.ts       findByEmail(), create()
```

### API contracts

Both endpoints return `{ access_token: string }` on success.

```
POST /auth/register  { email, password }  → 201 { access_token }
POST /auth/login     { email, password }  → 200 { access_token }
```

Error responses: 401 for invalid credentials, 409 for duplicate email on register.

**Password rules (enforced in `auth.service.ts`):** minimum 8 characters. Same rule shown client-side in the register form.

### Token strategy

- Access token JWT: `{ sub: userId, email }`, 7-day expiry (personal use, simplicity)
- Stored in Angular `localStorage`
- No refresh token for now — easy to add later

### JwtModule wiring (in `auth.module.ts`)

```typescript
JwtModule.registerAsync({
  imports: [ConfigModule],
  useFactory: (config: ConfigService) => ({
    secret: config.get<string>('JWT_SECRET'),
    signOptions: { expiresIn: '7d' },
  }),
  inject: [ConfigService],
})
```

### CORS (in `main.ts`)

```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true, // set true now to avoid a breaking change when refresh tokens are added
});
```

### PORT binding (in `main.ts`)

```typescript
await app.listen(process.env.PORT ?? 3000);
```

Do **not** set `PORT` as a fixed env var on Render — Render injects it dynamically.

### Entity changes

Every existing entity (`Food`, `Recipe`, `Meal`, `Activity`, `Goal`) receives:

```typescript
@Column({ name: 'user_id', nullable: false })
userId: string;

@ManyToOne(() => User)
@JoinColumn({ name: 'user_id' })
user: User;
```

**Data isolation convention:** Every service method **must** filter by `userId`. To avoid silent data leaks, each service receives the `userId` from the controller (extracted from `@Request() req` or a `@CurrentUser()` decorator), and passes it explicitly to every repository query. A code reviewer checklist item: confirm no `find()` or `findBy()` call omits `{ where: { userId } }`.

### Database migration strategy

**Dev:** `synchronize: true` — TypeORM auto-creates/alters tables. **Important:** Adding `nullable: false` userId columns to tables that already have rows will fail. Before running the dev server after entity changes, drop and recreate the local Docker database:
```bash
docker exec mfp-postgres psql -U mfp -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

**Prod (Neon):** `synchronize: false`, `migrationsRun: true`.

The first migration must be a **full initial schema** (all tables + userId columns), not an incremental alter, because Neon starts with an empty database.

Generate after all entity changes are finalized:
```bash
cd mfp-backend
npx typeorm-ts-node-commonjs migration:generate src/database/migrations/InitialSchema -d src/database/data-source.ts
```

Commit the generated migration file before deploying to Render.

---

## 3. Authentication Frontend (Angular)

### New files

```
src/app/core/
  services/auth.service.ts           login(), register(), logout(), isTokenValid(), token in localStorage
  interceptors/auth.interceptor.ts   adds "Authorization: Bearer <token>" to all requests;
                                     on 401 response → logout() + redirect to /login
                                     EXCEPT for requests to /auth/login or /auth/register
  guards/auth.guard.ts               validates token via isTokenValid(); redirects to /login if invalid

src/app/features/auth/
  login/login.component.ts           email + password form
  register/register.component.ts     email + password + confirm form (min 8 chars)
```

### Token validation in `auth.service.ts`

```typescript
isTokenValid(): boolean {
  const token = localStorage.getItem('access_token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}
```

### 401 handling in interceptor

If any API call returns 401 **and** the URL does not match `/auth/login` or `/auth/register`, the interceptor calls `authService.logout()` (clears localStorage) and redirects to `/login`. Auth endpoint 401s (wrong password, etc.) are passed through as normal errors for the form to display.

### Routing

```typescript
{ path: 'login',    component: LoginComponent },
{ path: 'register', component: RegisterComponent },
{ path: '', canActivate: [AuthGuard], canActivateChild: [AuthGuard], children: [ ...existing routes ] },
```

`canActivateChild` is required in case any child route becomes lazy-loaded.

Authenticated users navigating to `/login` or `/register` are redirected to `/`.

### User flow

```
App opens → AuthGuard checks token (presence + exp)
  ├─ valid   → Dashboard
  └─ invalid → /login
        ├─ login OK    → store token → Dashboard
        └─ no account  → /register  → store token → Dashboard

Any non-auth API call → 401 → logout() → /login
```

### Style

Login and register pages use the same design system as the rest of the app:
- Background: `var(--bg)`
- Card: `var(--surface)`, `var(--border)`
- Inputs: custom styled (no `mat-form-field`)
- Submit: FAB-style fixed button at bottom (`var(--primary)`)
- Typography: same font tokens

---

## 4. PWA Setup

```bash
ng add @angular/pwa
```

`ng add @angular/pwa` auto-generates `manifest.webmanifest` with icons, `ngsw-config.json`, and injects meta tags into `index.html`. After generation, update manifest fields:

### `manifest.webmanifest` (update generated file)

```json
{
  "name": "FoodyBud",
  "short_name": "FoodyBud",
  "theme_color": "#4CAF50",
  "background_color": "#F5F5F5",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "icons": [
    { "src": "icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Icons are generated by `ng add @angular/pwa`. Replace with branded versions if desired.

### `ngsw-config.json` caching strategy

- Angular shell (JS/CSS): `performance` (cache-first)
- Static assets (icons, fonts): `performance`
- API calls: not cached (always fresh data)

### `environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://foodybud-api.onrender.com'
};
```

### Security note

JWT tokens stored in `localStorage` are accessible to any JS on the page (XSS risk). For a single-user personal app this is accepted risk. Mitigations in scope: a strict Content Security Policy via Netlify `_headers` restricting script-src. Mitigation out of scope for now: httpOnly cookies (requires `credentials: true` on CORS, already set, so can be added later as an upgrade path).

### Cold start UX

Render free tier cold starts (~30-50s) affect the first request after inactivity. The Angular app must show a loading indicator during API calls (spinner or skeleton) so the user does not perceive a broken app.

### Install experience

- Android Chrome: automatic install banner
- iOS Safari: manual "Add to Home Screen" (Apple limitation)
- Launches full-screen, no browser chrome, home screen icon

---

## 5. Deployment Flow (one-time setup)

### Step 1 — Neon
1. Create project at neon.tech → copy the `DATABASE_URL` (SSL included)

### Step 2 — Render
1. Connect GitHub repo → select `mfp-backend`
2. Build command: `npm install && npm run build`
3. Start command: auto-read from `Procfile` (`node dist/main.js`)
4. Environment variables — add **only these 4**, never add `PORT` (Render injects it automatically; setting it manually breaks the deployment):
   ```
   DATABASE_URL=<neon_url>
   JWT_SECRET=<32+ char random string>
   NODE_ENV=production
   FRONTEND_URL=https://foodybud.netlify.app
   ```

### Step 3 — Netlify
1. Connect GitHub repo → select `mfp-frontend`
2. Build command: `npm run build`
3. Publish directory: `dist/mfp-frontend/browser`
4. Add `mfp-frontend/public/_redirects`: `/* /index.html 200`
5. Add `mfp-frontend/public/_headers` with CSP (see security note above)

---

## Out of scope (future)

- Refresh tokens (CORS `credentials: true` is already set in anticipation)
- OAuth / social login
- Push notifications
- Keep-alive ping for Render cold start
- TypeORM query interceptor for automatic userId injection
