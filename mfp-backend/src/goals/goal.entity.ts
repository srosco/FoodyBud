import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Singleton enforcement: only one row allowed
  @Column({ type: 'boolean', default: true, unique: true })
  singleton: boolean;

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
