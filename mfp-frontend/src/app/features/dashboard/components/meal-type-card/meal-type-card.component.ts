import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { NutriMap, Meal } from '../../../../core/models/meal.model';

@Component({
  selector: 'app-meal-type-card',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="meal-section">

      <!-- Summary header -->
      <div class="meal-header">
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

      <!-- Food items -->
      <ng-container *ngIf="allItems().length > 0">
        <div class="divider"></div>
        <div
          class="item-row"
          *ngFor="let item of allItems()"
          (click)="router.navigate(['/repas', item.mealId, 'edit'])"
        >
          <div class="item-dot" [style.background]="iconColor"></div>
          <span class="item-name">{{ item.food?.name ?? item.recipe?.name }}</span>
          <span class="item-qty">{{ item.quantityG }}g</span>
          <mat-icon class="item-edit-icon">edit</mat-icon>
        </div>
      </ng-container>

      <!-- Add row -->
      <div class="divider"></div>
      <button
        class="add-row"
        (click)="router.navigate(['/repas/nouveau'], { queryParams: { date: currentDate, mealType: mealTypeKey } })"
      >
        <mat-icon>add</mat-icon>
        <span>Ajouter</span>
      </button>

    </div>
  `,
  styles: [`
    .meal-section {
      background: #FFFFFF;
      border: 1px solid #E2E8E0;
      border-radius: 16px;
      margin-bottom: 8px;
      overflow: hidden;
    }

    .meal-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 14px;
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
    .meal-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }

    .meal-info { flex: 1; min-width: 0; }

    .meal-name {
      display: block;
      font-family: 'DM Sans', sans-serif;
      font-size: 14px;
      font-weight: 600;
      color: #1A2820;
      line-height: 1;
      margin-bottom: 5px;
    }

    .meal-macros { display: flex; gap: 4px; flex-wrap: wrap; }

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

    .meal-kcal { text-align: right; flex-shrink: 0; }
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

    .divider { height: 1px; background: #E2E8E0; margin: 0 14px; }

    .item-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 14px;
      cursor: pointer;
      transition: background 0.1s;
    }
    .item-row:active { background: #f5f8f6; }
    .item-row + .item-row { border-top: 1px solid #F0F4F1; }

    .item-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      flex-shrink: 0;
      opacity: 0.5;
    }

    .item-name {
      flex: 1;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 500;
      color: #1A2820;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-qty {
      font-family: 'DM Sans', sans-serif;
      font-size: 12px;
      font-weight: 600;
      color: #9AADA5;
      flex-shrink: 0;
      font-variant-numeric: tabular-nums;
    }

    .item-edit-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #C8D4CC;
      flex-shrink: 0;
    }

    .add-row {
      display: flex;
      align-items: center;
      gap: 6px;
      width: 100%;
      padding: 10px 14px;
      border: none;
      background: transparent;
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: var(--primary, #157444);
      cursor: pointer;
    }
    .add-row mat-icon { font-size: 16px; width: 16px; height: 16px; }
  `],
})
export class MealTypeCardComponent {
  router = inject(Router);

  @Input() mealType = '';
  @Input() mealTypeKey = '';
  @Input() totals!: NutriMap;
  @Input() meals: Meal[] = [];
  @Input() currentDate = '';

  allItems() {
    return this.meals.flatMap((meal) =>
      meal.items.map((item) => ({ ...item, mealId: meal.id }))
    );
  }

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
