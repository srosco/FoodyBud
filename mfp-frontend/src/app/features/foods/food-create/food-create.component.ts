import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FoodsService } from '../../../core/services/foods.service';
import { FoodFormComponent } from '../food-form/food-form.component';
import { Food } from '../../../core/models/food.model';

@Component({
  selector: 'app-food-create',
  standalone: true,
  imports: [FoodFormComponent],
  template: `
    <h1>Nouvel aliment</h1>
    <app-food-form submitLabel="Créer" (submitted)="onCreate($event)" />
  `,
})
export class FoodCreateComponent {
  private foodsService = inject(FoodsService);
  private router = inject(Router);

  onCreate(data: Partial<Food>) {
    this.foodsService.create({ ...data, source: 'CUSTOM' }).subscribe(() => {
      this.router.navigate(['/aliments']);
    });
  }
}
