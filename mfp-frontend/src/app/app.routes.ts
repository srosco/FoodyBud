import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { Router } from '@angular/router';

const redirectIfAuthenticated = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isTokenValid() ? router.createUrlTree(['/']) : true;
};

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [redirectIfAuthenticated],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    canActivate: [redirectIfAuthenticated],
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'journal', loadComponent: () => import('./features/journal/journal.component').then(m => m.JournalComponent) },
      { path: 'aliments', loadComponent: () => import('./features/foods/foods-list/foods-list.component').then(m => m.FoodsListComponent) },
      { path: 'aliments/scan', loadComponent: () => import('./features/foods/food-scan/food-scan.component').then(m => m.FoodScanComponent) },
      { path: 'aliments/nouveau', loadComponent: () => import('./features/foods/food-create/food-create.component').then(m => m.FoodCreateComponent) },
      { path: 'aliments/:id/edit', loadComponent: () => import('./features/foods/food-edit/food-edit.component').then(m => m.FoodEditComponent) },
      { path: 'recettes', loadComponent: () => import('./features/recipes/recipes-list/recipes-list.component').then(m => m.RecipesListComponent) },
      { path: 'recettes/nouveau', loadComponent: () => import('./features/recipes/recipe-create/recipe-create.component').then(m => m.RecipeCreateComponent) },
      { path: 'recettes/:id/edit', loadComponent: () => import('./features/recipes/recipe-edit/recipe-edit.component').then(m => m.RecipeEditComponent) },
      { path: 'repas/nouveau', loadComponent: () => import('./features/meals/meal-create/meal-create.component').then(m => m.MealCreateComponent) },
      { path: 'repas/:id/edit', loadComponent: () => import('./features/meals/meal-edit/meal-edit.component').then(m => m.MealEditComponent) },
      { path: 'activites/nouveau', loadComponent: () => import('./features/activities/activity-create/activity-create.component').then(m => m.ActivityCreateComponent) },
      { path: 'activites/:id/edit', loadComponent: () => import('./features/activities/activity-edit/activity-edit.component').then(m => m.ActivityEditComponent) },
      { path: 'objectifs', loadComponent: () => import('./features/goals/goals.component').then(m => m.GoalsComponent) },
    ],
  },
  { path: '**', redirectTo: '' },
];
