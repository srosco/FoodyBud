import { RecipesService } from './recipes.service';

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
