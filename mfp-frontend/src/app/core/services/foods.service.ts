import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Food } from '../models/food.model';

@Injectable({ providedIn: 'root' })
export class FoodsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/foods`;

  search(query?: string) {
    return this.http.get<Food[]>(this.base, { params: query ? { search: query } : {} });
  }
  getById(id: string) { return this.http.get<Food>(`${this.base}/${id}`); }
  scan(barcode: string) { return this.http.post<Partial<Food>>(`${this.base}/scan`, { barcode }); }
  create(food: Partial<Food>) { return this.http.post<Food>(this.base, food); }
  update(id: string, food: Partial<Food>) { return this.http.patch<Food>(`${this.base}/${id}`, food); }
  delete(id: string) { return this.http.delete(`${this.base}/${id}`); }
}
