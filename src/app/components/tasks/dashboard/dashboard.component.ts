import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="welcome-section">
        <h1>¡Bienvenido a DailyFlow!</h1>
        <p>Tu aplicación para gestionar tareas, hábitos y mantenerte organizado.</p>
        <div class="quick-actions">
          <button class="action-btn" (click)="navigateToTasks()">
            <i class="fas fa-tasks"></i>
            <span>Ver Tareas</span>
          </button>
          <button class="action-btn" (click)="navigateToHabits()">
            <i class="fas fa-heart"></i>
            <span>Ver Hábitos</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      min-height: calc(100vh - 140px);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .welcome-section {
      text-align: center;
      padding: 3rem 2rem;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      width: 100%;
    }

    .welcome-section h1 {
      font-size: 2.5rem;
      color: #2c3e50;
      margin-bottom: 1rem;
      font-weight: 700;
    }

    .welcome-section p {
      font-size: 1.25rem;
      color: #6c757d;
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .quick-actions {
      display: flex;
      justify-content: center;
      gap: 1.5rem;
      flex-wrap: wrap;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 2rem;
      border-radius: 8px;
      background-color: #4361ee;
      color: white;
      border: none;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .action-btn:hover {
      background-color: #3a56d4;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(67, 97, 238, 0.2);
    }

    .action-btn i {
      font-size: 1.25rem;
    }

    @media (max-width: 768px) {
      .dashboard-container {
        padding: 1rem;
      }

      .welcome-section {
        padding: 2rem 1rem;
      }

      .welcome-section h1 {
        font-size: 2rem;
      }

      .welcome-section p {
        font-size: 1.1rem;
      }

      .quick-actions {
        flex-direction: column;
        gap: 1rem;
      }

      .action-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class DashboardComponent {
  constructor(private router: Router) {}

  navigateToTasks(): void {
    this.router.navigate(['/tasks']);
  }

  navigateToHabits(): void {
    this.router.navigate(['/habits']);
  }
}