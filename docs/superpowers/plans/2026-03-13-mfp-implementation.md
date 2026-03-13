# MFP — Food Tracking App Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack food tracking PWA (Angular + NestJS + PostgreSQL) deployable on Vercel + Railway.

**Architecture:** Angular 17+ PWA (Vercel) communicates with a NestJS REST API (Railway) backed by PostgreSQL. Open Food Facts API is called server-side for barcode lookups. The frontend reads from `GET /summary?date=` for the daily dashboard.

**Tech Stack:** Angular 17+ standalone components · Angular Material · @zxing/browser · NestJS · TypeORM · PostgreSQL · Jest · Railway · Vercel

**Spec:** `docs/superpowers/specs/2026-03-13-mfp-design.md`

---

## File Structure

### Backend — `mfp-backend/`
```
src/
  app.module.ts
  main.ts
  foods/
    food.entity.ts
    foods.module.ts
    foods.controller.ts
    foods.service.ts
    off.service.ts                 ← Open Food Facts HTTP client
    dto/
      create-food.dto.ts
      update-food.dto.ts
  recipes/
    recipe.entity.ts
    recipe-item.entity.ts
    recipes.module.ts
    recipes.controller.ts
    recipes.service.ts
    dto/
      create-recipe.dto.ts
      update-recipe.dto.ts
  meals/
    meal.entity.ts
    meal-item.entity.ts
    meals.module.ts
    meals.controller.ts
    meals.service.ts
    dto/
      create-meal.dto.ts
      update-meal.dto.ts
  activities/
    activity.entity.ts
    activities.module.ts
    activities.controller.ts
    activities.service.ts
    dto/
      create-activity.dto.ts
      update-activity.dto.ts
  goals/
    goal.entity.ts
    goals.module.ts
    goals.controller.ts
    goals.service.ts
    dto/
      update-goals.dto.ts
  summary/
    summary.module.ts
    summary.controller.ts
    summary.service.ts
    summary.types.ts
  database/
    migrations/                    ← TypeORM migrations (generated)
test/
  foods.service.spec.ts
  recipes.service.spec.ts
  meals.service.spec.ts
  summary.service.spec.ts
```

### Frontend — `mfp-frontend/`
```
src/
  app/
    app.config.ts
    app.routes.ts
    core/
      models/
        food.model.ts
        recipe.model.ts
        meal.model.ts
        activity.model.ts
        goal.model.ts
        summary.model.ts
      services/
        foods.service.ts
        recipes.service.ts
        meals.service.ts
        activities.service.ts
        goals.service.ts
        summary.service.ts
      interceptors/
        error.interceptor.ts
    features/
      dashboard/
        dashboard.component.ts
        dashboard.component.html
        dashboard.component.scss
        components/
          calories-ring/calories-ring.component.ts
          macro-bar/macro-bar.component.ts
          meal-type-card/meal-type-card.component.ts
          activity-list/activity-list.component.ts
      journal/
        journal.component.ts
        journal.component.html
      foods/
        foods-list/foods-list.component.ts
        food-create/food-create.component.ts
        food-edit/food-edit.component.ts
        food-scan/food-scan.component.ts
        food-form/food-form.component.ts    ← réutilisé par create + edit
      recipes/
        recipes-list/recipes-list.component.ts
        recipe-create/recipe-create.component.ts
        recipe-edit/recipe-edit.component.ts
        recipe-form/recipe-form.component.ts
      meals/
        meal-create/meal-create.component.ts
        meal-edit/meal-edit.component.ts
        meal-form/meal-form.component.ts
      activities/
        activity-create/activity-create.component.ts
        activity-edit/activity-edit.component.ts
        activity-form/activity-form.component.ts
      goals/
        goals.component.ts
        goals.component.html
    shared/
      components/
        food-picker/food-picker.component.ts   ← dialog de sélection aliment/recette
        progress-ring/progress-ring.component.ts
        nutrient-row/nutrient-row.component.ts
  ngsw-config.json
  manifest.webmanifest
```

---

## Chunk 1: Project Bootstrap & Deployment Config

### Task 1: Initialize NestJS backend

**Files:**
- Create: `mfp-backend/` (NestJS project)
- Create: `mfp-backend/.env.example`
- Create: `mfp-backend/Procfile`

- [ ] **Step 1: Scaffold NestJS**

```bash
npx @nestjs/cli new mfp-backend --package-manager npm --skip-git
cd mfp-backend
```

- [ ] **Step 2: Install backend dependencies**

```bash
npm install @nestjs/typeorm typeorm pg @nestjs/config @nestjs/axios axios class-validator class-transformer
npm install --save-dev @types/pg
```

- [ ] **Step 3: Create `.env.example`**

```
DATABASE_URL=postgresql://user:password@localhost:5432/mfp
PORT=3000
FRONTEND_URL=http://localhost:4200
```

Copy to `.env` and fill with local values.

- [ ] **Step 4: Create `Procfile` for Railway**

```
web: node dist/main.js
```

- [ ] **Step 5: Enable validation pipe and CORS in `src/main.ts`**

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: process.env.FRONTEND_URL });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
```

- [ ] **Step 6: Commit**

```bash
git add . && git commit -m "chore: scaffold NestJS backend"
```

---

### Task 2: Initialize Angular PWA frontend

**Files:**
- Create: `mfp-frontend/` (Angular project)
- Create: `mfp-frontend/src/environments/environment.ts`
- Create: `mfp-frontend/src/environments/environment.prod.ts`

- [ ] **Step 1: Scaffold Angular app**

```bash
npx @angular/cli new mfp-frontend --routing --style scss --standalone --skip-git
cd mfp-frontend
```

- [ ] **Step 2: Add PWA support**

```bash
ng add @angular/pwa
```

- [ ] **Step 3: Add Angular Material**

```bash
ng add @angular/material
# Choose: Indigo/Pink theme, Set up typography: Yes, Include animations: Yes
```

- [ ] **Step 4: Install barcode scanner**

```bash
npm install @zxing/browser @zxing/library
```

- [ ] **Step 5: Create environment files**

`src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
};
```

`src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-railway-backend-url.railway.app',
};
```

- [ ] **Step 6: Commit**

```bash
git add . && git commit -m "chore: scaffold Angular PWA frontend"
```

---

### Task 3: Configure TypeORM + PostgreSQL

**Files:**
- Modify: `mfp-backend/src/app.module.ts`

- [ ] **Step 1: Update `app.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
        migrationsRun: true,
        synchronize: false,
        ssl: process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

- [ ] **Step 2: Add `typeorm` script to `package.json`**

```json
"scripts": {
  "typeorm": "typeorm-ts-node-commonjs -d src/database/data-source.ts"
}
```

- [ ] **Step 3: Create `src/database/data-source.ts`**

```typescript
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/database/migrations/*.ts'],
});
```

- [ ] **Step 4: Commit**

```bash
git add . && git commit -m "chore: configure TypeORM + PostgreSQL connection"
```

---

## Chunk 2: Database Schema — TypeORM Entities & Migrations

### Task 4: Food entity

**Files:**
- Create: `mfp-backend/src/foods/food.entity.ts`

- [ ] **Step 1: Write test verifying entity fields exist**

```typescript
// test/foods.service.spec.ts
import { Food } from '../src/foods/food.entity';

describe('Food entity', () => {
  it('should have required nutritional fields', () => {
    const food = new Food();
    food.name = 'Test';
    food.calories = 100;
    food.proteins = 10;
    food.carbs = 20;
    food.fat = 5;
    food.fiber = 2;
    food.sugars = 8;
    food.saturatedFat = 1.5;
    food.salt = 0.5;
    food.source = 'CUSTOM';
    expect(food.name).toBe('Test');
    expect(food.source).toBe('CUSTOM');
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd mfp-backend && npm test -- --testPathPattern=foods
```

- [ ] **Step 3: Create `src/foods/food.entity.ts`**

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('foods')
export class Food {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  barcode: string;

  @Column({ type: 'varchar', default: 'CUSTOM' })
  source: 'OFF' | 'CUSTOM';

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'float' })
  calories: number;

  @Column({ type: 'float' })
  proteins: number;

  @Column({ type: 'float' })
  carbs: number;

  @Column({ type: 'float' })
  fat: number;

  @Column({ type: 'float' })
  fiber: number;

  @Column({ type: 'float' })
  sugars: number;

  @Column({ type: 'float', name: 'saturated_fat' })
  saturatedFat: number;

  @Column({ type: 'float' })
  salt: number;

  @Column({ type: 'jsonb', nullable: true })
  vitamins: Record<string, number> | null;

  @Column({ type: 'jsonb', nullable: true })
  minerals: Record<string, number> | null;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt: Date | null;
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- --testPathPattern=foods
```

- [ ] **Step 5: Commit**

```bash
git add . && git commit -m "feat: add Food entity"
```

---

### Task 5: Recipe + RecipeItem entities

**Files:**
- Create: `mfp-backend/src/recipes/recipe.entity.ts`
- Create: `mfp-backend/src/recipes/recipe-item.entity.ts`

- [ ] **Step 1: Create `recipe.entity.ts`**

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany,
} from 'typeorm';
import { RecipeItem } from './recipe-item.entity';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'float', name: 'total_weight_g' })
  totalWeightG: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt: Date | null;

  @OneToMany(() => RecipeItem, (item) => item.recipe, {
    cascade: true,
    eager: true,
  })
  items: RecipeItem[];
}
```

- [ ] **Step 2: Create `recipe-item.entity.ts`**

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { Recipe } from './recipe.entity';
import { Food } from '../foods/food.entity';

@Entity('recipe_items')
export class RecipeItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Recipe, (recipe) => recipe.items, { onDelete: 'CASCADE' })
  recipe: Recipe;

  @ManyToOne(() => Food, { onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'food_id' })
  food: Food;

  @Column({ type: 'float', name: 'quantity_g' })
  quantityG: number;
}
```

- [ ] **Step 3: Commit**

```bash
git add . && git commit -m "feat: add Recipe and RecipeItem entities"
```

---

### Task 6: Meal + MealItem entities

**Files:**
- Create: `mfp-backend/src/meals/meal.entity.ts`
- Create: `mfp-backend/src/meals/meal-item.entity.ts`

- [ ] **Step 1: Create `meal.entity.ts`**

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany,
} from 'typeorm';
import { MealItem } from './meal-item.entity';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar' })
  mealType: MealType;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => MealItem, (item) => item.meal, {
    cascade: true,
    eager: true,
  })
  items: MealItem[];
}
```

- [ ] **Step 2: Create `meal-item.entity.ts`**

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { Meal } from './meal.entity';
import { Food } from '../foods/food.entity';
import { Recipe } from '../recipes/recipe.entity';

@Entity('meal_items')
export class MealItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Meal, (meal) => meal.items, { onDelete: 'CASCADE' })
  meal: Meal;

  @ManyToOne(() => Food, { nullable: true, onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'food_id' })
  food: Food | null;

  @ManyToOne(() => Recipe, { nullable: true, onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe | null;

  @Column({ type: 'float', name: 'quantity_g' })
  quantityG: number;
}
```

- [ ] **Step 3: Commit**

```bash
git add . && git commit -m "feat: add Meal and MealItem entities"
```

---

### Task 7: Activity + Goal entities

**Files:**
- Create: `mfp-backend/src/activities/activity.entity.ts`
- Create: `mfp-backend/src/goals/goal.entity.ts`

- [ ] **Step 1: Create `activity.entity.ts`**

```typescript
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'float', name: 'calories_burned' })
  caloriesBurned: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

- [ ] **Step 2: Create `goal.entity.ts`**

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Singleton enforcement: only one row allowed
  @Column({ type: 'boolean', default: true, unique: true })
  singleton: boolean;

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

- [ ] **Step 3: Generate and run migrations**

```bash
cd mfp-backend
npm run typeorm -- migration:generate src/database/migrations/InitialSchema
npm run typeorm -- migration:run
```

Expected: tables `foods`, `recipes`, `recipe_items`, `meals`, `meal_items`, `activities`, `goals` created.

- [ ] **Step 4: Seed Goal defaults**

```bash
# In psql or TablePlus:
INSERT INTO goals (singleton, calories, proteins, carbs, fat, fiber, sugars, saturated_fat, salt)
VALUES (true, 2000, 150, 250, 65, 25, 50, 20, 6)
ON CONFLICT (singleton) DO NOTHING;
```

Or add a TypeORM seeder script (optional, manual seed for v1 is fine).

- [ ] **Step 5: Commit**

```bash
git add . && git commit -m "feat: add Activity and Goal entities + run initial migration"
```

---

## Chunk 3: Backend — Foods Module

### Task 8: OpenFoodFacts service

**Files:**
- Create: `mfp-backend/src/foods/off.service.ts`

- [ ] **Step 1: Write failing test**

```typescript
// test/off.service.spec.ts
import { OffService } from '../src/foods/off.service';
import { HttpService } from '@nestjs/axios';
import { of } from 'rxjs';
import { AxiosResponse } from 'axios';

describe('OffService', () => {
  let service: OffService;
  let httpService: jest.Mocked<HttpService>;

  beforeEach(() => {
    httpService = { get: jest.fn() } as any;
    service = new OffService(httpService);
  });

  it('should return normalized food data for a valid barcode', async () => {
    const mockResponse: AxiosResponse = {
      data: {
        status: 1,
        product: {
          product_name: 'Yaourt nature',
          nutriments: {
            'energy-kcal_100g': 250,
            proteins_100g: 4.5,
            carbohydrates_100g: 5.2,
            fat_100g: 3.1,
            fiber_100g: 0,
            sugars_100g: 5.2,
            'saturated-fat_100g': 2,
            salt_100g: 0.1,
          },
        },
      },
    } as any;
    httpService.get.mockReturnValue(of(mockResponse));

    const result = await service.lookup('3033490004822');

    expect(result).not.toBeNull();
    expect(result!.name).toBe('Yaourt nature');
    expect(result!.calories).toBe(250); // direct from energy-kcal_100g
    expect(result!.proteins).toBe(4.5);
  });

  it('should return null when product not found', async () => {
    const mockResponse: AxiosResponse = {
      data: { status: 0 },
    } as any;
    httpService.get.mockReturnValue(of(mockResponse));

    const result = await service.lookup('0000000000000');
    expect(result).toBeNull();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- --testPathPattern=off
```

- [ ] **Step 3: Create `src/foods/off.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface OFFResult {
  name: string;
  barcode: string;
  calories: number;
  proteins: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugars: number;
  saturatedFat: number;
  salt: number;
  vitamins: Record<string, number> | null;
  minerals: Record<string, number> | null;
}

@Injectable()
export class OffService {
  private readonly BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';

  constructor(private readonly http: HttpService) {}

  async lookup(barcode: string): Promise<OFFResult | null> {
    const { data } = await firstValueFrom(
      this.http.get(`${this.BASE_URL}/${barcode}.json`),
    );

    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const n = p.nutriments ?? {};

    // Prefer energy-kcal_100g (kcal); fall back to energy_100g (kJ) / 4.184
    const calories = n['energy-kcal_100g'] ?? (n['energy_100g'] ?? 0) / 4.184;

    const MICRO_VITAMIN_KEYS = ['vitamin-a', 'vitamin-c', 'vitamin-d', 'vitamin-b12', 'vitamin-e'];
    const MICRO_MINERAL_KEYS = ['iron', 'calcium', 'magnesium', 'zinc', 'potassium'];

    const vitamins = this.extractMicros(n, MICRO_VITAMIN_KEYS);
    const minerals = this.extractMicros(n, MICRO_MINERAL_KEYS);

    return {
      name: p.product_name ?? 'Produit inconnu',
      barcode,
      calories: Math.round(calories * 10) / 10,
      proteins: n['proteins_100g'] ?? 0,
      carbs: n['carbohydrates_100g'] ?? 0,
      fat: n['fat_100g'] ?? 0,
      fiber: n['fiber_100g'] ?? 0,
      sugars: n['sugars_100g'] ?? 0,
      saturatedFat: n['saturated-fat_100g'] ?? 0,
      salt: n['salt_100g'] ?? 0,
      vitamins: Object.keys(vitamins).length ? vitamins : null,
      minerals: Object.keys(minerals).length ? minerals : null,
    };
  }

  private extractMicros(nutriments: any, keys: string[]): Record<string, number> {
    const result: Record<string, number> = {};
    for (const key of keys) {
      const val = nutriments[`${key}_100g`];
      if (val != null) result[key] = val;
    }
    return result;
  }
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- --testPathPattern=off
```

- [ ] **Step 5: Commit**

```bash
git add . && git commit -m "feat: add OpenFoodFacts service with barcode lookup"
```

---

### Task 9: FoodsService

**Files:**
- Create: `mfp-backend/src/foods/foods.service.ts`
- Create: `mfp-backend/src/foods/dto/create-food.dto.ts`
- Create: `mfp-backend/src/foods/dto/update-food.dto.ts`

- [ ] **Step 1: Write failing tests**

```typescript
// test/foods.service.spec.ts (extend existing file)
import { FoodsService } from '../src/foods/foods.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Food } from '../src/foods/food.entity';
import { Test } from '@nestjs/testing';

describe('FoodsService', () => {
  let service: FoodsService;
  let repo: jest.Mocked<any>;

  beforeEach(async () => {
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
    };
    const module = await Test.createTestingModule({
      providers: [
        FoodsService,
        { provide: getRepositoryToken(Food), useValue: repo },
      ],
    }).compile();
    service = module.get(FoodsService);
  });

  it('search() excludes soft-deleted foods', async () => {
    repo.find.mockResolvedValue([]);
    await service.search('test');
    expect(repo.find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.arrayContaining([
          expect.objectContaining({ deletedAt: null }),
        ]),
      }),
    );
  });

  it('softDelete() sets deletedAt', async () => {
    const food = Object.assign(new Food(), { id: '1', deletedAt: null });
    repo.findOne.mockResolvedValue(food);
    repo.save.mockResolvedValue({ ...food, deletedAt: new Date() });
    const result = await service.softDelete('1');
    expect(result.deletedAt).not.toBeNull();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- --testPathPattern=foods.service
```

- [ ] **Step 3: Create DTOs**

`src/foods/dto/create-food.dto.ts`:
```typescript
import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreateFoodDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsIn(['OFF', 'CUSTOM'])
  source: 'OFF' | 'CUSTOM';

  @IsNumber()
  calories: number;

  @IsNumber()
  proteins: number;

  @IsNumber()
  carbs: number;

  @IsNumber()
  fat: number;

  @IsNumber()
  fiber: number;

  @IsNumber()
  sugars: number;

  @IsNumber()
  saturatedFat: number;

  @IsNumber()
  salt: number;

  @IsOptional()
  vitamins?: Record<string, number>;

  @IsOptional()
  minerals?: Record<string, number>;
}
```

`src/foods/dto/update-food.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateFoodDto } from './create-food.dto';
export class UpdateFoodDto extends PartialType(CreateFoodDto) {}
```

- [ ] **Step 4: Create `src/foods/foods.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, ILike, Or } from 'typeorm';
import { Food } from './food.entity';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';

@Injectable()
export class FoodsService {
  constructor(
    @InjectRepository(Food)
    private readonly repo: Repository<Food>,
  ) {}

  async search(query?: string): Promise<Food[]> {
    if (!query) {
      return this.repo.find({ where: { deletedAt: IsNull() } });
    }

    const isNumeric = /^\d+$/.test(query);
    const conditions: any[] = [
      { name: ILike(`%${query}%`), deletedAt: IsNull() },
    ];
    if (isNumeric) {
      conditions.push({ barcode: query, deletedAt: IsNull() });
    }

    return this.repo.find({ where: conditions });
  }

  findOne(id: string): Promise<Food | null> {
    return this.repo.findOne({ where: { id, deletedAt: IsNull() } });
  }

  create(dto: CreateFoodDto): Promise<Food> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateFoodDto): Promise<Food> {
    const food = await this.findOne(id);
    if (!food) throw new NotFoundException(`Food ${id} not found`);
    return this.repo.save({ ...food, ...dto });
  }

  async softDelete(id: string): Promise<Food> {
    const food = await this.repo.findOne({ where: { id } });
    if (!food) throw new NotFoundException(`Food ${id} not found`);
    food.deletedAt = new Date();
    return this.repo.save(food);
  }
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test -- --testPathPattern=foods.service
```

- [ ] **Step 6: Commit**

```bash
git add . && git commit -m "feat: add FoodsService with search, soft-delete, CRUD"
```

---

### Task 10: FoodsController + FoodsModule

**Files:**
- Create: `mfp-backend/src/foods/foods.controller.ts`
- Create: `mfp-backend/src/foods/foods.module.ts`
- Modify: `mfp-backend/src/app.module.ts`

- [ ] **Step 1: Create `foods.controller.ts`**

```typescript
import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
} from '@nestjs/common';
import { FoodsService } from './foods.service';
import { OffService } from './off.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { UpdateFoodDto } from './dto/update-food.dto';

@Controller('foods')
export class FoodsController {
  constructor(
    private readonly foods: FoodsService,
    private readonly off: OffService,
  ) {}

  @Get()
  search(@Query('search') query?: string) {
    return this.foods.search(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.foods.findOne(id);
  }

  @Post('scan')
  scan(@Body('barcode') barcode: string) {
    return this.off.lookup(barcode);
  }

  @Post()
  create(@Body() dto: CreateFoodDto) {
    return this.foods.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateFoodDto) {
    return this.foods.update(id, dto);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.foods.softDelete(id);
  }
}
```

- [ ] **Step 2: Create `foods.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { Food } from './food.entity';
import { FoodsController } from './foods.controller';
import { FoodsService } from './foods.service';
import { OffService } from './off.service';

@Module({
  imports: [TypeOrmModule.forFeature([Food]), HttpModule],
  controllers: [FoodsController],
  providers: [FoodsService, OffService],
  exports: [FoodsService],
})
export class FoodsModule {}
```

- [ ] **Step 3: Register in `app.module.ts`** — add `FoodsModule` to `imports`.

- [ ] **Step 4: Manual smoke test**

```bash
npm run start:dev
curl http://localhost:3000/foods
# Expected: []
curl -X POST http://localhost:3000/foods/scan -H "Content-Type: application/json" -d '{"barcode":"3017620422003"}'
# Expected: Nutella data from OFF
```

- [ ] **Step 5: Commit**

```bash
git add . && git commit -m "feat: add FoodsController and FoodsModule"
```

---

## Chunk 4: Backend — Recipes & Meals Modules

### Task 11: RecipesService

**Files:**
- Create: `mfp-backend/src/recipes/recipes.service.ts`
- Create: `mfp-backend/src/recipes/dto/create-recipe.dto.ts`
- Create: `mfp-backend/src/recipes/dto/update-recipe.dto.ts`

- [ ] **Step 1: Write failing test for nutritional calculation**

```typescript
// test/recipes.service.spec.ts
import { RecipesService } from '../src/recipes/recipes.service';

describe('RecipesService.computePer100g', () => {
  let service: RecipesService;

  beforeEach(() => {
    service = new RecipesService(null as any, null as any);
  });

  it('calculates proteins per 100g correctly', () => {
    const items = [
      { food: { proteins: 3.5, calories: 130, carbs: 28, fat: 0.3, fiber: 0, sugars: 0, saturatedFat: 0, salt: 0 }, quantityG: 200 },
      { food: { proteins: 25, calories: 165, carbs: 0, fat: 3.6, fiber: 0, sugars: 0, saturatedFat: 1, salt: 0.07 }, quantityG: 100 },
    ] as any[];
    const totalWeightG = 300;

    const result = service.computePer100g(items, totalWeightG);

    // proteins: (3.5 * 200/100 + 25 * 100/100) / 300 * 100 = (7 + 25) / 300 * 100 = 10.67
    expect(result.proteins).toBeCloseTo(10.67, 1);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- --testPathPattern=recipes.service
```

- [ ] **Step 3: Create `dto/create-recipe.dto.ts`**

```typescript
import { IsString, IsNumber, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class RecipeItemDto {
  @IsUUID()
  foodId: string;

  @IsNumber()
  quantityG: number;
}

export class CreateRecipeDto {
  @IsString()
  name: string;

  @IsNumber()
  totalWeightG: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  items: RecipeItemDto[];
}
```

`dto/update-recipe.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateRecipeDto } from './create-recipe.dto';
export class UpdateRecipeDto extends PartialType(CreateRecipeDto) {}
```

- [ ] **Step 4: Create `recipes.service.ts`**

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Recipe } from './recipe.entity';
import { RecipeItem } from './recipe-item.entity';
import { Food } from '../foods/food.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

type NutrientKeys = 'calories' | 'proteins' | 'carbs' | 'fat' | 'fiber' | 'sugars' | 'saturatedFat' | 'salt';
type NutriMap = Record<NutrientKeys, number>;

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe) private readonly recipeRepo: Repository<Recipe>,
    @InjectRepository(Food) private readonly foodRepo: Repository<Food>,
  ) {}

  findAll(): Promise<Recipe[]> {
    return this.recipeRepo.find({ where: { deletedAt: IsNull() } });
  }

  findOne(id: string): Promise<Recipe | null> {
    return this.recipeRepo.findOne({ where: { id, deletedAt: IsNull() } });
  }

  async create(dto: CreateRecipeDto): Promise<Recipe> {
    const items = await this.resolveItems(dto.items);
    const recipe = this.recipeRepo.create({
      name: dto.name,
      totalWeightG: dto.totalWeightG,
      items,
    });
    return this.recipeRepo.save(recipe);
  }

  async update(id: string, dto: UpdateRecipeDto): Promise<Recipe> {
    const recipe = await this.findOne(id);
    if (!recipe) throw new NotFoundException(`Recipe ${id} not found`);
    if (dto.items) {
      recipe.items = await this.resolveItems(dto.items);
    }
    return this.recipeRepo.save({ ...recipe, ...dto });
  }

  async softDelete(id: string): Promise<Recipe> {
    const recipe = await this.recipeRepo.findOne({ where: { id } });
    if (!recipe) throw new NotFoundException(`Recipe ${id} not found`);
    recipe.deletedAt = new Date();
    return this.recipeRepo.save(recipe);
  }

  computePer100g(items: RecipeItem[], totalWeightG: number): NutriMap {
    const keys: NutrientKeys[] = ['calories', 'proteins', 'carbs', 'fat', 'fiber', 'sugars', 'saturatedFat', 'salt'];
    const totals = keys.reduce((acc, k) => ({ ...acc, [k]: 0 }), {} as NutriMap);

    for (const item of items) {
      const factor = item.quantityG / 100;
      for (const k of keys) {
        totals[k] += (item.food[k] ?? 0) * factor;
      }
    }

    return keys.reduce(
      (acc, k) => ({ ...acc, [k]: Math.round((totals[k] / totalWeightG) * 100 * 100) / 100 }),
      {} as NutriMap,
    );
  }

  private async resolveItems(dtoItems: { foodId: string; quantityG: number }[]): Promise<RecipeItem[]> {
    return Promise.all(
      dtoItems.map(async ({ foodId, quantityG }) => {
        const food = await this.foodRepo.findOne({ where: { id: foodId } });
        if (!food) throw new BadRequestException(`Food ${foodId} not found`);
        const item = new RecipeItem();
        item.food = food;
        item.quantityG = quantityG;
        return item;
      }),
    );
  }
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test -- --testPathPattern=recipes.service
```

- [ ] **Step 6: Commit**

```bash
git add . && git commit -m "feat: add RecipesService with nutritional computation"
```

---

### Task 12: RecipesController + RecipesModule

**Files:**
- Create: `mfp-backend/src/recipes/recipes.controller.ts`
- Create: `mfp-backend/src/recipes/recipes.module.ts`

- [ ] **Step 1: Create `recipes.controller.ts`**

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipes: RecipesService) {}

  @Get() findAll() { return this.recipes.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.recipes.findOne(id); }
  @Post() create(@Body() dto: CreateRecipeDto) { return this.recipes.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateRecipeDto) { return this.recipes.update(id, dto); }
  @Delete(':id') softDelete(@Param('id') id: string) { return this.recipes.softDelete(id); }
}
```

- [ ] **Step 2: Create `recipes.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Recipe } from './recipe.entity';
import { RecipeItem } from './recipe-item.entity';
import { Food } from '../foods/food.entity';
import { RecipesController } from './recipes.controller';
import { RecipesService } from './recipes.service';

@Module({
  imports: [TypeOrmModule.forFeature([Recipe, RecipeItem, Food])],
  controllers: [RecipesController],
  providers: [RecipesService],
  exports: [RecipesService],
})
export class RecipesModule {}
```

- [ ] **Step 3: Register in `app.module.ts`**

- [ ] **Step 4: Commit**

```bash
git add . && git commit -m "feat: add RecipesController and RecipesModule"
```

---

### Task 13: MealsService + MealsModule

**Files:**
- Create: `mfp-backend/src/meals/meals.service.ts`
- Create: `mfp-backend/src/meals/meals.controller.ts`
- Create: `mfp-backend/src/meals/meals.module.ts`
- Create: `mfp-backend/src/meals/dto/create-meal.dto.ts`

- [ ] **Step 1: Write failing test for XOR validation**

```typescript
// test/meals.service.spec.ts
import { MealsService } from '../src/meals/meals.service';
import { BadRequestException } from '@nestjs/common';

describe('MealsService XOR validation', () => {
  let service: MealsService;

  beforeEach(() => {
    service = new MealsService(null as any, null as any, null as any);
  });

  it('throws when both foodId and recipeId are provided', () => {
    expect(() =>
      service.validateXor({ foodId: 'a', recipeId: 'b', quantityG: 100 }),
    ).toThrow(BadRequestException);
  });

  it('throws when neither foodId nor recipeId are provided', () => {
    expect(() =>
      service.validateXor({ quantityG: 100 }),
    ).toThrow(BadRequestException);
  });

  it('passes when only foodId is provided', () => {
    expect(() =>
      service.validateXor({ foodId: 'a', quantityG: 100 }),
    ).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- --testPathPattern=meals.service
```

- [ ] **Step 3: Create `dto/create-meal.dto.ts`**

```typescript
import { IsString, IsDateString, IsIn, IsOptional, IsArray, ValidateNested, IsUUID, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class MealItemDto {
  @IsOptional() @IsUUID()
  foodId?: string;

  @IsOptional() @IsUUID()
  recipeId?: string;

  @IsNumber()
  quantityG: number;
}

export class CreateMealDto {
  @IsOptional() @IsString()
  name?: string;

  @IsDateString()
  date: string;

  @IsIn(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'])
  mealType: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealItemDto)
  items: MealItemDto[];
}
```

- [ ] **Step 4: Create `meals.service.ts`**

```typescript
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meal } from './meal.entity';
import { MealItem } from './meal-item.entity';
import { Food } from '../foods/food.entity';
import { Recipe } from '../recipes/recipe.entity';
import { CreateMealDto, MealItemDto } from './dto/create-meal.dto';

@Injectable()
export class MealsService {
  constructor(
    @InjectRepository(Meal) private readonly mealRepo: Repository<Meal>,
    @InjectRepository(Food) private readonly foodRepo: Repository<Food>,
    @InjectRepository(Recipe) private readonly recipeRepo: Repository<Recipe>,
  ) {}

  findByDate(date: string): Promise<Meal[]> {
    return this.mealRepo.find({ where: { date } });
  }

  findOne(id: string): Promise<Meal | null> {
    return this.mealRepo.findOne({ where: { id } });
  }

  async create(dto: CreateMealDto): Promise<Meal> {
    dto.items.forEach((item) => this.validateXor(item));
    const items = await this.resolveItems(dto.items);
    const meal = this.mealRepo.create({ ...dto, items });
    return this.mealRepo.save(meal);
  }

  async update(id: string, dto: Partial<CreateMealDto>): Promise<Meal> {
    const meal = await this.findOne(id);
    if (!meal) throw new NotFoundException(`Meal ${id} not found`);
    if (dto.items) {
      dto.items.forEach((item) => this.validateXor(item));
      meal.items = await this.resolveItems(dto.items);
    }
    return this.mealRepo.save({ ...meal, ...dto });
  }

  async remove(id: string): Promise<void> {
    const meal = await this.findOne(id);
    if (!meal) throw new NotFoundException(`Meal ${id} not found`);
    await this.mealRepo.remove(meal);
  }

  validateXor(item: Partial<MealItemDto>): void {
    const hasFood = !!item.foodId;
    const hasRecipe = !!item.recipeId;
    if (hasFood === hasRecipe) {
      throw new BadRequestException('Each meal item must have exactly one of foodId or recipeId');
    }
  }

  private async resolveItems(dtoItems: MealItemDto[]): Promise<MealItem[]> {
    return Promise.all(
      dtoItems.map(async (dto) => {
        const item = new MealItem();
        item.quantityG = dto.quantityG;
        item.food = null;
        item.recipe = null;
        if (dto.foodId) {
          const food = await this.foodRepo.findOne({ where: { id: dto.foodId } });
          if (!food) throw new BadRequestException(`Food ${dto.foodId} not found`);
          item.food = food;
        } else {
          const recipe = await this.recipeRepo.findOne({ where: { id: dto.recipeId } });
          if (!recipe) throw new BadRequestException(`Recipe ${dto.recipeId} not found`);
          item.recipe = recipe;
        }
        return item;
      }),
    );
  }
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test -- --testPathPattern=meals.service
```

- [ ] **Step 6: Create `meals.controller.ts` and `meals.module.ts`**

`meals.controller.ts`:
```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { MealsService } from './meals.service';
import { CreateMealDto } from './dto/create-meal.dto';

@Controller('meals')
export class MealsController {
  constructor(private readonly meals: MealsService) {}

  @Get() findByDate(@Query('date') date: string) { return this.meals.findByDate(date); }
  @Get(':id') findOne(@Param('id') id: string) { return this.meals.findOne(id); }
  @Post() create(@Body() dto: CreateMealDto) { return this.meals.create(dto); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: Partial<CreateMealDto>) { return this.meals.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.meals.remove(id); }
}
```

`meals.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meal } from './meal.entity';
import { MealItem } from './meal-item.entity';
import { Food } from '../foods/food.entity';
import { Recipe } from '../recipes/recipe.entity';
import { MealsController } from './meals.controller';
import { MealsService } from './meals.service';

@Module({
  imports: [TypeOrmModule.forFeature([Meal, MealItem, Food, Recipe])],
  controllers: [MealsController],
  providers: [MealsService],
  exports: [MealsService],
})
export class MealsModule {}
```

- [ ] **Step 7: Register in `app.module.ts`**

- [ ] **Step 8: Commit**

```bash
git add . && git commit -m "feat: add MealsModule with XOR validation"
```

---

## Chunk 5: Backend — Activities, Goals, Summary

### Task 14: ActivitiesModule + GoalsModule

**Files:**
- Create: `mfp-backend/src/activities/` (module, controller, service, dto)
- Create: `mfp-backend/src/goals/` (module, controller, service, dto)

- [ ] **Step 1: Create Activities DTOs**

`activities/dto/create-activity.dto.ts`:
```typescript
import { IsString, IsDateString, IsNumber } from 'class-validator';
export class CreateActivityDto {
  @IsString() name: string;
  @IsDateString() date: string;
  @IsNumber() caloriesBurned: number;
}
```

`activities/dto/update-activity.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { CreateActivityDto } from './create-activity.dto';
export class UpdateActivityDto extends PartialType(CreateActivityDto) {}
```

- [ ] **Step 2: Create `activities/activities.service.ts`**

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(
    @InjectRepository(Activity) private readonly repo: Repository<Activity>,
  ) {}

  findByDate(date: string): Promise<Activity[]> {
    return this.repo.find({ where: { date } });
  }

  findOne(id: string): Promise<Activity | null> {
    return this.repo.findOne({ where: { id } });
  }

  create(dto: CreateActivityDto): Promise<Activity> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateActivityDto): Promise<Activity> {
    const activity = await this.findOne(id);
    if (!activity) throw new NotFoundException(`Activity ${id} not found`);
    return this.repo.save({ ...activity, ...dto });
  }

  async remove(id: string): Promise<void> {
    const activity = await this.findOne(id);
    if (!activity) throw new NotFoundException(`Activity ${id} not found`);
    await this.repo.remove(activity);
  }
}
```

- [ ] **Step 3: Create `activities/activities.controller.ts`**

```typescript
import { Controller, Get, Post, Patch, Delete, Body, Param, Query } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Get()
  findByDate(@Query('date') date: string) {
    return this.activities.findByDate(date);
  }

  @Post()
  create(@Body() dto: CreateActivityDto) {
    return this.activities.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateActivityDto) {
    return this.activities.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.activities.remove(id);
  }
}
```

- [ ] **Step 4: Create `activities/activities.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Activity } from './activity.entity';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';

@Module({
  imports: [TypeOrmModule.forFeature([Activity])],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
  exports: [ActivitiesService],
})
export class ActivitiesModule {}
```

- [ ] **Step 5: Scaffold Goals — create `goals/dto/update-goals.dto.ts`**

```typescript
import { IsNumber, IsOptional } from 'class-validator';
export class UpdateGoalsDto {
  @IsOptional() @IsNumber() calories?: number;
  @IsOptional() @IsNumber() proteins?: number;
  @IsOptional() @IsNumber() carbs?: number;
  @IsOptional() @IsNumber() fat?: number;
  @IsOptional() @IsNumber() fiber?: number;
  @IsOptional() @IsNumber() sugars?: number;
  @IsOptional() @IsNumber() saturatedFat?: number;
  @IsOptional() @IsNumber() salt?: number;
}
```

- [ ] **Step 6: Create `goals/goals.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Goal } from './goal.entity';
import { UpdateGoalsDto } from './dto/update-goals.dto';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(Goal) private readonly repo: Repository<Goal>,
  ) {}

  async get(): Promise<Goal> {
    let goal = await this.repo.findOne({ where: { singleton: true } });
    if (!goal) {
      goal = this.repo.create({ singleton: true });
      await this.repo.save(goal);
    }
    return goal;
  }

  async upsert(dto: UpdateGoalsDto): Promise<Goal> {
    const goal = await this.get();
    return this.repo.save({ ...goal, ...dto });
  }
}
```

- [ ] **Step 7: Create `goals/goals.controller.ts`**

```typescript
import { Controller, Get, Put, Body } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { UpdateGoalsDto } from './dto/update-goals.dto';

@Controller('goals')
export class GoalsController {
  constructor(private readonly goals: GoalsService) {}

  @Get() get() { return this.goals.get(); }
  @Put() upsert(@Body() dto: UpdateGoalsDto) { return this.goals.upsert(dto); }
}
```

- [ ] **Step 8: Create `goals/goals.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal } from './goal.entity';
import { GoalsController } from './goals.controller';
import { GoalsService } from './goals.service';

@Module({
  imports: [TypeOrmModule.forFeature([Goal])],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}
```

- [ ] **Step 9: Register both modules in `app.module.ts`**

Add to the `imports` array in `app.module.ts`:
```typescript
import { ActivitiesModule } from './activities/activities.module';
import { GoalsModule } from './goals/goals.module';
// add ActivitiesModule, GoalsModule to @Module imports array
```

- [ ] **Step 10: Commit**

```bash
git add . && git commit -m "feat: add ActivitiesModule and GoalsModule"
```

---

### Task 15: SummaryService

**Files:**
- Create: `mfp-backend/src/summary/summary.service.ts`
- Create: `mfp-backend/src/summary/summary.types.ts`
- Create: `mfp-backend/src/summary/summary.controller.ts`
- Create: `mfp-backend/src/summary/summary.module.ts`

- [ ] **Step 1: Write failing test for aggregation**

```typescript
// test/summary.service.spec.ts
import { SummaryService } from '../src/summary/summary.service';
import { MealItem } from '../src/meals/meal-item.entity';
import { Food } from '../src/foods/food.entity';

describe('SummaryService.computeItemNutrients', () => {
  let service: SummaryService;

  beforeEach(() => {
    service = new SummaryService(null as any, null as any, null as any, null as any);
  });

  it('computes nutrients for food item proportionally', () => {
    const food = Object.assign(new Food(), {
      calories: 100, proteins: 10, carbs: 20, fat: 5, fiber: 2, sugars: 8, saturatedFat: 1, salt: 0.5,
    });
    const item = Object.assign(new MealItem(), { food, recipe: null, quantityG: 200 });

    const result = service.computeItemNutrients(item);

    expect(result.calories).toBe(200);   // 100 * 200/100
    expect(result.proteins).toBe(20);    // 10 * 2
    expect(result.carbs).toBe(40);
  });
});
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- --testPathPattern=summary.service
```

- [ ] **Step 3: Create `summary.types.ts`**

```typescript
export interface NutriTotals {
  calories: number;
  proteins: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugars: number;
  saturatedFat: number;
  salt: number;
}

export const EMPTY_TOTALS = (): NutriTotals => ({
  calories: 0, proteins: 0, carbs: 0, fat: 0, fiber: 0, sugars: 0, saturatedFat: 0, salt: 0,
});

export type MealTypeKey = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
```

- [ ] **Step 4: Create `summary.service.ts`**

```typescript
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meal } from '../meals/meal.entity';
import { MealItem } from '../meals/meal-item.entity';
import { Activity } from '../activities/activity.entity';
import { Goal } from '../goals/goal.entity';
import { NutriTotals, EMPTY_TOTALS, MealTypeKey } from './summary.types';
import { RecipesService } from '../recipes/recipes.service';

@Injectable()
export class SummaryService {
  constructor(
    @InjectRepository(Meal) private readonly mealRepo: Repository<Meal>,
    @InjectRepository(Activity) private readonly activityRepo: Repository<Activity>,
    @InjectRepository(Goal) private readonly goalRepo: Repository<Goal>,
    private readonly recipesService: RecipesService,
  ) {}

  async getSummary(date: string) {
    const meals = await this.mealRepo.find({ where: { date } });
    const activities = await this.activityRepo.find({ where: { date } });
    const goal = await this.goalRepo.findOne({ where: { singleton: true } });

    const totals = EMPTY_TOTALS();
    const byMealType: Record<MealTypeKey, NutriTotals> = {
      BREAKFAST: EMPTY_TOTALS(),
      LUNCH: EMPTY_TOTALS(),
      DINNER: EMPTY_TOTALS(),
      SNACK: EMPTY_TOTALS(),
    };

    const mealsWithComputed = meals.map((meal) => {
      const mealTotals = EMPTY_TOTALS();
      const items = meal.items.map((item) => {
        const computed = this.computeItemNutrients(item);
        this.addTo(mealTotals, computed);
        return { ...item, computed };
      });
      this.addTo(totals, mealTotals);
      this.addTo(byMealType[meal.mealType as MealTypeKey], mealTotals);
      return { id: meal.id, name: meal.name, meal_type: meal.mealType, items };
    });

    return { date, totals, byMealType, meals: mealsWithComputed, activities, goals: goal };
  }

  computeItemNutrients(item: MealItem): NutriTotals {
    const keys: (keyof NutriTotals)[] = ['calories', 'proteins', 'carbs', 'fat', 'fiber', 'sugars', 'saturatedFat', 'salt'];
    const source: NutriTotals = item.food
      ? (item.food as any)
      : this.recipesService.computePer100g(item.recipe!.items, item.recipe!.totalWeightG);

    return keys.reduce(
      (acc, k) => ({ ...acc, [k]: Math.round((source[k] ?? 0) * item.quantityG / 100 * 100) / 100 }),
      {} as NutriTotals,
    );
  }

  private addTo(target: NutriTotals, source: NutriTotals): void {
    for (const k of Object.keys(source) as (keyof NutriTotals)[]) {
      target[k] = Math.round((target[k] + source[k]) * 100) / 100;
    }
  }
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test -- --testPathPattern=summary.service
```

- [ ] **Step 6: Create controller and module**

`summary.controller.ts`:
```typescript
import { Controller, Get, Query } from '@nestjs/common';
import { SummaryService } from './summary.service';

@Controller('summary')
export class SummaryController {
  constructor(private readonly summary: SummaryService) {}

  @Get()
  get(@Query('date') date: string) {
    return this.summary.getSummary(date ?? new Date().toISOString().split('T')[0]);
  }
}
```

- [ ] **Step 6b: Create `summary.module.ts`**

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meal } from '../meals/meal.entity';
import { MealItem } from '../meals/meal-item.entity';
import { Activity } from '../activities/activity.entity';
import { Goal } from '../goals/goal.entity';
import { RecipesModule } from '../recipes/recipes.module';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Meal, MealItem, Activity, Goal]), RecipesModule],
  controllers: [SummaryController],
  providers: [SummaryService],
})
export class SummaryModule {}
```

- [ ] **Step 7: Register in `app.module.ts`**

Add `SummaryModule` (and all previous modules) to the `imports` array. Final `app.module.ts` imports:
```typescript
imports: [
  ConfigModule.forRoot({ isGlobal: true }),
  TypeOrmModule.forRootAsync({ ... }),
  FoodsModule,
  RecipesModule,
  MealsModule,
  ActivitiesModule,
  GoalsModule,
  SummaryModule,
],
```

- [ ] **Step 8: Smoke test**

```bash
curl "http://localhost:3000/summary?date=2026-03-13"
# Expected: { date, totals, byMealType, meals: [], activities: [], goals: {...} }
```

- [ ] **Step 9: Commit**

```bash
git add . && git commit -m "feat: add SummaryModule with daily aggregation"
```

---

## Chunk 6: Angular Core Setup

### Task 16: Routing, models, HTTP services

**Files:**
- Modify: `mfp-frontend/src/app/app.routes.ts`
- Create: `mfp-frontend/src/app/core/models/*.model.ts` (6 files)
- Create: `mfp-frontend/src/app/core/services/*.service.ts` (6 files)
- Create: `mfp-frontend/src/app/core/interceptors/error.interceptor.ts`
- Modify: `mfp-frontend/src/app/app.config.ts`

- [ ] **Step 1: Define TypeScript models**

`core/models/food.model.ts`:
```typescript
export interface Food {
  id: string;
  name: string;
  barcode?: string;
  source: 'OFF' | 'CUSTOM';
  calories: number;
  proteins: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugars: number;
  saturatedFat: number;
  salt: number;
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
  deletedAt?: string;
}
```

`core/models/recipe.model.ts`:
```typescript
import { Food } from './food.model';
export interface RecipeItem { id: string; food: Food; quantityG: number; }
export interface Recipe { id: string; name: string; totalWeightG: number; items: RecipeItem[]; }
```

`core/models/meal.model.ts`:
```typescript
import { Food } from './food.model';
import { Recipe } from './recipe.model';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
export interface MealItem { id: string; food: Food | null; recipe: Recipe | null; quantityG: number; computed?: NutriMap; }
export interface Meal { id: string; name?: string; date: string; mealType: MealType; items: MealItem[]; }
export interface NutriMap { calories: number; proteins: number; carbs: number; fat: number; fiber: number; sugars: number; saturatedFat: number; salt: number; }
```

`core/models/activity.model.ts`:
```typescript
export interface Activity { id: string; name: string; date: string; caloriesBurned: number; }
```

`core/models/goal.model.ts`:
```typescript
export interface Goal { calories: number; proteins: number; carbs: number; fat: number; fiber: number; sugars: number; saturatedFat: number; salt: number; }
```

`core/models/summary.model.ts`:
```typescript
import { NutriMap, Meal, MealType } from './meal.model';
import { Activity } from './activity.model';
import { Goal } from './goal.model';
export interface Summary { date: string; totals: NutriMap; byMealType: Record<MealType, NutriMap>; meals: Meal[]; activities: Activity[]; goals: Goal; }
```

- [ ] **Step 2: Create API services**

`core/services/foods.service.ts`:
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Food } from '../models/food.model';

@Injectable({ providedIn: 'root' })
export class FoodsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/foods`;

  search(query?: string) {
    return this.http.get<Food[]>(this.base, { params: query ? { search: query } : {} });
  }
  getById(id: string) { return this.http.get<Food>(`${this.base}/${id}`); }
  scan(barcode: string) { return this.http.post<Partial<Food>>(`${this.base}/scan`, { barcode }); }
  create(food: Partial<Food>) { return this.http.post<Food>(this.base, food); }
  update(id: string, food: Partial<Food>) { return this.http.patch<Food>(`${this.base}/${id}`, food); }
  delete(id: string) { return this.http.delete(`${this.base}/${id}`); }
}
```

`core/services/recipes.service.ts`:
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Recipe } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class RecipesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/recipes`;

  getAll() { return this.http.get<Recipe[]>(this.base); }
  getById(id: string) { return this.http.get<Recipe>(`${this.base}/${id}`); }
  create(recipe: Partial<Recipe>) { return this.http.post<Recipe>(this.base, recipe); }
  update(id: string, recipe: Partial<Recipe>) { return this.http.patch<Recipe>(`${this.base}/${id}`, recipe); }
  delete(id: string) { return this.http.delete(`${this.base}/${id}`); }
}
```

`core/services/meals.service.ts`:
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Meal } from '../models/meal.model';

@Injectable({ providedIn: 'root' })
export class MealsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/meals`;

  getByDate(date: string) { return this.http.get<Meal[]>(this.base, { params: { date } }); }
  getById(id: string) { return this.http.get<Meal>(`${this.base}/${id}`); }
  create(meal: Partial<Meal>) { return this.http.post<Meal>(this.base, meal); }
  update(id: string, meal: Partial<Meal>) { return this.http.patch<Meal>(`${this.base}/${id}`, meal); }
  delete(id: string) { return this.http.delete(`${this.base}/${id}`); }
}
```

`core/services/activities.service.ts`:
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Activity } from '../models/activity.model';

@Injectable({ providedIn: 'root' })
export class ActivitiesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/activities`;

  getByDate(date: string) { return this.http.get<Activity[]>(this.base, { params: { date } }); }
  getById(id: string) { return this.http.get<Activity>(`${this.base}/${id}`); }
  create(activity: Partial<Activity>) { return this.http.post<Activity>(this.base, activity); }
  update(id: string, activity: Partial<Activity>) { return this.http.patch<Activity>(`${this.base}/${id}`, activity); }
  delete(id: string) { return this.http.delete(`${this.base}/${id}`); }
}
```

`core/services/goals.service.ts`:
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Goal } from '../models/goal.model';

@Injectable({ providedIn: 'root' })
export class GoalsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/goals`;

  get() { return this.http.get<Goal>(this.base); }
  update(goal: Partial<Goal>) { return this.http.put<Goal>(this.base, goal); }
}
```

`core/services/summary.service.ts`:
```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Summary } from '../models/summary.model';

@Injectable({ providedIn: 'root' })
export class SummaryService {
  private http = inject(HttpClient);

  get(date: string) {
    return this.http.get<Summary>(`${environment.apiUrl}/summary`, { params: { date } });
  }
}
```

- [ ] **Step 3: Create error interceptor**

`core/interceptors/error.interceptor.ts`:
```typescript
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const snack = inject(MatSnackBar);
  return next(req).pipe(
    catchError((err) => {
      const message = err.error?.message ?? 'Une erreur est survenue';
      snack.open(message, 'Fermer', { duration: 4000 });
      return throwError(() => err);
    }),
  );
};
```

- [ ] **Step 4: Configure `app.config.ts`**

```typescript
import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([errorInterceptor])),
    provideAnimationsAsync(),
  ],
};
```

- [ ] **Step 5: Configure routes in `app.routes.ts`**

```typescript
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'journal', loadComponent: () => import('./features/journal/journal.component').then(m => m.JournalComponent) },
  { path: 'aliments', loadComponent: () => import('./features/foods/foods-list/foods-list.component').then(m => m.FoodsListComponent) },
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
  { path: '**', redirectTo: '' },
];
```

- [ ] **Step 6: Commit**

```bash
git add . && git commit -m "feat: add Angular core — models, services, routing, interceptor"
```

---

## Chunk 7: Frontend — Foods Feature

### Task 17: Food form component (shared between create + edit)

**Files:**
- Create: `mfp-frontend/src/app/features/foods/food-form/food-form.component.ts`

- [ ] **Step 1: Create `food-form.component.ts`** (reactive form, emits on submit)

```typescript
import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Food } from '../../../core/models/food.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-food-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatFormFieldModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field>
        <mat-label>Nom</mat-label>
        <input matInput formControlName="name" required />
      </mat-form-field>

      <h3>Valeurs pour 100g</h3>
      <mat-form-field *ngFor="let field of nutrientFields">
        <mat-label>{{ field.label }}</mat-label>
        <input matInput type="number" [formControlName]="field.key" />
        <span matSuffix>g</span>
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
        {{ submitLabel }}
      </button>
    </form>
  `,
})
export class FoodFormComponent implements OnInit {
  @Input() initialData?: Partial<Food>;
  @Input() submitLabel = 'Enregistrer';
  @Output() submitted = new EventEmitter<Partial<Food>>();

  private fb = inject(FormBuilder);

  nutrientFields = [
    { key: 'calories', label: 'Calories (kcal)' },
    { key: 'proteins', label: 'Protéines' },
    { key: 'carbs', label: 'Glucides' },
    { key: 'fat', label: 'Lipides' },
    { key: 'fiber', label: 'Fibres' },
    { key: 'sugars', label: 'Sucres' },
    { key: 'saturatedFat', label: 'Graisses saturées' },
    { key: 'salt', label: 'Sel' },
  ];

  form = this.fb.group({
    name: ['', Validators.required],
    barcode: [''],
    calories: [0, [Validators.required, Validators.min(0)]],
    proteins: [0, [Validators.required, Validators.min(0)]],
    carbs: [0, [Validators.required, Validators.min(0)]],
    fat: [0, [Validators.required, Validators.min(0)]],
    fiber: [0, [Validators.required, Validators.min(0)]],
    sugars: [0, [Validators.required, Validators.min(0)]],
    saturatedFat: [0, [Validators.required, Validators.min(0)]],
    salt: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    if (this.initialData) {
      this.form.patchValue(this.initialData as any);
    }
  }

  onSubmit() {
    if (this.form.valid) this.submitted.emit(this.form.value as Partial<Food>);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add . && git commit -m "feat: add FoodFormComponent"
```

---

### Task 18: Foods list, create, edit pages

**Files:**
- Create: `mfp-frontend/src/app/features/foods/foods-list/foods-list.component.ts`
- Create: `mfp-frontend/src/app/features/foods/food-create/food-create.component.ts`
- Create: `mfp-frontend/src/app/features/foods/food-edit/food-edit.component.ts`

- [ ] **Step 1: Create `foods-list.component.ts`**

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { FoodsService } from '../../../core/services/foods.service';
import { Food } from '../../../core/models/food.model';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-foods-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatListModule, MatInputModule, MatButtonModule, MatIconModule],
  template: `
    <div class="page-header">
      <h1>Mes aliments</h1>
      <div class="actions">
        <button mat-raised-button routerLink="/aliments/nouveau">+ Créer</button>
        <button mat-stroked-button (click)="router.navigate(['/aliments/scan'])">Scan</button>
      </div>
    </div>
    <mat-form-field appearance="outline" class="search-field">
      <mat-label>Rechercher</mat-label>
      <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)" />
    </mat-form-field>
    <mat-list>
      <mat-list-item *ngFor="let food of foods()">
        <span matListItemTitle>{{ food.name }}</span>
        <span matListItemLine>{{ food.calories }} kcal · P {{ food.proteins }}g · G {{ food.carbs }}g · L {{ food.fat }}g</span>
        <button mat-icon-button (click)="router.navigate(['/aliments', food.id, 'edit'])">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-list-item>
    </mat-list>
  `,
})
export class FoodsListComponent implements OnInit {
  router = inject(Router);
  private foodsService = inject(FoodsService);
  foods = signal<Food[]>([]);
  searchQuery = '';
  private search$ = new Subject<string>();

  ngOnInit() {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) => this.foodsService.search(q)),
    ).subscribe((foods) => this.foods.set(foods));
    this.onSearch('');
  }

  onSearch(query: string) { this.search$.next(query); }
}
```

- [ ] **Step 2: Create `food-create.component.ts`**

```typescript
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FoodsService } from '../../../core/services/foods.service';
import { FoodFormComponent } from '../food-form/food-form.component';
import { Food } from '../../../core/models/food.model';

@Component({
  selector: 'app-food-create',
  standalone: true,
  imports: [FoodFormComponent],
  template: `
    <h1>Nouvel aliment</h1>
    <app-food-form submitLabel="Créer" (submitted)="onCreate($event)" />
  `,
})
export class FoodCreateComponent {
  private foodsService = inject(FoodsService);
  private router = inject(Router);

  onCreate(data: Partial<Food>) {
    this.foodsService.create({ ...data, source: 'CUSTOM' }).subscribe(() => {
      this.router.navigate(['/aliments']);
    });
  }
}
```

- [ ] **Step 3: Create `food-edit.component.ts`**

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FoodsService } from '../../../core/services/foods.service';
import { FoodFormComponent } from '../food-form/food-form.component';
import { Food } from '../../../core/models/food.model';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-food-edit',
  standalone: true,
  imports: [CommonModule, FoodFormComponent, MatButtonModule],
  template: `
    <h1>Modifier un aliment</h1>
    <app-food-form *ngIf="food()" [initialData]="food()!" submitLabel="Enregistrer" (submitted)="onUpdate($event)" />
    <button mat-stroked-button color="warn" (click)="onDelete()">Supprimer</button>
  `,
})
export class FoodEditComponent implements OnInit {
  private foodsService = inject(FoodsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  food = signal<Food | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.foodsService.getById(id).subscribe((f) => this.food.set(f));
  }

  onUpdate(data: Partial<Food>) {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.foodsService.update(id, data).subscribe(() => this.router.navigate(['/aliments']));
  }

  onDelete() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.foodsService.delete(id).subscribe(() => this.router.navigate(['/aliments']));
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add . && git commit -m "feat: add foods list, create, and edit pages"
```

---

### Task 19: Barcode scanner component

**Files:**
- Create: `mfp-frontend/src/app/features/foods/food-scan/food-scan.component.ts`

- [ ] **Step 1: Create `food-scan.component.ts`**

```typescript
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { FoodsService } from '../../../core/services/foods.service';
import { FoodFormComponent } from '../food-form/food-form.component';
import { Food } from '../../../core/models/food.model';

@Component({
  selector: 'app-food-scan',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatInputModule, FoodFormComponent],
  template: `
    <h1>Scanner un produit</h1>

    <!-- Camera scan (mobile) -->
    <div *ngIf="!manualMode && !scannedData">
      <video #videoEl autoplay></video>
      <button mat-stroked-button (click)="manualMode = true">Saisie manuelle</button>
    </div>

    <!-- Manual barcode entry (desktop fallback) -->
    <div *ngIf="manualMode && !scannedData">
      <mat-form-field>
        <mat-label>Code-barres</mat-label>
        <input matInput [(ngModel)]="manualBarcode" />
      </mat-form-field>
      <button mat-raised-button (click)="lookupManual()">Rechercher</button>
    </div>

    <!-- Confirmation form after scan -->
    <div *ngIf="scannedData">
      <p>Produit trouvé : <strong>{{ scannedData.name }}</strong></p>
      <app-food-form [initialData]="scannedData" submitLabel="Enregistrer" (submitted)="onSave($event)" />
    </div>

    <p *ngIf="error" class="error">{{ error }}</p>
  `,
})
export class FoodScanComponent implements OnInit, OnDestroy {
  @ViewChild('videoEl') videoEl!: ElementRef<HTMLVideoElement>;
  private foodsService = inject(FoodsService);
  private router = inject(Router);

  manualMode = false;
  manualBarcode = '';
  scannedData: Partial<Food> | null = null;
  error = '';
  private reader = new BrowserMultiFormatReader();
  private stream: MediaStream | null = null;

  async ngOnInit() {
    if (!navigator.mediaDevices) { this.manualMode = true; return; }
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      // start scanning after view initializes
      setTimeout(() => this.startScan(), 200);
    } catch {
      this.manualMode = true;
    }
  }

  private startScan() {
    if (!this.videoEl) return;
    this.reader.decodeFromStream(this.stream!, this.videoEl.nativeElement, (result) => {
      if (result) this.lookup(result.getText());
    });
  }

  lookupManual() { this.lookup(this.manualBarcode); }

  private lookup(barcode: string) {
    this.error = '';
    this.foodsService.scan(barcode).subscribe({
      next: (data) => {
        if (!data) {
          this.error = 'Produit non trouvé. Vous pouvez le saisir manuellement.';
          this.scannedData = { barcode, source: 'CUSTOM' };
        } else {
          this.scannedData = { ...data, source: 'OFF' };
        }
        this.stopStream();
      },
      error: () => {
        this.error = 'Erreur lors de la recherche. Saisie manuelle activée.';
        this.scannedData = { barcode, source: 'CUSTOM' };
        this.stopStream();
      },
    });
  }

  onSave(data: Partial<Food>) {
    this.foodsService.create({ ...data, source: this.scannedData?.source ?? 'CUSTOM' }).subscribe(() => {
      this.router.navigate(['/aliments']);
    });
  }

  ngOnDestroy() { this.stopStream(); }
  private stopStream() { this.stream?.getTracks().forEach((t) => t.stop()); }
}
```

- [ ] **Step 2: Add route for scan**

In `app.routes.ts`:
```typescript
{ path: 'aliments/scan', loadComponent: () => import('./features/foods/food-scan/food-scan.component').then(m => m.FoodScanComponent) },
```

(Add before `/aliments/:id/edit` to avoid conflict.)

- [ ] **Step 3: Commit**

```bash
git add . && git commit -m "feat: add barcode scanner component with camera + manual fallback"
```

---

## Chunk 8: Frontend — Recipes & Meals

### Task 20: Food picker dialog (shared component)

**Files:**
- Create: `mfp-frontend/src/app/shared/components/food-picker/food-picker.component.ts`

- [ ] **Step 1: Create `food-picker.component.ts`** (Material dialog, returns selected food or recipe + quantity)

```typescript
import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FoodsService } from '../../../core/services/foods.service';
import { RecipesService } from '../../../core/services/recipes.service';
import { Food } from '../../../core/models/food.model';
import { Recipe } from '../../../core/models/recipe.model';

export interface FoodPickerResult {
  food?: Food;
  recipe?: Recipe;
  quantityG: number;
}

@Component({
  selector: 'app-food-picker',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatTabsModule, MatListModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Ajouter un aliment ou une recette</h2>
    <mat-dialog-content>
      <mat-tab-group>
        <mat-tab label="Aliments">
          <input matInput placeholder="Rechercher..." [(ngModel)]="foodQuery" (ngModelChange)="searchFoods()" />
          <mat-selection-list [multiple]="false" [(ngModel)]="selectedFood">
            <mat-list-option *ngFor="let f of foods()" [value]="f">
              {{ f.name }} — {{ f.calories }} kcal/100g
            </mat-list-option>
          </mat-selection-list>
        </mat-tab>
        <mat-tab label="Recettes">
          <mat-selection-list [multiple]="false" [(ngModel)]="selectedRecipe">
            <mat-list-option *ngFor="let r of recipes()" [value]="r">{{ r.name }}</mat-list-option>
          </mat-selection-list>
        </mat-tab>
      </mat-tab-group>

      <mat-form-field>
        <mat-label>Quantité (g)</mat-label>
        <input matInput type="number" [(ngModel)]="quantityG" min="1" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="confirm()" [disabled]="!canConfirm()">Ajouter</button>
    </mat-dialog-actions>
  `,
})
export class FoodPickerComponent implements OnInit {
  private foodsService = inject(FoodsService);
  private recipesService = inject(RecipesService);
  private dialogRef = inject(MatDialogRef<FoodPickerComponent>);

  foods = signal<Food[]>([]);
  recipes = signal<Recipe[]>([]);
  foodQuery = '';
  selectedFood: Food[] = [];
  selectedRecipe: Recipe[] = [];
  quantityG = 100;

  ngOnInit() {
    this.searchFoods();
    this.recipesService.getAll().subscribe((r) => this.recipes.set(r));
  }

  searchFoods() {
    this.foodsService.search(this.foodQuery).subscribe((f) => this.foods.set(f));
  }

  canConfirm() {
    return (this.selectedFood.length > 0 || this.selectedRecipe.length > 0) && this.quantityG > 0;
  }

  confirm() {
    const result: FoodPickerResult = { quantityG: this.quantityG };
    if (this.selectedFood.length > 0) result.food = this.selectedFood[0];
    else result.recipe = this.selectedRecipe[0];
    this.dialogRef.close(result);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add . && git commit -m "feat: add FoodPickerComponent dialog"
```

---

### Task 21: Recipe pages

**Files:**
- Create: `mfp-frontend/src/app/features/recipes/recipe-form/recipe-form.component.ts`
- Create: `mfp-frontend/src/app/features/recipes/recipes-list/recipes-list.component.ts`
- Create: `mfp-frontend/src/app/features/recipes/recipe-create/recipe-create.component.ts`
- Create: `mfp-frontend/src/app/features/recipes/recipe-edit/recipe-edit.component.ts`

- [ ] **Step 1: Create `recipe-form.component.ts`**

```typescript
import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { FoodPickerComponent, FoodPickerResult } from '../../../shared/components/food-picker/food-picker.component';
import { Recipe, RecipeItem } from '../../../core/models/recipe.model';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatIconModule, MatListModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field appearance="outline">
        <mat-label>Nom de la recette</mat-label>
        <input matInput formControlName="name" required />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Poids total préparé</mat-label>
        <input matInput type="number" formControlName="totalWeightG" required />
        <span matSuffix>g</span>
      </mat-form-field>

      <h3>Ingrédients</h3>
      <mat-list>
        <mat-list-item *ngFor="let item of items; let i = index">
          <span matListItemTitle>{{ item.food.name }}</span>
          <span matListItemLine>{{ item.quantityG }}g</span>
          <button mat-icon-button (click)="removeItem(i)" type="button">
            <mat-icon>delete</mat-icon>
          </button>
        </mat-list-item>
      </mat-list>
      <button mat-stroked-button type="button" (click)="openPicker()">+ Ajouter un aliment</button>

      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || items.length === 0">
        {{ submitLabel }}
      </button>
    </form>
  `,
})
export class RecipeFormComponent implements OnInit {
  @Input() initialData?: Partial<Recipe>;
  @Input() submitLabel = 'Enregistrer';
  @Output() submitted = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  form = this.fb.group({
    name: ['', Validators.required],
    totalWeightG: [0, [Validators.required, Validators.min(1)]],
  });

  items: { food: any; quantityG: number }[] = [];

  ngOnInit() {
    if (this.initialData) {
      this.form.patchValue(this.initialData as any);
      this.items = (this.initialData.items ?? []).map((i: any) => ({ food: i.food, quantityG: i.quantityG }));
    }
  }

  openPicker() {
    this.dialog.open(FoodPickerComponent).afterClosed().subscribe((result: FoodPickerResult | undefined) => {
      if (result?.food) this.items.push({ food: result.food, quantityG: result.quantityG });
    });
  }

  removeItem(index: number) { this.items.splice(index, 1); }

  onSubmit() {
    if (this.form.valid) {
      this.submitted.emit({
        ...this.form.value,
        items: this.items.map((i) => ({ foodId: i.food.id, quantityG: i.quantityG })),
      });
    }
  }
}
```

- [ ] **Step 2: Create `recipes-list.component.ts`**

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { RecipesService } from '../../../core/services/recipes.service';
import { Recipe } from '../../../core/models/recipe.model';

@Component({
  selector: 'app-recipes-list',
  standalone: true,
  imports: [CommonModule, MatListModule, MatButtonModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>Mes recettes</h1>
      <button mat-raised-button routerLink="/recettes/nouveau">+ Créer</button>
    </div>
    <mat-list>
      <mat-list-item *ngFor="let r of recipes()">
        <span matListItemTitle>{{ r.name }}</span>
        <span matListItemLine>{{ r.totalWeightG }}g total · {{ r.items.length }} ingrédients</span>
        <button mat-button (click)="router.navigate(['/recettes', r.id, 'edit'])">Modifier</button>
      </mat-list-item>
    </mat-list>
  `,
})
export class RecipesListComponent implements OnInit {
  router = inject(Router);
  private recipesService = inject(RecipesService);
  recipes = signal<Recipe[]>([]);
  ngOnInit() { this.recipesService.getAll().subscribe((r) => this.recipes.set(r)); }
}
```

- [ ] **Step 3: Create `recipe-create.component.ts`**

```typescript
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RecipesService } from '../../../core/services/recipes.service';
import { RecipeFormComponent } from '../recipe-form/recipe-form.component';

@Component({
  selector: 'app-recipe-create',
  standalone: true,
  imports: [RecipeFormComponent],
  template: `<h1>Nouvelle recette</h1><app-recipe-form submitLabel="Créer" (submitted)="onCreate($event)" />`,
})
export class RecipeCreateComponent {
  private recipesService = inject(RecipesService);
  private router = inject(Router);
  onCreate(data: any) {
    this.recipesService.create(data).subscribe(() => this.router.navigate(['/recettes']));
  }
}
```

- [ ] **Step 4: Create `recipe-edit.component.ts`**

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RecipesService } from '../../../core/services/recipes.service';
import { RecipeFormComponent } from '../recipe-form/recipe-form.component';
import { Recipe } from '../../../core/models/recipe.model';

@Component({
  selector: 'app-recipe-edit',
  standalone: true,
  imports: [CommonModule, RecipeFormComponent, MatButtonModule],
  template: `
    <h1>Modifier la recette</h1>
    <app-recipe-form *ngIf="recipe()" [initialData]="recipe()!" submitLabel="Enregistrer" (submitted)="onUpdate($event)" />
    <button mat-stroked-button color="warn" (click)="onDelete()">Supprimer</button>
  `,
})
export class RecipeEditComponent implements OnInit {
  private recipesService = inject(RecipesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  recipe = signal<Recipe | null>(null);
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.recipesService.getById(id).subscribe((r) => this.recipe.set(r));
  }
  onUpdate(data: any) {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.recipesService.update(id, data).subscribe(() => this.router.navigate(['/recettes']));
  }
  onDelete() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.recipesService.delete(id).subscribe(() => this.router.navigate(['/recettes']));
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add . && git commit -m "feat: add recipe pages (list, create, edit)"
```

---

### Task 22: Meal pages

**Files:**
- Create: `mfp-frontend/src/app/features/meals/meal-form/meal-form.component.ts`
- Create: `mfp-frontend/src/app/features/meals/meal-create/meal-create.component.ts`
- Create: `mfp-frontend/src/app/features/meals/meal-edit/meal-edit.component.ts`

- [ ] **Step 1: Create `meal-form.component.ts`**

```typescript
import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { FoodPickerComponent, FoodPickerResult } from '../../../shared/components/food-picker/food-picker.component';

@Component({
  selector: 'app-meal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatListModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field appearance="outline">
        <mat-label>Date</mat-label>
        <input matInput type="date" formControlName="date" required />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Moment de la journée</mat-label>
        <mat-select formControlName="mealType" required>
          <mat-option *ngFor="let t of mealTypes" [value]="t.value">{{ t.label }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Nom (optionnel)</mat-label>
        <input matInput formControlName="name" />
      </mat-form-field>

      <h3>Aliments / Recettes</h3>
      <mat-list>
        <mat-list-item *ngFor="let item of items; let i = index">
          <span matListItemTitle>{{ item.food?.name ?? item.recipe?.name }}</span>
          <span matListItemLine>{{ item.quantityG }}g</span>
          <button mat-icon-button type="button" (click)="removeItem(i)"><mat-icon>delete</mat-icon></button>
        </mat-list-item>
      </mat-list>
      <button mat-stroked-button type="button" (click)="openPicker()">+ Ajouter</button>

      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || items.length === 0">
        {{ submitLabel }}
      </button>
    </form>
  `,
})
export class MealFormComponent implements OnInit {
  @Input() initialData?: any;
  @Input() defaultDate?: string;
  @Input() submitLabel = 'Enregistrer';
  @Output() submitted = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  mealTypes = [
    { value: 'BREAKFAST', label: 'Petit-déjeuner' },
    { value: 'LUNCH', label: 'Déjeuner' },
    { value: 'DINNER', label: 'Dîner' },
    { value: 'SNACK', label: 'Snack' },
  ];

  form = this.fb.group({
    date: [this.defaultDate ?? new Date().toISOString().split('T')[0], Validators.required],
    mealType: ['LUNCH', Validators.required],
    name: [''],
  });

  items: { food: any | null; recipe: any | null; quantityG: number }[] = [];

  ngOnInit() {
    if (this.initialData) {
      this.form.patchValue(this.initialData);
      this.items = (this.initialData.items ?? []).map((i: any) => ({
        food: i.food ?? null,
        recipe: i.recipe ?? null,
        quantityG: i.quantityG,
      }));
    }
    if (this.defaultDate) this.form.patchValue({ date: this.defaultDate });
  }

  openPicker() {
    this.dialog.open(FoodPickerComponent).afterClosed().subscribe((result: FoodPickerResult | undefined) => {
      if (result) this.items.push({ food: result.food ?? null, recipe: result.recipe ?? null, quantityG: result.quantityG });
    });
  }

  removeItem(index: number) { this.items.splice(index, 1); }

  onSubmit() {
    if (this.form.valid) {
      this.submitted.emit({
        ...this.form.value,
        items: this.items.map((i) => ({
          foodId: i.food?.id ?? undefined,
          recipeId: i.recipe?.id ?? undefined,
          quantityG: i.quantityG,
        })),
      });
    }
  }
}
```

- [ ] **Step 2: Create `meal-create.component.ts`**

```typescript
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MealsService } from '../../../core/services/meals.service';
import { MealFormComponent } from '../meal-form/meal-form.component';

@Component({
  selector: 'app-meal-create',
  standalone: true,
  imports: [MealFormComponent],
  template: `
    <h1>Nouveau repas</h1>
    <app-meal-form submitLabel="Créer" [defaultDate]="defaultDate" (submitted)="onCreate($event)" />
  `,
})
export class MealCreateComponent {
  private mealsService = inject(MealsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  defaultDate = this.route.snapshot.queryParamMap.get('date') ?? new Date().toISOString().split('T')[0];

  onCreate(data: any) {
    this.mealsService.create(data).subscribe(() => this.router.navigate(['/']));
  }
}
```

- [ ] **Step 3: Create `meal-edit.component.ts`**

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MealsService } from '../../../core/services/meals.service';
import { MealFormComponent } from '../meal-form/meal-form.component';

@Component({
  selector: 'app-meal-edit',
  standalone: true,
  imports: [CommonModule, MealFormComponent, MatButtonModule],
  template: `
    <h1>Modifier le repas</h1>
    <app-meal-form *ngIf="meal()" [initialData]="meal()!" submitLabel="Enregistrer" (submitted)="onUpdate($event)" />
    <button mat-stroked-button color="warn" (click)="onDelete()">Supprimer</button>
  `,
})
export class MealEditComponent implements OnInit {
  private mealsService = inject(MealsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  meal = signal<any>(null);
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.mealsService.getById(id).subscribe((m) => this.meal.set(m));
  }
  onUpdate(data: any) {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.mealsService.update(id, data).subscribe(() => this.router.navigate(['/']));
  }
  onDelete() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.mealsService.delete(id).subscribe(() => this.router.navigate(['/']));
  }
}
```

- [ ] **Step 4: Commit**

```bash
git add . && git commit -m "feat: add meal pages (create, edit) with food picker"
```

---

## Chunk 9: Frontend — Activities, Goals, Dashboard, Journal

### Task 23: Activities + Goals pages

**Files:**
- Create: `mfp-frontend/src/app/features/activities/activity-form/activity-form.component.ts`
- Create: `mfp-frontend/src/app/features/activities/activity-create/activity-create.component.ts`
- Create: `mfp-frontend/src/app/features/activities/activity-edit/activity-edit.component.ts`
- Create: `mfp-frontend/src/app/features/goals/goals.component.ts`

- [ ] **Step 1: Create `activity-form.component.ts`**

```typescript
import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activity-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field appearance="outline">
        <mat-label>Activité</mat-label>
        <input matInput formControlName="name" required />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Date</mat-label>
        <input matInput type="date" formControlName="date" required />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Calories brûlées</mat-label>
        <input matInput type="number" formControlName="caloriesBurned" required />
        <span matSuffix>kcal</span>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">{{ submitLabel }}</button>
    </form>
  `,
})
export class ActivityFormComponent implements OnInit {
  @Input() initialData?: any;
  @Input() submitLabel = 'Enregistrer';
  @Output() submitted = new EventEmitter<any>();

  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: ['', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    caloriesBurned: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() { if (this.initialData) this.form.patchValue(this.initialData); }
  onSubmit() { if (this.form.valid) this.submitted.emit(this.form.value); }
}
```

- [ ] **Step 2: Create `activity-create.component.ts`**

```typescript
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ActivitiesService } from '../../../core/services/activities.service';
import { ActivityFormComponent } from '../activity-form/activity-form.component';

@Component({
  selector: 'app-activity-create',
  standalone: true,
  imports: [ActivityFormComponent],
  template: `<h1>Nouvelle activité</h1><app-activity-form submitLabel="Ajouter" (submitted)="onCreate($event)" />`,
})
export class ActivityCreateComponent {
  private activitiesService = inject(ActivitiesService);
  private router = inject(Router);
  onCreate(data: any) {
    this.activitiesService.create(data).subscribe(() => this.router.navigate(['/']));
  }
}
```

- [ ] **Step 3: Create `activity-edit.component.ts`**

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ActivitiesService } from '../../../core/services/activities.service';
import { ActivityFormComponent } from '../activity-form/activity-form.component';

@Component({
  selector: 'app-activity-edit',
  standalone: true,
  imports: [CommonModule, ActivityFormComponent, MatButtonModule],
  template: `
    <h1>Modifier l'activité</h1>
    <app-activity-form *ngIf="activity()" [initialData]="activity()!" submitLabel="Enregistrer" (submitted)="onUpdate($event)" />
    <button mat-stroked-button color="warn" (click)="onDelete()">Supprimer</button>
  `,
})
export class ActivityEditComponent implements OnInit {
  private activitiesService = inject(ActivitiesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  activity = signal<any>(null);
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.activitiesService.getById(id).subscribe((a) => this.activity.set(a));
  }
  onUpdate(data: any) {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.activitiesService.update(id, data).subscribe(() => this.router.navigate(['/']));
  }
  onDelete() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.activitiesService.delete(id).subscribe(() => this.router.navigate(['/']));
  }
}
```

Note: `getById` and `delete` are already defined in `core/services/activities.service.ts` (Task 16, Step 2).

- [ ] **Step 4: Create `goals.component.ts`**

```typescript
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { GoalsService } from '../../core/services/goals.service';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule],
  template: `
    <h1>Mes objectifs journaliers</h1>
    <form [formGroup]="form" (ngSubmit)="onSave()">
      <mat-form-field appearance="outline" *ngFor="let f of fields">
        <mat-label>{{ f.label }}</mat-label>
        <input matInput type="number" [formControlName]="f.key" min="0" />
        <span matSuffix>{{ f.unit }}</span>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Enregistrer</button>
    </form>
  `,
})
export class GoalsComponent implements OnInit {
  private goalsService = inject(GoalsService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  fields = [
    { key: 'calories', label: 'Calories', unit: 'kcal' },
    { key: 'proteins', label: 'Protéines', unit: 'g' },
    { key: 'carbs', label: 'Glucides', unit: 'g' },
    { key: 'fat', label: 'Lipides', unit: 'g' },
    { key: 'fiber', label: 'Fibres', unit: 'g' },
    { key: 'sugars', label: 'Sucres', unit: 'g' },
    { key: 'saturatedFat', label: 'Graisses saturées', unit: 'g' },
    { key: 'salt', label: 'Sel', unit: 'g' },
  ];

  form = this.fb.group({
    calories: [2000, [Validators.required, Validators.min(0)]],
    proteins: [150, [Validators.required, Validators.min(0)]],
    carbs: [250, [Validators.required, Validators.min(0)]],
    fat: [65, [Validators.required, Validators.min(0)]],
    fiber: [25, [Validators.required, Validators.min(0)]],
    sugars: [50, [Validators.required, Validators.min(0)]],
    saturatedFat: [20, [Validators.required, Validators.min(0)]],
    salt: [6, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    this.goalsService.get().subscribe((g) => this.form.patchValue(g as any));
  }

  onSave() {
    this.goalsService.update(this.form.value as any).subscribe(() => {
      this.snack.open('Objectifs enregistrés', 'OK', { duration: 2000 });
    });
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add . && git commit -m "feat: add activities and goals pages"
```

---

### Task 24: Dashboard

**Files:**
- Create: `mfp-frontend/src/app/features/dashboard/dashboard.component.ts`
- Create: `mfp-frontend/src/app/features/dashboard/dashboard.component.html`
- Create: `mfp-frontend/src/app/features/dashboard/components/calories-ring/calories-ring.component.ts`
- Create: `mfp-frontend/src/app/features/dashboard/components/macro-bar/macro-bar.component.ts`
- Create: `mfp-frontend/src/app/features/dashboard/components/meal-type-card/meal-type-card.component.ts`

- [ ] **Step 1: Create `calories-ring.component.ts`**

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calories-ring',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg viewBox="0 0 100 100" width="160" height="160">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" stroke-width="8" />
      <circle cx="50" cy="50" r="45" fill="none" stroke="#3f51b5" stroke-width="8"
        [attr.stroke-dasharray]="circumference"
        [attr.stroke-dashoffset]="dashOffset"
        stroke-linecap="round"
        transform="rotate(-90 50 50)" />
      <text x="50" y="44" text-anchor="middle" font-size="13" fill="#333">
        {{ consumed | number:'1.0-0' }}
      </text>
      <text x="50" y="58" text-anchor="middle" font-size="9" fill="#888">
        / {{ goal }} kcal
      </text>
    </svg>
  `,
})
export class CaloriesRingComponent {
  @Input() consumed = 0;
  @Input() goal = 2000;

  get circumference() { return 2 * Math.PI * 45; }
  get percentage() { return Math.min((this.consumed / (this.goal || 1)) * 100, 100); }
  get dashOffset() { return this.circumference - (this.percentage / 100) * this.circumference; }
}
```

- [ ] **Step 2: Create `macro-bar.component.ts`**

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-macro-bar',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  template: `
    <div class="macro-bar">
      <div class="macro-header">
        <span class="label">{{ label }}</span>
        <span class="values">{{ consumed | number:'1.0-1' }} / {{ goal }}{{ unit }}</span>
      </div>
      <mat-progress-bar mode="determinate" [value]="percentage" />
    </div>
  `,
  styles: [`.macro-bar { margin-bottom: 8px; } .macro-header { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }`],
})
export class MacroBarComponent {
  @Input() label = '';
  @Input() consumed = 0;
  @Input() goal = 0;
  @Input() unit = 'g';
  get percentage() { return Math.min((this.consumed / (this.goal || 1)) * 100, 100); }
}
```

- [ ] **Step 3: Create `meal-type-card.component.ts`**

```typescript
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NutriMap } from '../../../../core/models/meal.model';

@Component({
  selector: 'app-meal-type-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="meal-type-card">
      <mat-card-header>
        <mat-card-title>{{ mealType }}</mat-card-title>
        <mat-card-subtitle>{{ totals.calories | number:'1.0-0' }} kcal</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <span>P {{ totals.proteins | number:'1.0-1' }}g</span> ·
        <span>G {{ totals.carbs | number:'1.0-1' }}g</span> ·
        <span>L {{ totals.fat | number:'1.0-1' }}g</span>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.meal-type-card { margin-bottom: 8px; }`],
})
export class MealTypeCardComponent {
  @Input() mealType = '';
  @Input() totals!: NutriMap;
}
```

- [ ] **Step 4: Create `dashboard.component.ts`**

```typescript
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SummaryService } from '../../core/services/summary.service';
import { Summary } from '../../core/models/summary.model';
import { MatListModule } from '@angular/material/list';
import { CaloriesRingComponent } from './components/calories-ring/calories-ring.component';
import { MacroBarComponent } from './components/macro-bar/macro-bar.component';
import { MealTypeCardComponent } from './components/meal-type-card/meal-type-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatListModule, CaloriesRingComponent, MacroBarComponent, MealTypeCardComponent],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private summaryService = inject(SummaryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  summary = signal<Summary | null>(null);
  today = new Date().toISOString().split('T')[0];
  currentDate = signal<string>(this.today);

  mealTypeLabels: Record<string, string> = {
    BREAKFAST: 'Petit-déjeuner',
    LUNCH: 'Déjeuner',
    DINNER: 'Dîner',
    SNACK: 'Snacks',
  };

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const date = params.get('date') ?? this.today;
      this.currentDate.set(date);
      this.load(date);
    });
  }

  load(date: string) {
    this.summaryService.get(date).subscribe((s) => this.summary.set(s));
  }

  addMeal() {
    this.router.navigate(['/repas/nouveau'], { queryParams: { date: this.currentDate() } });
  }
}
```

- [ ] **Step 5: Create `dashboard.component.html`**

```html
<div class="dashboard">
  <div class="date-nav">
    <button mat-icon-button (click)="navigateDay(-1)"><mat-icon>chevron_left</mat-icon></button>
    <span>{{ currentDate() === today ? "Aujourd'hui" : currentDate() }}</span>
    <button mat-icon-button (click)="navigateDay(1)" [disabled]="currentDate() === today">
      <mat-icon>chevron_right</mat-icon>
    </button>
  </div>

  <ng-container *ngIf="summary() as s">
    <!-- Calories ring -->
    <app-calories-ring [consumed]="s.totals.calories" [goal]="s.goals.calories" />

    <!-- Macros -->
    <div class="macros">
      <app-macro-bar label="Protéines" [consumed]="s.totals.proteins" [goal]="s.goals.proteins" />
      <app-macro-bar label="Glucides" [consumed]="s.totals.carbs" [goal]="s.goals.carbs" />
      <app-macro-bar label="Lipides" [consumed]="s.totals.fat" [goal]="s.goals.fat" />
      <app-macro-bar label="Fibres" [consumed]="s.totals.fiber" [goal]="s.goals.fiber" />
    </div>

    <!-- By meal type -->
    <div class="meal-types">
      <app-meal-type-card
        *ngFor="let type of ['BREAKFAST','LUNCH','DINNER','SNACK']"
        [mealType]="mealTypeLabels[type]"
        [totals]="s.byMealType[type]"
      />
    </div>

    <!-- Activities -->
    <div class="activities" *ngIf="s.activities.length">
      <h3>Activités <span>({{ totalBurned(s.activities) }} kcal brûlées)</span></h3>
      <mat-list>
        <mat-list-item *ngFor="let a of s.activities">
          {{ a.name }} — {{ a.caloriesBurned }} kcal
        </mat-list-item>
      </mat-list>
    </div>

    <!-- Quick add button -->
    <button mat-fab extended color="primary" class="fab-add" (click)="addMeal()">
      <mat-icon>add</mat-icon> Ajouter un repas
    </button>
  </ng-container>
</div>
```

Add `navigateDay(offset: number)` method:
```typescript
navigateDay(offset: number) {
  const d = new Date(this.currentDate());
  d.setDate(d.getDate() + offset);
  const newDate = d.toISOString().split('T')[0];
  this.router.navigate([], { queryParams: { date: newDate } });
}

totalBurned(activities: any[]) {
  return activities.reduce((sum, a) => sum + a.caloriesBurned, 0);
}
```

- [ ] **Step 6: Commit**

```bash
git add . && git commit -m "feat: add dashboard with calories ring, macro bars, meal type cards"
```

---

### Task 25: Journal (calendar)

**Files:**
- Create: `mfp-frontend/src/app/features/journal/journal.component.ts`

- [ ] **Step 1: Create `journal.component.ts`**

Use Angular Material's `MatDatepickerModule` (inline calendar) to display and navigate dates.

```typescript
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [MatDatepickerModule, MatNativeDateModule, MatCardModule],
  template: `
    <h1>Journal</h1>
    <mat-card>
      <mat-calendar [maxDate]="today" (selectedChange)="onDateSelected($event)" />
    </mat-card>
  `,
})
export class JournalComponent {
  private router = inject(Router);
  today = new Date();

  onDateSelected(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    this.router.navigate(['/'], { queryParams: { date: dateStr } });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add . && git commit -m "feat: add journal calendar page"
```

---

### Task 26: Navigation shell + PWA manifest

**Files:**
- Modify: `mfp-frontend/src/app/app.component.ts`
- Modify: `mfp-frontend/src/manifest.webmanifest`

- [ ] **Step 1: Update `app.component.ts`** with `MatToolbarModule` + custom bottom nav (`<nav>` with `mat-button` anchors — Angular Material has no `MatBottomNavBar`, use plain nav with fixed positioning)

Bottom navigation tabs: Dashboard · Journal · Aliments · Recettes · Objectifs

```typescript
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, CommonModule, RouterLink, RouterLinkActive],
  template: `
    <mat-toolbar color="primary">
      <span>MFP</span>
    </mat-toolbar>

    <main class="content">
      <router-outlet />
    </main>

    <nav class="bottom-nav">
      <a mat-button routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
        <mat-icon>home</mat-icon><span>Journal</span>
      </a>
      <a mat-button routerLink="/journal" routerLinkActive="active">
        <mat-icon>calendar_month</mat-icon><span>Calendrier</span>
      </a>
      <a mat-button routerLink="/aliments" routerLinkActive="active">
        <mat-icon>restaurant</mat-icon><span>Aliments</span>
      </a>
      <a mat-button routerLink="/recettes" routerLinkActive="active">
        <mat-icon>menu_book</mat-icon><span>Recettes</span>
      </a>
      <a mat-button routerLink="/objectifs" routerLinkActive="active">
        <mat-icon>flag</mat-icon><span>Objectifs</span>
      </a>
    </nav>
  `,
  styles: [`
    .content { padding-bottom: 64px; }
    .bottom-nav { position: fixed; bottom: 0; width: 100%; display: flex; justify-content: space-around; background: white; border-top: 1px solid #e0e0e0; }
    .bottom-nav a { flex-direction: column; align-items: center; min-width: 0; flex: 1; }
    .bottom-nav .active { color: #3f51b5; }
  `],
})
export class AppComponent {}
```

- [ ] **Step 2: Update `manifest.webmanifest`**

```json
{
  "name": "MFP — Tracker alimentaire",
  "short_name": "MFP",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3f51b5",
  "icons": [
    { "src": "assets/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "assets/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 3: Commit**

```bash
git add . && git commit -m "feat: add app shell with bottom navigation + PWA manifest"
```

---

## Chunk 10: Deployment

### Task 27: Deploy backend to Railway

- [ ] **Step 1: Build backend**

```bash
cd mfp-backend && npm run build
# Verify dist/ is generated
```

- [ ] **Step 2: Create Railway project**

1. Go to [railway.app](https://railway.app), create new project
2. Add a **PostgreSQL** service — Railway injects `DATABASE_URL` automatically
3. Add a **Node.js** service linked to `mfp-backend/` directory
4. Set env vars: `NODE_ENV=production`, `FRONTEND_URL=https://your-vercel-url.vercel.app` (update after Task 28)
5. Deploy — `migrationsRun: true` in TypeORM config will run migrations automatically on startup

- [ ] **Step 3: Verify migrations ran**

In Railway's PostgreSQL console:
```sql
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- Expected: foods, recipes, recipe_items, meals, meal_items, activities, goals
```

- [ ] **Step 4: Seed Goal defaults**

```sql
INSERT INTO goals (singleton, calories, proteins, carbs, fat, fiber, sugars, saturated_fat, salt)
VALUES (true, 2000, 150, 250, 65, 25, 50, 20, 6)
ON CONFLICT (singleton) DO NOTHING;
-- Expected: INSERT 0 1
SELECT * FROM goals;
-- Expected: one row with default values
```

- [ ] **Step 5: Verify backend is live**

```bash
curl https://your-railway-url.railway.app/goals
# Expected: { calories: 2000, proteins: 150, ... }
```

---

### Task 28: Deploy frontend to Vercel

- [ ] **Step 1: Update `environment.prod.ts`** — replace `your-railway-backend-url` with the actual Railway URL from Task 27.

- [ ] **Step 2: Create `mfp-frontend/vercel.json`** for Angular SPA routing

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 3: Build frontend locally to verify no errors**

```bash
cd mfp-frontend && npm run build -- --configuration production
# Expected: build completes with no errors, dist/ generated
```

- [ ] **Step 4: Deploy to Vercel**

```bash
npx vercel --prod
# Prompts:
#   Root directory: mfp-frontend
#   Build command: npm run build -- --configuration production
#   Output directory: dist/mfp-frontend/browser
```

- [ ] **Step 5: Update Railway `FRONTEND_URL`**

In Railway environment variables, set `FRONTEND_URL` to the Vercel URL from Step 4 (e.g. `https://mfp.vercel.app`). Trigger a Railway redeploy so CORS is updated.

- [ ] **Step 6: Verify PWA**

1. Open Vercel URL in Chrome on smartphone
2. Tap "Add to Home Screen" → install
3. Open the installed app → test barcode scan on a product

- [ ] **Step 7: Final commit**

```bash
git add . && git commit -m "chore: add vercel.json SPA rewrite + finalize deployment config"
```

---

## Summary

| Chunk | What it builds |
|-------|---------------|
| 1 | NestJS + Angular scaffolds, TypeORM config |
| 2 | All TypeORM entities + DB migration |
| 3 | Foods module (CRUD + OFF barcode lookup) |
| 4 | Recipes module (nutritional calc) + Meals module (XOR validation) |
| 5 | Activities, Goals, Summary modules |
| 6 | Angular core (models, services, routing, interceptor) |
| 7 | Foods feature (list, create, edit, barcode scan) |
| 8 | Recipes + Meals features (with food picker dialog) |
| 9 | Activities, Goals, Dashboard, Journal, app shell |
| 10 | Railway + Vercel deployment |
