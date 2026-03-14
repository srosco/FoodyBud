import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Activity } from '../models/activity.model';

@Injectable({ providedIn: 'root' })
export class ActivitiesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/activities`;

  getByDate(date: string) { return this.http.get<Activity[]>(this.base, { params: { date } }); }
  getById(id: string) { return this.http.get<Activity>(`${this.base}/${id}`); }
  create(activity: Partial<Activity>) { return this.http.post<Activity>(this.base, activity); }
  update(id: string, activity: Partial<Activity>) { return this.http.patch<Activity>(`${this.base}/${id}`, activity); }
  delete(id: string) { return this.http.delete(`${this.base}/${id}`); }
}
