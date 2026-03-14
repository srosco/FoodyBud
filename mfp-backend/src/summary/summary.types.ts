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
