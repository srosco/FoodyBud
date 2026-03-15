import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { SummaryService } from '../../core/services/summary.service';
import { MealType, Meal } from '../../core/models/meal.model';
import { CaloriesRingComponent } from './components/calories-ring/calories-ring.component';
import { MacroBarComponent } from './components/macro-bar/macro-bar.component';
import { MealTypeCardComponent } from './components/meal-type-card/meal-type-card.component';
import type { Summary } from '../../core/models/summary.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, CaloriesRingComponent, MacroBarComponent, MealTypeCardComponent],
  templateUrl: './dashboard.component.html',
  styles: [`
    .dashboard { background: var(--bg); min-height: 100%; }

    .date-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      margin-bottom: 20px;
    }
    .date-label {
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 700;
      color: var(--text);
      min-width: 120px;
      text-align: center;
    }

    .ring-section {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
      background: var(--surface);
      border-radius: var(--r);
      border: 1px solid var(--border);
      padding: 24px 16px 20px;
    }

    .macros-card {
      margin-bottom: 0;
    }
    .macros-card app-macro-bar:last-child ::ng-deep .macro-row {
      margin-bottom: 0;
    }

    .activity-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 6px 0;
    }
    .activity-row + .activity-row {
      border-top: 1px solid var(--border);
    }
    .activity-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: var(--primary-light);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .activity-icon mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--primary);
    }
    .activity-name {
      flex: 1;
      font-family: var(--font);
      font-size: 14px;
      font-weight: 500;
      color: var(--text);
    }
    .activity-kcal {
      font-family: var(--font);
      font-size: 13px;
      font-weight: 600;
      color: var(--primary);
    }

    .fab-wrap {
      display: flex;
      justify-content: center;
      margin-top: 28px;
      padding-bottom: 8px;
    }
  `],
})
export class DashboardComponent implements OnInit {
  private summaryService = inject(SummaryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  summary = signal<Summary | null>(null);
  today = new Date().toISOString().split('T')[0];
  currentDate = signal<string>(this.today);

  mealTypes: MealType[] = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

  emptyNutriMap = { calories: 0, proteins: 0, carbs: 0, fat: 0, fiber: 0, sugars: 0, saturatedFat: 0, salt: 0 };

  mealTypeLabels: Record<MealType, string> = {
    BREAKFAST: 'Petit-déjeuner',
    LUNCH: 'Déjeuner',
    DINNER: 'Dîner',
    SNACK: 'Snacks',
  };

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const date = params.get('date') ?? this.today;
      this.currentDate.set(date);
      this.load(date);
    });
  }

  load(date: string) {
    this.summaryService.get(date).subscribe((s) => this.summary.set(s));
  }

  addMeal() {
    this.router.navigate(['/repas/nouveau'], { queryParams: { date: this.currentDate() } });
  }

  navigateDay(offset: number) {
    const [y, m, d] = this.currentDate().split('-').map(Number);
    const date = new Date(y, m - 1, d + offset);
    const newDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    this.router.navigate([], { queryParams: { date: newDate } });
  }

  getMealsByType(meals: Meal[], type: MealType): Meal[] {
    return (meals ?? []).filter((m) => m.mealType === type);
  }

  totalBurned(activities: any[]) {
    return activities.reduce((sum, a) => sum + a.caloriesBurned, 0);
  }
}
