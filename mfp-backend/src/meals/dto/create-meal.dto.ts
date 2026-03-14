import { IsString, IsDateString, IsIn, IsOptional, IsArray, ValidateNested, IsUUID, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class MealItemDto {
  @IsOptional() @IsUUID()
  foodId?: string;

  @IsOptional() @IsUUID()
  recipeId?: string;

  @IsNumber()
  quantityG: number;
}

export class CreateMealDto {
  @IsOptional() @IsString()
  name?: string;

  @IsDateString()
  date: string;

  @IsIn(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'])
  mealType: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealItemDto)
  items: MealItemDto[];
}
