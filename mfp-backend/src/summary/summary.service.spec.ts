import { SummaryService } from './summary.service';
import { MealItem } from '../meals/meal-item.entity';
import { Food } from '../foods/food.entity';

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
