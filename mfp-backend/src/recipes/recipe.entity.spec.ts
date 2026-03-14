import { Recipe } from './recipe.entity';
import { RecipeItem } from './recipe-item.entity';

describe('Recipe entity', () => {
  it('should have name, totalWeightG, and items', () => {
    const recipe = new Recipe();
    recipe.name = 'Test Recipe';
    recipe.totalWeightG = 300;
    recipe.items = [];
    expect(recipe.name).toBe('Test Recipe');
    expect(recipe.totalWeightG).toBe(300);
    expect(recipe.items).toHaveLength(0);
  });

  it('RecipeItem should have quantityG and food reference', () => {
    const item = new RecipeItem();
    item.quantityG = 100;
    expect(item.quantityG).toBe(100);
  });
});
