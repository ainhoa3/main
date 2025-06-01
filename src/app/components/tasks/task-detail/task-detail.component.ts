import { Component, EventEmitter, Input, OnInit, Output, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../../services/task.service';
import { Task, WORK_ENVIRONMENT, PERSONAL_ENVIRONMENT, getEnvironmentString, TaskUpdatingDTO } from '../../../models/task.model';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="modal-backdrop" (click)="onBackdropClick($event)">
      <div class="modal-content task-detail">
        <div class="modal-header">
          <h2>{{ isEditing ? 'Editar Tarea' : 'Detalle de Tarea' }}</h2>
          <button class="close-btn" (click)="close.emit()">✕</button>
        </div>
        <div class="modal-body">
          <div *ngIf="!isEditing && task" class="task-view">
            <h3 class="task-title">{{ task.title }}</h3>
            <div class="task-meta">
              <span class="task-environment">{{ getEnvironmentStringFromNumber(task.environment) }}</span>
              <span class="task-status tag" [class.status-completed]="task.done" [class.status-pending]="!task.done && !isTaskLate(task)" [class.status-late]="isTaskLate(task)">
                {{ getTaskStatus(task) }}
              </span>
              <span class="task-importance tag">Importancia: {{ task.importance }}/5</span>
              <span class="task-date">Fecha: {{ task.dueDate | date:'dd/MM/yyyy' }}</span>
            </div>
            <p class="task-description">{{ task.description }}</p>
          </div>
          <form *ngIf="isEditing && taskForm" [formGroup]="taskForm" class="edit-form">
            <div class="form-group">
              <label for="title">Título</label>
              <input type="text" id="title" formControlName="title" class="form-control">
              <div *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched" class="error-message">
                El título es requerido
              </div>
            </div>
            
            <div class="form-group">
              <label for="description">Descripción</label>
              <textarea id="description" formControlName="description" class="form-control" rows="3"></textarea>
            </div>
            
            <div class="form-group">
              <label for="environment">Entorno</label>
              <select id="environment" formControlName="environment" class="form-control">
                <option [value]="WORK_ENVIRONMENT">Trabajo</option>
                <option [value]="PERSONAL_ENVIRONMENT">Personal</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="dueDate">Fecha de entrega</label>
              <input type="date" id="dueDate" formControlName="dueDate" class="form-control">
            </div>
            
            <div class="form-row">
          <div class="form-group">
            <label>Importancia</label>
            <div class="star-rating">
              <span *ngFor="let star of [1, 2, 3, 4, 5]" 
                    (click)="setImportance(star)" 
                    class="star">
                {{ star <= taskForm.get('importance')?.value ? '★' : '☆' }}
              </span>
            </div>
          </div>
        </div>
            
            <div class="form-group checkbox-group">
              <label class="checkbox">
                <input type="checkbox" formControlName="done">
                <span>Marcar como completada</span>
              </label>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <div class="btn-group">
            <button *ngIf="!isEditing" class="btn btn-outline" (click)="startEditing()">Editar</button>
            <button *ngIf="!isEditing" class="btn btn-danger" (click)="deleteTask()" title="Eliminar tarea">
              <i class="fas fa-trash-alt"></i> Eliminar
            </button>
          </div>
          <button *ngIf="isEditing" class="btn btn-outline" (click)="cancelEdit()">Cancelar</button>
          <button *ngIf="isEditing" class="btn btn-primary" (click)="saveTask()" [disabled]="taskForm?.invalid">Guardar</button>
          <button *ngIf="!isEditing" class="btn btn-primary" (click)="close.emit()">Cerrar</button>
          <span *ngIf="isDeleting">Eliminando...</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .task-detail {
      width: 500px;
      max-width: 90vw;
    }

    .task-view {
      padding: 0.5rem;
    }

    .task-title {
      font-size: 1.5rem;
      margin-bottom: 0.75rem;
    }

    .task-meta {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .task-environment {
      background-color: var(--primary-light);
      color: var(--primary-dark);
      padding: 0.2rem 0.5rem;
      border-radius: var(--border-radius-sm);
      font-weight: 500;
    }

    .task-description {
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }

    .task-metrics {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      background-color: var(--background-color);
      border-radius: var(--border-radius-sm);
      padding: 0.75rem;
    }

    .metric {
      display: flex;
      flex-direction: column;
    }

    .label {
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-bottom: 0.25rem;
    }

    .value {
      font-weight: 600;
    }

    .status {
      font-weight: 500;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      display: inline-block;
      min-width: fit-content;
    }

    .status-success {
      color: var(--success-color);
      background-color: rgba(39, 174, 96, 0.1);
    }

    .status-error {
      color: var(--error-color);
      background-color: rgba(231, 76, 60, 0.1);
    }

    .status-pending {
      color: var(--warning-color);
      background-color: rgba(243, 156, 18, 0.1);
    }

    .edit-form {
      padding: 0.5rem;
    }

    .form-row {
      display: flex;
      gap: 1rem;
      width: 100%;
    }

    .half {
      flex: 1;
    }

    .checkbox-group {
      margin-top: 1rem;
    }

    .checkbox {
      display: flex;
      align-items: center;
    }

    .checkbox input {
      margin-right: 0.5rem;
    }

    @media (max-width: 768px) {
      .task-metrics {
        grid-template-columns: 1fr;
      }

      .form-row {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class TaskDetailComponent implements OnInit {
  @Input() taskId: number = 0;
  @Output() close = new EventEmitter<void>();
  @Output() taskUpdated = new EventEmitter<void>();

  task: Task | null = null;
  isEditing: boolean = false;
  taskForm: FormGroup | null = null;
  WORK_ENVIRONMENT = WORK_ENVIRONMENT;
  PERSONAL_ENVIRONMENT = PERSONAL_ENVIRONMENT;
  isDeleting: boolean = false;


  constructor(
    @Inject(TaskService) private taskService: TaskService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.loadTask();
  }

  loadTask(): void {
    this.taskService.getTask(this.taskId).subscribe({
      next: (task) => {
        this.task = task;
        this.initForm();
      },
      error: (error) => {
        console.error('Error loading task:', error);
      }
    });
  }

  getEnvironmentString(environment: number): string {
    return environment === WORK_ENVIRONMENT ? 'Trabajo' : 'Personal';
  }



  getEnvironmentStringFromNumber(environment: number): string {
    return getEnvironmentString(environment);
  }

  isTaskLate(task: Task): boolean {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  }

  getTaskStatus(task: Task): string {
    if (task.done) {
      return 'Terminada';
    }
    return this.isTaskLate(task) ? 'Atrasada' : 'Pendiente';
  }



  initForm(): void {
    if (this.task) {
      this.taskForm = this.fb.group({
        title: [this.task.title, Validators.required],
        description: [this.task.description],
        environment: [this.task.environment],
        dueDate: [this.formatDateForInput(this.task.dueDate)],
        importance: [this.task.importance, [Validators.min(1), Validators.max(5)]],
        done: [this.task.done]
      });
    }
  }

  formatDateForInput(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  setImportance(stars: number): void {
    this.taskForm?.get('importance')?.setValue(stars);
  }
  startEditing(): void {
    this.isEditing = true;
    this.initForm();
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  saveTask(): void {
    if (this.taskForm?.valid && this.task) {
      const updatedTask: TaskUpdatingDTO = {
        title: this.taskForm.value.title,
        description: this.taskForm.value.description,
        environment: this.taskForm.value.environment,
        dueDate: this.taskForm.value.dueDate,
        importance: this.taskForm.value.importance,
        priority: this.taskForm.value.priority,
        done: this.taskForm.value.done
      };

      this.taskService.updateTask(this.task.id, updatedTask).subscribe({
        next: () => {
          this.isEditing = false;
          this.loadTask(); // Refresh the task data
          this.taskUpdated.emit(); // Notify parent component
        },
        error: (error) => {
          console.error('Error updating task:', error);
        }
      });
    }
  }

  deleteTask(): void {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      this.isDeleting = true;
      this.taskService.deleteTask(this.taskId).subscribe({
        next: () => {
          this.close.emit();
          this.taskUpdated.emit();
        },
        error: (error) => {
          console.error('Error deleting task:', error);
          alert('Error al eliminar la tarea. Por favor, inténtalo de nuevo.');
        },
        complete: () => {
          this.isDeleting = false;
        }
      });
    }
  }

  onBackdropClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}