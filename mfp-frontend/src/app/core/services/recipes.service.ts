import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Recipe } from '../models/recipe.model';

@Injectable({ providedIn: 'root' })
export class RecipesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/recipes`;

  getAll() { return this.http.get<Recipe[]>(this.base); }
  getById(id: string) { return this.http.get<Recipe>(`${this.base}/${id}`); }
  create(recipe: Partial<Recipe>) { return this.http.post<Recipe>(this.base, recipe); }
  update(id: string, recipe: Partial<Recipe>) { return this.http.patch<Recipe>(`${this.base}/${id}`, recipe); }
  delete(id: string) { return this.http.delete(`${this.base}/${id}`); }
}
