import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { NutriMap } from '../../../../core/models/meal.model';

@Component({
  selector: 'app-meal-type-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="meal-card">
      <div class="meal-icon" [style.background]="iconBg">
        <mat-icon [style.color]="iconColor">{{ icon }}</mat-icon>
      </div>
      <div class="meal-info">
        <span class="meal-name">{{ mealType }}</span>
        <div class="meal-macros">
          <span class="macro-pill p">P&nbsp;{{ totals.proteins | number:'1.0-0' }}g</span>
          <span class="macro-pill c">G&nbsp;{{ totals.carbs | number:'1.0-0' }}g</span>
          <span class="macro-pill f">L&nbsp;{{ totals.fat | number:'1.0-0' }}g</span>
        </div>
      </div>
      <div class="meal-kcal">
        <span class="kcal-value">{{ totals.calories | number:'1.0-0' }}</span>
        <span class="kcal-unit">kcal</span>
      </div>
    </div>
  `,
  styles: [`
    .meal-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #FFFFFF;
      border: 1px solid #E2E8E0;
      border-radius: 14px;
      padding: 12px 14px;
      margin-bottom: 8px;
    }

    .meal-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .meal-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    .meal-info {
      flex: 1;
      min-width: 0;
    }

    .meal-name {
      display: block;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #1A2820;
      line-height: 1;
      margin-bottom: 5px;
    }

    .meal-macros {
      display: flex;
      gap: 4px;
      flex-wrap: wrap;
    }

    .macro-pill {
      font-family: 'DM Sans', sans-serif;
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 99px;
    }
    .macro-pill.p { background: #EBF4FC; color: #4A8FD4; }
    .macro-pill.c { background: #FFF8E6; color: #CC8800; }
    .macro-pill.f { background: #FFF0E6; color: #E8702A; }

    .meal-kcal {
      text-align: right;
      flex-shrink: 0;
    }
    .kcal-value {
      display: block;
      font-family: 'DM Sans', sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: #1A2820;
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }
    .kcal-unit {
      font-family: 'DM Sans', sans-serif;
      font-size: 10px;
      color: #9AADA5;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
  `],
})
export class MealTypeCardComponent {
  @Input() mealType = '';
  @Input() mealTypeKey = '';
  @Input() totals!: NutriMap;

  get icon(): string {
    const icons: Record<string, string> = {
      BREAKFAST: 'wb_sunny',
      LUNCH:     'lunch_dining',
      DINNER:    'dinner_dining',
      SNACK:     'cookie',
    };
    return icons[this.mealTypeKey] ?? 'restaurant';
  }

  get iconBg(): string {
    const bgs: Record<string, string> = {
      BREAKFAST: '#FFF8E6',
      LUNCH:     '#DFF0E7',
      DINNER:    '#EBF4FC',
      SNACK:     '#FFF0E6',
    };
    return bgs[this.mealTypeKey] ?? '#EFF2EC';
  }

  get iconColor(): string {
    const colors: Record<string, string> = {
      BREAKFAST: '#F0A500',
      LUNCH:     '#157444',
      DINNER:    '#4A8FD4',
      SNACK:     '#E8702A',
    };
    return colors[this.mealTypeKey] ?? '#5A6E65';
  }
}
