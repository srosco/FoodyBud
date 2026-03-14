import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MealsService } from '../../../core/services/meals.service';
import { MealFormComponent } from '../meal-form/meal-form.component';

@Component({
  selector: 'app-meal-edit',
  standalone: true,
  imports: [CommonModule, MealFormComponent, MatButtonModule],
  template: `
    <h1>Modifier le repas</h1>
    <app-meal-form *ngIf="meal()" [initialData]="meal()!" submitLabel="Enregistrer" (submitted)="onUpdate($event)" />
    <button mat-stroked-button color="warn" [disabled]="!meal()" (click)="onDelete()">Supprimer</button>
  `,
})
export class MealEditComponent implements OnInit {
  private mealsService = inject(MealsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  meal = signal<any>(null);
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.mealsService.getById(id).subscribe((m) => this.meal.set(m));
  }
  onUpdate(data: any) {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.mealsService.update(id, data).subscribe(() => this.router.navigate(['/']));
  }
  onDelete() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.mealsService.delete(id).subscribe(() => this.router.navigate(['/']));
  }
}
