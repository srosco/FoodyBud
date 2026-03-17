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

  async getSummary(userId: string, date: string) {
    const meals = await this.mealRepo.find({ where: { date, userId } });
    const activities = await this.activityRepo.find({ where: { date, userId } });
    const goal = await this.goalRepo.findOne({ where: { userId } });

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
      ? (item.food as unknown as NutriTotals)
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
