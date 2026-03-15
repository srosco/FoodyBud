import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-macro-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="macro-row">
      <div class="macro-label-row">
        <span class="dot" [style.background]="color"></span>
        <span class="label">{{ label }}</span>
        <span class="values">
          <strong>{{ consumed | number:'1.0-0' }}</strong>
          <span class="sep">/</span>
          {{ goal }}{{ unit }}
        </span>
      </div>
      <div class="track">
        <div class="fill" [style.width.%]="percentage" [style.background]="color"></div>
      </div>
    </div>
  `,
  styles: [`
    .macro-row { margin-bottom: 12px; }

    .macro-label-row {
      display: flex;
      align-items: center;
      margin-bottom: 5px;
      font-family: 'DM Sans', sans-serif;
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
      margin-right: 8px;
    }

    .label {
      font-size: 13px;
      font-weight: 500;
      color: #1A2820;
      flex: 1;
    }

    .values {
      font-size: 12px;
      color: #5A6E65;
    }
    .values strong {
      font-weight: 700;
      color: #1A2820;
    }
    .sep {
      margin: 0 2px;
      color: #9AADA5;
    }

    .track {
      height: 6px;
      background: #EDF2EE;
      border-radius: 99px;
      overflow: hidden;
    }

    .fill {
      height: 100%;
      border-radius: 99px;
      transition: width 0.4s cubic-bezier(.4,0,.2,1);
      max-width: 100%;
    }
  `],
})
export class MacroBarComponent {
  @Input() label = '';
  @Input() consumed = 0;
  @Input() goal = 0;
  @Input() unit = 'g';
  @Input() color = '#4A8FD4';

  get percentage() { return Math.min((this.consumed / (this.goal || 1)) * 100, 100); }
}
