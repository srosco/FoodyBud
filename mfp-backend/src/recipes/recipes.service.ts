import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Recipe } from './recipe.entity';
import { RecipeItem } from './recipe-item.entity';
import { Food } from '../foods/food.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';

type NutrientKeys = 'calories' | 'proteins' | 'carbs' | 'fat' | 'fiber' | 'sugars' | 'saturatedFat' | 'salt';
type NutriMap = Record<NutrientKeys, number>;

@Injectable()
export class RecipesService {
  constructor(
    @InjectRepository(Recipe) private readonly recipeRepo: Repository<Recipe>,
    @InjectRepository(Food) private readonly foodRepo: Repository<Food>,
  ) {}

  findAll(userId: string): Promise<Recipe[]> {
    return this.recipeRepo.find({ where: { deletedAt: IsNull(), userId } });
  }

  findOne(id: string, userId: string): Promise<Recipe | null> {
    return this.recipeRepo.findOne({ where: { id, userId, deletedAt: IsNull() } });
  }

  async create(dto: CreateRecipeDto, userId: string): Promise<Recipe> {
    const items = await this.resolveItems(dto.items);
    const recipe = this.recipeRepo.create({
      name: dto.name,
      totalWeightG: dto.totalWeightG,
      userId,
      items,
    });
    return this.recipeRepo.save(recipe);
  }

  async update(id: string, dto: UpdateRecipeDto, userId: string): Promise<Recipe> {
    const recipe = await this.findOne(id, userId);
    if (!recipe) throw new NotFoundException(`Recipe ${id} not found`);
    if (dto.name !== undefined) recipe.name = dto.name;
    if (dto.totalWeightG !== undefined) recipe.totalWeightG = dto.totalWeightG;
    if (dto.items) {
      recipe.items = await this.resolveItems(dto.items);
    }
    return this.recipeRepo.save(recipe);
  }

  async softDelete(id: string, userId: string): Promise<Recipe> {
    const recipe = await this.findOne(id, userId);
    if (!recipe) throw new NotFoundException(`Recipe ${id} not found`);
    recipe.deletedAt = new Date();
    return this.recipeRepo.save(recipe);
  }

  computePer100g(items: RecipeItem[], totalWeightG: number): NutriMap {
    if (totalWeightG <= 0) throw new BadRequestException('totalWeightG must be greater than 0');
    const keys: NutrientKeys[] = ['calories', 'proteins', 'carbs', 'fat', 'fiber', 'sugars', 'saturatedFat', 'salt'];
    const totals = keys.reduce((acc, k) => ({ ...acc, [k]: 0 }), {} as NutriMap);

    for (const item of items) {
      const factor = item.quantityG / 100;
      for (const k of keys) {
        totals[k] += ((item.food as unknown as Record<string, number>)[k] ?? 0) * factor;
      }
    }

    return keys.reduce(
      (acc, k) => ({ ...acc, [k]: Math.round((totals[k] / totalWeightG) * 100 * 100) / 100 }),
      {} as NutriMap,
    );
  }

  private async resolveItems(dtoItems: { foodId: string; quantityG: number }[]): Promise<RecipeItem[]> {
    return Promise.all(
      dtoItems.map(async ({ foodId, quantityG }) => {
        const food = await this.foodRepo.findOne({ where: { id: foodId } });
        if (!food) throw new BadRequestException(`Food ${foodId} not found`);
        const item = new RecipeItem();
        item.food = food;
        item.quantityG = quantityG;
        return item;
      }),
    );
  }
}
