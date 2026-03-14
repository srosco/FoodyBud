import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Food } from '../../../core/models/food.model';
import { NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-food-form',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, MatInputModule, MatButtonModule, MatFormFieldModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field appearance="outline">
        <mat-label>Nom</mat-label>
        <input matInput formControlName="name" required />
      </mat-form-field>

      <h3>Valeurs pour 100g</h3>
      <mat-form-field appearance="outline" *ngFor="let field of nutrientFields">
        <mat-label>{{ field.label }}</mat-label>
        <input matInput type="number" [formControlName]="field.key" />
        <span matSuffix>g</span>
      </mat-form-field>

      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">
        {{ submitLabel }}
      </button>
    </form>
  `,
})
export class FoodFormComponent implements OnInit {
  @Input() initialData?: Partial<Food>;
  @Input() submitLabel = 'Enregistrer';
  @Output() submitted = new EventEmitter<Partial<Food>>();

  private fb = inject(FormBuilder);

  nutrientFields = [
    { key: 'calories', label: 'Calories (kcal)' },
    { key: 'proteins', label: 'Protéines' },
    { key: 'carbs', label: 'Glucides' },
    { key: 'fat', label: 'Lipides' },
    { key: 'fiber', label: 'Fibres' },
    { key: 'sugars', label: 'Sucres' },
    { key: 'saturatedFat', label: 'Graisses saturées' },
    { key: 'salt', label: 'Sel' },
  ];

  form = this.fb.group({
    name: ['', Validators.required],
    barcode: [''],
    calories: [0, [Validators.required, Validators.min(0)]],
    proteins: [0, [Validators.required, Validators.min(0)]],
    carbs: [0, [Validators.required, Validators.min(0)]],
    fat: [0, [Validators.required, Validators.min(0)]],
    fiber: [0, [Validators.required, Validators.min(0)]],
    sugars: [0, [Validators.required, Validators.min(0)]],
    saturatedFat: [0, [Validators.required, Validators.min(0)]],
    salt: [0, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    if (this.initialData) {
      this.form.patchValue(this.initialData as Record<string, unknown>);
    }
  }

  onSubmit() {
    if (this.form.valid) this.submitted.emit(this.form.value as Partial<Food>);
  }
}
