import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-delete-icon',
  standalone: true,
  inputs: ['size', 'isHovered', 'isAnimated'],
  template: `
    <div class="delete-icon" [class.animate]="isAnimated || isHovered">
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
        <!-- Lid (top part) -->
        <g class="lid">
          <path d="M3 6h18" />
          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        </g>
        
        <!-- Bin body -->
        <path class="bin-body" d="M19 8v12c0 1-1 2-2 2H7c-1 0-2-1-2-2V8" />
        
        <!-- Lines -->
        <line class="line line-1" x1="10" x2="10" y1="11" y2="17" />
        <line class="line line-2" x1="14" x2="14" y1="11" y2="17" />
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      color: #ff6b6b;
    }
    
    .delete-icon {
      display: inline-block;
      cursor: pointer;
      transition: transform 0.2s ease-in-out;
    }
    
    .delete-icon.animate {
      animation: shake 0.5s ease-in-out;
    }
    
    .delete-icon:hover {
      transform: scale(1.1);
    }
    
    .delete-icon:active {
      transform: scale(0.95);
    }
    
    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      20%, 60% { transform: translateX(-2px); }
      40%, 80% { transform: translateX(2px); }
    }
  `]
})
export class DeleteIconComponent {
  @Input() size: number = 24;
  @Input() isAnimated: boolean = false;
  @Input() isHovered: boolean = false;

  // Public methods to control animation programmatically
  startAnimation() {
    this.isAnimated = true;
  }

  stopAnimation() {
    this.isAnimated = false;
  }
}
