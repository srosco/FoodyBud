import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'float', name: 'calories_burned' })
  caloriesBurned: number;

  @CreateDateColumn()
  createdAt: Date;
}
