import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn,
} from 'typeorm';

@Entity('foods')
export class Food {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  barcode: string | null;

  @Column({ type: 'varchar', default: 'CUSTOM' })
  source: 'OFF' | 'CUSTOM';

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'float' })
  calories: number;

  @Column({ type: 'float' })
  proteins: number;

  @Column({ type: 'float' })
  carbs: number;

  @Column({ type: 'float' })
  fat: number;

  @Column({ type: 'float' })
  fiber: number;

  @Column({ type: 'float' })
  sugars: number;

  @Column({ type: 'float', name: 'saturated_fat' })
  saturatedFat: number;

  @Column({ type: 'float' })
  salt: number;

  @Column({ type: 'jsonb', nullable: true })
  vitamins: Record<string, number> | null;

  @Column({ type: 'jsonb', nullable: true })
  minerals: Record<string, number> | null;

  @Column({ type: 'timestamp', nullable: true, name: 'deleted_at' })
  deletedAt: Date | null;
}
