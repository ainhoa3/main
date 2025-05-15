import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../../services/task.service';
import { Environment, TaskCreatingDTO } from '../../../models/task.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="create-task-container">
      <h1>Crear Nueva Tarea</h1>
      
      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="task-form">
        <div class="form-group">
          <label for="title">Título</label>
          <input type="text" id="title" formControlName="title" class="form-control">
          <div *ngIf="taskForm.get('title')?.invalid && taskForm.get('title')?.touched" class="error-message">
            El título es requerido
          </div>
        </div>
        
        <div class="form-group">
          <label for="description">Descripción</label>
          <textarea id="description" formControlName="description" class="form-control" rows="4"></textarea>
        </div>
        
        <div class="form-row">
          <div class="form-group half">
            <label for="environment">Entorno</label>
            <select id="environment" formControlName="environment" class="form-control">
              <option [value]="Environment.WORK">Trabajo</option>
              <option [value]="Environment.PERSONAL">Personal</option>
            </select>
          </div>
          
          <div class="form-group half">
            <label for="date">Fecha de entrega</label>
            <input type="date" id="date" formControlName="date" class="form-control">
          </div>
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
        
        <div class="form-actions">
          <button type="button" class="btn btn-outline" (click)="onCancel()">Cancelar</button>
          <button type="submit" class="btn btn-primary" [disabled]="taskForm.invalid">Crear Tarea</button>
        </div>
      </form>

      <div *ngIf="submitting" class="loading-indicator">
        <div class="spinner"></div>
        <p>Guardando...</p>
      </div>

      <div *ngIf="successMessage" class="success-message">
        <p>{{ successMessage }}</p>
      </div>
    </div>
  `,
  styles: [`
    .create-task-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 1.5rem;
    }

    .task-form {
      background-color: white;
      padding: 1.5rem;
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-md);
    }

    .form-row {
      display: flex;
      gap: 1rem;
      width: 100%;
    }

    .half {
      flex: 1;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .loading-indicator {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-top: 2rem;
    }

    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top: 4px solid var(--primary-color);
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin-bottom: 1rem;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .success-message {
      margin-top: 1.5rem;
      text-align: center;
      padding: 1rem;
      background-color: rgba(46, 204, 113, 0.1);
      border-radius: var(--border-radius-sm);
      color: var(--success-color);
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class CreateTaskComponent implements OnInit {
  taskForm!: FormGroup;
  Environment = Environment;
  submitting = false;
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      environment: [Environment.PERSONAL, [Validators.required]],
      date: ['', [Validators.required]],
      importance: [3, [Validators.required, Validators.min(1), Validators.max(5)]],
      priority: ['', [Validators.required, Validators.min(1), Validators.max(10)]]
    });
  }

  setImportance(stars: number): void {
    this.taskForm.get('importance')?.setValue(stars);
  }

  onSubmit(): void {
    if (this.taskForm.valid) {
      const taskData: TaskCreatingDTO = {
        title: this.taskForm.get('title')?.value,
        description: this.taskForm.get('description')?.value || '',
        environment: this.taskForm.get('environment')?.value,
        importance: this.taskForm.get('importance')?.value,
        dueDate: this.taskForm.get('date')?.value, 
      };
      
      this.taskService.createTask(taskData).subscribe({
        next: () => {
          this.router.navigate(['/tasks']);
        },
        error: (error) => {
          console.error('Error creating task', error);
        }
      });
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.taskForm.controls).forEach(key => {
        const control = this.taskForm.get(key);
        control?.markAsTouched();
      });
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}