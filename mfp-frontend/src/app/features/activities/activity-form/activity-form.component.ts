import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-activity-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <mat-form-field appearance="outline">
        <mat-label>Activité</mat-label>
        <input matInput formControlName="name" required />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Date</mat-label>
        <input matInput type="date" formControlName="date" required />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Calories brûlées</mat-label>
        <input matInput type="number" formControlName="caloriesBurned" required />
        <span matSuffix>kcal</span>
      </mat-form-field>
      <button mat-raised-button color="primary" type="submit" [disabled]="form.invalid">{{ submitLabel }}</button>
    </form>
  `,
})
export class ActivityFormComponent implements OnInit {
  @Input() initialData?: any;
  @Input() submitLabel = 'Enregistrer';
  @Output() submitted = new EventEmitter<any>();

  private fb = inject(FormBuilder);

  form = this.fb.group({
    name: ['', Validators.required],
    date: [new Date().toISOString().split('T')[0], Validators.required],
    caloriesBurned: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit() { if (this.initialData) this.form.patchValue(this.initialData); }
  onSubmit() { if (this.form.valid) this.submitted.emit(this.form.value); }
}
