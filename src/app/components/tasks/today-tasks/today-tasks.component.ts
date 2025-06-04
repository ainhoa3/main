import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TaskDetailComponent } from '../task-detail/task-detail.component';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { TaskService } from '../../../services/task.service';
import { Task, TaskPreview, TaskUpdatingDTO, WORK_ENVIRONMENT, PERSONAL_ENVIRONMENT } from '../../../models/task.model';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-today-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskDetailComponent, SpinnerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <div class="today-tasks-container">
      <h2 class="section-title">Tareas de Hoy</h2>
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
      <div class="tasks-container">
        <div class="tasks-list" *ngIf="filteredTasks.length > 0">
          <div *ngFor="let task of filteredTasks" 
            class="task-item" 
            [class.completed]="task.done" 
            [class.selected]="selectedTaskId === task.id"
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
              <div class="task-environment" [ngClass]="{'work': task.environment === WORK_ENVIRONMENT, 'personal': task.environment === PERSONAL_ENVIRONMENT}">{{ getEnvironmentString(task.environment) }}</div>
              <div class="task-description">{{ task.description }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="loading-container" *ngIf="loading">
        <app-spinner></app-spinner>
      </div>
      <div class="no-tasks" *ngIf="!loading && filteredTasks.length === 0 && tasks.length > 0">
        <p>No hay tareas en este filtro</p>
      </div>
      <div class="no-tasks" *ngIf="tasks.length === 0">
        <p>No hay tareas disponibles</p>
      </div>
    </div>
    <app-task-detail 
      *ngIf="showTaskDetail && selectedTaskId !== null" 
      [taskId]="selectedTaskId!" 
      (close)="closeTaskDetail()"
      (taskUpdated)="taskUpdated()"
      (taskDeleted)="taskDeleted()"
    ></app-task-detail>
  `,
  styles: [`.today-tasks-container:host {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
  }

  .tasks-filters {
    margin-bottom: 1rem;
  }

  .filters-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 0.5rem;
    width: 100%;
  }

  .btn-filter {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem;
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

  .tasks-container {
    flex: 1;
    overflow-y: auto;
    padding-right: 0.5rem;
    margin-right: -0.5rem;
  }

  .tasks-list {
    flex-grow: 1;
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

  .task-checkbox {
    margin-right: 1rem;
    display: flex;
    align-items: center;
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

  .task-content {
    flex-grow: 1;
  }

  .task-title {
    font-weight: 500;
    margin-bottom: 0.2rem;
  }

  .completed-title {
    text-decoration: line-through;
    color: var(--text-secondary);
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

  .task-description {
    font-size: 0.8rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
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

  .selected {
    background-color: var(--success-color-light);
    border-left: 3px solid var(--success-color);
  }

  .no-tasks {
    text-align: center;
    padding: 2rem;
    color: var(--text-secondary);
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

  .filter-icon {
    font-size: 1.2rem;
    margin-right: 0.5rem;
  }

  .filter-text {
    font-size: 0.9rem;
  }

  .filters-container {
    display: flex;
    
    gap: 0.5rem;
    width: 100%;
  }

  .btn-filter {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
  }
`]
})
export class TodayTasksComponent implements OnInit {
  WORK_ENVIRONMENT = WORK_ENVIRONMENT;
  PERSONAL_ENVIRONMENT = PERSONAL_ENVIRONMENT;

  allTasks: TaskPreview[] = [];
  filteredTasks: TaskPreview[] = [];
  currentFilter: number | null = null;
  tasks: TaskPreview[] = [];
  showTaskDetail: boolean = false;
  selectedTaskId: number | null = null;
  loading = false;

  constructor(
    @Inject(TaskService) private taskService: TaskService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  getEnvironmentString(environment: number): string {
    return environment === WORK_ENVIRONMENT ? 'Trabajo' : 'Personal';
  }

  filterEnvironment(environment: number): void {
    this.currentFilter = environment;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.currentFilter === null) {
      this.filteredTasks = this.allTasks;
    } else {
      // 0 for personal, 1 for work
      this.filteredTasks = this.allTasks.filter(task => task.environment === this.currentFilter);
    }
    this.tasks = this.filteredTasks;
    console.log('Filtering tasks:', { environment: this.currentFilter, filteredTasksCount: this.filteredTasks.length });
  }

  clearFilter(): void {
    this.currentFilter = null;
    this.filteredTasks = this.allTasks;
    this.tasks = this.filteredTasks;
  }

  loadTasks(): void {
    this.loading = true;
    this.taskService.getTasksOfTheDayPreview().subscribe({
      next: (tasks: TaskPreview[]) => {
        this.allTasks = tasks;
        this.filteredTasks = tasks;
        this.tasks = tasks;
        this.loading = false;
      },
      error: (error: Error) => {
        console.error('Error loading tasks:', error);
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
            this.filteredTasks[taskIndex].done = true;
          }
          // Add a small delay before refreshing to ensure local state update is completed
          setTimeout(() => {
            this.loadTasks(); // Refresh the list
          }, 100);
        },
        error: (error) => {
          console.error('Error marking task as done:', error);
          this.loading = false;
        }
      });
    }
  }

  getPriorityClass(priority: number): string {
    if (priority > 3) {
      return 'priority-high';
    } else if (priority >= 2) {
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
    this.selectedTaskId = null;
  }

  refreshTasks(): void {
    this.loadTasks();
  }

  taskUpdated(): void {
    // Refresh the task list to get the latest data
    this.loadTasks();
  }

  taskDeleted(): void {
    // Close the detail view and refresh the task list
    this.closeTaskDetail();
    this.loadTasks();
  }
}