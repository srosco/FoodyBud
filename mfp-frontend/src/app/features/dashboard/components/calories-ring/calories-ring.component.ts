import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calories-ring',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ring-wrap">
      <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="kcal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#E8702A"/>
            <stop offset="100%" stop-color="#F5A623"/>
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="50" fill="none" stroke="#EDF2EE" stroke-width="8"/>
        <circle cx="60" cy="60" r="50" fill="none"
          stroke="url(#kcal-grad)" stroke-width="8"
          stroke-linecap="round"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="dashOffset"
          transform="rotate(-90 60 60)"/>
      </svg>

      <div class="ring-center">
        <span class="ring-value">{{ consumed | number:'1.0-0' }}</span>
        <span class="ring-unit">kcal</span>
        <span class="ring-remaining" [class.over]="remaining < 0">
          {{ remaining >= 0
            ? (remaining | number:'1.0-0') + '\u00a0restantes'
            : ((-remaining) | number:'1.0-0') + '\u00a0dépassées' }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .ring-wrap {
      position: relative;
      width: 200px;
      height: 200px;
      margin: 0 auto;
    }

    svg {
      width: 200px;
      height: 200px;
      display: block;
    }

    .ring-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0;
      pointer-events: none;
    }

    .ring-value {
      font-family: 'DM Sans', sans-serif;
      font-size: 40px;
      font-weight: 700;
      color: #1A2820;
      line-height: 1;
      letter-spacing: -2px;
      font-variant-numeric: tabular-nums;
    }

    .ring-unit {
      font-family: 'DM Sans', sans-serif;
      font-size: 13px;
      font-weight: 600;
      color: #5A6E65;
      margin-top: 2px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    .ring-remaining {
      font-family: 'DM Sans', sans-serif;
      font-size: 11px;
      font-weight: 400;
      color: #9AADA5;
      margin-top: 6px;
      text-align: center;
      line-height: 1.2;
    }

    .ring-remaining.over {
      color: #E8702A;
      font-weight: 600;
    }
  `],
})
export class CaloriesRingComponent {
  @Input() consumed = 0;
  @Input() goal = 2000;

  get circumference() { return 2 * Math.PI * 50; }
  get percentage() { return Math.min((this.consumed / (this.goal || 1)) * 100, 100); }
  get dashOffset() { return this.circumference - (this.percentage / 100) * this.circumference; }
  get remaining() { return this.goal - this.consumed; }
}
