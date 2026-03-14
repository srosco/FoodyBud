import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { FoodPickerComponent, FoodPickerResult } from '../../../shared/components/food-picker/food-picker.component';
import { Recipe } from '../../../core/models/recipe.model';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatIconModule, MatListModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field appearance="outline">
        <mat-label>Nom de la recette</mat-label>
        <input matInput formControlName="name" required />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Poids total préparé</mat-label>
        <input matInput type="number" formControlName="totalWeightG" required />
        <span matSuffix>g</span>
      </mat-form-field>

      <h3>Ingrédients</h3>
      <mat-list>
        <mat-list-item *ngFor="let item of items; let i = index">
          <span matListItemTitle>{{ item.food.name }}</span>
          <span matListItemLine>{{ item.quantityG }}g</span>
          <button mat-icon-button (click)="removeItem(i)" type="button">
            <mat-icon>delete</mat-icon>
          </button>
        </mat-list-item>
      </mat-list>
      <button mat-stroked-button type="button" (click)="openPicker()">+ Ajouter un aliment</button>

      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || items.length === 0">
        {{ submitLabel }}
      </button>
    </form>
  `,
})
export class RecipeFormComponent implements OnInit {
  @Input() initialData?: Partial<Recipe>;
  @Input() submitLabel = 'Enregistrer';
  @Output() submitted = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  form = this.fb.group({
    name: ['', Validators.required],
    totalWeightG: [0, [Validators.required, Validators.min(1)]],
  });

  items: { food: any; quantityG: number }[] = [];

  ngOnInit() {
    if (this.initialData) {
      this.form.patchValue(this.initialData as any);
      this.items = (this.initialData.items ?? []).map((i: any) => ({ food: i.food, quantityG: i.quantityG }));
    }
  }

  openPicker() {
    this.dialog.open(FoodPickerComponent).afterClosed().subscribe((result: FoodPickerResult | undefined) => {
      if (result?.food) this.items = [...this.items, { food: result.food, quantityG: result.quantityG }];
    });
  }

  removeItem(index: number) { this.items = this.items.filter((_, idx) => idx !== index); }

  onSubmit() {
    if (this.form.valid) {
      this.submitted.emit({
        ...this.form.value,
        items: this.items.map((i) => ({ foodId: i.food.id, quantityG: i.quantityG })),
      });
    }
  }
}
