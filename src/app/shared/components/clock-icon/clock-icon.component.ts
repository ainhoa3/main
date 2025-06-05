import { Component, Input, HostListener, ElementRef, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-clock-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="clock-icon">
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
        <!-- Clock outline -->
        <circle cx="12" cy="12" r="10" />
        
        <!-- Minute hand (background) -->
        <path 
          d="M12 12l4 0"
          stroke="#000"
          stroke-opacity="0.5"
          stroke-width="2"
          fill="none"
        />
        
        <!-- Hour hand (background) -->
        <path 
          d="M12 12l0 -6"
          stroke="#000"
          stroke-opacity="0.5"
          stroke-width="2"
          fill="none"
        />
        
        <!-- Minute hand (animated) -->
        <path 
          class="minute-hand"
          d="M12 12l4 0"
          [style.stroke-dasharray]="isHovered ? '0 1000' : '1000 1000'"
          [style.stroke-dashoffset]="isHovered ? '0' : '1000'"
        />
        
        <!-- Hour hand (animated) -->
        <path 
          class="hour-hand"
          d="M12 12l0 -6"
          [style.stroke-dasharray]="isHovered ? '0 1000' : '1000 1000'"
          [style.stroke-dashoffset]="isHovered ? '0' : '1000'"
        />
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      color: #000;
    }
    
    .clock-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: 20px;
      height: 20px;
    }
    
    .clock-icon svg {
      transition: all 0.3s ease;
      width: 100%;
      height: 100%;
    }
    
    .clock-icon:hover svg {
      transform: scale(1.1);
      color: var(--primary-color, #2ecc71);
    }
    
    .minute-hand,
    .hour-hand {
      transition: all 0.6s cubic-bezier(0.65, 0, 0.45, 1);
      stroke: currentColor;
    }
    
    :host-context(.active) .clock-icon svg {
      color: #000;
    }
  `]
})
export class ClockIconComponent {
  @Input() size: number = 24;
  @Input() isHovered: boolean = false;

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }

  // Public methods to control animation programmatically
  startAnimation() {
    this.isHovered = true;
  }

  stopAnimation() {
    this.isHovered = false;
  }
}
