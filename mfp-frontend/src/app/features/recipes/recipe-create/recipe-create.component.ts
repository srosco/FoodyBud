import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { RecipesService } from '../../../core/services/recipes.service';
import { RecipeFormComponent } from '../recipe-form/recipe-form.component';

@Component({
  selector: 'app-recipe-create',
  standalone: true,
  imports: [RecipeFormComponent],
  template: `<h1>Nouvelle recette</h1><app-recipe-form submitLabel="Créer" (submitted)="onCreate($event)" />`,
})
export class RecipeCreateComponent {
  private recipesService = inject(RecipesService);
  private router = inject(Router);
  onCreate(data: any) {
    this.recipesService.create(data).subscribe(() => this.router.navigate(['/recettes']));
  }
}
