import { IsNumber, IsOptional } from 'class-validator';
export class UpdateGoalsDto {
  @IsOptional() @IsNumber() calories?: number;
  @IsOptional() @IsNumber() proteins?: number;
  @IsOptional() @IsNumber() carbs?: number;
  @IsOptional() @IsNumber() fat?: number;
  @IsOptional() @IsNumber() fiber?: number;
  @IsOptional() @IsNumber() sugars?: number;
  @IsOptional() @IsNumber() saturatedFat?: number;
  @IsOptional() @IsNumber() salt?: number;
}
