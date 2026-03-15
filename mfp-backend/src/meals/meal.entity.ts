import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany,
} from 'typeorm';
import { MealItem } from './meal-item.entity';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';

@Entity('meals')
export class Meal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', name: 'meal_type' })
  mealType: MealType;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => MealItem, (item) => item.meal, {
    cascade: true,
    eager: true,
  })
  items: MealItem[];
}
