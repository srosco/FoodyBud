export interface Food {
  id: string;
  name: string;
  barcode?: string;
  source: 'OFF' | 'CUSTOM';
  calories: number;
  proteins: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugars: number;
  saturatedFat: number;
  salt: number;
  vitamins?: Record<string, number>;
  minerals?: Record<string, number>;
  deletedAt?: string;
}
