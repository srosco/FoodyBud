import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [MatDatepickerModule, MatNativeDateModule, MatCardModule],
  template: `
    <h1>Journal</h1>
    <mat-card>
      <mat-calendar [maxDate]="today" (selectedChange)="onDateSelected($event)" />
    </mat-card>
  `,
})
export class JournalComponent {
  private router = inject(Router);
  today = new Date();

  onDateSelected(date: Date) {
    const dateStr = date.toISOString().split('T')[0];
    this.router.navigate(['/'], { queryParams: { date: dateStr } });
  }
}
