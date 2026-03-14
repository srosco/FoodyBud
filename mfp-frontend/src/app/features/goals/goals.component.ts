import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { GoalsService } from '../../core/services/goals.service';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule],
  template: `
    <h1>Mes objectifs journaliers</h1>
    <form [formGroup]="form" (ngSubmit)="onSave()">
      <mat-form-field appearance="outline" *ngFor="let f of fields">
        <mat-label>{{ f.label }}</mat-label>
        <input matInput type="number" [formControlName]="f.key" min="0" />
        <span matSuffix>{{ f.unit }}</span>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">Enregistrer</button>
    </form>
  `,
})
export class GoalsComponent implements OnInit {
  private goalsService = inject(GoalsService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  fields = [
    { key: 'calories', label: 'Calories', unit: 'kcal' },
    { key: 'proteins', label: 'Protéines', unit: 'g' },
    { key: 'carbs', label: 'Glucides', unit: 'g' },
    { key: 'fat', label: 'Lipides', unit: 'g' },
    { key: 'fiber', label: 'Fibres', unit: 'g' },
    { key: 'sugars', label: 'Sucres', unit: 'g' },
    { key: 'saturatedFat', label: 'Graisses saturées', unit: 'g' },
    { key: 'salt', label: 'Sel', unit: 'g' },
  ];

  form = this.fb.group({
    calories: [2000, [Validators.required, Validators.min(0)]],
    proteins: [150, [Validators.required, Validators.min(0)]],
    carbs: [250, [Validators.required, Validators.min(0)]],
    fat: [65, [Validators.required, Validators.min(0)]],
    fiber: [25, [Validators.required, Validators.min(0)]],
    sugars: [50, [Validators.required, Validators.min(0)]],
    saturatedFat: [20, [Validators.required, Validators.min(0)]],
    salt: [6, [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    this.goalsService.get().subscribe((g) => this.form.patchValue(g as any));
  }

  onSave() {
    this.goalsService.update(this.form.value as any).subscribe(() => {
      this.snack.open('Objectifs enregistrés', 'OK', { duration: 2000 });
    });
  }
}
