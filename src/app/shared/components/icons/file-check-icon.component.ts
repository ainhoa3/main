import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { animate, style, transition, trigger, state } from '@angular/animations';

@Component({
  selector: 'app-file-check-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="file-check-icon"
      [class.animate]="isAnimating"
      (mouseenter)="onMouseEnter()"
      (mouseleave)="onMouseLeave()"
      [style.width.px]="size"
      [style.height.px]="size"
    >
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
        <path 
          class="check-path"
          d="m9 15 2 2 4-4" 
          [style.stroke-dasharray]="isAnimating ? '0 1' : '1 0'"
          [style.stroke-dashoffset]="isAnimating ? '1' : '0'"
        />
      </svg>
    </div>
  `,
  styles: [`
    :host {
      display: inline-block;
    }
    
    .file-check-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: currentColor;
      transition: all 0.2s ease;
    }
    
    .check-path {
      transition: stroke-dasharray 0.4s ease-in-out, stroke-dashoffset 0.4s ease-in-out;
    }
    
    .animate .check-path {
      animation: draw 0.4s ease-in-out forwards;
    }
    
    @keyframes draw {
      to {
        stroke-dasharray: 1 0;
        stroke-dashoffset: 0;
      }
    }
  `]
})
export class FileCheckIcon implements OnInit, OnDestroy {
  @Input() size: number | string = 24;
  isAnimating = false;
  private animationTimeout: any;

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    // Iniciar animación al montar
    this.animateOnce();
  }

  ngOnDestroy() {
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
  }

  onMouseEnter() {
    this.animateOnce();
  }

  onMouseLeave() {
    // No es necesario hacer nada al salir
  }

  private animateOnce() {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    
    // Resetear la animación después de que termine
    this.animationTimeout = setTimeout(() => {
      this.isAnimating = false;
    }, 400);
  }
}
