import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Meal } from '../models/meal.model';

@Injectable({ providedIn: 'root' })
export class MealsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/meals`;

  getByDate(date: string) { return this.http.get<Meal[]>(this.base, { params: { date } }); }
  getById(id: string) { return this.http.get<Meal>(`${this.base}/${id}`); }
  create(meal: Partial<Meal>) { return this.http.post<Meal>(this.base, meal); }
  update(id: string, meal: Partial<Meal>) { return this.http.patch<Meal>(`${this.base}/${id}`, meal); }
  delete(id: string) { return this.http.delete(`${this.base}/${id}`); }
}
