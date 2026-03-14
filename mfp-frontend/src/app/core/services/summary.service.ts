import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Summary } from '../models/summary.model';

@Injectable({ providedIn: 'root' })
export class SummaryService {
  private http = inject(HttpClient);

  get(date: string) {
    return this.http.get<Summary>(`${environment.apiUrl}/summary`, { params: { date } });
  }
}
