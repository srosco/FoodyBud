import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Goal } from '../models/goal.model';

@Injectable({ providedIn: 'root' })
export class GoalsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/goals`;

  get() { return this.http.get<Goal>(this.base); }
  update(goal: Partial<Goal>) { return this.http.put<Goal>(this.base, goal); }
}
