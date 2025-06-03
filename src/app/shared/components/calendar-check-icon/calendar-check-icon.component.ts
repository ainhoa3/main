import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-calendar-check-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="calendar-check-icon">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        [attr.width]="size"
        [attr.height]="size"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <!-- Calendar outline -->
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M3 10h18" />
        
        <!-- Check mark (background) -->
        <path 
          d="M9 16l2 2 4-4" 
          stroke="#000"
          stroke-opacity="0.2"
          fill="none"
        />
        
        <!-- Check mark (animated) -->
        <path 
          class="check-mark"
          d="M9 16l2 2 4-4"
          [style.stroke-dasharray]="isHovered ? '0 1000' : '1000 1000'"
          [style.stroke-dashoffset]="isHovered ? '0' : '1000'"
          fill="none"
        />
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      color: #000;
    }
    
    .calendar-check-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: 20px;
      height: 20px;
    }
    
    .calendar-check-icon svg {
      transition: all 0.3s ease;
      width: 100%;
      height: 100%;
    }
    
    .calendar-check-icon:hover svg {
      transform: scale(1.1);
      color: var(--primary-color, #2ecc71);
    }
    
    .check-mark {
      transition: all 0.6s cubic-bezier(0.65, 0, 0.45, 1);
      stroke: currentColor;
    }
    
    :host-context(.active) .calendar-check-icon svg {
      color: #000;
    }
  `]
})
export class CalendarCheckIconComponent {
  @Input() size: number = 24;
  @Input() isHovered: boolean = false;

  // Public methods to control animation programmatically
  startAnimation() {
    this.isHovered = true;
  }

  stopAnimation() {
    this.isHovered = false;
  }
}
