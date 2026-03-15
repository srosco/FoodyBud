import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { RecipesService } from '../../../core/services/recipes.service';
import { RecipeFormComponent } from '../recipe-form/recipe-form.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recipe-create',
  standalone: true,
  imports: [RecipeFormComponent, MatIconModule],
  template: `
    <div class="page">
      <div class="page-header">
        <button class="back-btn" (click)="location.back()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="page-title">Nouvelle recette</span>
      </div>
      <app-recipe-form submitLabel="Créer la recette" (submitted)="onCreate($event)" />
    </div>
  `,
  styles: [`
    .page { min-height: 100%; background: var(--bg); }

    .page-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 16px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .back-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: none;
      background: #EDF2EE;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--primary);
      flex-shrink: 0;
    }
    .back-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }

    .page-title {
      font-family: var(--font);
      font-size: 17px;
      font-weight: 700;
      color: var(--text);
    }
  `],
})
export class RecipeCreateComponent {
  location = inject(Location);
  private recipesService = inject(RecipesService);
  private router = inject(Router);

  onCreate(data: any) {
    this.recipesService.create(data).subscribe(() => this.router.navigate(['/recettes']));
  }
}
