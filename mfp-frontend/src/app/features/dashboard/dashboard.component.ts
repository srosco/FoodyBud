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

    /* ── Skeleton shapes ── */
    .sk-ring-section { display: flex; align-items: center; justify-content: center; gap: 28px; }
    .sk-circle { width: 140px; height: 140px; border-radius: 50%; flex-shrink: 0; }
    .sk-ring-aside { display: flex; flex-direction: column; gap: 10px; }
    .sk-ring-val { width: 72px; height: 28px; border-radius: 6px; }
    .sk-ring-lbl { width: 52px; height: 12px; border-radius: 4px; }

    .sk-macros-card { display: flex; flex-direction: column; gap: 0; }
    .sk-macro-row { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--border); }
    .sk-macro-row:last-child { border-bottom: none; }
    .sk-mac-label { width: 68px; height: 11px; border-radius: 4px; flex-shrink: 0; }
    .sk-mac-bar { flex: 1; height: 8px; border-radius: 4px; }
    .sk-mac-val { width: 32px; height: 11px; border-radius: 4px; flex-shrink: 0; }

    .sk-section-lbl { width: 44px; height: 13px; border-radius: 4px; margin: 14px 0 8px; }

    .sk-meal-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; margin-bottom: 8px; }
    .sk-meal-hd { display: flex; align-items: center; gap: 12px; padding: 12px 14px; }
    .sk-meal-icon { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; }
    .sk-meal-body { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .sk-meal-name { width: 80px; height: 12px; border-radius: 4px; }
    .sk-pills-row { display: flex; gap: 4px; }
    .sk-pill { width: 32px; height: 16px; border-radius: 99px; }
    .sk-meal-kcal-col { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex-shrink: 0; }
    .sk-kcal-val { width: 28px; height: 18px; border-radius: 4px; }
    .sk-kcal-lbl { width: 22px; height: 9px; border-radius: 3px; }
    .sk-divider { height: 1px; background: var(--border); margin: 0 14px; }
    .sk-add-btn { width: 80px; height: 13px; border-radius: 4px; margin: 12px 14px; }

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

    /* Speed-dial FAB */
    .fab-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      z-index: 48;
    }
    .fab-backdrop.open { display: block; }

    .fab-container {
      position: fixed;
      bottom: calc(var(--nav-h, 64px) + 16px);
      left: 20px;
      z-index: 49;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }

    .fab-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      pointer-events: none;
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.18s, transform 0.18s;
    }
    .fab-container.open .fab-actions {
      pointer-events: auto;
      opacity: 1;
      transform: translateY(0);
    }

    .fab-action {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 18px 10px 14px;
      border: none;
      border-radius: 50px;
      background: var(--surface);
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
      font-family: var(--font);
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      cursor: pointer;
      white-space: nowrap;
    }
    .fab-action mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--primary);
    }

    .fab-main {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: none;
      background: var(--primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(21,116,68,0.4);
      transition: transform 0.2s;
      flex-shrink: 0;
    }
    .fab-main mat-icon { font-size: 26px; width: 26px; height: 26px; }
    .fab-container.open .fab-main { transform: rotate(45deg); }
  `],
})
export class DashboardComponent implements OnInit {
  private summaryService = inject(SummaryService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  summary = signal<Summary | null>(null);
  loading = signal(true);
  today = new Date().toISOString().split('T')[0];
  currentDate = signal<string>(this.today);
  fabOpen = signal(false);

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
    this.loading.set(true);
    this.summaryService.get(date).subscribe((s) => {
      this.summary.set(s);
      this.loading.set(false);
    });
  }

  addMeal() {
    this.fabOpen.set(false);
    this.router.navigate(['/repas/nouveau'], { queryParams: { date: this.currentDate() } });
  }

  goToScan() {
    this.fabOpen.set(false);
    this.router.navigate(['/aliments/scan']);
  }

  navigateDay(offset: number) {
    const [y, m, d] = this.currentDate().split('-').map(Number);
    const date = new Date(y, m - 1, d + offset);
    const newDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    this.router.navigate([], { queryParams: { date: newDate } });
  }

  getMealsByType(meals: Meal[], type: MealType): Meal[] {
    return (meals ?? []).filter((m) => ((m as any).meal_type ?? m.mealType) === type);
  }

  formatDate(iso: string): string {
    const [y, m, d] = iso.split('-');
    const date = new Date(+y, +m - 1, +d);
    const day = date.toLocaleDateString('fr-FR', { weekday: 'long' });
    return `${day.charAt(0).toUpperCase() + day.slice(1)} ${d}-${m}-${y}`;
  }

  totalBurned(activities: any[]) {
    return activities.reduce((sum, a) => sum + a.caloriesBurned, 0);
  }
}
