import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meal } from '../meals/meal.entity';
import { MealItem } from '../meals/meal-item.entity';
import { Activity } from '../activities/activity.entity';
import { Goal } from '../goals/goal.entity';
import { RecipesModule } from '../recipes/recipes.module';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';

@Module({
  imports: [TypeOrmModule.forFeature([Meal, MealItem, Activity, Goal]), RecipesModule],
  controllers: [SummaryController],
  providers: [SummaryService],
})
export class SummaryModule {}
