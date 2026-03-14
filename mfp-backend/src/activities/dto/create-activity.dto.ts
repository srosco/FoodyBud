import { IsString, IsDateString, IsNumber } from 'class-validator';
export class CreateActivityDto {
  @IsString() name: string;
  @IsDateString() date: string;
  @IsNumber() caloriesBurned: number;
}
