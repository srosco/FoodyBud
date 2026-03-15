import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { FoodsService } from '../../../core/services/foods.service';
import { RecipesService } from '../../../core/services/recipes.service';
import { Food } from '../../../core/models/food.model';
import { Recipe } from '../../../core/models/recipe.model';

export interface FoodPickerResult {
  food?: Food;
  recipe?: Recipe;
  quantityG: number;
}

@Component({
  selector: 'app-food-picker',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTabsModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <h2 mat-dialog-title>Ajouter un aliment</h2>

    <mat-dialog-content>
      <mat-tab-group>

        <mat-tab label="Aliments">
          <div class="tab-content">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Rechercher un aliment</mat-label>
              <input matInput [formControl]="searchControl" />
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <div class="food-list">
              <div
                *ngFor="let food of foods()"
                class="food-row"
                [class.selected]="selectedFood() === food"
                (click)="selectFood(food)"
              >
                <span class="food-name">{{ food.name }}</span>
                <span class="food-meta">{{ food.calories }} kcal/100g</span>
              </div>
              <div *ngIf="foods().length === 0" class="empty-hint">
                Aucun aliment trouvé
              </div>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Recettes">
          <div class="tab-content">
            <div class="food-list">
              <div
                *ngFor="let recipe of recipes()"
                class="food-row"
                [class.selected]="selectedRecipe() === recipe"
                (click)="selectRecipe(recipe)"
              >
                <span class="food-name">{{ recipe.name }}</span>
              </div>
              <div *ngIf="recipes().length === 0" class="empty-hint">
                Aucune recette disponible
              </div>
            </div>
          </div>
        </mat-tab>

      </mat-tab-group>

      <mat-form-field appearance="outline" class="quantity-field">
        <mat-label>Quantité (g)</mat-label>
        <input
          matInput
          type="number"
          [ngModel]="quantityG()"
          (ngModelChange)="quantityG.set(+$event)"
          min="1"
        />
      </mat-form-field>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button (click)="cancel()">Annuler</button>
      <button
        mat-raised-button
        color="primary"
        (click)="confirm()"
        [disabled]="!canAdd()"
      >
        Ajouter
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    mat-dialog-content {
      min-width: 320px;
      max-width: 480px;
      padding-bottom: 8px;
    }

    .tab-content {
      padding-top: 12px;
    }

    .search-field {
      width: 100%;
    }

    .food-list {
      max-height: 240px;
      overflow-y: auto;
      border: 1px solid var(--border);
      border-radius: var(--r-sm);
      background: var(--surface);
    }

    .food-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      cursor: pointer;
      transition: background 0.15s;
      border-bottom: 1px solid var(--border);
    }

    .food-row:last-child {
      border-bottom: none;
    }

    .food-row:hover {
      background: var(--surface-2);
    }

    .food-row.selected {
      background: var(--primary-light);
      color: var(--primary);
    }

    .food-row.selected .food-name,
    .food-row.selected .food-meta {
      color: var(--primary);
    }

    .food-name {
      font-weight: 500;
      color: var(--text);
      font-size: 14px;
    }

    .food-meta {
      font-size: 12px;
      color: var(--text-2);
      white-space: nowrap;
      margin-left: 8px;
    }

    .empty-hint {
      padding: 16px;
      text-align: center;
      color: var(--text-3);
      font-size: 13px;
    }

    .quantity-field {
      width: 100%;
      margin-top: 16px;
    }
  `],
})
export class FoodPickerComponent implements OnInit {
  private foodsService = inject(FoodsService);
  private recipesService = inject(RecipesService);
  readonly dialogRef = inject(MatDialogRef<FoodPickerComponent>);

  searchControl = new FormControl('');

  searchQuery = signal('');
  foods = signal<Food[]>([]);
  recipes = signal<Recipe[]>([]);
  selectedFood = signal<Food | null>(null);
  selectedRecipe = signal<Recipe | null>(null);
  quantityG = signal(100);

  canAdd = computed(
    () => (this.selectedFood() !== null || this.selectedRecipe() !== null) && this.quantityG() > 0,
  );

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) => this.foodsService.search(q ?? '')),
    ).subscribe((foods) => this.foods.set(foods));

    // Initial load
    this.foodsService.search('').subscribe((foods) => this.foods.set(foods));

    this.recipesService.getAll().subscribe((recipes) => this.recipes.set(recipes));
  }

  selectFood(food: Food): void {
    this.selectedFood.set(food);
    this.selectedRecipe.set(null);
  }

  selectRecipe(recipe: Recipe): void {
    this.selectedRecipe.set(recipe);
    this.selectedFood.set(null);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  confirm(): void {
    const food = this.selectedFood();
    const recipe = this.selectedRecipe();
    if (!food && !recipe) return;
    this.dialogRef.close({
      food: food ?? undefined,
      recipe: recipe ?? undefined,
      quantityG: this.quantityG(),
    });
  }
}
