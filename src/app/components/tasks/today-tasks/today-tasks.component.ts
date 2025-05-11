import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../../services/task.service';
import { TaskPreview, Task, Environment, TaskUpdatingDTO } from '../../../models/task.model';
import { TaskDetailComponent } from '../task-detail/task-detail.component';

@Component({
  selector: 'app-today-tasks',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TaskDetailComponent],
  template: `
    <div class="today-tasks-container">
      <h2 class="section-title">Tareas de Hoy</h2>
      <div class="tasks-list" *ngIf="tasks.length > 0">
        <div *ngFor="let task of tasks" 
          class="task-item" 
          [class.completed]="task.done" 
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
            <div class="task-environment">{{ task.environment }}</div>
          </div>
        </div>
      </div>
      <div class="no-tasks" *ngIf="tasks.length === 0">
        <p>No hay tareas para hoy</p>
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
    }

    .task-checkbox input {
      width: 18px;
      height: 18px;
      cursor: pointer;
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
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-transform: capitalize;
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
export class TodayTasksComponent implements OnInit {
  tasks: TaskPreview[] = [];
  showTaskDetail: boolean = false;
  selectedTaskId: number = 0;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasksOfTheDayPreview().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
      }
    });
  }

  markAsDone(id: number): void {
    this.taskService.markTaskAsDone(id).subscribe({
      next: () => {
        this.loadTasks(); // Refresh the list
      },
      error: (error) => {
        console.error('Error marking task as done:', error);
      }
    });
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
    this.loadTasks();
  }
}