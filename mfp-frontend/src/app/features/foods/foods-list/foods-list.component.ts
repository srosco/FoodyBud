import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { FoodsService } from '../../../core/services/foods.service';
import { Food } from '../../../core/models/food.model';
import { debounceTime, distinctUntilChanged, Subject, switchMap, startWith } from 'rxjs';

@Component({
  selector: 'app-foods-list',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, RouterLink, FormsModule, MatButtonModule, MatIconModule],
  template: `
    <div class="foods-page page">

      <!-- Sticky search bar -->
      <div class="search-bar">
        <div class="search-input-wrap">
          <mat-icon class="search-icon">search</mat-icon>
          <input
            class="search-input"
            type="search"
            placeholder="Rechercher un aliment…"
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch($event)"
          />
          <button *ngIf="searchQuery" class="clear-btn" (click)="clearSearch()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
        <button class="scan-btn" routerLink="/aliments/scan" title="Scanner un code-barres">
          <mat-icon>qr_code_scanner</mat-icon>
        </button>
      </div>

      <!-- Skeleton rows -->
      <div class="food-list" *ngIf="loading()">
        <div class="food-row sk-food-row" *ngFor="let i of [1,2,3,4,5,6]">
          <div class="sk sk-fi"></div>
          <div class="sk-fi-info">
            <div class="sk sk-fi-name"></div>
            <div class="sk-fi-pills">
              <div class="sk sk-fi-pill"></div>
              <div class="sk sk-fi-pill"></div>
              <div class="sk sk-fi-pill"></div>
            </div>
          </div>
          <div class="sk-fi-kcal">
            <div class="sk sk-fi-kval"></div>
            <div class="sk sk-fi-klbl"></div>
          </div>
        </div>
      </div>

      <!-- Food list -->
      <div class="food-list" *ngIf="foods().length > 0 && !loading()">
        <div class="food-row" *ngFor="let food of foods()" (click)="router.navigate(['/aliments', food.id, 'edit'])">
          <div class="food-icon">
            <mat-icon>nutrition</mat-icon>
          </div>
          <div class="food-info">
            <span class="food-name">{{ food.name }}</span>
            <div class="food-macros">
              <span class="macro-pill p">P {{ food.proteins | number:'1.0-1' }}g</span>
              <span class="macro-pill c">G {{ food.carbs | number:'1.0-1' }}g</span>
              <span class="macro-pill f">L {{ food.fat | number:'1.0-1' }}g</span>
            </div>
          </div>
          <div class="food-kcal">
            <span class="kcal-value">{{ food.calories | number:'1.0-0' }}</span>
            <span class="kcal-unit">kcal</span>
          </div>
          <mat-icon class="chevron">chevron_right</mat-icon>
        </div>
      </div>

      <!-- Empty search state -->
      <div class="empty-state" *ngIf="foods().length === 0 && searchQuery && !loading()">
        <mat-icon>search_off</mat-icon>
        <p>Aucun aliment trouvé<br>pour « {{ searchQuery }} »</p>
      </div>

      <!-- Empty initial state -->
      <div class="empty-state" *ngIf="foods().length === 0 && !searchQuery && !loading()">
        <mat-icon>restaurant_menu</mat-icon>
        <p>Aucun aliment encore.<br>Crée le premier !</p>
      </div>

    </div>

    <!-- FAB -->
    <div class="fab-wrap">
      <button mat-fab extended color="primary" routerLink="/aliments/nouveau">
        <mat-icon>add</mat-icon>
        Nouvel aliment
      </button>
    </div>
  `,
  styles: [`
    .foods-page {
      min-height: 100%;
      background: var(--bg);
      padding-bottom: 88px;
    }

    /* Search bar */
    .search-bar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 16px;
      background: var(--bg);
      border-bottom: 1px solid var(--border);
    }

    .search-input-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      background: var(--surface);
      border: 1.5px solid var(--border);
      border-radius: 14px;
      padding: 0 12px;
      gap: 8px;
      height: 44px;
      transition: border-color 0.15s;
    }
    .search-input-wrap:focus-within { border-color: var(--primary); }

    .search-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--text-3, #9aada5);
      flex-shrink: 0;
    }

    .search-input {
      flex: 1;
      border: none;
      outline: none;
      background: transparent;
      font-family: var(--font);
      font-size: 14px;
      color: var(--text);
      min-width: 0;
    }
    .search-input::placeholder { color: var(--text-3, #9aada5); }

    .clear-btn {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      color: var(--text-3, #9aada5);
    }
    .clear-btn mat-icon { font-size: 18px; width: 18px; height: 18px; }

    .scan-btn {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: var(--primary-light, #dff0e7);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--primary);
      transition: background 0.15s;
    }
    .scan-btn:active { background: #c8e8d4; }
    .scan-btn mat-icon { font-size: 22px; width: 22px; height: 22px; }

    /* Food list */
    .food-list {
      padding: 12px 16px 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .food-row {
      display: flex;
      align-items: center;
      gap: 12px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 12px 14px;
      cursor: pointer;
      transition: background 0.12s;
    }
    .food-row:active { background: #f0f4f1; }

    .food-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: #EDF2EE;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .food-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--text-2, #5a6e65);
    }

    .food-info {
      flex: 1;
      min-width: 0;
    }

    .food-name {
      display: block;
      font-family: var(--font);
      font-size: 14px;
      font-weight: 600;
      color: var(--text);
      line-height: 1.2;
      margin-bottom: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .food-macros {
      display: flex;
      gap: 4px;
    }

    .macro-pill {
      font-family: var(--font);
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 99px;
    }
    .macro-pill.p { background: #EBF4FC; color: #4A8FD4; }
    .macro-pill.c { background: #FFF8E6; color: #CC8800; }
    .macro-pill.f { background: #FFF0E6; color: #E8702A; }

    .food-kcal {
      text-align: right;
      flex-shrink: 0;
    }
    .kcal-value {
      display: block;
      font-family: var(--font);
      font-size: 17px;
      font-weight: 700;
      color: var(--text);
      line-height: 1;
      font-variant-numeric: tabular-nums;
    }
    .kcal-unit {
      font-family: var(--font);
      font-size: 10px;
      color: var(--text-3, #9aada5);
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .chevron {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--border, #e2e8e0);
      flex-shrink: 0;
    }

    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 60px 24px;
      color: var(--text-3, #9aada5);
      text-align: center;
    }
    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      opacity: 0.4;
    }
    .empty-state p {
      font-family: var(--font);
      font-size: 14px;
      margin: 0;
      line-height: 1.5;
    }

    /* Skeleton food rows */
    .sk-food-row { pointer-events: none; }
    .sk-fi { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; }
    .sk-fi-info { flex: 1; display: flex; flex-direction: column; gap: 7px; min-width: 0; }
    .sk-fi-name { width: 55%; height: 12px; border-radius: 4px; }
    .sk-fi-pills { display: flex; gap: 4px; }
    .sk-fi-pill { width: 30px; height: 14px; border-radius: 99px; }
    .sk-fi-kcal { display: flex; flex-direction: column; align-items: flex-end; gap: 5px; flex-shrink: 0; }
    .sk-fi-kval { width: 28px; height: 18px; border-radius: 4px; }
    .sk-fi-klbl { width: 20px; height: 9px; border-radius: 3px; }

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
export class FoodsListComponent implements OnInit {
  router = inject(Router);
  private foodsService = inject(FoodsService);
  foods = signal<Food[]>([]);
  loading = signal(true);
  searchQuery = '';
  private search$ = new Subject<string>();

  ngOnInit() {
    this.search$.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) => this.foodsService.search(q)),
    ).subscribe((foods) => {
      this.foods.set(foods);
      this.loading.set(false);
    });
  }

  onSearch(query: string) { this.loading.set(true); this.search$.next(query); }
  clearSearch() { this.searchQuery = ''; this.search$.next(''); }
}
