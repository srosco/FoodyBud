import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calories-ring',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg viewBox="0 0 100 100" width="160" height="160">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#e0e0e0" stroke-width="8" />
      <circle cx="50" cy="50" r="45" fill="none" stroke="#3f51b5" stroke-width="8"
        [attr.stroke-dasharray]="circumference"
        [attr.stroke-dashoffset]="dashOffset"
        stroke-linecap="round"
        transform="rotate(-90 50 50)" />
      <text x="50" y="44" text-anchor="middle" font-size="13" fill="#333">
        {{ consumed | number:'1.0-0' }}
      </text>
      <text x="50" y="58" text-anchor="middle" font-size="9" fill="#888">
        / {{ goal }} kcal
      </text>
    </svg>
  `,
})
export class CaloriesRingComponent {
  @Input() consumed = 0;
  @Input() goal = 2000;

  get circumference() { return 2 * Math.PI * 45; }
  get percentage() { return Math.min((this.consumed / (this.goal || 1)) * 100, 100); }
  get dashOffset() { return this.circumference - (this.percentage / 100) * this.circumference; }
}
