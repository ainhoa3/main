import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-logout-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="logout-icon" [class.animate]="isHovered">
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
        <!-- Door (background) -->
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" class="door-bg" />
        <polyline points="16 17 21 12 16 7" class="arrow-bg" />
        <line x1="21" x2="9" y1="12" y2="12" class="line-bg" />
        
        <!-- Animated elements -->
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" class="door" />
        <polyline points="16 17 21 12 16 7" class="arrow" />
        <line x1="21" x2="9" y1="12" y2="12" class="line" />
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      color: #000;
    }
    
    .logout-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: 20px;
      height: 20px;
    }
    
    .logout-icon svg {
      transition: all 0.3s ease;
      width: 100%;
      height: 100%;
    }
    
    .logout-icon:hover svg {
      transform: scale(1.1);
      color: var(--primary-color, #2ecc71);
    }
    
    /* Background elements */
    .door-bg,
    .arrow-bg,
    .line-bg {
      opacity: 0.1;
      stroke: currentColor;
      fill: none;
    }
    
    /* Animated elements */
    .door,
    .arrow,
    .line {
      stroke: currentColor;
      fill: none;
      transition: all 0.4s ease;
    }
    
    /* Initial state */
    .arrow {
      transform: translateX(0);
    }
    
    .line {
      stroke-dasharray: 12;
      stroke-dashoffset: 0;
    }
    
    /* Animated state */
    .animate .arrow {
      animation: arrowMove 0.4s ease forwards;
    }
    
    .animate .line {
      animation: lineDraw 0.4s ease forwards;
    }
    
    @keyframes arrowMove {
      0% {
        transform: translateX(0);
      }
      50% {
        transform: translateX(-3px);
      }
      100% {
        transform: translateX(0);
      }
    }
    
    @keyframes lineDraw {
      0% {
        stroke-dashoffset: 0;
      }
      50% {
        stroke-dashoffset: 12;
      }
      100% {
        stroke-dashoffset: 0;
      }
    }
    
    :host-context(.active) .logout-icon svg {
      color: #000;
    }
  `]
})
export class LogoutIconComponent {
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
