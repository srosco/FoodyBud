import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ActivitiesService } from '../../../core/services/activities.service';
import { ActivityFormComponent } from '../activity-form/activity-form.component';

@Component({
  selector: 'app-activity-create',
  standalone: true,
  imports: [ActivityFormComponent],
  template: `<h1>Nouvelle activité</h1><app-activity-form submitLabel="Ajouter" (submitted)="onCreate($event)" />`,
})
export class ActivityCreateComponent {
  private activitiesService = inject(ActivitiesService);
  private router = inject(Router);
  onCreate(data: any) {
    this.activitiesService.create(data).subscribe(() => this.router.navigate(['/']));
  }
}
