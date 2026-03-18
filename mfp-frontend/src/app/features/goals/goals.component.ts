import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NgFor } from '@angular/common';
import { GoalsService } from '../../core/services/goals.service';

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [NgFor, ReactiveFormsModule, MatIconModule, MatButtonModule],
  template: `
    @if (loading()) {
      <div class="goals-page page">
        <div class="sk sk-g-cal"></div>
        <div class="form-section">
          <div class="sk-g-sec-hd">
            <div class="sk sk-g-icon"></div>
            <div class="sk sk-g-title"></div>
          </div>
          <div class="sk-g-row" *ngFor="let r of [1,2,3]">
            <div class="sk sk-g-dot"></div>
            <div class="sk sk-g-lbl"></div>
            <div class="sk sk-g-input"></div>
          </div>
        </div>
        <div class="form-section">
          <div class="sk-g-sec-hd">
            <div class="sk sk-g-icon"></div>
            <div class="sk sk-g-title"></div>
          </div>
          <div class="sk-g-row" *ngFor="let r of [1,2,3,4]">
            <div class="sk sk-g-dot"></div>
            <div class="sk sk-g-lbl"></div>
            <div class="sk sk-g-input"></div>
          </div>
        </div>
      </div>
    }

    <form [formGroup]="form" (ngSubmit)="onSave()" class="goals-page page" [style.display]="loading() ? 'none' : ''">

      <!-- Calories card -->
      <div class="calories-card">
        <div class="calories-label">Objectif calorique</div>
        <div class="calories-input-row">
          <input
            class="calories-input"
            type="number"
            formControlName="calories"
            min="0"
            inputmode="decimal"
          />
          <span class="calories-unit">kcal / jour</span>
        </div>
      </div>

      <!-- Macros section -->
      <div class="form-section">
        <div class="section-header">
          <mat-icon>bar_chart</mat-icon>
          <span class="section-title">Macronutriments</span>
        </div>
        <div class="nutrient-rows">
          <div class="nutrient-row" *ngFor="let f of macroFields">
            <div class="nutrient-dot {{f.color}}"></div>
            <span class="nutrient-label">{{ f.label }}</span>
            <div class="nutrient-input-wrap">
              <input
                class="nutrient-input"
                type="number"
                [formControlName]="f.key"
                min="0"
                inputmode="decimal"
              />
              <span class="nutrient-unit">g</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Détails section -->
      <div class="form-section">
        <div class="section-header">
          <mat-icon>info_outline</mat-icon>
          <span class="section-title">Détails</span>
        </div>
        <div class="nutrient-rows">
          <div class="nutrient-row" *ngFor="let f of detailFields">
            <div class="nutrient-dot neutral"></div>
            <span class="nutrient-label">{{ f.label }}</span>
            <div class="nutrient-input-wrap">
              <input
                class="nutrient-input"
                type="number"
                [formControlName]="f.key"
                min="0"
                inputmode="decimal"
              />
              <span class="nutrient-unit">g</span>
            </div>
          </div>
        </div>
      </div>

    </form>

    @if (!loading()) {
      <div class="fab-wrap">
        <button mat-fab extended color="primary" [disabled]="form.invalid" (click)="onSave()">
          @if (saving()) {
            <span class="btn-spinner"></span>
            Enregistrement…
          } @else {
            <mat-icon>check</mat-icon>
            Enregistrer
          }
        </button>
      </div>
    }
  `,
  styles: [`
    .goals-page {
      min-height: 100%;
      background: var(--bg);
      padding: 16px;
      padding-bottom: 88px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    /* Calories card */
    .calories-card {
      background: var(--primary);
      border-radius: 20px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
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
      gap: 8px;
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
      width: 200px;
      font-variant-numeric: tabular-nums;
    }
    .calories-input::-webkit-inner-spin-button,
    .calories-input::-webkit-outer-spin-button { -webkit-appearance: none; }

    .calories-unit {
      font-family: var(--font);
      font-size: 15px;
      font-weight: 600;
      color: rgba(255,255,255,0.65);
      white-space: nowrap;
    }

    /* Sections */
    .form-section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      overflow: hidden;
    }

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

    /* Skeleton shapes */
    .sk-g-cal { height: 120px; border-radius: 20px; }
    .sk-g-sec-hd { display: flex; align-items: center; gap: 8px; padding: 12px 16px 10px; border-bottom: 1px solid var(--border); }
    .sk-g-icon  { width: 16px; height: 16px; border-radius: 4px; flex-shrink: 0; }
    .sk-g-title { width: 110px; height: 12px; border-radius: 4px; }
    .sk-g-row   { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--border); }
    .sk-g-row:last-child { border-bottom: none; }
    .sk-g-dot   { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .sk-g-lbl   { flex: 1; height: 12px; max-width: 100px; border-radius: 4px; }
    .sk-g-input { width: 72px; height: 30px; border-radius: 8px; flex-shrink: 0; }

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
export class GoalsComponent implements OnInit {
  private goalsService = inject(GoalsService);
  private snack = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  loading = signal(true);
  saving = signal(false);

  macroFields = [
    { key: 'proteins', label: 'Protéines', color: 'protein' },
    { key: 'carbs',    label: 'Glucides',  color: 'carb'    },
    { key: 'fat',      label: 'Lipides',   color: 'fat'     },
  ];

  detailFields = [
    { key: 'fiber',        label: 'Fibres'            },
    { key: 'sugars',       label: 'Sucres'            },
    { key: 'saturatedFat', label: 'Graisses saturées' },
    { key: 'salt',         label: 'Sel'               },
  ];

  form = this.fb.group({
    calories:     [2000, [Validators.required, Validators.min(0)]],
    proteins:     [150,  [Validators.required, Validators.min(0)]],
    carbs:        [250,  [Validators.required, Validators.min(0)]],
    fat:          [65,   [Validators.required, Validators.min(0)]],
    fiber:        [25,   [Validators.required, Validators.min(0)]],
    sugars:       [50,   [Validators.required, Validators.min(0)]],
    saturatedFat: [20,   [Validators.required, Validators.min(0)]],
    salt:         [6,    [Validators.required, Validators.min(0)]],
  });

  ngOnInit() {
    this.goalsService.get().subscribe({
      next: (g) => { this.form.patchValue(g as any); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  onSave() {
    this.saving.set(true);
    this.goalsService.update(this.form.value as any).subscribe({
      next: () => {
        this.snack.open('Objectifs enregistrés', 'OK', { duration: 2000 });
        this.saving.set(false);
      },
      error: () => this.saving.set(false),
    });
  }
}
