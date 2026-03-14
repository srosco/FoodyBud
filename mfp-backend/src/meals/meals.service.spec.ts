import { MealsService } from './meals.service';
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
