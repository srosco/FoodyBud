import { IsString, IsNumber, IsArray, ValidateNested, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class RecipeItemDto {
  @IsUUID()
  foodId: string;

  @IsNumber()
  quantityG: number;
}

export class CreateRecipeDto {
  @IsString()
  name: string;

  @IsNumber()
  totalWeightG: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecipeItemDto)
  items: RecipeItemDto[];
}
