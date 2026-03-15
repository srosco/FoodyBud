import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, NgIf } from '@angular/common';
import { RecipesService } from '../../../core/services/recipes.service';
import { RecipeFormComponent } from '../recipe-form/recipe-form.component';
import { Recipe } from '../../../core/models/recipe.model';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-recipe-edit',
  standalone: true,
  imports: [NgIf, RecipeFormComponent, MatIconModule],
  template: `
    <div class="page">
      <div class="page-header">
        <button class="back-btn" (click)="location.back()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <span class="page-title">Modifier la recette</span>
        <button class="delete-btn" [disabled]="!recipe()" (click)="onDelete()" title="Supprimer">
          <mat-icon>delete_outline</mat-icon>
        </button>
      </div>
      <app-recipe-form *ngIf="recipe()" [initialData]="recipe()!" submitLabel="Enregistrer" (submitted)="onUpdate($event)" />
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
      flex: 1;
    }

    .delete-btn {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      border: none;
      background: #FFF0EE;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: #E84040;
      flex-shrink: 0;
    }
    .delete-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .delete-btn mat-icon { font-size: 20px; width: 20px; height: 20px; }
  `],
})
export class RecipeEditComponent implements OnInit {
  location = inject(Location);
  private recipesService = inject(RecipesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  recipe = signal<Recipe | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.recipesService.getById(id).subscribe((r) => this.recipe.set(r));
  }

  onUpdate(data: any) {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.recipesService.update(id, data).subscribe(() => this.router.navigate(['/recettes']));
  }

  onDelete() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.recipesService.delete(id).subscribe(() => this.router.navigate(['/recettes']));
  }
}
