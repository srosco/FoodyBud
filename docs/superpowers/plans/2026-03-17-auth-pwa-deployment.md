# Auth, PWA & Deployment Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add JWT authentication, multi-user entity isolation, PWA manifest, and deployment configuration so FoodyBud runs on Netlify + Render + Neon and is installable on smartphones.

**Architecture:** NestJS global JWT guard protects all routes except `/auth/*`; every service filters data by `userId` from the token payload. Angular uses a functional auth interceptor (Bearer header injection + 401 redirect) and a route guard checking token expiry. PWA manifest and environment file replacements are already scaffolded — just need updating.

**Tech Stack:** NestJS 11, `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`, Angular 17 standalone components, TypeORM migrations, Neon PostgreSQL, Render, Netlify.

---

## File Map

### Backend — New files
- `mfp-backend/src/users/user.entity.ts` — User entity (uuid, email, passwordHash, createdAt)
- `mfp-backend/src/users/users.module.ts`
- `mfp-backend/src/users/users.service.ts` — findByEmail(), create()
- `mfp-backend/src/auth/auth.module.ts`
- `mfp-backend/src/auth/auth.controller.ts` — POST /auth/register, POST /auth/login
- `mfp-backend/src/auth/auth.service.ts` — bcrypt + JWT signing
- `mfp-backend/src/auth/jwt.strategy.ts` — Passport JWT strategy
- `mfp-backend/src/auth/jwt-auth.guard.ts` — Global guard
- `mfp-backend/src/auth/public.decorator.ts` — @Public() to exempt routes
- `mfp-backend/src/auth/current-user.decorator.ts` — @CurrentUser() param decorator
- `mfp-backend/src/auth/auth.service.spec.ts`
- `mfp-backend/src/database/migrations/<timestamp>-InitialSchema.ts` — full initial schema

### Backend — Modified files
- `mfp-backend/src/main.ts` — add `credentials: true` to CORS
- `mfp-backend/src/app.module.ts` — register AuthModule, apply global JwtAuthGuard
- `mfp-backend/src/foods/food.entity.ts` — add userId
- `mfp-backend/src/foods/foods.service.ts` — filter by userId
- `mfp-backend/src/foods/foods.controller.ts` — inject @CurrentUser()
- `mfp-backend/src/recipes/recipe.entity.ts` — add userId
- `mfp-backend/src/recipes/recipes.service.ts` — filter by userId
- `mfp-backend/src/recipes/recipes.controller.ts` — inject @CurrentUser()
- `mfp-backend/src/meals/meal.entity.ts` — add userId
- `mfp-backend/src/meals/meals.service.ts` — filter by userId
- `mfp-backend/src/meals/meals.controller.ts` — inject @CurrentUser()
- `mfp-backend/src/activities/activity.entity.ts` — add userId
- `mfp-backend/src/activities/activities.service.ts` — filter by userId
- `mfp-backend/src/activities/activities.controller.ts` — inject @CurrentUser()
- `mfp-backend/src/goals/goal.entity.ts` — remove singleton, add userId (unique)
- `mfp-backend/src/goals/goals.service.ts` — replace singleton logic with userId
- `mfp-backend/src/goals/goals.controller.ts` — inject @CurrentUser()
- `mfp-backend/src/summary/summary.service.ts` — filter all queries by userId
- `mfp-backend/src/summary/summary.controller.ts` — inject @CurrentUser()

### Frontend — New files
- `mfp-frontend/src/app/core/services/auth.service.ts`
- `mfp-frontend/src/app/core/interceptors/auth.interceptor.ts`
- `mfp-frontend/src/app/core/guards/auth.guard.ts`
- `mfp-frontend/src/app/features/auth/login/login.component.ts`
- `mfp-frontend/src/app/features/auth/register/register.component.ts`

### Frontend — Modified files
- `mfp-frontend/src/app/app.routes.ts` — wrap existing routes with AuthGuard
- `mfp-frontend/src/app/app.config.ts` — register auth interceptor
- `mfp-frontend/src/app/core/interceptors/error.interceptor.ts` — skip 401 snackbar for auth routes
- `mfp-frontend/src/manifest.webmanifest` — update name/colors/scope
- `mfp-frontend/src/environments/environment.prod.ts` — set Render URL
- `mfp-frontend/angular.json` — add fileReplacements + assets for _redirects/_headers

### Frontend — New static files
- `mfp-frontend/src/_redirects` — `/* /index.html 200`
- `mfp-frontend/src/_headers` — CSP for Netlify

---

## Chunk 1: Auth Backend

### Task 1: Install auth dependencies

**Files:** `mfp-backend/package.json`

- [ ] **Step 1: Install packages**

```bash
cd mfp-backend
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install --save-dev @types/passport-jwt @types/bcrypt
```

- [ ] **Step 2: Verify installation**

```bash
grep -E "passport|jwt|bcrypt" package.json
```

Expected: all 5 packages listed under dependencies.

- [ ] **Step 3: Commit**

```bash
cd ..
git add mfp-backend/package.json mfp-backend/package-lock.json
git commit -m "chore(backend): install auth dependencies"
```

---

### Task 2: User entity + UsersModule

**Files:**
- Create: `mfp-backend/src/users/user.entity.ts`
- Create: `mfp-backend/src/users/users.service.ts`
- Create: `mfp-backend/src/users/users.module.ts`

- [ ] **Step 1: Write User entity**

`mfp-backend/src/users/user.entity.ts`:
```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
```

- [ ] **Step 2: Write UsersService**

`mfp-backend/src/users/users.service.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email } });
  }

  create(email: string, passwordHash: string): Promise<User> {
    return this.repo.save(this.repo.create({ email, passwordHash }));
  }
}
```

- [ ] **Step 3: Write UsersModule**

`mfp-backend/src/users/users.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

---

### Task 3: AuthService + AuthController

**Files:**
- Create: `mfp-backend/src/auth/auth.service.ts`
- Create: `mfp-backend/src/auth/auth.service.spec.ts`
- Create: `mfp-backend/src/auth/auth.controller.ts`

- [ ] **Step 1: Write failing test for register**

`mfp-backend/src/auth/auth.service.spec.ts`:
```typescript
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let users: jest.Mocked<UsersService>;
  let jwt: jest.Mocked<JwtService>;

  beforeEach(async () => {
    users = { findByEmail: jest.fn(), create: jest.fn() } as any;
    jwt = { sign: jest.fn().mockReturnValue('test-token') } as any;

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: users },
        { provide: JwtService, useValue: jwt },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('register() creates user with hashed password and returns token', async () => {
    users.findByEmail.mockResolvedValue(null);
    users.create.mockResolvedValue({ id: 'u1', email: 'a@b.com' } as any);

    const result = await service.register('a@b.com', 'password123');

    expect(users.create).toHaveBeenCalledWith('a@b.com', expect.any(String));
    const [, hash] = users.create.mock.calls[0];
    expect(await bcrypt.compare('password123', hash)).toBe(true);
    expect(result).toEqual({ access_token: 'test-token' });
  });

  it('register() throws ConflictException for duplicate email', async () => {
    users.findByEmail.mockResolvedValue({ id: 'u1' } as any);
    await expect(service.register('a@b.com', 'password123')).rejects.toThrow('Email already in use');
  });

  it('login() returns token for valid credentials', async () => {
    const hash = await bcrypt.hash('secret', 10);
    users.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com', passwordHash: hash } as any);

    const result = await service.login('a@b.com', 'secret');
    expect(result).toEqual({ access_token: 'test-token' });
  });

  it('login() throws UnauthorizedException for wrong password', async () => {
    const hash = await bcrypt.hash('correct', 10);
    users.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com', passwordHash: hash } as any);
    await expect(service.login('a@b.com', 'wrong')).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd mfp-backend
npx jest src/auth/auth.service.spec.ts --no-coverage
```

Expected: FAIL — `Cannot find module './auth.service'`

- [ ] **Step 3: Write AuthService**

`mfp-backend/src/auth/auth.service.ts`:
```typescript
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  async register(email: string, password: string): Promise<{ access_token: string }> {
    // Check duplicate BEFORE hashing (hashing is expensive)
    const existing = await this.users.findByEmail(email);
    if (existing) throw new ConflictException('Email already in use');

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.create(email, passwordHash);
    return { access_token: this.jwt.sign({ sub: user.id, email: user.email }) };
  }

  async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.users.findByEmail(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    return { access_token: this.jwt.sign({ sub: user.id, email: user.email }) };
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npx jest src/auth/auth.service.spec.ts --no-coverage
```

Expected: PASS (4 tests)

- [ ] **Step 5: Write AuthController**

> **Note:** Password minimum length is enforced at the DTO level only via `class-validator`. The service does NOT re-validate — `MinLength(8)` on the DTO + the global `ValidationPipe` (already in `main.ts`) is sufficient.

`mfp-backend/src/auth/auth.controller.ts`:
```typescript
import { Controller, Post, Body, HttpCode } from '@nestjs/common';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { Public } from './public.decorator';

class AuthDto {
  @IsEmail() email: string;
  @IsString() @MinLength(8) password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() dto: AuthDto) {
    return this.auth.register(dto.email, dto.password);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: AuthDto) {
    return this.auth.login(dto.email, dto.password);
  }
}
```

---

### Task 4: JWT Strategy + Guard + Decorators

**Files:**
- Create: `mfp-backend/src/auth/jwt.strategy.ts`
- Create: `mfp-backend/src/auth/jwt-auth.guard.ts`
- Create: `mfp-backend/src/auth/public.decorator.ts`
- Create: `mfp-backend/src/auth/current-user.decorator.ts`

- [ ] **Step 1: Write @Public() decorator**

`mfp-backend/src/auth/public.decorator.ts`:
```typescript
import { SetMetadata } from '@nestjs/common';
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

- [ ] **Step 2: Write @CurrentUser() decorator**

`mfp-backend/src/auth/current-user.decorator.ts`:
```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtPayload {
  sub: string;
  email: string;
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
```

- [ ] **Step 3: Write JWT strategy**

`mfp-backend/src/auth/jwt.strategy.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './current-user.decorator';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload) {
    return { sub: payload.sub, email: payload.email };
  }
}
```

- [ ] **Step 4: Write global JWT guard**

`mfp-backend/src/auth/jwt-auth.guard.ts`:
```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    return super.canActivate(context);
  }
}
```

---

### Task 5: AuthModule + register in AppModule

**Files:**
- Create: `mfp-backend/src/auth/auth.module.ts`
- Modify: `mfp-backend/src/app.module.ts`
- Modify: `mfp-backend/src/main.ts`

- [ ] **Step 1: Write AuthModule**

`mfp-backend/src/auth/auth.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthService, JwtStrategy, JwtAuthGuard],
  controllers: [AuthController],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
```

- [ ] **Step 2: Register AuthModule and global guard in AppModule**

> **Note:** `ConfigModule.forRoot({ isGlobal: true })` is already present in `AppModule` — `JwtModule.registerAsync` depends on it. Do NOT add it again.
> **Note:** `UsersModule` has no controller and must NEVER have one added. It is internal only.

Edit `mfp-backend/src/app.module.ts` — add imports at top:
```typescript
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
```

Add `AuthModule` to the `imports` array (do NOT add `UsersModule` here — it is already imported inside `AuthModule`).

Add to a new `providers` array:
```typescript
providers: [{ provide: APP_GUARD, useClass: JwtAuthGuard }],
```

- [ ] **Step 3: Update CORS in main.ts**

Edit `mfp-backend/src/main.ts` — replace `app.enableCors(...)` line with:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
});
```

- [ ] **Step 4: Run all backend tests**

```bash
cd mfp-backend
npx jest --no-coverage
```

Expected: all tests pass (auth.service.spec + existing specs).

- [ ] **Step 5: Commit**

```bash
cd ..
git add mfp-backend/src/
git commit -m "feat(backend): add JWT auth module with register/login endpoints"
```

---

## Chunk 2: Entity Changes + Migration

### Task 6: Add userId to Food entity

**Files:**
- Modify: `mfp-backend/src/foods/food.entity.ts`
- Modify: `mfp-backend/src/foods/foods.service.ts`
- Modify: `mfp-backend/src/foods/foods.controller.ts`

- [ ] **Step 1: Add userId to Food entity**

In `mfp-backend/src/foods/food.entity.ts`, add imports and columns after the existing imports:
```typescript
import { ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
```

Add before the closing `}` of the class:
```typescript
  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
```

- [ ] **Step 2: Update FoodsService to filter by userId**

In `mfp-backend/src/foods/foods.service.ts`, update methods:

`search()`:
```typescript
async search(userId: string, query?: string): Promise<Food[]> {
  if (!query) {
    return this.repo.find({ where: { deletedAt: IsNull(), userId } });
  }
  const isNumeric = /^\d+$/.test(query);
  const conditions: object[] = [
    { name: ILike(`%${query}%`), deletedAt: IsNull(), userId },
  ];
  if (isNumeric) {
    conditions.push({ barcode: query, deletedAt: IsNull(), userId });
  }
  return this.repo.find({ where: conditions });
}
```

`findOne()`:
```typescript
findOne(id: string, userId: string): Promise<Food | null> {
  return this.repo.findOne({ where: { id, deletedAt: IsNull(), userId } });
}
```

`create()`:
```typescript
create(dto: CreateFoodDto, userId: string): Promise<Food> {
  return this.repo.save(this.repo.create({ ...dto, userId }));
}
```

`update()` and `remove()`: add `userId` param and pass to `findOne()`.

- [ ] **Step 3: Update FoodsController to inject @CurrentUser()**

In `mfp-backend/src/foods/foods.controller.ts`, add:
```typescript
import { CurrentUser, JwtPayload } from '../auth/current-user.decorator';
```

Update each handler to pass `user.sub` as `userId`:
```typescript
@Get()
search(@Query('search') query: string, @CurrentUser() user: JwtPayload) {
  return this.foods.search(user.sub, query);
}

@Post()
create(@Body() dto: CreateFoodDto, @CurrentUser() user: JwtPayload) {
  return this.foods.create(dto, user.sub);
}
```

(Similar for `findOne`, `update`, `remove`.)

- [ ] **Step 4: Run food tests**

```bash
cd mfp-backend
npx jest src/foods/ --no-coverage
```

Expected: PASS (existing tests still pass — they mock the repo and don't test userId filtering).

---

### Task 7: Add userId to Recipe entity

**Files:**
- Modify: `mfp-backend/src/recipes/recipe.entity.ts`
- Modify: `mfp-backend/src/recipes/recipes.service.ts`
- Modify: `mfp-backend/src/recipes/recipes.controller.ts`

- [ ] **Step 1: Add userId to Recipe entity** (same pattern as Food)

In `mfp-backend/src/recipes/recipe.entity.ts`, add after existing imports:
```typescript
import { ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../users/user.entity';
```

Add to class:
```typescript
  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
```

- [ ] **Step 2: Update RecipesService** — add `userId: string` param to `findAll()`, `findOne()`, `create()`, `update()`, `remove()`. Every single-record lookup (`findOne`, `findOneOrFail`) **must** include `userId` in the where clause — e.g. `{ where: { id, userId } }` — to prevent cross-user data access by ID guessing.

- [ ] **Step 3: Update RecipesController** — add `@CurrentUser() user: JwtPayload` to all handlers, pass `user.sub` to service.

- [ ] **Step 4: Run recipe tests**

```bash
npx jest src/recipes/ --no-coverage
```

Expected: PASS.

---

### Task 8: Add userId to Meal entity

**Files:**
- Modify: `mfp-backend/src/meals/meal.entity.ts`
- Modify: `mfp-backend/src/meals/meals.service.ts`
- Modify: `mfp-backend/src/meals/meals.controller.ts`

- [ ] **Step 1: Add userId to Meal entity** (same pattern)

- [ ] **Step 2: Update MealsService**

> All single-record lookups must scope by userId: `{ where: { id, userId } }` — never by id alone.

`findByDate()`: add `userId` param, filter: `{ where: { date, userId } }`
`findOne()`: filter: `{ where: { id, userId } }`
`create()`: pass `userId` to `mealRepo.create({ ..., userId })`
`update()`, `remove()`: add `userId`, pass to `findOne()`.

- [ ] **Step 3: Update MealsController** — add `@CurrentUser()` to all handlers.

- [ ] **Step 4: Run meal tests**

```bash
npx jest src/meals/ --no-coverage
```

Expected: PASS.

---

### Task 9: Add userId to Activity entity

**Files:**
- Modify: `mfp-backend/src/activities/activity.entity.ts`
- Modify: `mfp-backend/src/activities/activities.service.ts`
- Modify: `mfp-backend/src/activities/activities.controller.ts`

- [ ] **Step 1: Add userId to Activity entity** (same pattern)

- [ ] **Step 2: Update ActivitiesService** — same userId filter pattern on all methods.

- [ ] **Step 3: Update ActivitiesController** — add `@CurrentUser()`.

- [ ] **Step 4: Run activity tests**

```bash
npx jest src/activities/ --no-coverage
```

Expected: PASS.

---

### Task 10: Rework Goal entity (singleton → userId)

**Files:**
- Modify: `mfp-backend/src/goals/goal.entity.ts`
- Modify: `mfp-backend/src/goals/goals.service.ts`
- Modify: `mfp-backend/src/goals/goals.controller.ts`

- [ ] **Step 1: Update Goal entity**

> The existing `Goal` entity has a `@Column({ type: 'boolean', default: true, unique: true })` field named `singleton`. This column and its unique constraint must be completely removed. The new `@Unique(['userId'])` class decorator replaces it. Because the DB will be freshly reset (Task 11 Step 1), no manual migration for this constraint is needed.

Replace the entire Goal entity content:
```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('goals')
@Unique(['userId'])   // one goal per user
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'float', default: 2000 })
  calories: number;

  @Column({ type: 'float', default: 150 })
  proteins: number;

  @Column({ type: 'float', default: 250 })
  carbs: number;

  @Column({ type: 'float', default: 65 })
  fat: number;

  @Column({ type: 'float', default: 25 })
  fiber: number;

  @Column({ type: 'float', default: 50 })
  sugars: number;

  @Column({ type: 'float', name: 'saturated_fat', default: 20 })
  saturatedFat: number;

  @Column({ type: 'float', default: 6 })
  salt: number;
}
```

- [ ] **Step 2: Update GoalsService**

```typescript
async get(userId: string): Promise<Goal> {
  let goal = await this.repo.findOne({ where: { userId } });
  if (!goal) {
    goal = this.repo.create({ userId });
    await this.repo.save(goal);
  }
  return goal;
}

async upsert(userId: string, dto: UpdateGoalsDto): Promise<Goal> {
  const goal = await this.get(userId);
  return this.repo.save({ ...goal, ...dto });
}
```

- [ ] **Step 3: Update GoalsController** — add `@CurrentUser()`, pass `user.sub` to service.

- [ ] **Step 4: Update SummaryService**

In `mfp-backend/src/summary/summary.service.ts`, update `getSummary()` signature to `getSummary(userId: string, date: string)` and update all queries:
```typescript
const meals = await this.mealRepo.find({ where: { date, userId } });
const activities = await this.activityRepo.find({ where: { date, userId } });
const goal = await this.goalRepo.findOne({ where: { userId } });
```

Also update the SummaryController to inject `@CurrentUser()` and pass `user.sub`.

- [ ] **Step 5: Run all backend tests**

```bash
npx jest --no-coverage
```

Expected: all PASS.

---

### Task 11: Reset dev DB and generate InitialSchema migration

> **Critical order:** Do NOT start the dev server before generating the migration. If `synchronize: true` runs first, the DB schema is updated automatically and the migration diff will be empty. The correct order is: empty DB → generate migration → THEN start server.

- [ ] **Step 1: Drop and recreate local dev database**

```bash
docker exec mfp-postgres psql -U mfp -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
```

Expected: `DROP SCHEMA` / `CREATE SCHEMA`

- [ ] **Step 2: Generate InitialSchema migration (DB is empty — diff = full schema)**

```bash
cd mfp-backend
npx typeorm-ts-node-commonjs migration:generate src/database/migrations/InitialSchema -d src/database/data-source.ts
```

Expected: `Migration X-InitialSchema.ts has been generated successfully.`

- [ ] **Step 3: Verify migration file was created**

```bash
ls src/database/migrations/
```

Expected: one `*-InitialSchema.ts` file.

- [ ] **Step 4: Start dev server to verify it boots cleanly with the schema**

```bash
npm run start:dev
```

Wait for "Application is running on: http://[::1]:3000". Then Ctrl+C.

- [ ] **Step 5: Commit**

```bash
cd ..
git add mfp-backend/src/
git commit -m "feat(backend): add userId to all entities, rework Goal, generate InitialSchema migration"
```

---

## Chunk 3: Auth Frontend

### Task 12: AuthService

**Files:**
- Create: `mfp-frontend/src/app/core/services/auth.service.ts`

- [ ] **Step 1: Create AuthService**

`mfp-frontend/src/app/core/services/auth.service.ts`:
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

const TOKEN_KEY = 'access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private base = `${environment.apiUrl}/auth`;

  login(email: string, password: string) {
    return this.http.post<{ access_token: string }>(`${this.base}/login`, { email, password }).pipe(
      tap(({ access_token }) => localStorage.setItem(TOKEN_KEY, access_token)),
    );
  }

  register(email: string, password: string) {
    return this.http.post<{ access_token: string }>(`${this.base}/register`, { email, password }).pipe(
      tap(({ access_token }) => localStorage.setItem(TOKEN_KEY, access_token)),
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }
}
```

---

### Task 13: Auth Interceptor

**Files:**
- Create: `mfp-frontend/src/app/core/interceptors/auth.interceptor.ts`
- Modify: `mfp-frontend/src/app/core/interceptors/error.interceptor.ts`

- [ ] **Step 1: Create auth interceptor**

`mfp-frontend/src/app/core/interceptors/auth.interceptor.ts`:
```typescript
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      const isAuthRoute = req.url.includes('/auth/login') || req.url.includes('/auth/register');
      if (err.status === 401 && !isAuthRoute) {
        auth.logout();
      }
      return throwError(() => err);
    }),
  );
};
```

- [ ] **Step 2: Update error interceptor to skip 401 snackbar for auth routes**

In `mfp-frontend/src/app/core/interceptors/error.interceptor.ts`, update the catchError:
```typescript
catchError((err) => {
  const isAuthRoute = (req.url.includes('/auth/login') || req.url.includes('/auth/register'));
  const is401 = err.status === 401;
  if (!is401 || isAuthRoute) {
    const message = (err.error?.message as string) ?? 'Une erreur est survenue';
    snack.open(message, 'Fermer', { duration: 4000 });
  }
  return throwError(() => err);
}),
```

- [ ] **Step 3: Register auth interceptor in app.config.ts**

In `mfp-frontend/src/app/app.config.ts`, add import:
```typescript
import { authInterceptor } from './core/interceptors/auth.interceptor';
```

Update `provideHttpClient` line:
```typescript
provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
```

(auth interceptor must be first — adds the token before error interceptor runs.)

---

### Task 14: AuthGuard

**Files:**
- Create: `mfp-frontend/src/app/core/guards/auth.guard.ts`

- [ ] **Step 1: Create auth guard**

`mfp-frontend/src/app/core/guards/auth.guard.ts`:
```typescript
import { inject } from '@angular/core';
import { CanActivateFn, CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn & CanActivateChildFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isTokenValid()) return true;
  return router.createUrlTree(['/login']);
};
```

---

### Task 15: Login component

**Files:**
- Create: `mfp-frontend/src/app/features/auth/login/login.component.ts`

- [ ] **Step 1: Create login component**

`mfp-frontend/src/app/features/auth/login/login.component.ts`:
```typescript
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  template: `
    <div class="auth-page">
      <div class="auth-header">
        <mat-icon class="brand-icon">restaurant</mat-icon>
        <h1 class="brand-name">FoodyBud</h1>
        <p class="brand-sub">Ton tracker nutritionnel</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-card">
        <div class="field-group">
          <label class="field-label">Email</label>
          <input class="field-input" type="email" formControlName="email"
                 placeholder="ton@email.com" autocomplete="email" />
        </div>

        <div class="field-group">
          <label class="field-label">Mot de passe</label>
          <input class="field-input" type="password" formControlName="password"
                 placeholder="••••••••" autocomplete="current-password" />
        </div>

        @if (error()) {
          <p class="auth-error">{{ error() }}</p>
        }

        <p class="auth-link">Pas encore de compte ? <a routerLink="/register">S'inscrire</a></p>
      </form>

      <div class="fab-wrap">
        <button class="fab-btn" type="button" [disabled]="form.invalid || loading()"
                (click)="onSubmit()">
          <mat-icon>login</mat-icon>
          {{ loading() ? 'Connexion...' : 'Se connecter' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100dvh; background: var(--bg); display: flex; flex-direction: column; align-items: center; padding: 48px 16px 100px; }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .brand-icon { font-size: 48px; width: 48px; height: 48px; color: var(--primary); }
    .brand-name { font-size: 28px; font-weight: 700; color: var(--font); margin: 8px 0 4px; }
    .brand-sub { color: var(--text-3); font-size: 14px; margin: 0; }
    .auth-card { width: 100%; max-width: 400px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 13px; font-weight: 500; color: var(--text-3); }
    .field-input { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; font-size: 15px; color: var(--font); outline: none; width: 100%; box-sizing: border-box; }
    .field-input:focus { border-color: var(--primary); }
    .auth-error { color: #E84040; font-size: 13px; margin: 0; text-align: center; }
    .auth-link { font-size: 13px; color: var(--text-3); text-align: center; margin: 0; }
    .auth-link a { color: var(--primary); text-decoration: none; font-weight: 500; }
    .fab-wrap { position: fixed; bottom: 24px; left: 0; right: 0; display: flex; justify-content: center; padding: 0 16px; }
    .fab-btn { display: flex; align-items: center; gap: 8px; background: var(--primary); color: #fff; border: none; border-radius: 28px; padding: 14px 32px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
    .fab-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  `],
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  loading = signal(false);
  error = signal('');

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(err.error?.message ?? 'Email ou mot de passe incorrect');
        this.loading.set(false);
      },
    });
  }
}
```

---

### Task 16: Register component

**Files:**
- Create: `mfp-frontend/src/app/features/auth/register/register.component.ts`

- [ ] **Step 1: Create register component** (same structure as login, with confirm password field)

`mfp-frontend/src/app/features/auth/register/register.component.ts`:
```typescript
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { MatIconModule } from '@angular/material/icon';

function passwordsMatch(control: AbstractControl): ValidationErrors | null {
  const p = control.get('password')?.value;
  const c = control.get('confirm')?.value;
  return p && c && p !== c ? { mismatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatIconModule],
  template: `
    <div class="auth-page">
      <div class="auth-header">
        <mat-icon class="brand-icon">restaurant</mat-icon>
        <h1 class="brand-name">FoodyBud</h1>
        <p class="brand-sub">Créer un compte</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-card">
        <div class="field-group">
          <label class="field-label">Email</label>
          <input class="field-input" type="email" formControlName="email"
                 placeholder="ton@email.com" autocomplete="email" />
        </div>

        <div class="field-group">
          <label class="field-label">Mot de passe <span class="hint">(8 caractères min.)</span></label>
          <input class="field-input" type="password" formControlName="password"
                 placeholder="••••••••" autocomplete="new-password" />
        </div>

        <div class="field-group">
          <label class="field-label">Confirmer le mot de passe</label>
          <input class="field-input" type="password" formControlName="confirm"
                 placeholder="••••••••" autocomplete="new-password" />
          @if (form.hasError('mismatch') && form.get('confirm')?.dirty) {
            <span class="field-error">Les mots de passe ne correspondent pas</span>
          }
        </div>

        @if (error()) {
          <p class="auth-error">{{ error() }}</p>
        }

        <p class="auth-link">Déjà un compte ? <a routerLink="/login">Se connecter</a></p>
      </form>

      <div class="fab-wrap">
        <button class="fab-btn" type="button" [disabled]="form.invalid || loading()"
                (click)="onSubmit()">
          <mat-icon>person_add</mat-icon>
          {{ loading() ? 'Création...' : "S'inscrire" }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { min-height: 100dvh; background: var(--bg); display: flex; flex-direction: column; align-items: center; padding: 48px 16px 100px; }
    .auth-header { text-align: center; margin-bottom: 32px; }
    .brand-icon { font-size: 48px; width: 48px; height: 48px; color: var(--primary); }
    .brand-name { font-size: 28px; font-weight: 700; color: var(--font); margin: 8px 0 4px; }
    .brand-sub { color: var(--text-3); font-size: 14px; margin: 0; }
    .auth-card { width: 100%; max-width: 400px; background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 24px; display: flex; flex-direction: column; gap: 16px; }
    .field-group { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 13px; font-weight: 500; color: var(--text-3); }
    .hint { font-weight: 400; color: var(--text-3); font-size: 12px; }
    .field-input { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 12px 14px; font-size: 15px; color: var(--font); outline: none; width: 100%; box-sizing: border-box; }
    .field-input:focus { border-color: var(--primary); }
    .field-error { font-size: 12px; color: #E84040; }
    .auth-error { color: #E84040; font-size: 13px; margin: 0; text-align: center; }
    .auth-link { font-size: 13px; color: var(--text-3); text-align: center; margin: 0; }
    .auth-link a { color: var(--primary); text-decoration: none; font-weight: 500; }
    .fab-wrap { position: fixed; bottom: 24px; left: 0; right: 0; display: flex; justify-content: center; padding: 0 16px; }
    .fab-btn { display: flex; align-items: center; gap: 8px; background: var(--primary); color: #fff; border: none; border-radius: 28px; padding: 14px 32px; font-size: 16px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 16px rgba(0,0,0,0.2); }
    .fab-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  `],
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirm: ['', Validators.required],
  }, { validators: passwordsMatch });

  loading = signal(false);
  error = signal('');

  onSubmit() {
    if (this.form.invalid) return;
    this.loading.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.register(email, password).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err) => {
        this.error.set(err.error?.message ?? 'Erreur lors de la création du compte');
        this.loading.set(false);
      },
    });
  }
}
```

---

### Task 17: Update routes + redirect logic

**Files:**
- Modify: `mfp-frontend/src/app/app.routes.ts`

- [ ] **Step 1: Wrap existing routes with AuthGuard**

Replace content of `mfp-frontend/src/app/app.routes.ts`:
```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

const redirectIfAuthenticated = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isTokenValid() ? router.createUrlTree(['/']) : true;
};

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [redirectIfAuthenticated],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [redirectIfAuthenticated],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'journal', loadComponent: () => import('./features/journal/journal.component').then(m => m.JournalComponent) },
      { path: 'aliments', loadComponent: () => import('./features/foods/foods-list/foods-list.component').then(m => m.FoodsListComponent) },
      { path: 'aliments/scan', loadComponent: () => import('./features/foods/food-scan/food-scan.component').then(m => m.FoodScanComponent) },
      { path: 'aliments/nouveau', loadComponent: () => import('./features/foods/food-create/food-create.component').then(m => m.FoodCreateComponent) },
      { path: 'aliments/:id/edit', loadComponent: () => import('./features/foods/food-edit/food-edit.component').then(m => m.FoodEditComponent) },
      { path: 'recettes', loadComponent: () => import('./features/recipes/recipes-list/recipes-list.component').then(m => m.RecipesListComponent) },
      { path: 'recettes/nouveau', loadComponent: () => import('./features/recipes/recipe-create/recipe-create.component').then(m => m.RecipeCreateComponent) },
      { path: 'recettes/:id/edit', loadComponent: () => import('./features/recipes/recipe-edit/recipe-edit.component').then(m => m.RecipeEditComponent) },
      { path: 'repas/nouveau', loadComponent: () => import('./features/meals/meal-create/meal-create.component').then(m => m.MealCreateComponent) },
      { path: 'repas/:id/edit', loadComponent: () => import('./features/meals/meal-edit/meal-edit.component').then(m => m.MealEditComponent) },
      { path: 'activites/nouveau', loadComponent: () => import('./features/activities/activity-create/activity-create.component').then(m => m.ActivityCreateComponent) },
      { path: 'activites/:id/edit', loadComponent: () => import('./features/activities/activity-edit/activity-edit.component').then(m => m.ActivityEditComponent) },
      { path: 'objectifs', loadComponent: () => import('./features/goals/goals.component').then(m => m.GoalsComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
```

- [ ] **Step 2: Build frontend to check for compile errors**

```bash
cd mfp-frontend
npm run build 2>&1 | tail -20
```

Expected: `✔ Browser application bundle generation complete.` (or similar success output)

- [ ] **Step 3: Commit**

```bash
cd ..
git add mfp-frontend/src/
git commit -m "feat(frontend): add JWT auth service, interceptor, guard, login/register pages"
```

---

## Chunk 4: PWA Updates + Deployment Prep

### Task 18: Update PWA manifest

**Files:**
- Modify: `mfp-frontend/src/manifest.webmanifest`

- [ ] **Step 1: Update manifest**

Replace content of `mfp-frontend/src/manifest.webmanifest`:
```json
{
  "name": "FoodyBud",
  "short_name": "FoodyBud",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#F5F5F5",
  "theme_color": "#4CAF50",
  "icons": [
    { "src": "assets/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "assets/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

Also update `<meta name="theme-color">` in `mfp-frontend/src/index.html`:
```html
<meta name="theme-color" content="#4CAF50">
```

---

### Task 19: Wire environment file replacements

**Files:**
- Modify: `mfp-frontend/angular.json`
- Modify: `mfp-frontend/src/environments/environment.prod.ts`

- [ ] **Step 1: Add fileReplacements to angular.json production config**

In `mfp-frontend/angular.json`, find the `"production"` configuration under `"build"` and add `fileReplacements`:
```json
"production": {
  "fileReplacements": [
    {
      "replace": "src/environments/environment.ts",
      "with": "src/environments/environment.prod.ts"
    }
  ],
  "budgets": [ ... ],
  "outputHashing": "all",
  "serviceWorker": "ngsw-config.json"
}
```

- [ ] **Step 2: Update environment.prod.ts**

The URL will be filled in after deploying to Render. For now set a clear placeholder:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://REPLACE_WITH_RENDER_URL',
};
```

---

### Task 20: Netlify deployment files

**Files:**
- Create: `mfp-frontend/src/_redirects`
- Create: `mfp-frontend/src/_headers`
- Modify: `mfp-frontend/angular.json`

- [ ] **Step 1: Create _redirects**

`mfp-frontend/src/_redirects`:
```
/* /index.html 200
```

- [ ] **Step 2: Create _headers (CSP)**

`mfp-frontend/src/_headers`:
```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://REPLACE_WITH_RENDER_URL;
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
```

(Update `connect-src` with the actual Render URL after deployment.)

- [ ] **Step 3: Add _redirects and _headers to angular.json assets**

In `mfp-frontend/angular.json`, update the `"assets"` array under both `build` options (default and development) to include:
```json
{ "glob": "_redirects", "input": "src", "output": "/" },
{ "glob": "_headers", "input": "src", "output": "/" }
```

- [ ] **Step 4: Build to verify all assets are included**

```bash
cd mfp-frontend
npm run build 2>&1 | tail -5
ls dist/mfp-frontend/browser/ | grep -E "_redirects|_headers"
```

Expected: `_redirects` and `_headers` listed.

- [ ] **Step 5: Run all backend tests one final time**

```bash
cd ../mfp-backend
npx jest --no-coverage
```

Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
cd ..
git add mfp-frontend/
git commit -m "feat(pwa): update manifest, wire env fileReplacements, add Netlify deployment files"
```

---

## Chunk 5: Deployment (manual steps)

### Task 21: Deploy to Neon + Render + Netlify

These steps are done manually in the browser — no code changes.

- [ ] **Step 1: Create Neon database**
  1. Go to neon.tech → sign up / log in
  2. Create project "FoodyBud"
  3. Copy the `DATABASE_URL` connection string (format: `postgresql://user:pass@host/dbname?sslmode=require`)

- [ ] **Step 2: Deploy backend to Render**
  1. Go to render.com → sign up / log in
  2. New → Web Service → connect GitHub repo → select `FoodyBud`
  3. Root directory: `mfp-backend`
  4. Build command: `npm install && npm run build`
  5. Start command: `node dist/main.js` (or leave blank — Render reads Procfile)
  6. Add environment variables (Settings → Environment):
     ```
     DATABASE_URL=<neon_url>
     JWT_SECRET=<generate with: openssl rand -base64 32>
     NODE_ENV=production
     FRONTEND_URL=https://foodybud.netlify.app
     ```
  7. Deploy → wait for "Live" status
  8. Copy the service URL (e.g. `https://foodybud-api.onrender.com`)

- [ ] **Step 3: Update environment.prod.ts with real Render URL**

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://foodybud-api.onrender.com',  // actual URL from Render
};
```

Also update `connect-src` in `mfp-frontend/src/_headers`.

- [ ] **Step 4: Commit and push updated env**

```bash
git add mfp-frontend/src/environments/environment.prod.ts mfp-frontend/src/_headers
git commit -m "feat(deploy): set Render backend URL in prod environment"
git push origin master
```

- [ ] **Step 5: Deploy frontend to Netlify**
  1. Go to netlify.com → sign up / log in
  2. Add new site → Import from Git → select FoodyBud repo
  3. Base directory: `mfp-frontend`
  4. Build command: `npm run build`
  5. Publish directory: `dist/mfp-frontend/browser`
  6. Deploy site → wait for success
  7. (Optional) Set custom domain or note the `https://random-name.netlify.app` URL

- [ ] **Step 6: Test end-to-end**
  1. Open the Netlify URL on your smartphone
  2. Register a new account
  3. Add a food item — verify it saves and appears
  4. On Android Chrome: check for "Add to Home Screen" install prompt
  5. On iOS Safari: Share → "Add to Home Screen"
  6. Launch from home screen — verify it opens fullscreen without browser chrome

---

## Post-deployment verification checklist

- [ ] `/auth/register` and `/auth/login` return `{ access_token }`
- [ ] Authenticated API calls include Bearer header (check DevTools Network tab)
- [ ] Unauthenticated requests to protected routes return 401
- [ ] Refreshing the page keeps the session (token in localStorage)
- [ ] Logging out redirects to /login
- [ ] PWA installable on Android (install banner appears)
- [ ] PWA installable on iOS (Add to Home Screen works)
- [ ] Cold start after inactivity: app shows loading state, then recovers
