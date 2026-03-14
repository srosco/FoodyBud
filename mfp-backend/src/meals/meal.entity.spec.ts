import { Meal } from './meal.entity';
import { MealItem } from './meal-item.entity';

describe('Meal entity', () => {
  it('should have date, mealType, and items', () => {
    const meal = new Meal();
    meal.date = '2024-01-15';
    meal.mealType = 'BREAKFAST';
    meal.items = [];
    expect(meal.date).toBe('2024-01-15');
    expect(meal.mealType).toBe('BREAKFAST');
  });

  it('MealItem allows either food or recipe', () => {
    const item = new MealItem();
    item.quantityG = 150;
    item.food = null;
    item.recipe = null;
    expect(item.quantityG).toBe(150);
    expect(item.food).toBeNull();
    expect(item.recipe).toBeNull();
  });
});
