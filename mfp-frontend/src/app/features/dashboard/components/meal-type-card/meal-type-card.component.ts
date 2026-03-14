import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NutriMap } from '../../../../core/models/meal.model';

@Component({
  selector: 'app-meal-type-card',
  standalone: true,
  imports: [CommonModule, MatCardModule],
  template: `
    <mat-card class="meal-type-card">
      <mat-card-header>
        <mat-card-title>{{ mealType }}</mat-card-title>
        <mat-card-subtitle>{{ totals.calories | number:'1.0-0' }} kcal</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <span>P {{ totals.proteins | number:'1.0-1' }}g</span> ·
        <span>G {{ totals.carbs | number:'1.0-1' }}g</span> ·
        <span>L {{ totals.fat | number:'1.0-1' }}g</span>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`.meal-type-card { margin-bottom: 8px; }`],
})
export class MealTypeCardComponent {
  @Input() mealType = '';
  @Input() totals!: NutriMap;
}
