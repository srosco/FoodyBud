import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface OFFResult {
  name: string;
  barcode: string;
  calories: number;
  proteins: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugars: number;
  saturatedFat: number;
  salt: number;
  vitamins: Record<string, number> | null;
  minerals: Record<string, number> | null;
}

@Injectable()
export class OffService {
  private readonly BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';
  private readonly logger = new Logger(OffService.name);

  private readonly MICRO_VITAMIN_KEYS = ['vitamin-a', 'vitamin-c', 'vitamin-d', 'vitamin-b12', 'vitamin-e'];
  private readonly MICRO_MINERAL_KEYS = ['iron', 'calcium', 'magnesium', 'zinc', 'potassium'];

  constructor(private readonly http: HttpService) {}

  async lookup(barcode: string): Promise<OFFResult | null> {
    let data: Record<string, unknown>;
    try {
      const response = await firstValueFrom(
        this.http.get(`${this.BASE_URL}/${barcode}.json`),
      );
      data = response.data;
    } catch (err) {
      this.logger.warn(`OFF API error for barcode ${barcode}: ${(err as Error).message}`);
      return null;
    }

    if (data['status'] !== 1 || !data['product']) return null;

    const p = data['product'] as Record<string, unknown>;
    const n = (p['nutriments'] ?? {}) as Record<string, number>;

    // Prefer energy-kcal_100g (kcal); fall back to energy_100g (kJ) / 4.184
    const calories = n['energy-kcal_100g'] ?? (n['energy_100g'] ?? 0) / 4.184;

    const vitamins = this.extractMicros(n, this.MICRO_VITAMIN_KEYS);
    const minerals = this.extractMicros(n, this.MICRO_MINERAL_KEYS);

    return {
      name: (p['product_name'] as string) ?? 'Produit inconnu',
      barcode,
      calories: Math.round(calories * 10) / 10,
      proteins: n['proteins_100g'] ?? 0,
      carbs: n['carbohydrates_100g'] ?? 0,
      fat: n['fat_100g'] ?? 0,
      fiber: n['fiber_100g'] ?? 0,
      sugars: n['sugars_100g'] ?? 0,
      saturatedFat: n['saturated-fat_100g'] ?? 0,
      salt: n['salt_100g'] ?? 0,
      vitamins: Object.keys(vitamins).length ? vitamins : null,
      minerals: Object.keys(minerals).length ? minerals : null,
    };
  }

  private extractMicros(nutriments: Record<string, number>, keys: string[]): Record<string, number> {
    const result: Record<string, number> = {};
    for (const key of keys) {
      const val = nutriments[`${key}_100g`];
      if (val != null) result[key] = val;
    }
    return result;
  }
}
