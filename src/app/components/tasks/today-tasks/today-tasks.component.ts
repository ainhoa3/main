import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../../services/task.service';
import { TaskPreview, Environment, getEnvironmentString } from '../../../models/task.model';
import { TaskDetailComponent } from '../../tasks/task-detail/task-detail.component';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-today-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TaskDetailComponent, SpinnerComponent],
  template: `
    <div class="today-tasks-container">
      <h2 class="section-title">Tareas de Hoy</h2>
      <div class="tasks-filters">
        <button class="btn btn-filter" (click)="filterEnvironment(Environment.WORK)" [ngClass]="{'selected': currentFilter === Environment.WORK}">Trabajo</button>
        <button class="btn btn-filter" (click)="filterEnvironment(Environment.PERSONAL)" [ngClass]="{'selected': currentFilter === Environment.PERSONAL}">Personal</button>
        <button class="btn btn-filter" (click)="clearFilter()" [ngClass]="{'selected': currentFilter === null}">Todos</button>
      </div>
      <div class="tasks-container">
        <div class="tasks-list" *ngIf="filteredTasks.length > 0">
          <div *ngFor="let task of filteredTasks" 
            class="task-item" 
            [class.completed]="task.done" 
            [class.selected]="selectedTaskId === task.id"
            [ngClass]="getPriorityClass(task.priority)"
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
              <div class="task-environment {{ getEnvironmentString(task.environment).toLowerCase() }}">{{ getEnvironmentString(task.environment) }}</div>
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
        <p>No hay tareas para hoy</p>
      </div>
    </div>
    
    <app-task-detail 
      *ngIf="showTaskDetail && selectedTaskId !== null" 
      [taskId]="selectedTaskId!" 
      (close)="closeTaskDetail()"
      (taskUpdated)="refreshTasks()"
    ></app-task-detail>
  `,
  styles: [`
    /* From Uiverse.io by 00Kubi */ 
    .neon-checkbox {
      --primary: #00ffaa;
      --primary-dark: #00cc88;
      --primary-light: #88ffdd;
      --size: 30px;
      position: relative;
      width: var(--size);
      height: var(--size);
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }

    .neon-checkbox input {
      display: none;
    }

    .neon-checkbox__frame {
      position: relative;
      width: 100%;
      height: 100%;
    }

    .neon-checkbox__box {
      position: absolute;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      border-radius: 4px;
      border: 2px solid var(--primary-dark);
      transition: all 0.4s ease;
    }

    .neon-checkbox__check-container {
      position: absolute;
      inset: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .neon-checkbox__check {
      width: 80%;
      height: 80%;
      fill: none;
      stroke: var(--primary);
      stroke-width: 3;
      stroke-linecap: round;
      stroke-linejoin: round;
      stroke-dasharray: 40;
      stroke-dashoffset: 40;
      transform-origin: center;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .neon-checkbox__glow {
      position: absolute;
      inset: -2px;
      border-radius: 6px;
      background: var(--primary);
      opacity: 0;
      filter: blur(8px);
      transform: scale(1.2);
      transition: all 0.4s ease;
    }

    .neon-checkbox__borders {
      position: absolute;
      inset: 0;
      border-radius: 4px;
      overflow: hidden;
    }

    .neon-checkbox__borders span {
      position: absolute;
      width: 40px;
      height: 1px;
      background: var(--primary);
      opacity: 0;
      transition: opacity 0.4s ease;
    }

    .neon-checkbox__borders span:nth-child(1) {
      top: 0;
      left: -100%;
      animation: borderFlow1 2s linear infinite;
    }

    .neon-checkbox__borders span:nth-child(2) {
      top: -100%;
      right: 0;
      width: 1px;
      height: 40px;
      animation: borderFlow2 2s linear infinite;
    }

    .neon-checkbox__borders span:nth-child(3) {
      bottom: 0;
      right: -100%;
      animation: borderFlow3 2s linear infinite;
    }

    .neon-checkbox__borders span:nth-child(4) {
      bottom: -100%;
      left: 0;
      width: 1px;
      height: 40px;
      animation: borderFlow4 2s linear infinite;
    }

    .neon-checkbox__particles span {
      position: absolute;
      width: 4px;
      height: 4px;
      background: var(--primary);
      border-radius: 50%;
      opacity: 0;
      pointer-events: none;
      top: 50%;
      left: 50%;
      box-shadow: 0 0 6px var(--primary);
    }

    .neon-checkbox__rings {
      position: absolute;
      inset: -20px;
      pointer-events: none;
    }

    .neon-checkbox__rings .ring {
      position: absolute;
      inset: 0;
      border-radius: 50%;
      border: 1px solid var(--primary);
      opacity: 0;
      transform: scale(0);
    }

    .neon-checkbox__sparks span {
      position: absolute;
      width: 20px;
      height: 1px;
      background: linear-gradient(90deg, var(--primary), transparent);
      opacity: 0;
    }

    .today-tasks-container {
      padding: 1rem;
      height: 100%;
      overflow-y: auto;
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
  `]
})
export class TodayTasksComponent implements OnInit {
  Environment = Environment;

  filterEnvironment(environment: Environment): void {
    this.currentFilter = environment;
    const environmentNumber = this.convertToEnvironment(0); // Convertir WORK a número
    this.filteredTasks = this.allTasks.filter(task => this.convertToEnvironment(0) === task.environment);
    // Always keep tasks list populated to prevent hiding buttons
    this.tasks = this.filteredTasks;
    console.log('Filtering tasks:', { environment, filteredTasksCount: this.filteredTasks.length });
  }

  clearFilter(): void {
    this.currentFilter = null;
    this.filteredTasks = this.allTasks;
    this.tasks = this.allTasks;
  }

  getEnvironmentString(environment: Environment): string {
    return getEnvironmentString(environment);
  }

  allTasks: TaskPreview[] = [];
  filteredTasks: TaskPreview[] = [];
  currentFilter: Environment | null = null;
  tasks: TaskPreview[] = [];
  showTaskDetail: boolean = false;
  selectedTaskId: number | null = null;
  loading = false;

  constructor(private taskService: TaskService) {}

  // Convert number from API to Environment enum
  convertToEnvironment(num: number): Environment {
    return num === 0 ? Environment.WORK : Environment.PERSONAL;
  }

  ngOnInit(): void {
    this.loadTasks();
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
            this.filteredTasks[taskIndex] = {
              ...this.filteredTasks[taskIndex],
              done: true
            };
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
}