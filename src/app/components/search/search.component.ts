import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskService } from '../../services/task.service';
import { HabitService } from '../../services/habit.service';
import { TaskPreview, Environment } from '../../models/task.model';
import { HabitPreview } from '../../models/habit.model';
import { TaskDetailComponent } from '../tasks/task-detail/task-detail.component';
import { SpinnerComponent } from '../shared/spinner/spinner.component';
@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TaskDetailComponent,
    SpinnerComponent
  ],
  template: `
    <div class="search-page">
      <h1>Búsqueda</h1>
      
      <div class="search-container">
        <input 
          type="text" 
          [(ngModel)]="searchTerm" 
          placeholder="Buscar tareas o hábitos..." 
          class="search-input"
          (keyup.enter)="search()"
        >
        <button class="btn btn-primary" (click)="search()">Buscar</button>
      </div>

      <div class="results-container">
        <div class="loading-container" *ngIf="loading">
          <app-spinner></app-spinner>
        </div>
        <div class="tasks-section" *ngIf="hasSearched">
          <h2>Tareas</h2>
          <div *ngIf="tasks.length === 0" class="no-results">
            No se encontraron tareas relacionadas con "{{ searchTerm }}"
          </div>
          <div class="results-list" *ngIf="tasks.length > 0">
            <div *ngFor="let task of tasks" 
              class="result-item task-result" 
              [class.completed]="task.done" 
              [ngClass]="getPriorityClass(task.priority)"
              (click)="openTaskDetail(task.id)">
              <h3 [ngClass]="{'completed-title': task.done}">{{ task.title }}</h3>
              <div class="task-environment {{ getEnvironmentString(task.environment).toLowerCase() }}">{{ getEnvironmentString(task.environment) }}</div>
              <p class="task-description">{{ task.description }}</p>
            </div>
          </div>
        </div>

        <div class="habits-section" *ngIf="hasSearched">
          <h2>Hábitos</h2>
          <div *ngIf="habits.length === 0" class="no-results">
            No se encontraron hábitos relacionados con "{{ searchTerm }}"
          </div>
          <div class="results-list" *ngIf="habits.length > 0">
            <div *ngFor="let habit of habits" 
              class="result-item habit-result"
              [ngClass]="getPriorityClass(habit.priority)">
              <h3>{{ habit.title }}</h3>
              <div class="habit-environment">{{ habit.environment }}</div>
            </div>
          </div>
        </div>
      </div>

      <app-task-detail 
        *ngIf="showTaskDetail" 
        [taskId]="selectedTaskId" 
        (close)="closeTaskDetail()"
        (taskUpdated)="search()"
      ></app-task-detail>
    </div>
  `,
  styles: [`
    .search-page {
      padding: 2rem;
      min-height: calc(100vh - 70px);
      position: relative;
    }

    .loading-container {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.8);
      z-index: 1000;
    }

    h1 {
      margin-bottom: 1.5rem;
      font-size: 1.8rem;
    }

    .search-container {
      display: flex;
      margin-bottom: 2rem;
    }

    .search-input {
      flex-grow: 1;
      padding: 0.75rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius-sm);
      font-size: 1rem;
      margin-right: 0.75rem;
    }

    .search-input:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
    }

    .results-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .results-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .result-item {
      background-color: white;
      padding: 1rem;
      border-radius: var(--border-radius-sm);
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
    }

    .task-result {
      cursor: pointer;
    }

    .task-result:hover {
      box-shadow: var(--shadow-md);
    }

    .result-item h3 {
      margin-bottom: 0.3rem;
      font-size: 1.1rem;
    }

    .completed-title {
      text-decoration: line-through;
      color: var(--text-secondary);
    }

    .task-environment {
      font-size: 0.7rem;
      color: white;
      text-transform: capitalize;
      padding: 0.2rem 0.5rem;
      border-radius: 12px;
      display: inline-block;
      margin-top: 0.25rem;
      min-width: fit-content;
    }

    .task-environment.work {
      background-color: var(--primary-color);
    }

    .task-environment.personal {
      background-color: var(--secondary-color);
    }

    .task-description {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: 0.5rem;
    }

    .task-description.completed {
      color: var(--text-tertiary);
    }

    .no-results {
      padding: 1.5rem;
      color: var(--text-secondary);
      background-color: var(--background-color);
      border-radius: var(--border-radius-sm);
      text-align: center;
    }

    .priority-high {
      border-left: 3px solid var(--error-color);
    }

    .priority-medium {
      border-left: 3px solid var(--warning-color);
    }

    .priority-low {
      border-left: 3px solid var(--success-color);
    }

    .completed {
      opacity: 0.7;
    }

    .tasks-section h2, .habits-section h2 {
      margin-bottom: 1rem;
      font-size: 1.3rem;
    }

    @media (min-width: 768px) {
      .results-container {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class SearchComponent {
  searchTerm: string = '';
  tasks: TaskPreview[] = [];
  habits: HabitPreview[] = [];
  hasSearched: boolean = false;
  showTaskDetail: boolean = false;
  selectedTaskId: number = 0;
  loading: boolean = false;
  
  getEnvironmentString(environment: Environment): string {
    return environment === Environment.WORK ? 'Trabajo' : 'Personal';
  }

  constructor(
    @Inject(TaskService) private taskService: TaskService, 
    @Inject(HabitService) private habitService: HabitService
  ) {}

  search(): void {
    if (this.searchTerm.trim()) {
      this.loading = true;
      
      // Search tasks
      this.taskService.searchTasks(this.searchTerm).subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.hasSearched = true;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error searching tasks:', error);
          this.loading = false;
        }
      });

      // Search habits
      this.habitService.searchHabits(this.searchTerm).subscribe({
        next: (habits) => {
          this.habits = habits;
          this.hasSearched = true;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error searching habits:', error);
          this.loading = false;
        }
      });
    }
  }

  getPriorityClass(priority: number): string {
    if (priority >= 7) {
      return 'priority-high';
    } else if (priority >= 4) {
      return 'priority-medium';
    } else {
      return 'priority-low';
    }
  }

  openTaskDetail(taskId: number): void {
    this.selectedTaskId = taskId;
    this.showTaskDetail = true;
  }

  closeTaskDetail(): void {
    this.showTaskDetail = false;
  }
}