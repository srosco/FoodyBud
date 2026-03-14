import { Food } from './food.entity';

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
