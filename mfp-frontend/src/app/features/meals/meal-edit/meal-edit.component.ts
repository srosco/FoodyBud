import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, NgIf } from '@angular/common';
import { MealsService } from '../../../core/services/meals.service';
import { MealFormComponent } from '../meal-form/meal-form.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-meal-edit',
  standalone: true,
  imports: [NgIf, MealFormComponent, MatIconModule],
  template: `
    <div class="page">
      <div class="page-header">
        <button class="back-btn" (click)="location.back()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="page-title">Modifier le repas</span>
        <button class="delete-btn" [disabled]="!meal()" (click)="onDelete()" title="Supprimer">
          <mat-icon>delete_outline</mat-icon>
        </button>
      </div>
      <app-meal-form *ngIf="meal()" [initialData]="meal()!" submitLabel="Enregistrer" (submitted)="onUpdate($event)" />
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
      flex: 1;
    }

    .delete-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: none;
      background: #FFF0EE;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #E84040;
      flex-shrink: 0;
    }
    .delete-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .delete-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }
  `],
})
export class MealEditComponent implements OnInit {
  location = inject(Location);
  private mealsService = inject(MealsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  meal = signal<any>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.mealsService.getById(id).subscribe((m) => this.meal.set(m));
  }

  onUpdate(data: any) {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.mealsService.update(id, data).subscribe(() => this.router.navigate(['/']));
  }

  onDelete() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.mealsService.delete(id).subscribe(() => this.router.navigate(['/']));
  }
}
