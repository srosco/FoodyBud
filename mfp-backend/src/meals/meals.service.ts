import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Meal } from './meal.entity';
import { MealItem } from './meal-item.entity';
import { Food } from '../foods/food.entity';
import { Recipe } from '../recipes/recipe.entity';
import { CreateMealDto, MealItemDto } from './dto/create-meal.dto';

@Injectable()
export class MealsService {
  constructor(
    @InjectRepository(Meal) private readonly mealRepo: Repository<Meal>,
    @InjectRepository(Food) private readonly foodRepo: Repository<Food>,
    @InjectRepository(Recipe) private readonly recipeRepo: Repository<Recipe>,
  ) {}

  findByDate(date: string): Promise<Meal[]> {
    return this.mealRepo.find({ where: { date } });
  }

  findOne(id: string): Promise<Meal | null> {
    return this.mealRepo.findOne({ where: { id } });
  }

  async create(dto: CreateMealDto): Promise<Meal> {
    dto.items.forEach((item) => this.validateXor(item));
    const items = await this.resolveItems(dto.items);
    const meal = this.mealRepo.create({
      name: dto.name,
      date: dto.date,
      mealType: dto.mealType as any,
      items,
    });
    return this.mealRepo.save(meal);
  }

  async update(id: string, dto: Partial<CreateMealDto>): Promise<Meal> {
    const meal = await this.findOne(id);
    if (!meal) throw new NotFoundException(`Meal ${id} not found`);
    if (dto.items) {
      dto.items.forEach((item) => this.validateXor(item));
      meal.items = await this.resolveItems(dto.items);
    }
    if (dto.name !== undefined) meal.name = dto.name ?? null;
    if (dto.date !== undefined) meal.date = dto.date;
    if (dto.mealType !== undefined) meal.mealType = dto.mealType as any;
    return this.mealRepo.save(meal);
  }

  async remove(id: string): Promise<void> {
    const meal = await this.findOne(id);
    if (!meal) throw new NotFoundException(`Meal ${id} not found`);
    await this.mealRepo.remove(meal);
  }

  validateXor(item: Partial<MealItemDto>): void {
    const hasFood = !!item.foodId;
    const hasRecipe = !!item.recipeId;
    if (hasFood === hasRecipe) {
      throw new BadRequestException('Each meal item must have exactly one of foodId or recipeId');
    }
  }

  private async resolveItems(dtoItems: MealItemDto[]): Promise<MealItem[]> {
    return Promise.all(
      dtoItems.map(async (dto) => {
        const item = new MealItem();
        item.quantityG = dto.quantityG;
        item.food = null;
        item.recipe = null;
        if (dto.foodId) {
          const food = await this.foodRepo.findOne({ where: { id: dto.foodId } });
          if (!food) throw new BadRequestException(`Food ${dto.foodId} not found`);
          item.food = food;
        } else {
          const recipe = await this.recipeRepo.findOne({ where: { id: dto.recipeId } });
          if (!recipe) throw new BadRequestException(`Recipe ${dto.recipeId} not found`);
          item.recipe = recipe;
        }
        return item;
      }),
    );
  }
}
