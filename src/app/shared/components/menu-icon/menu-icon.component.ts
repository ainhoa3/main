import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-menu-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="menu-icon" [class.animate]="isAnimated || isOpen">
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
        <!-- Top line -->
        <line 
          x1="4" 
          y1="6" 
          x2="20" 
          y2="6" 
          class="line top-line"
        />
        
        <!-- Middle line -->
        <line 
          x1="4" 
          y1="12" 
          x2="20" 
          y2="12" 
          class="line middle-line"
        />
        
        <!-- Bottom line -->
        <line 
          x1="4" 
          y1="18" 
          x2="20" 
          y2="18" 
          class="line bottom-line"
        />
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      color: #000;
    }
    
    .menu-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: 24px;
      height: 24px;
      position: relative;
    }
    
    .menu-icon svg {
      transition: all 0.3s ease;
      width: 100%;
      height: 100%;
    }
    
    .menu-icon:hover svg {
      transform: scale(1.1);
      color: var(--primary-color, #2ecc71);
    }
    
    .line {
      stroke: currentColor;
      transform-origin: center;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Animation for the top line */
    .animate .top-line {
      transform: translateY(6px) rotate(45deg);
    }
    
    /* Animation for the middle line */
    .animate .middle-line {
      opacity: 0;
      transform: scaleX(0);
    }
    
    /* Animation for the bottom line */
    .animate .bottom-line {
      transform: translateY(-6px) rotate(-45deg);
    }
    
    /* When menu is open (X shape) */
    :host-context(.menu-open) .menu-icon {
      color: #000;
    }
    
    :host-context(.menu-open) .menu-icon:hover {
      color: var(--primary-color, #2ecc71);
    }
  `]
})
export class MenuIconComponent {
  @Input() size: number = 24;
  @Input() isAnimated: boolean = false;
  @Input() isOpen: boolean = false;

  // Public methods to control animation programmatically
  startAnimation() {
    this.isAnimated = true;
  }

  stopAnimation() {
    this.isAnimated = false;
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
