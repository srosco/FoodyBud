import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { RecipesService } from '../../../core/services/recipes.service';
import { Recipe } from '../../../core/models/recipe.model';

@Component({
  selector: 'app-recipes-list',
  standalone: true,
  imports: [CommonModule, MatListModule, MatButtonModule, RouterLink],
  template: `
    <div class="page-header">
      <h1>Mes recettes</h1>
      <button mat-raised-button routerLink="/recettes/nouveau">+ Créer</button>
    </div>
    <mat-list>
      <mat-list-item *ngFor="let r of recipes()">
        <span matListItemTitle>{{ r.name }}</span>
        <span matListItemLine>{{ r.totalWeightG }}g total · {{ r.items.length }} ingrédients</span>
        <button mat-button (click)="router.navigate(['/recettes', r.id, 'edit'])">Modifier</button>
      </mat-list-item>
    </mat-list>
  `,
})
export class RecipesListComponent implements OnInit {
  router = inject(Router);
  private recipesService = inject(RecipesService);
  recipes = signal<Recipe[]>([]);
  ngOnInit() { this.recipesService.getAll().subscribe((r) => this.recipes.set(r)); }
}
