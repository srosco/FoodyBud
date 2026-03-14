import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ActivitiesService } from '../../../core/services/activities.service';
import { ActivityFormComponent } from '../activity-form/activity-form.component';

@Component({
  selector: 'app-activity-edit',
  standalone: true,
  imports: [CommonModule, ActivityFormComponent, MatButtonModule],
  template: `
    <h1>Modifier l'activité</h1>
    <app-activity-form *ngIf="activity()" [initialData]="activity()!" submitLabel="Enregistrer" (submitted)="onUpdate($event)" />
    <button mat-stroked-button color="warn" [disabled]="!activity()" (click)="onDelete()">Supprimer</button>
  `,
})
export class ActivityEditComponent implements OnInit {
  private activitiesService = inject(ActivitiesService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  activity = signal<any>(null);
  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.activitiesService.getById(id).subscribe((a) => this.activity.set(a));
  }
  onUpdate(data: any) {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.activitiesService.update(id, data).subscribe(() => this.router.navigate(['/']));
  }
  onDelete() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.activitiesService.delete(id).subscribe(() => this.router.navigate(['/']));
  }
}
