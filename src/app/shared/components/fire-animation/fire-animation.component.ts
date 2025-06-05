import { Component, Input, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationService } from '../../../services/animation.service';

@Component({
  selector: 'app-fire-animation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fire-animation" *ngIf="showAnimation">
      <div class="fire-container">
        <div class="fire">
          <div class="fire-left">
            <div class="main-fire"></div>
            <div class="particle-fire"></div>
          </div>
          <div class="fire-center">
            <div class="main-fire"></div>
            <div class="particle-fire">
              <div class="streak-text">+{{streakData.streak}}</div>
            </div>
          </div>
          <div class="fire-right">
            <div class="main-fire"></div>
            <div class="particle-fire"></div>
          </div>
          <div class="fire-bottom">
            <div class="main-fire"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="felicitation-message" *ngIf="showAnimation">
      <div class="message-content">
        <h2>¡Felicidades!</h2>
        <p>Has completado todas tus tareas y hábitos de hoy</p>
        <p>Tu racha actual es: {{ streak }} días</p>
      </div>
    </div>
  `,
  styles: [`
    .fire-animation {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      background-color: rgba(0, 0, 0, 0.5);
    }

    .fire-container {
      position: relative;
      width: 200px;
      height: 200px;
    }

    .streak-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: #fff;
      font-size: 2rem;
      font-weight: bold;
      text-shadow: 0 0 10px #fff;
      z-index: 10;
    }

    .fire {
      position: absolute;
      top: calc(50% - 50px);
      left: calc(50% - 50px);
      width: 100px;
      height: 100px;
      background-color: transparent;
      z-index: 1000;
    }

    .fire-center {
      position: absolute;
      height: 100%;
      width: 100%;
      animation: scaleUpDown 3s ease-out;
      animation-iteration-count: infinite;
      animation-fill-mode: both;
    }

    .fire-center .main-fire {
      position: absolute;
      width: 100%;
      height: 100%;
      background-image: radial-gradient(farthest-corner at 10px 0, #d43300 0%, #ef5a00 95%);
      transform: scaleX(0.8) rotate(45deg);
      border-radius: 0 40% 60% 40%;
      filter: drop-shadow(0 0 10px #d43322);
    }

    .fire-center .particle-fire {
      position: absolute;
      top: 60%;
      left: 45%;
      width: 10px;
      height: 10px;
      background-color: #ef5a00;
      border-radius: 50%;
      filter: drop-shadow(0 0 10px #d43322);
      animation: particleUp 2s ease-out 0;
      animation-iteration-count: infinite;
      animation-fill-mode: both;
    }

    .fire-right {
      height: 100%;
      width: 100%;
      position: absolute;
      animation: shake 2s ease-out 0;
      animation-iteration-count: infinite;
      animation-fill-mode: both;
    }

    .fire-right .main-fire {
      position: absolute;
      top: 15%;
      right: -25%;
      width: 80%;
      height: 80%;
      background-color: #ef5a00;
      transform: scaleX(0.8) rotate(45deg);
      border-radius: 0 40% 60% 40%;
      filter: drop-shadow(0 0 10px #d43322);
    }

    .fire-right .particle-fire {
      position: absolute;
      top: 45%;
      left: 50%;
      width: 15px;
      height: 15px;
      background-color: #ef5a00;
      transform: scaleX(0.8) rotate(45deg);
      border-radius: 50%;
      filter: drop-shadow(0 0 10px #d43322);
      animation: particleUp 2s ease-out 0;
      animation-iteration-count: infinite;
      animation-fill-mode: both;
    }

    .fire-left {
      position: absolute;
      height: 100%;
      width: 100%;
      animation: shake 3s ease-out 0;
      animation-iteration-count: infinite;
      animation-fill-mode: both;
    }

    .fire-left .main-fire {
      position: absolute;
      top: 15%;
      left: -20%;
      width: 80%;
      height: 80%;
      background-color: #ef5a00;
      transform: scaleX(0.8) rotate(45deg);
      border-radius: 0 40% 60% 40%;
      filter: drop-shadow(0 0 10px #d43322);
    }

    .fire-left .particle-fire {
      position: absolute;
      top: 10%;
      left: 20%;
      width: 10%;
      height: 10%;
      background-color: #ef5a00;
      border-radius: 50%;
      filter: drop-shadow(0 0 10px #d43322);
      animation: particleUp 3s infinite ease-out 0;
      animation-fill-mode: both;
    }

    .fire-bottom .main-fire {
      position: absolute;
      top: 30%;
      left: 20%;
      width: 75%;
      height: 75%;
      background-color: #ff7800;
      transform: scaleX(0.8) rotate(45deg);
      border-radius: 0 40% 100% 40%;
      filter: blur(10px);
      animation: glow 2s ease-out 0;
      animation-iteration-count: infinite;
      animation-fill-mode: both;
    }

    .felicitation-message {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(255, 255, 255, 0.95);
      padding: 20px 40px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
      z-index: 1001;
      opacity: 0;
      transition: opacity 0.3s ease-in-out;
    }

    .felicitation-message.show {
      opacity: 1;
    }

    @keyframes scaleUpDown {
      0%, 100% {
        transform: scaleY(1) scaleX(1);
      }

      50%, 90% {
        transform: scaleY(1.1);
      }

      75% {
        transform: scaleY(0.95);
      }

      80% {
        transform: scaleX(0.95);
      }
    }

    @keyframes shake {
      0%, 100% {
        transform: skewX(0) scale(1);
      }

      50% {
        transform: skewX(5deg) scale(0.9);
      }
    }

    @keyframes particleUp {
      0% {
        opacity: 0;
      }

      20% {
        opacity: 1;
      }

      80% {
        opacity: 1;
      }

      100% {
        opacity: 0;
        top: -100%;
        transform: scale(0.5);
      }
    }

    @keyframes glow {
      0%, 100% {
        background-color: #ef5a00;
      }

      50% {
        background-color: #ff7800;
      }
    }

    .message-content {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .message-content h2 {
      color: #ef5a00;
      margin: 0;
    }

    .message-content p {
      margin: 0;
      color: #333;
    }
  `]
})
export class FireAnimationComponent implements OnInit {
  showAnimation = false;
  streakData: { date: string; streak: number } = { date: '', streak: 0 };

  constructor(private animationService: AnimationService) {
    this.animationService.showFireAnimation$.subscribe(show => {
      this.showAnimation = show;
    });
    this.animationService.streak$.subscribe((streakData: { date: string; streak: number }) => {
      this.streakData = streakData;
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.showAnimation) {
      setTimeout(() => {
        this.showAnimation = false;
      }, 5000);
    }
  }
}
