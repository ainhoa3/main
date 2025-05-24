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
        <button class="btn btn-filter" (click)="filterEnvironment(WORK_ENVIRONMENT)" [ngClass]="{'selected': currentFilter === WORK_ENVIRONMENT}">Trabajo</button>
        <button class="btn btn-filter" (click)="filterEnvironment(PERSONAL_ENVIRONMENT)" [ngClass]="{'selected': currentFilter === PERSONAL_ENVIRONMENT}">Personal</button>
        <button class="btn btn-filter" (click)="clearFilter()" [ngClass]="{'selected': currentFilter === null}">Todos</button>
      </div>
      <div class="tasks-container">
        <div class="tasks-list" *ngIf="filteredTasks.length > 0">
        <div *ngFor="let task of filteredTasks" 
          class="task-item" 
          [ngClass]="{'completed': task.done}"
          (click)="openTaskDetail(task.id)">
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
            <div class="task-environment {{ task.environment === 0 ? 'work' : 'personal' }}">{{ getEnvironmentString(task.environment) }}</div>
            <div class="task-description-tag">{{ task.description }}</div>
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
      (taskUpdated)="refreshTasks()"
    ></app-task-detail>
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
  allTasks: TaskPreview[] = []; // Added missing property

  constructor(private taskService: TaskService) {
    // Initialize allTasks with tasks
    this.allTasks = [...this.tasks];
  }

  ngOnInit(): void {
    this.loadExtraTasks();
  }

  applyFilter(): void {
    if (this.currentFilter === null) {
      this.filteredTasks = this.allTasks;
    } else {
      // 0 for personal, 1 for work
      this.filteredTasks = this.allTasks.filter((task: TaskPreview) => 
        task.environment === this.currentFilter!
      );
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
    // Only mark as done if it's not already done
    if (!this.filteredTasks.find(task => task.id === id)?.done) {
      this.loading = true;
      this.taskService.markTaskAsDone(id).subscribe({
        next: () => {
          // Update the task locally to prevent flickering
          const taskIndex = this.filteredTasks.findIndex(task => task.id === id);
          if (taskIndex !== -1) {
            this.filteredTasks[taskIndex] = {
              ...this.filteredTasks[taskIndex],
              done: true
            };
          }
          this.loadExtraTasks(); // Refresh the list
        },
        error: (error) => {
          console.error('Error marking task as done:', error);
          this.loading = false;
        }
      });
    }
  }

  filterEnvironment(environment: number): void {
    this.currentFilter = environment;
    this.filteredTasks = this.allTasks.filter(task => task.environment === environment);
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

  getEnvironmentString(environment: number): string {
    // 0 for personal, 1 for work
    return environment === 1 ? 'Trabajo' : 'Personal';
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