import { Food } from './food.model';
export interface RecipeItem { id: string; food: Food; quantityG: number; }
export interface Recipe { id: string; name: string; totalWeightG: number; items: RecipeItem[]; }
