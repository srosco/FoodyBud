import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany,
  ManyToOne, JoinColumn,
} from 'typeorm';
import { RecipeItem } from './recipe-item.entity';
import { User } from '../users/user.entity';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'float', name: 'total_weight_g' })
  totalWeightG: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt: Date | null;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => RecipeItem, (item) => item.recipe, {
    cascade: true,
    eager: true,
  })
  items: RecipeItem[];
}
