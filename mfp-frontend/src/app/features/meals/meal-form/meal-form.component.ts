import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgFor, NgIf } from '@angular/common';
import { FoodPickerComponent, FoodPickerResult } from '../../../shared/components/food-picker/food-picker.component';

@Component({
  selector: 'app-meal-form',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, MatButtonModule, MatIconModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="meal-form">

      <!-- Date -->
      <div class="form-section">
        <div class="field-row">
          <div class="field-icon"><mat-icon>calendar_today</mat-icon></div>
          <span class="field-label">Date</span>
          <input class="field-input date-input" type="date" formControlName="date" />
        </div>
      </div>

      <!-- Meal type -->
      <div class="form-section">
        <div class="section-header">
          <mat-icon>restaurant</mat-icon>
          <span class="section-title">Moment de la journée</span>
        </div>
        <div class="meal-type-grid">
          <button
            type="button"
            class="meal-type-pill"
            *ngFor="let t of mealTypes"
            [class.selected]="form.get('mealType')?.value === t.value"
            (click)="form.controls.mealType.setValue(t.value)"
          >
            <mat-icon class="pill-icon">{{ t.icon }}</mat-icon>
            <span>{{ t.label }}</span>
          </button>
        </div>
      </div>

      <!-- Optional name -->
      <div class="form-section">
        <div class="field-row">
          <div class="field-icon"><mat-icon>label_outline</mat-icon></div>
          <input
            class="field-input name-input"
            type="text"
            formControlName="name"
            placeholder="Nom du repas (optionnel)"
          />
        </div>
      </div>

      <!-- Food items -->
      <div class="form-section">
        <div class="section-header">
          <mat-icon>nutrition</mat-icon>
          <span class="section-title">Aliments &amp; Recettes</span>
          <span class="section-count" *ngIf="items.length > 0">{{ items.length }}</span>
        </div>
        <div class="items-list" *ngIf="items.length > 0">
          <div class="item-row" *ngFor="let item of items; let i = index">
            <div class="item-dot"></div>
            <div class="item-info">
              <span class="item-name">{{ item.food?.name ?? item.recipe?.name }}</span>
              <span class="item-qty">{{ item.quantityG }}g</span>
            </div>
            <button type="button" class="item-delete" (click)="removeItem(i)">
              <mat-icon>close</mat-icon>
            </button>
          </div>
        </div>
        <button type="button" class="add-btn" (click)="openPicker()">
          <mat-icon>add_circle_outline</mat-icon>
          Ajouter un aliment
        </button>
      </div>

    </form>

    <!-- Submit FAB -->
    <div class="fab-wrap">
      <button
        mat-fab extended color="primary"
        [disabled]="form.invalid || items.length === 0"
        (click)="onSubmit()"
      >
        <mat-icon>check</mat-icon>
        {{ submitLabel }}
      </button>
    </div>
  `,
  styles: [`
    .meal-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      padding-bottom: 88px;
    }

    .form-section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
    }

    /* Field rows */
    .field-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
    }

    .field-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: #EDF2EE;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .field-icon mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--primary);
    }

    .field-label {
      font-family: var(--font);
      font-size: 14px;
      color: var(--text-2, #5a6e65);
      flex-shrink: 0;
    }

    .field-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-family: var(--font);
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      text-align: right;
      min-width: 0;
    }

    .name-input {
      text-align: left;
      font-weight: 400;
    }
    .name-input::placeholder { color: var(--text-3, #9aada5); }

    .date-input::-webkit-calendar-picker-indicator {
      opacity: 0.45;
      cursor: pointer;
    }

    /* Section header */
    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px 10px;
      border-bottom: 1px solid var(--border);
    }
    .section-header mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: var(--primary);
    }
    .section-title {
      font-family: var(--font);
      font-size: 13px;
      font-weight: 700;
      color: var(--text);
      flex: 1;
    }
    .section-count {
      font-family: var(--font);
      font-size: 11px;
      font-weight: 700;
      background: var(--primary);
      color: #fff;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Meal type grid */
    .meal-type-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      padding: 12px;
    }

    .meal-type-pill {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 10px 12px;
      border-radius: 12px;
      border: 1.5px solid var(--border);
      background: var(--bg);
      font-family: var(--font);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-2, #5a6e65);
      cursor: pointer;
      transition: all 0.15s;
    }
    .meal-type-pill.selected {
      background: #EDF2EE;
      border-color: var(--primary);
      color: var(--primary);
    }
    .pill-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    /* Items list */
    .items-list { padding: 4px 0; }

    .item-row {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
    }

    .item-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--primary);
      flex-shrink: 0;
      opacity: 0.6;
    }

    .item-info {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }

    .item-name {
      font-family: var(--font);
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .item-qty {
      font-family: var(--font);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-3, #9aada5);
      flex-shrink: 0;
      font-variant-numeric: tabular-nums;
    }

    .item-delete {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: none;
      background: #FFF0EE;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #E84040;
      flex-shrink: 0;
    }
    .item-delete mat-icon { font-size: 16px; width: 16px; height: 16px; }

    /* Add button */
    .add-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 13px 16px;
      border: none;
      background: transparent;
      font-family: var(--font);
      font-size: 14px;
      font-weight: 600;
      color: var(--primary);
      cursor: pointer;
    }
    .add-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    /* FAB */
    .fab-wrap {
      position: fixed;
      bottom: calc(var(--nav-h, 64px) + 16px);
      left: 50%;
      transform: translateX(-50%);
      z-index: 50;
    }
  `],
})
export class MealFormComponent implements OnInit {
  @Input() initialData?: any;
  @Input() defaultDate?: string;
  @Input() submitLabel = 'Enregistrer';
  @Output() submitted = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);

  mealTypes = [
    { value: 'BREAKFAST', label: 'Petit-déj',  icon: 'free_breakfast' },
    { value: 'LUNCH',     label: 'Déjeuner',   icon: 'lunch_dining'   },
    { value: 'DINNER',    label: 'Dîner',       icon: 'dinner_dining'  },
    { value: 'SNACK',     label: 'Snack',       icon: 'local_cafe'     },
  ];

  form = this.fb.group({
    date:     [this.defaultDate ?? new Date().toISOString().split('T')[0], Validators.required],
    mealType: ['LUNCH', Validators.required],
    name:     [''],
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
