import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RecipesService } from '../../../core/services/recipes.service';
import { Recipe } from '../../../core/models/recipe.model';

@Component({
  selector: 'app-recipes-list',
  standalone: true,
  imports: [NgFor, NgIf, MatIconModule, MatButtonModule],
  template: `
    <div class="recipes-page page">

      <!-- Recipe list -->
      <div class="recipe-list" *ngIf="recipes().length > 0">
        <div
          class="recipe-row"
          *ngFor="let r of recipes()"
          (click)="router.navigate(['/recettes', r.id, 'edit'])"
        >
          <div class="recipe-icon">
            <mat-icon>menu_book</mat-icon>
          </div>
          <div class="recipe-info">
            <span class="recipe-name">{{ r.name }}</span>
            <div class="recipe-meta">
              <span class="meta-pill">
                {{ r.items.length }} ingrédient{{ r.items.length > 1 ? 's' : '' }}
              </span>
              <span class="meta-pill weight">{{ r.totalWeightG }}g</span>
            </div>
          </div>
          <mat-icon class="chevron">chevron_right</mat-icon>
        </div>
      </div>

      <!-- Empty state -->
      <div class="empty-state" *ngIf="recipes().length === 0">
        <mat-icon>menu_book</mat-icon>
        <p>Aucune recette encore.<br>Crée la première !</p>
      </div>

    </div>

    <!-- FAB -->
    <div class="fab-wrap">
      <button mat-fab extended color="primary" (click)="router.navigate(['/recettes/nouveau'])">
        <mat-icon>add</mat-icon>
        Nouvelle recette
      </button>
    </div>
  `,
  styles: [`
    .recipes-page {
      min-height: 100%;
      background: var(--bg);
      padding: 16px;
      padding-bottom: 88px;
    }

    .recipe-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .recipe-row {
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
    .recipe-row:active { background: #f0f4f1; }

    .recipe-icon {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: #EDF2EE;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .recipe-icon mat-icon {
      font-size: 20px;
      width: 20px;
      height: 20px;
      color: var(--primary);
    }

    .recipe-info {
      flex: 1;
      min-width: 0;
    }

    .recipe-name {
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

    .recipe-meta {
      display: flex;
      gap: 4px;
    }

    .meta-pill {
      font-family: var(--font);
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 99px;
      background: #EDF2EE;
      color: var(--primary);
    }
    .meta-pill.weight {
      background: #FFF8E6;
      color: #CC8800;
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
export class RecipesListComponent implements OnInit {
  router = inject(Router);
  private recipesService = inject(RecipesService);
  recipes = signal<Recipe[]>([]);

  ngOnInit() {
    this.recipesService.getAll().subscribe((r) => this.recipes.set(r));
  }
}
