import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { Meal } from './meal.entity';
import { Food } from '../foods/food.entity';
import { Recipe } from '../recipes/recipe.entity';

@Entity('meal_items')
export class MealItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Meal, (meal) => meal.items, { onDelete: 'CASCADE' })
  meal: Meal;

  @ManyToOne(() => Food, { nullable: true, onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'food_id' })
  food: Food | null;

  @ManyToOne(() => Recipe, { nullable: true, onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'recipe_id' })
  recipe: Recipe | null;

  @Column({ type: 'float', name: 'quantity_g' })
  quantityG: number;
}
