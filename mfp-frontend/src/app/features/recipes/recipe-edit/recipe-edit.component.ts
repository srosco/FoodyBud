import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { RecipesService } from '../../../core/services/recipes.service';
import { RecipeFormComponent } from '../recipe-form/recipe-form.component';
import { Recipe } from '../../../core/models/recipe.model';

@Component({
  selector: 'app-recipe-edit',
  standalone: true,
  imports: [CommonModule, RecipeFormComponent, MatButtonModule],
  template: `
    <h1>Modifier la recette</h1>
    <app-recipe-form *ngIf="recipe()" [initialData]="recipe()!" submitLabel="Enregistrer" (submitted)="onUpdate($event)" />
    <button mat-stroked-button color="warn" (click)="onDelete()">Supprimer</button>
  `,
})
export class RecipeEditComponent implements OnInit {
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
