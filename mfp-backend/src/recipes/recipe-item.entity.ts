import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
} from 'typeorm';
import { Recipe } from './recipe.entity';
import { Food } from '../foods/food.entity';

@Entity('recipe_items')
export class RecipeItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Recipe, (recipe) => recipe.items, { onDelete: 'CASCADE' })
  recipe: Recipe;

  @ManyToOne(() => Food, { onDelete: 'RESTRICT', eager: true })
  @JoinColumn({ name: 'food_id' })
  food: Food;

  @Column({ type: 'float', name: 'quantity_g' })
  quantityG: number;
}
