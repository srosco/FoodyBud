import { IsString, IsNumber, IsOptional, IsIn } from 'class-validator';

export class CreateFoodDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsIn(['OFF', 'CUSTOM'])
  source: 'OFF' | 'CUSTOM';

  @IsNumber()
  calories: number;

  @IsNumber()
  proteins: number;

  @IsNumber()
  carbs: number;

  @IsNumber()
  fat: number;

  @IsNumber()
  fiber: number;

  @IsNumber()
  sugars: number;

  @IsNumber()
  saturatedFat: number;

  @IsNumber()
  salt: number;

  @IsOptional()
  vitamins?: Record<string, number>;

  @IsOptional()
  minerals?: Record<string, number>;
}
