import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('goals')
@Unique(['userId'])   // one goal per user
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'float', default: 2000 })
  calories: number;

  @Column({ type: 'float', default: 150 })
  proteins: number;

  @Column({ type: 'float', default: 250 })
  carbs: number;

  @Column({ type: 'float', default: 65 })
  fat: number;

  @Column({ type: 'float', default: 25 })
  fiber: number;

  @Column({ type: 'float', default: 50 })
  sugars: number;

  @Column({ type: 'float', name: 'saturated_fat', default: 20 })
  saturatedFat: number;

  @Column({ type: 'float', default: 6 })
  salt: number;
}
