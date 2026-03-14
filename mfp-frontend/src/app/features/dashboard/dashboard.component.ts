import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { SummaryService } from '../../core/services/summary.service';
import { Summary } from '../../core/models/summary.model';
import { MealType } from '../../core/models/meal.model';
import { CaloriesRingComponent } from './components/calories-ring/calories-ring.component';
import { MacroBarComponent } from './components/macro-bar/macro-bar.component';
import { MealTypeCardComponent } from './components/meal-type-card/meal-type-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatListModule, CaloriesRingComponent, MacroBarComponent, MealTypeCardComponent],
  templateUrl: './dashboard.component.html',
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
    const date = new Date(y, m - 1, d + offset); // local time, no UTC issue
    const newDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    this.router.navigate([], { queryParams: { date: newDate } });
  }

  totalBurned(activities: any[]) {
    return activities.reduce((sum, a) => sum + a.caloriesBurned, 0);
  }
}
