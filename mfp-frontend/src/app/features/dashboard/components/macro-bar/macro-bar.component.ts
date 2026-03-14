import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-macro-bar',
  standalone: true,
  imports: [CommonModule, MatProgressBarModule],
  template: `
    <div class="macro-bar">
      <div class="macro-header">
        <span class="label">{{ label }}</span>
        <span class="values">{{ consumed | number:'1.0-1' }} / {{ goal }}{{ unit }}</span>
      </div>
      <mat-progress-bar mode="determinate" [value]="percentage" />
    </div>
  `,
  styles: [`.macro-bar { margin-bottom: 8px; } .macro-header { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }`],
})
export class MacroBarComponent {
  @Input() label = '';
  @Input() consumed = 0;
  @Input() goal = 0;
  @Input() unit = 'g';
  get percentage() { return Math.min((this.consumed / (this.goal || 1)) * 100, 100); }
}
