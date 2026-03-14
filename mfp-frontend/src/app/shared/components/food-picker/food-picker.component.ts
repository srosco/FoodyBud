import { Component, inject, OnInit, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
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
  imports: [CommonModule, FormsModule, MatDialogModule, MatTabsModule, MatListModule, MatInputModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>Ajouter un aliment ou une recette</h2>
    <mat-dialog-content>
      <mat-tab-group>
        <mat-tab label="Aliments">
          <input matInput placeholder="Rechercher..." [(ngModel)]="foodQuery" (ngModelChange)="searchFoods()" />
          <mat-selection-list [multiple]="false" [(ngModel)]="selectedFood">
            <mat-list-option *ngFor="let f of foods()" [value]="f">
              {{ f.name }} — {{ f.calories }} kcal/100g
            </mat-list-option>
          </mat-selection-list>
        </mat-tab>
        <mat-tab label="Recettes">
          <mat-selection-list [multiple]="false" [(ngModel)]="selectedRecipe">
            <mat-list-option *ngFor="let r of recipes()" [value]="r">{{ r.name }}</mat-list-option>
          </mat-selection-list>
        </mat-tab>
      </mat-tab-group>

      <mat-form-field>
        <mat-label>Quantité (g)</mat-label>
        <input matInput type="number" [(ngModel)]="quantityG" min="1" />
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions>
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-raised-button color="primary" (click)="confirm()" [disabled]="!canConfirm()">Ajouter</button>
    </mat-dialog-actions>
  `,
})
export class FoodPickerComponent implements OnInit {
  private foodsService = inject(FoodsService);
  private recipesService = inject(RecipesService);
  private dialogRef = inject(MatDialogRef<FoodPickerComponent>);

  foods = signal<Food[]>([]);
  recipes = signal<Recipe[]>([]);
  foodQuery = '';
  selectedFood: Food[] = [];
  selectedRecipe: Recipe[] = [];
  quantityG = 100;

  private searchQuery$ = new Subject<string>();

  ngOnInit() {
    this.searchQuery$.pipe(
      debounceTime(300),
      switchMap(q => this.foodsService.search(q))
    ).subscribe(f => this.foods.set(f));
    this.searchQuery$.next(''); // initial load
    this.recipesService.getAll().subscribe(r => this.recipes.set(r));
  }

  searchFoods() {
    this.searchQuery$.next(this.foodQuery);
  }

  canConfirm() {
    return (this.selectedFood.length > 0 || this.selectedRecipe.length > 0) && this.quantityG > 0;
  }

  confirm() {
    const result: FoodPickerResult = { quantityG: this.quantityG };
    if (this.selectedFood.length > 0) result.food = this.selectedFood[0];
    else result.recipe = this.selectedRecipe[0];
    this.dialogRef.close(result);
  }
}
