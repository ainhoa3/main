import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../services/task.service';
import { TaskPreview, Task, Environment, numberToEnvironment, environmentToNumber, getEnvironmentString } from '../../../models/task.model';
import { TaskDetailComponent } from '../task-detail/task-detail.component';

@Component({
  selector: 'app-extra-tasks',
  standalone: true,
  imports: [CommonModule, TaskDetailComponent],
  template: `
    <div class="extra-tasks-container">
      <h2 class="section-title">Tareas Extra</h2>
      <div class="tasks-filters">
        <button class="btn btn-filter" (click)="filterEnvironment(Environment.WORK)" [ngClass]="{'selected': currentFilter === Environment.WORK}">Trabajo</button>
        <button class="btn btn-filter" (click)="filterEnvironment(Environment.PERSONAL)" [ngClass]="{'selected': currentFilter === Environment.PERSONAL}">Personal</button>
        <button class="btn btn-filter" (click)="clearFilter()" [ngClass]="{'selected': currentFilter === null}">Todos</button>
      </div>
      <div class="tasks-list" *ngIf="filteredTasks.length > 0">
        <div *ngFor="let task of filteredTasks" 
          class="task-item" 
          [class.completed]="task.done" 
          [ngClass]="getPriorityClass(task.priority)"
          (click)="openTaskDetail(task.id)">
          <div class="task-title" [ngClass]="{'completed-title': task.done}">{{ task.title }}</div>
          <div class="task-environment">{{ getEnvironmentString(task.environment) }}</div>
        </div>
      </div>
      <div class="no-tasks" *ngIf="filteredTasks.length === 0">
        <p>No hay tareas extra</p>
      </div>
    </div>
    
    <app-task-detail 
      *ngIf="showTaskDetail" 
      [taskId]="selectedTaskId" 
      (close)="closeTaskDetail()"
      (taskUpdated)="refreshTasks()"
    ></app-task-detail>
  `,
  styles: [`
    .extra-tasks-container {
      padding: 1rem;
      height: 100%;
      overflow-y: auto;
    }

    .tasks-filters {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .tasks-filters .btn-filter {
      background-color: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-color);
    }

    .tasks-filters .btn-filter.selected {
      background-color: #2ecc71;
      color: white;
    }

    .task-environment {
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-transform: capitalize;
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

    .task-item {
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
  Environment = Environment;
  tasks: TaskPreview[] = [];
  allTasks: TaskPreview[] = [];
  filteredTasks: TaskPreview[] = [];
  currentFilter: Environment | null = null;
  showTaskDetail: boolean = false;
  selectedTaskId: number = 0;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadExtraTasks();
  }

  loadExtraTasks(): void {
    this.taskService.getExtraTasks().subscribe({
      next: (tasks) => {
        this.allTasks = tasks;
        this.filteredTasks = tasks;
      },
      error: (error) => {
        console.error('Error loading extra tasks:', error);
      }
    });
  }

  filterEnvironment(environment: Environment): void {
    this.currentFilter = environment;
    const environmentNumber = environmentToNumber(environment);
    this.filteredTasks = this.allTasks.filter(task => environmentToNumber(task.environment) === environmentNumber);
    // Always keep tasks list populated to prevent hiding buttons
    this.tasks = this.allTasks;
    console.log('Filtering extra tasks:', { environment, filteredTasksCount: this.filteredTasks.length });
  }

  clearFilter(): void {
    this.currentFilter = null;
    this.filteredTasks = this.allTasks;
    // Reset the tasks list to show all tasks
    this.tasks = this.allTasks;
    console.log('Cleared extra tasks filter');
  }

  getEnvironmentString(environment: Environment): string {
    return getEnvironmentString(environment);
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