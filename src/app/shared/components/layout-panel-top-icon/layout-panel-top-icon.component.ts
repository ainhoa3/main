import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout-panel-top-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="layout-panel-top-icon" [class.animate]="isHovered">
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
        <!-- Top rectangle (background) -->
        <rect 
          class="top-rect-bg"
          width="18" 
          height="7" 
          x="3" 
          y="3" 
          rx="1" 
        />
        
        <!-- Left rectangle (background) -->
        <rect 
          class="left-rect-bg"
          width="7" 
          height="7" 
          x="3" 
          y="14" 
          rx="1" 
        />
        
        <!-- Right rectangle (background) -->
        <rect 
          class="right-rect-bg"
          width="7" 
          height="7" 
          x="14" 
          y="14" 
          rx="1" 
        />
        
        <!-- Animated rectangles -->
        <rect 
          class="top-rect"
          width="18" 
          height="7" 
          x="3" 
          y="3" 
          rx="1" 
        />
        
        <rect 
          class="left-rect"
          width="7" 
          height="7" 
          x="3" 
          y="14" 
          rx="1" 
        />
        
        <rect 
          class="right-rect"
          width="7" 
          height="7" 
          x="14" 
          y="14" 
          rx="1" 
        />
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      color: #000;
    }
    
    .layout-panel-top-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: 20px;
      height: 20px;
    }
    
    .layout-panel-top-icon svg {
      transition: all 0.3s ease;
      width: 100%;
      height: 100%;
    }
    
    .layout-panel-top-icon:hover svg {
      transform: scale(1.1);
      color: var(--primary-color, #2ecc71);
    }
    
    /* Background rectangles */
    .top-rect-bg,
    .left-rect-bg,
    .right-rect-bg {
      opacity: 0.1;
      stroke: currentColor;
      fill: none;
    }
    
    /* Animated rectangles */
    .top-rect,
    .left-rect,
    .right-rect {
      stroke: #000;
      fill: none;
      transform-origin: center;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    /* Initial state */
    .top-rect {
      opacity: 0;
      transform: translateY(-5px);
    }
    
    .left-rect {
      opacity: 0;
      transform: translateX(-10px);
    }
    
    .right-rect {
      opacity: 0;
      transform: translateX(10px);
    }
    
    /* Animated state */
    .animate .top-rect {
      opacity: 1;
      transform: translateY(0);
      transition: opacity 0.5s ease 0.2s, transform 0.5s ease 0.2s;
    }
    
    .animate .left-rect {
      opacity: 1;
      transform: translateX(0);
      transition: opacity 0.7s ease 0.3s, transform 0.7s ease 0.3s;
    }
    
    .animate .right-rect {
      opacity: 1;
      transform: translateX(0);
      transition: opacity 0.8s ease 0.4s, transform 0.8s ease 0.4s;
    }
    
    :host-context(.active) .layout-panel-top-icon svg {
      color: #000;
    }
  `]
})
export class LayoutPanelTopIconComponent {
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
