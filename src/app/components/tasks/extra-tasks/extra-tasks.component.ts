import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../services/task.service';
import { TaskPreview } from '../../../models/task.model';
import { TaskDetailComponent } from '../task-detail/task-detail.component';

@Component({
  selector: 'app-extra-tasks',
  standalone: true,
  imports: [CommonModule, TaskDetailComponent],
  template: `
    <div class="extra-tasks-container">
      <h2 class="section-title">Tareas Extra</h2>
      <div class="tasks-list" *ngIf="tasks.length > 0">
        <div *ngFor="let task of tasks" 
          class="task-item" 
          [class.completed]="task.done" 
          [ngClass]="getPriorityClass(task.priority)"
          (click)="openTaskDetail(task.id)">
          <div class="task-title" [ngClass]="{'completed-title': task.done}">{{ task.title }}</div>
        </div>
      </div>
      <div class="no-tasks" *ngIf="tasks.length === 0">
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
  tasks: TaskPreview[] = [];
  showTaskDetail: boolean = false;
  selectedTaskId: number = 0;

  constructor(private taskService: TaskService) {}

  ngOnInit(): void {
    this.loadExtraTasks();
  }

  loadExtraTasks(): void {
    this.taskService.getExtraTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
      },
      error: (error) => {
        console.error('Error loading extra tasks:', error);
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
    this.loadExtraTasks();
  }
}