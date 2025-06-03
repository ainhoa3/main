import { Component, Input, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="search-icon">
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
        <!-- Circle (background) -->
        <circle cx="11" cy="11" r="8" fill="none" stroke="#000" stroke-opacity="0.1" />
        
        <!-- Line (background) -->
        <path d="m21 21-4.3-4.3" stroke="#000" stroke-opacity="0.1" />
        
        <!-- Check mark (background) -->
        <path 
          d="M8 12l2 2 4-4" 
          stroke="#000"
          stroke-opacity="0.1"
          fill="none"
        />
        
        <!-- Animated circle -->
        <circle 
          class="search-circle" 
          cx="11" 
          cy="11" 
          r="8" 
          fill="none"
          [style.stroke-dasharray]="isHovered ? '0 1000' : '1000 1000'"
          [style.stroke-dashoffset]="isHovered ? '0' : '1000'"
        />
        
        <!-- Animated check mark -->
        <path 
          class="check-mark"
          d="M8 12l2 2 4-4"
          [style.stroke-dasharray]="isHovered ? '0 1000' : '1000 1000'"
          [style.stroke-dashoffset]="isHovered ? '0' : '1000'"
        />
        
        <!-- Animated line -->
        <path 
          class="search-line" 
          d="m21 21-4.3-4.3"
          [style.stroke-dasharray]="isHovered ? '0 1000' : '1000 1000'"
          [style.stroke-dashoffset]="isHovered ? '0' : '1000'"
        />
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      --icon-color: #000;
      --hover-color: var(--primary-color, #2ecc71);
      color: #000;
    }
    
    .search-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: 20px;
      height: 20px;
    }
    
    .search-icon svg {
      transition: all 0.3s ease;
      width: 100%;
      height: 100%;
    }
    
    .search-icon:hover svg {
      transform: scale(1.1);
      color: var(--hover-color);
    }
    
    .search-circle,
    .search-line,
    .check-mark {
      transition: all 0.3s ease;
      stroke: #000;
    }
    
    .search-icon:hover .search-circle,
    .search-icon:hover .search-line,
    .search-icon:hover .check-mark {
      stroke: currentColor;
    }
    
    :host-context(.active) .search-icon svg {
      --icon-color: #000;
    }
  `]
})
export class SearchIconComponent {
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
