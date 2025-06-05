import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-file-check-icon',
  template: `
    <div class="file-check-icon" [class.animate]="isHovered">
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
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
        <!-- Static black checkmark background -->
        <path 
          d="m9 15 2 2 4-4"
          stroke="#000"
          stroke-opacity="0.6"
          stroke-width="2"
          fill="none"
        />
        <!-- Animated checkmark -->
        <path 
          class="check-mark"
          d="m9 15 2 2 4-4"
          [style.stroke-dasharray]="isHovered ? '0 1000' : '1000 1000'"
          [style.stroke-dashoffset]="isHovered ? '0' : '1000'"
        />
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
      color: #000; /* Cambiado a negro para mejor contraste */
    }
    
    .file-check-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      width: 20px;
      height: 20px;
    }
    
    .file-check-icon svg {
      transition: all 0.3s ease;
      width: 100%;
      height: 100%;
    }
    
    .file-check-icon:hover svg {
      transform: scale(1.1);
      color: var(--primary-color, #2ecc71);
    }
    
    .check-mark {
      transition: all 0.6s cubic-bezier(0.65, 0, 0.45, 1);
      stroke: currentColor;
    }
    
    :host-context(.active) .file-check-icon svg {
      color: #000; /* Mantenemos el negro incluso en estado activo */
    }
  `]
})
export class FileCheckIconComponent {
  @Input() size: number = 24;
  @Input() isHovered: boolean = false;

  onMouseEnter() {
    this.isHovered = true;
  }

  onMouseLeave() {
    this.isHovered = false;
  }
}
