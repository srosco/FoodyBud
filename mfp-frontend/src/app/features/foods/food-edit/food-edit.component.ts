import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FoodsService } from '../../../core/services/foods.service';
import { FoodFormComponent } from '../food-form/food-form.component';
import { Food } from '../../../core/models/food.model';
import { MatButtonModule } from '@angular/material/button';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-food-edit',
  standalone: true,
  imports: [NgIf, FoodFormComponent, MatButtonModule],
  template: `
    <h1>Modifier un aliment</h1>
    <app-food-form *ngIf="food()" [initialData]="food()!" submitLabel="Enregistrer" (submitted)="onUpdate($event)" />
    <button mat-stroked-button color="warn" (click)="onDelete()">Supprimer</button>
  `,
})
export class FoodEditComponent implements OnInit {
  private foodsService = inject(FoodsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  food = signal<Food | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.foodsService.getById(id).subscribe((f) => this.food.set(f));
  }

  onUpdate(data: Partial<Food>) {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.foodsService.update(id, data).subscribe(() => this.router.navigate(['/aliments']));
  }

  onDelete() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.foodsService.delete(id).subscribe(() => this.router.navigate(['/aliments']));
  }
}
