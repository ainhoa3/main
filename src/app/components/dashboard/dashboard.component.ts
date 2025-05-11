import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodayTasksComponent } from '../tasks/today-tasks/today-tasks.component';
import { ExtraTasksComponent } from '../tasks/extra-tasks/extra-tasks.component';
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TodayTasksComponent, ExtraTasksComponent, HeaderComponent],
  template: `
    <div class="dashboard-container">
      <app-header [pageName]="'Dashboard'"></app-header>
      
      <div class="dashboard-content">
        <div class="welcome-section">
          <h1>¡Bienvenido a tu día!</h1>
          <p>Aquí puedes ver un resumen de tus tareas y acciones rápidas.</p>
          <div class="action-buttons">
            <button class="btn btn-primary" (click)="createTask()">Nueva Tarea</button>
            <button class="btn btn-outline" (click)="createHabit()">Nuevo Hábito</button>
          </div>
        </div>
        
        <div class="tasks-container">
          <div class="today-tasks">
            <app-today-tasks></app-today-tasks>
          </div>
          <div class="extra-tasks">
            <app-extra-tasks></app-extra-tasks>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .dashboard-content {
      padding: 2rem;
      margin-left: 250px;
      min-height: calc(100vh - 70px);
    }

    .welcome-section {
      margin-bottom: 2rem;
    }

    .welcome-section h1 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .welcome-section p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
    }

    .tasks-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .today-tasks, .extra-tasks {
      background-color: white;
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-md);
      overflow: hidden;
      min-height: 400px;
    }

    @media (max-width: 768px) {
      .dashboard-content {
        margin-left: 60px;
        padding: 1rem;
      }

      .tasks-container {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class DashboardComponent {
  
  constructor(private router: Router) {}
  
  createTask(): void {
    this.router.navigate(['/create-task']);
  }

  createHabit(): void {
    this.router.navigate(['/create-habit']);
  }
}