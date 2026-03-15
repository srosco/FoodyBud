import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, NgIf } from '@angular/common';
import { FoodsService } from '../../../core/services/foods.service';
import { FoodFormComponent } from '../food-form/food-form.component';
import { Food } from '../../../core/models/food.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-food-edit',
  standalone: true,
  imports: [NgIf, FoodFormComponent, MatIconModule],
  template: `
    <div class="page">
      <div class="page-header">
        <button class="back-btn" (click)="location.back()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="page-title">Modifier l'aliment</span>
        <button class="delete-btn" (click)="onDelete()" title="Supprimer">
          <mat-icon>delete_outline</mat-icon>
        </button>
      </div>
      <app-food-form *ngIf="food()" [initialData]="food()!" submitLabel="Enregistrer" (submitted)="onUpdate($event)" />
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
    .delete-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }
  `],
})
export class FoodEditComponent implements OnInit {
  location = inject(Location);
  private foodsService = inject(FoodsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  food = signal<Food | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.foodsService.getById(id).subscribe((f) => this.food.set(f));
  }

  onUpdate(data: Partial<Food>) {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.foodsService.update(id, data).subscribe(() => this.router.navigate(['/aliments']));
  }

  onDelete() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.foodsService.delete(id).subscribe(() => this.router.navigate(['/aliments']));
  }
}
