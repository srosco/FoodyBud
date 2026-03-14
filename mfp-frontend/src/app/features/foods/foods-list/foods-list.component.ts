import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgFor } from '@angular/common';
import { FoodsService } from '../../../core/services/foods.service';
import { Food } from '../../../core/models/food.model';
import { debounceTime, distinctUntilChanged, Subject, switchMap } from 'rxjs';

@Component({
  selector: 'app-foods-list',
  standalone: true,
  imports: [NgFor, RouterLink, FormsModule, MatListModule, MatInputModule, MatButtonModule, MatIconModule, MatFormFieldModule],
  template: `
    <div class="page-header">
      <h1>Mes aliments</h1>
      <div class="actions">
        <button mat-raised-button routerLink="/aliments/nouveau">+ Créer</button>
        <button mat-stroked-button routerLink="/aliments/scan">Scan</button>
      </div>
    </div>
    <mat-form-field appearance="outline" class="search-field">
      <mat-label>Rechercher</mat-label>
      <input matInput [(ngModel)]="searchQuery" (ngModelChange)="onSearch($event)" />
    </mat-form-field>
    <mat-list>
      <mat-list-item *ngFor="let food of foods()">
        <span matListItemTitle>{{ food.name }}</span>
        <span matListItemLine>{{ food.calories }} kcal · P {{ food.proteins }}g · G {{ food.carbs }}g · L {{ food.fat }}g</span>
        <button mat-icon-button (click)="router.navigate(['/aliments', food.id, 'edit'])">
          <mat-icon>edit</mat-icon>
        </button>
      </mat-list-item>
    </mat-list>
  `,
})
export class FoodsListComponent implements OnInit {
  router = inject(Router);
  private foodsService = inject(FoodsService);
  foods = signal<Food[]>([]);
  searchQuery = '';
  private search$ = new Subject<string>();

  ngOnInit() {
    this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((q) => this.foodsService.search(q)),
    ).subscribe((foods) => this.foods.set(foods));
    this.onSearch('');
  }

  onSearch(query: string) { this.search$.next(query); }
}
