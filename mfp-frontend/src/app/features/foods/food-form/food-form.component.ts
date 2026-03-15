import { Component, Input, Output, EventEmitter, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Food } from '../../../core/models/food.model';

@Component({
  selector: 'app-food-form',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule, MatIconModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="food-form">

      <!-- Name -->
      <div class="form-section">
        <div class="name-row">
          <div class="input-icon">
            <mat-icon>restaurant</mat-icon>
          </div>
          <input
            class="name-input"
            type="text"
            formControlName="name"
            placeholder="Nom de l'aliment"
          />
        </div>
      </div>

      <!-- Calories -->
      <div class="calories-card">
        <div class="calories-label">Calories</div>
        <div class="calories-input-row">
          <input
            class="calories-input"
            type="number"
            formControlName="calories"
            min="0"
            inputmode="decimal"
          />
          <span class="calories-unit">kcal</span>
        </div>
        <div class="calories-sub">pour 100g</div>
      </div>

      <!-- Macronutriments -->
      <div class="form-section">
        <div class="section-header">
          <mat-icon>bar_chart</mat-icon>
          <span class="section-title">Macronutriments</span>
          <span class="section-note">pour 100g</span>
        </div>
        <div class="nutrient-rows">
          <div class="nutrient-row" *ngFor="let f of macroFields">
            <div class="nutrient-dot {{f.color}}"></div>
            <span class="nutrient-label">{{ f.label }}</span>
            <div class="nutrient-input-wrap">
              <input class="nutrient-input" type="number" [formControlName]="f.key" min="0" inputmode="decimal" />
              <span class="nutrient-unit">g</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Détails -->
      <div class="form-section">
        <div class="section-header">
          <mat-icon>info_outline</mat-icon>
          <span class="section-title">Détails</span>
          <span class="section-note">pour 100g</span>
        </div>
        <div class="nutrient-rows">
          <div class="nutrient-row" *ngFor="let f of detailFields">
            <div class="nutrient-dot neutral"></div>
            <span class="nutrient-label">{{ f.label }}</span>
            <div class="nutrient-input-wrap">
              <input class="nutrient-input" type="number" [formControlName]="f.key" min="0" inputmode="decimal" />
              <span class="nutrient-unit">g</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <button class="submit-btn" type="submit" [disabled]="form.invalid">
        {{ submitLabel }}
      </button>

    </form>
  `,
  styles: [`
    .food-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      padding-bottom: 32px;
    }

    /* Name section */
    .form-section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
    }

    .name-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
    }

    .input-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #EDF2EE;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .input-icon mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--primary);
    }

    .name-input {
      flex: 1;
      border: none;
      outline: none;
      font-family: var(--font);
      font-size: 16px;
      font-weight: 600;
      color: var(--text);
      background: transparent;
      min-width: 0;
    }
    .name-input::placeholder {
      color: var(--text-3, #9aada5);
      font-weight: 400;
    }

    /* Calories big card */
    .calories-card {
      background: var(--primary);
      border-radius: 20px;
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .calories-label {
      font-family: var(--font);
      font-size: 12px;
      font-weight: 700;
      color: rgba(255,255,255,0.7);
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .calories-input-row {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .calories-input {
      border: none;
      outline: none;
      background: transparent;
      font-family: var(--font);
      font-size: 56px;
      font-weight: 800;
      color: #fff;
      text-align: center;
      width: 180px;
      font-variant-numeric: tabular-nums;
    }
    .calories-input::-webkit-inner-spin-button,
    .calories-input::-webkit-outer-spin-button { -webkit-appearance: none; }

    .calories-unit {
      font-family: var(--font);
      font-size: 18px;
      font-weight: 600;
      color: rgba(255,255,255,0.7);
    }

    .calories-sub {
      font-family: var(--font);
      font-size: 12px;
      color: rgba(255,255,255,0.5);
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
    .section-note {
      font-family: var(--font);
      font-size: 11px;
      color: var(--text-3, #9aada5);
    }

    /* Nutrient rows */
    .nutrient-rows { padding: 4px 0; }

    .nutrient-row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 16px;
      border-bottom: 1px solid var(--border);
    }
    .nutrient-row:last-child { border-bottom: none; }

    .nutrient-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .nutrient-dot.protein { background: #4A8FD4; }
    .nutrient-dot.carb    { background: #CC8800; }
    .nutrient-dot.fat     { background: #E8702A; }
    .nutrient-dot.neutral { background: #d0d8d4; }

    .nutrient-label {
      font-family: var(--font);
      font-size: 14px;
      color: var(--text);
      flex: 1;
    }

    .nutrient-input-wrap {
      display: flex;
      align-items: baseline;
      gap: 4px;
      background: #F4F6F1;
      border-radius: 8px;
      padding: 5px 10px;
    }

    .nutrient-input {
      border: none;
      outline: none;
      background: transparent;
      font-family: var(--font);
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      width: 56px;
      text-align: right;
      font-variant-numeric: tabular-nums;
    }
    .nutrient-input::-webkit-inner-spin-button,
    .nutrient-input::-webkit-outer-spin-button { -webkit-appearance: none; }

    .nutrient-unit {
      font-family: var(--font);
      font-size: 12px;
      color: var(--text-3, #9aada5);
    }

    /* Submit */
    .submit-btn {
      margin-top: 4px;
      width: 100%;
      height: 52px;
      border-radius: 16px;
      border: none;
      background: var(--primary);
      color: #fff;
      font-family: var(--font);
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .submit-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    .submit-btn:not(:disabled):active { opacity: 0.85; }
  `],
})
export class FoodFormComponent implements OnInit {
  @Input() initialData?: Partial<Food>;
  @Input() submitLabel = 'Enregistrer';
  @Output() submitted = new EventEmitter<Partial<Food>>();

  private fb = inject(FormBuilder);

  macroFields = [
    { key: 'proteins', label: 'Protéines', color: 'protein' },
    { key: 'carbs',    label: 'Glucides',  color: 'carb'    },
    { key: 'fat',      label: 'Lipides',   color: 'fat'     },
  ];

  detailFields = [
    { key: 'fiber',       label: 'Fibres'           },
    { key: 'sugars',      label: 'Sucres'           },
    { key: 'saturatedFat',label: 'Graisses saturées'},
    { key: 'salt',        label: 'Sel'              },
  ];

  form = this.fb.group({
    name:         ['', Validators.required],
    barcode:      [''],
    calories:     [0, [Validators.required, Validators.min(0)]],
    proteins:     [0, [Validators.required, Validators.min(0)]],
    carbs:        [0, [Validators.required, Validators.min(0)]],
    fat:          [0, [Validators.required, Validators.min(0)]],
    fiber:        [0, [Validators.required, Validators.min(0)]],
    sugars:       [0, [Validators.required, Validators.min(0)]],
    saturatedFat: [0, [Validators.required, Validators.min(0)]],
    salt:         [0, [Validators.required, Validators.min(0)]],
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
