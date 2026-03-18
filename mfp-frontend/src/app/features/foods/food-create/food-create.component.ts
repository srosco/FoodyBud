import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { FoodsService } from '../../../core/services/foods.service';
import { FoodFormComponent } from '../food-form/food-form.component';
import { Food } from '../../../core/models/food.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-food-create',
  standalone: true,
  imports: [FoodFormComponent, MatIconModule],
  template: `
    <div class="page">
      <div class="page-header">
        <button class="back-btn" (click)="location.back()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="page-title">Nouvel aliment</span>
      </div>
      <app-food-form submitLabel="Créer l'aliment" [loading]="loading()" (submitted)="onCreate($event)" />
    </div>
  `,
  styles: [`
    .page { min-height: 100%; background: var(--bg); }

    .page-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .back-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: none;
      background: #EDF2EE;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--primary);
      flex-shrink: 0;
    }
    .back-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }

    .page-title {
      font-family: var(--font);
      font-size: 17px;
      font-weight: 700;
      color: var(--text);
    }
  `],
})
export class FoodCreateComponent {
  location = inject(Location);
  private foodsService = inject(FoodsService);
  private router = inject(Router);

  loading = signal(false);

  onCreate(data: Partial<Food>) {
    this.loading.set(true);
    this.foodsService.create({ ...data, source: 'CUSTOM' }).subscribe({
      next: () => this.router.navigate(['/aliments']),
      error: () => this.loading.set(false),
    });
  }
}
