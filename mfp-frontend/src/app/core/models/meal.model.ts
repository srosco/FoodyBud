import { Food } from './food.model';
import { Recipe } from './recipe.model';
export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
export interface MealItem { id: string; food: Food | null; recipe: Recipe | null; quantityG: number; computed?: NutriMap; }
export interface Meal { id: string; name?: string; date: string; mealType: MealType; items: MealItem[]; }
export interface NutriMap { calories: number; proteins: number; carbs: number; fat: number; fiber: number; sugars: number; saturatedFat: number; salt: number; }
