import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, NativeDateAdapter, DateAdapter, MAT_DATE_LOCALE } from '@angular/material/core';

class MondayFirstDateAdapter extends NativeDateAdapter {
  override getFirstDayOfWeek(): number { return 1; }
}

@Component({
  selector: 'app-journal',
  standalone: true,
  imports: [MatDatepickerModule, MatNativeDateModule],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: DateAdapter, useClass: MondayFirstDateAdapter, deps: [MAT_DATE_LOCALE] },
  ],
  template: `
    <div class="journal-page page">
      <div class="journal-header">
        <p class="journal-subtitle">Sélectionne un jour pour voir ton journal</p>
      </div>
      <div class="calendar-wrap">
        <mat-calendar [maxDate]="today" (selectedChange)="onDateSelected($event)" />
      </div>
    </div>
  `,
  styles: [`
    .journal-page {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 24px 16px 32px;
      min-height: 100%;
      background: var(--bg);
    }

    .journal-header {
      width: 100%;
      max-width: 360px;
      margin-bottom: 16px;
      text-align: center;
    }

    .journal-subtitle {
      font-family: var(--font);
      font-size: 13px;
      color: var(--text-3, #9aada5);
      margin: 0;
    }

    .calendar-wrap {
      width: 100%;
      max-width: 360px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 8px 12px 16px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    }

    .calendar-wrap ::ng-deep .mat-calendar {
      width: 100%;
      font-family: var(--font);
    }

    .calendar-wrap ::ng-deep .mat-calendar-header {
      padding: 8px 8px 0;
    }

    .calendar-wrap ::ng-deep .mat-calendar-period-button {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 15px;
      color: var(--text);
    }

    .calendar-wrap ::ng-deep .mat-calendar-body-selected {
      background-color: var(--primary);
      color: #fff;
      border-radius: 50%;
    }

    .calendar-wrap ::ng-deep .mat-calendar-body-today:not(.mat-calendar-body-selected) {
      border-color: var(--primary);
    }

    .calendar-wrap ::ng-deep .mat-calendar-body-cell-content {
      font-family: var(--font);
      font-size: 13px;
    }

    .calendar-wrap ::ng-deep .mat-calendar-table-header th {
      font-family: var(--font);
      font-size: 11px;
      font-weight: 600;
      color: var(--text-3, #9aada5);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  `],
})
export class JournalComponent {
  private router = inject(Router);
  today = new Date();

  onDateSelected(date: Date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    this.router.navigate(['/'], { queryParams: { date: `${y}-${m}-${d}` } });
  }
}
