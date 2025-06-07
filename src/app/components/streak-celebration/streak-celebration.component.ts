import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FireAnimationComponent } from '../../shared/components/fire-animation/fire-animation.component';
import { StreakCelebrationService } from './streak-celebration.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-streak-celebration',
  standalone: true,
  imports: [CommonModule, FireAnimationComponent],
  template: `
    <div class="celebration-banner" *ngIf="isVisible">
      <div class="celebration-content">
        <div class="celebration-message">
          <h2>¡Enhorabuena! 🎉</h2>
          <p>¡Has completado tu racha de hoy!</p>
          <p>¡Sigue así! 🔥</p>
        </div>
        <div class="animation-container">
          <app-fire-animation></app-fire-animation>
        </div>
      </div>
      <button class="close-btn" (click)="close()">
        <span>×</span>
      </button>
    </div>
  `,
  styles: [`
    .celebration-banner {
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, #4a90e2, #8e44ad);
      color: white;
      padding: 20px 30px;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      z-index: 1000;
      display: flex;
      align-items: center;
      max-width: 90%;
      animation: slideIn 0.5s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translate(-50%, 100px);
        opacity: 0;
      }
      to {
        transform: translate(-50%, 0);
        opacity: 1;
      }
    }

    .celebration-content {
      display: flex;
      align-items: center;
      gap: 20px;
    }

    .celebration-message {
      text-align: center;
    }

    .celebration-message h2 {
      margin: 0 0 10px 0;
      font-size: 1.5rem;
    }

    .celebration-message p {
      margin: 5px 0;
      font-size: 1.1rem;
    }

    .animation-container {
      width: 100px;
      height: 100px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .close-btn {
      position: absolute;
      top: 10px;
      right: 15px;
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      opacity: 0.8;
      transition: opacity 0.2s;
    }

    .close-btn:hover {
      opacity: 1;
    }

    @media (max-width: 600px) {
      .celebration-banner {
        flex-direction: column;
        padding: 15px;
      }
      
      .celebration-content {
        flex-direction: column;
        text-align: center;
      }
      
      .animation-container {
        margin: 10px 0;
      }
    }
  `]
})
export class StreakCelebrationComponent implements OnInit, OnDestroy {
  isVisible: boolean = false;
  private subscription: Subscription = new Subscription();

  constructor(private streakCelebrationService: StreakCelebrationService) {}

  ngOnInit(): void {
    this.subscription = this.streakCelebrationService.showCelebration$.subscribe(
      show => this.isVisible = show
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  close(): void {
    this.streakCelebrationService.hideCelebration();
  }
}
