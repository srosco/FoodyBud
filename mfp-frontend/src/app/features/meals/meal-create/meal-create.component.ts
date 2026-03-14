import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MealsService } from '../../../core/services/meals.service';
import { MealFormComponent } from '../meal-form/meal-form.component';

@Component({
  selector: 'app-meal-create',
  standalone: true,
  imports: [MealFormComponent],
  template: `
    <h1>Nouveau repas</h1>
    <app-meal-form submitLabel="Créer" [defaultDate]="defaultDate" (submitted)="onCreate($event)" />
  `,
})
export class MealCreateComponent {
  private mealsService = inject(MealsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  defaultDate = this.route.snapshot.queryParamMap.get('date') ?? new Date().toISOString().split('T')[0];

  onCreate(data: any) {
    this.mealsService.create(data).subscribe(() => this.router.navigate(['/']));
  }
}
