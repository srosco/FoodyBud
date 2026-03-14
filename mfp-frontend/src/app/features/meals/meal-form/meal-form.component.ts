import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { FoodPickerComponent, FoodPickerResult } from '../../../shared/components/food-picker/food-picker.component';

@Component({
  selector: 'app-meal-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatSelectModule, MatButtonModule, MatIconModule, MatListModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field appearance="outline">
        <mat-label>Date</mat-label>
        <input matInput type="date" formControlName="date" required />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Moment de la journée</mat-label>
        <mat-select formControlName="mealType" required>
          <mat-option *ngFor="let t of mealTypes" [value]="t.value">{{ t.label }}</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Nom (optionnel)</mat-label>
        <input matInput formControlName="name" />
      </mat-form-field>

      <h3>Aliments / Recettes</h3>
      <mat-list>
        <mat-list-item *ngFor="let item of items; let i = index">
          <span matListItemTitle>{{ item.food?.name ?? item.recipe?.name }}</span>
          <span matListItemLine>{{ item.quantityG }}g</span>
          <button mat-icon-button type="button" (click)="removeItem(i)"><mat-icon>delete</mat-icon></button>
        </mat-list-item>
      </mat-list>
      <button mat-stroked-button type="button" (click)="openPicker()">+ Ajouter</button>

      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid || items.length === 0">
        {{ submitLabel }}
      </button>
    </form>
  `,
})
export class MealFormComponent implements OnInit {
  @Input() initialData?: any;
  @Input() defaultDate?: string;
  @Input() submitLabel = 'Enregistrer';
  @Output() submitted = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  mealTypes = [
    { value: 'BREAKFAST', label: 'Petit-déjeuner' },
    { value: 'LUNCH', label: 'Déjeuner' },
    { value: 'DINNER', label: 'Dîner' },
    { value: 'SNACK', label: 'Snack' },
  ];

  form = this.fb.group({
    date: [this.defaultDate ?? new Date().toISOString().split('T')[0], Validators.required],
    mealType: ['LUNCH', Validators.required],
    name: [''],
  });

  items: { food: any | null; recipe: any | null; quantityG: number }[] = [];

  ngOnInit() {
    if (this.initialData) {
      this.form.patchValue(this.initialData);
      this.items = (this.initialData.items ?? []).map((i: any) => ({
        food: i.food ?? null,
        recipe: i.recipe ?? null,
        quantityG: i.quantityG,
      }));
    } else if (this.defaultDate) {
      this.form.patchValue({ date: this.defaultDate });
    }
  }

  openPicker() {
    this.dialog.open(FoodPickerComponent).afterClosed().subscribe((result: FoodPickerResult | undefined) => {
      if (result) this.items = [...this.items, { food: result.food ?? null, recipe: result.recipe ?? null, quantityG: result.quantityG }];
    });
  }

  removeItem(index: number) { this.items = this.items.filter((_, idx) => idx !== index); }

  onSubmit() {
    if (this.form.valid) {
      this.submitted.emit({
        ...this.form.value,
        items: this.items.map((i) => ({
          foodId: i.food?.id ?? undefined,
          recipeId: i.recipe?.id ?? undefined,
          quantityG: i.quantityG,
        })),
      });
    }
  }
}
