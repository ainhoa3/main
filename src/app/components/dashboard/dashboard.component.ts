import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { HabitService } from '../../services/habit.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-content">
        <div class="welcome-section">
          <h1>¡Bienvenido a tu día!</h1>
          <p>¡Hola! Aquí tienes un resumen rápido de tu día.</p>
          <p class="description">* Haz clic en tu racha para ver tus estadísticas y seguir tu progreso.</p>
          
          <div class="quick-stats">
            <div class="stats-item">
              <p class="description">Tareas son acciones específicas que necesitas completar hoy. Nuestro algoritmo las prioriza automáticamente para ayudarte a ser más eficiente.</p>
              <p>Tienes {{todayTasksCount}} tareas hoy</p>
              <button class="btn btn-primary" (click)="goToTasks()">Ver tareas</button>
            </div>
            <div class="stats-item">
              <p class="description">Hábitos son comportamientos que deseas cultivar y hacer parte de tu rutina. Puedes configurar la frecuencia (cada X días) que prefieras para cada hábito.</p>
              <p>Tienes {{todayHabitsCount}} hábitos hoy</p>
              <button class="btn btn-outline" (click)="goToHabits()">Ver hábitos</button>
            </div>
          </div>

          <div class="action-buttons">
            <button class="btn btn-primary" (click)="createTask()">Crear tarea</button>
            <button class="btn btn-outline" (click)="createHabit()">Crear hábito</button>
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

    .quick-stats {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .stats-item {
      background-color: white;
      padding: 1.5rem;
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
    }

    .description {
      color: var(--text-secondary);
      font-size: 0.9rem;
      margin-bottom: 0.5rem;
      opacity: 0.8;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
    }

    @media (max-width: 768px) {
      .dashboard-content {
        
        padding: 1rem;
      }

      .quick-stats {
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
  todayTasksCount = 0;
  todayHabitsCount = 0;
  
  constructor(private router: Router, private taskService: TaskService, private habitService: HabitService) {}

  ngOnInit(): void {
    this.loadTodayStats();
  }

  private async loadTodayStats(): Promise<void> {
    try {
      // Cargar el número de tareas del día
      const todayTasks = await this.taskService.getTasksOfTheDayPreview().toPromise();
      this.todayTasksCount = todayTasks ? todayTasks.length : 0;

      // Cargar el número de hábitos del día
      const todayHabits = await this.habitService.getHabitsOfTheDayPreview().toPromise();
      this.todayHabitsCount = todayHabits ? todayHabits.length : 0;
    } catch (error) {
      console.error('Error loading today stats:', error);
      this.todayTasksCount = 0;
      this.todayHabitsCount = 0;
    }
  }

  createTask(): void {
    this.router.navigate(['/create-task']);
  }

  createHabit(): void {
    this.router.navigate(['/create-habit']);
  }

  goToTasks(): void {
    this.router.navigate(['/tasks']);
  }

  goToHabits(): void {
    this.router.navigate(['/habits']);
  }
}