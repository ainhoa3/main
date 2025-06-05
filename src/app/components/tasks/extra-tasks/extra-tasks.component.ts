import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../services/task.service';
import { TaskPreview, Task, WORK_ENVIRONMENT, PERSONAL_ENVIRONMENT, getEnvironmentString } from '../../../models/task.model';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-extra-tasks',
  standalone: true,
  imports: [CommonModule, TaskDetailComponent, SpinnerComponent],
  template: `
    <div class="extra-tasks-container">
      <h2 class="section-title">Tareas Extra</h2>
      <div class="tasks-filters">
        <div class="filters-container">
          <button class="btn btn-filter" (click)="filterEnvironment(WORK_ENVIRONMENT)" [ngClass]="{'selected': currentFilter === WORK_ENVIRONMENT}">
            <span class="filter-icon">💼</span>
            <span class="filter-text">Trabajo</span>
          </button>
          <button class="btn btn-filter" (click)="filterEnvironment(PERSONAL_ENVIRONMENT)" [ngClass]="{'selected': currentFilter === PERSONAL_ENVIRONMENT}">
            <span class="filter-icon">🏠</span>
            <span class="filter-text">Personal</span>
          </button>
          <button class="btn btn-filter" (click)="clearFilter()" [ngClass]="{'selected': currentFilter === null}">
            <span class="filter-icon">📋</span>
            <span class="filter-text">Todos</span>
          </button>
        </div>
      </div>
      <div class="tasks-list">
        <div class="task-item" *ngFor="let task of filteredTasks" (click)="openTaskDetail(task.id)" [class.completed]="task.done">
          <div class="task-checkbox">
            <input 
              type="checkbox" 
              [checked]="task.done" 
              (click)="$event.stopPropagation()"
              (change)="markAsDone(task.id)"
            >
          </div>
          <div class="task-content">
            <div class="task-title" [ngClass]="{'completed-title': task.done}">{{ task.title }}</div>
            <div class="task-environment" [ngClass]="{'work': task.environment === WORK_ENVIRONMENT, 'personal': task.environment === PERSONAL_ENVIRONMENT}">{{ getEnvironmentString(task.environment) }}</div>
            <div class="task-description">{{ task.description }}</div>
          </div>
        </div>
      </div>
      <div class="loading-container" *ngIf="loading">
        <app-spinner></app-spinner>
      </div>
      <div class="no-tasks" *ngIf="!loading && filteredTasks.length === 0">
        <p>No hay tareas extra</p>
      </div>
    </div>
    
    <app-task-detail 
      *ngIf="showTaskDetail" 
      [taskId]="selectedTaskId" 
      (close)="closeTaskDetail()"
      (taskUpdated)="handleTaskUpdated()"
      (taskDeleted)="handleTaskDeleted()">
    </app-task-detail>
  `,
  styles: [`
    .task-checkbox {
      margin-right: 1rem;
    }

    .task-checkbox input {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: var(--success-color);
      border-radius: 4px;
      border: 2px solid var(--border-color);
      background-color: var(--background-color);
      transition: all 0.2s ease;
    }

    .task-checkbox input:hover {
      border-color: var(--success-color);
    }

    .task-checkbox input:checked {
      background-color: var(--success-color);
      border-color: var(--success-color);
    }

    .extra-tasks-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .tasks-list {
      flex: 1;
      overflow-y: auto;
      padding-right: 0.5rem;
      margin-right: -0.5rem;
    }

    .tasks-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .filters-container {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      width: 100%;
    }

    .btn-filter {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem;
      gap: 0.5rem;
      width: 100%;
      background-color: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-color);
      border-radius: 4px;
      transition: all 0.2s ease;
    }

    .btn-filter:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .btn-filter.selected {
      background-color: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .tasks-filters {
      margin-bottom: 1rem;
    }

    @media (min-width: 768px) {
      .filters-container {
        flex-direction: row;
        flex-wrap: nowrap;
      }
      
      .btn-filter {
        flex: 1;
        min-width: 0;
      }
    }

    .tasks-filters .btn-filter {
      background-color: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-color);
    }

    .tasks-filters .btn-filter.selected {
      background-color: var(--primary-color);
      color: white;
    }

    .task-environment {
      font-size: 0.7rem;
      color: white;
      text-transform: capitalize;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      display: inline-block;
      margin-top: 0.25rem;
      min-width: fit-content;
      font-weight: 500;
    }

    .task-environment.work {
      background-color: #2196F3;
    }

    .task-environment.personal {
      background-color: #4CAF50;
    }

    .task-description-tag {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
    }

    .section-title {
      margin-bottom: 1rem;
      font-size: 1.2rem;
      color: var(--text-color);
    }

    .tasks-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .tasks-container {
      height: 100%;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }

    .tasks-list {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .task-item {
      display: flex;
      align-items: center;
      background-color: white;
      padding: 0.75rem;
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      transition: all var(--transition-fast);
      box-shadow: var(--shadow-sm);
    }

    .task-item:hover {
      box-shadow: var(--shadow-md);
    }

    .task-title {
      font-weight: 500;
    }

    .completed-title {
      text-decoration: line-through;
      color: var(--text-secondary);
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

    .no-tasks {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
    }
  `]
})
export class ExtraTasksComponent implements OnInit {
  WORK_ENVIRONMENT = WORK_ENVIRONMENT;
  PERSONAL_ENVIRONMENT = PERSONAL_ENVIRONMENT;
  tasks: TaskPreview[] = [];
  filteredTasks: TaskPreview[] = [];
  currentFilter: number | null = null;
  selectedTask: Task | null = null;
  loading = false;
  showTaskDetail: boolean = false;
  selectedTaskId: number = 0;

  constructor(private taskService: TaskService) {
    this.filteredTasks = [...this.tasks];
  }

  ngOnInit(): void {
    this.loadExtraTasks();
  }

  applyFilter(): void {
    if (this.currentFilter === null) {
      this.filteredTasks = [...this.tasks];
    } else {
      this.filteredTasks = this.tasks.filter(task => task.environment === this.currentFilter);
    }
  }

  loadExtraTasks(): void {
    this.loading = true;
    this.taskService.getExtraTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.applyFilter();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading extra tasks:', error);
        this.loading = false;
      }
    });
  }

  markAsDone(id: number): void {
    this.loading = true;
    this.taskService.markTaskAsDone(id).subscribe({
      next: () => {
        this.loadExtraTasks();
      },
      error: (error) => {
        console.error('Error marking task as done:', error);
        this.loading = false;
      }
    });
  }

  filterEnvironment(environment: number): void {
    this.currentFilter = environment;
    this.applyFilter();
    console.log('Filtering extra tasks:', { environment, filteredTasksCount: this.filteredTasks.length });
  }

  clearFilter(): void {
    this.currentFilter = null;
    this.applyFilter();
    console.log('Cleared extra tasks filter');
  }

  getEnvironmentString(environment: number): string {
    // 0 for personal, 1 for work
    return environment === 1 ? 'Trabajo' : 'Personal';
  }

  handleTaskUpdated(): void {
    // Refresh the task list to get the latest data
    this.loadExtraTasks();
  }

  handleTaskDeleted(): void {
    // Close the detail view and refresh the task list
    this.closeTaskDetail();
    this.loadExtraTasks();
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

  refreshTasks(): void {
    this.loadExtraTasks();
  }
}