import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn,
} from 'typeorm';
import { MealItem } from './meal-item.entity';
import { User } from '../users/user.entity';

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

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => MealItem, (item) => item.meal, {
    cascade: true,
    eager: true,
  })
  items: MealItem[];
}
