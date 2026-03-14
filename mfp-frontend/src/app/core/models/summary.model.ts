import { NutriMap, Meal, MealType } from './meal.model';
import { Activity } from './activity.model';
import { Goal } from './goal.model';
export interface Summary { date: string; totals: NutriMap; byMealType: Partial<Record<MealType, NutriMap>>; meals: Meal[]; activities: Activity[]; goals: Goal; }
