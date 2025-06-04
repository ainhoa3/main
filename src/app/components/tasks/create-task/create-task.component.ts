import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../../services/task.service';
import { WORK_ENVIRONMENT, PERSONAL_ENVIRONMENT, TaskCreatingDTO } from '../../../models/task.model';
import { Router } from '@angular/router';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-create-task',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  template: `
    <div class="create-task-container">
      <h1>Crear Nueva Tarea</h1>
      
      <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="task-form">
        <div class="form-group">
          <label for="title">Título</label>
          <input type="text" id="title" formControlName="title" class="form-control">
          <div *ngIf="taskForm.get('title')?.invalid && (taskForm.get('title')?.dirty || taskForm.get('title')?.touched)" class="error-message">
            <div *ngIf="taskForm.get('title')?.errors?.['required']">El título es requerido</div>
            <div *ngIf="taskForm.get('title')?.errors?.['minlength']">El título debe tener al menos 3 caracteres</div>
            <div *ngIf="taskForm.get('title')?.errors?.['maxlength']">El título no puede tener más de 100 caracteres</div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="description">Descripción</label>
          <textarea id="description" formControlName="description" class="form-control" rows="4"></textarea>
          <div *ngIf="taskForm.get('description')?.invalid && (taskForm.get('description')?.dirty || taskForm.get('description')?.touched)" class="error-message">
            La descripción es requerida
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group half">
            <label for="environment">Entorno</label>
            <select id="environment" formControlName="environment" class="form-control">
              <option value="0">Trabajo</option>
              <option value="1">Personal</option>
            </select>
            <div *ngIf="taskForm.get('environment')?.invalid && (taskForm.get('environment')?.dirty || taskForm.get('environment')?.touched)" class="error-message">
              Selecciona un entorno
            </div>
          </div>
          
          <div class="form-group half">
            <label for="date">Fecha Límite</label>
            <input type="date" id="date" formControlName="date" class="form-control">
            <div *ngIf="taskForm.get('date')?.invalid && (taskForm.get('date')?.dirty || taskForm.get('date')?.touched)" class="error-message">
              Selecciona una Fecha Límite
            </div>
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
        
        <div *ngIf="formError" class="global-error-message">
          {{ formError }}
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-outline" (click)="onCancel()">Cancelar</button>
          <button type="submit" class="btn btn-primary" [disabled]="taskForm.invalid || submitting">Crear Tarea</button>
        </div>
      </form>

      <div *ngIf="submitting" class="loading-container">
        <app-spinner></app-spinner>
      </div>
    </div>
  `,
  styles: [`
    .create-task-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .task-form {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
    }
    
    .form-row {
      display: flex;
      gap: 15px;
    }
    
    .form-row .form-group.half {
      flex: 1;
    }
    
    .star-rating .star {
      cursor: pointer;
      font-size: 24px;
      color: #ffc107;
    }
    
    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
    
    .btn-primary:disabled {
      background-color: #6c757d;
      color: #fff;
      cursor: not-allowed;
      opacity: 0.65;
    }
    
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }
    
    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 5px;
      animation: fadeIn 0.3s ease-in-out;
    }
    
    .global-error-message {
      background-color: #f8d7da;
      color: #721c24;
      padding: 10px;
      border-radius: 4px;
      margin-bottom: 15px;
      border: 1px solid #f5c6cb;
      animation: fadeIn 0.3s ease-in-out;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .global-error-message {
      margin-top: 1.5rem;
      text-align: center;
      padding: 1rem;
      background-color: rgba(255, 0, 0, 0.1);
      border-radius: var(--border-radius-sm);
      color: var(--error-color);
      font-weight: var(--font-weight-medium);
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class CreateTaskComponent implements OnInit, AfterViewInit {
  taskForm: FormGroup;

  submitting = false;
  successMessage = '';
  formError = '';

  constructor(
    private fb: FormBuilder,
    private taskService: TaskService,
    private router: Router
  ) {
    this.taskForm = this.fb.group({
      title: ['', [
        Validators.required, 
        Validators.minLength(3), 
      ]], 
      description: ['', [
        Validators.required
      ]], 
      environment: [PERSONAL_ENVIRONMENT, [
        Validators.required
      ]], 
      date: ['', [
        Validators.required
      ]], 
      importance: [''], 
      priority: [''] 
    });

    // Add value change listeners for debugging
    this.taskForm.valueChanges.subscribe(value => {
      console.log('Form value changed:', value);
    });

    this.taskForm.statusChanges.subscribe(status => {
      console.log('Form status changed:', status);
    });
  }

  // Helper method to get today's date in YYYY-MM-DD format
  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  ngOnInit(): void {
    // Optional additional initialization if needed
  }

  ngAfterViewInit(): void {
    console.log('CreateTaskComponent: AfterViewInit');
    console.log('Form instance:', this.taskForm);
    
    // Detailed validation logging
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      console.log(`Control ${key}:`);
      console.log('  Value:', control?.value);
      console.log('  Valid:', control?.valid);
      console.log('  Errors:', control?.errors);
      console.log('  Touched:', control?.touched);
      console.log('  Dirty:', control?.dirty);
    });
    
    // Manually trigger validation to ensure form is ready
    this.taskForm.updateValueAndValidity();
    
    // Log form details after view initialization
    console.log('Form valid after view init:', this.taskForm.valid);
    console.log('Form value after view init:', this.taskForm.value);
    console.log('Form errors after view init:', this.taskForm.errors);
  }

  setImportance(stars: number): void {
    if (stars < 1 ) {
      stars = 1;
    }
    this.taskForm.get('importance')?.setValue(stars);
  }

  onSubmit(): void {
    console.log('onSubmit called');
    console.log('Form valid:', this.taskForm.valid);
    console.log('Form value:', this.taskForm.value);
    console.log('Form errors:', this.taskForm.errors);
    
    this.formError = '';
    
    // Detailed validation logging
    const invalidControls: string[] = [];
    Object.keys(this.taskForm.controls).forEach(key => {
      const control = this.taskForm.get(key);
      control?.markAsTouched();
      
      // Detailed control validation logging
      console.log(`Control ${key}:`);
      console.log('  Value:', control?.value);
      console.log('  Valid:', control?.valid);
      console.log('  Errors:', control?.errors);
      console.log('  Touched:', control?.touched);
      console.log('  Dirty:', control?.dirty);
      
      // Track invalid controls
      if (!control?.valid) {
        invalidControls.push(key);
      }
    });
    
    // If form is invalid, log specific invalid controls
    if (!this.taskForm.valid) {
      console.error('Invalid controls:', invalidControls);
      
      // Generate detailed error message
      const errorMessages = invalidControls.map(key => {
        const control = this.taskForm.get(key);
        if (control?.errors) {
          if (control.errors['required']) return `${key} is required`;
          if (control.errors['minlength']) return `${key} is too short`;
          if (control.errors['maxlength']) return `${key} is too long`;
          if (control.errors['min']) return `${key} is below minimum value`;
          if (control.errors['max']) return `${key} is above maximum value`;
        }
        return `${key} is invalid`;
      });
      
      this.formError = `Por favor, corrija los siguientes campos: ${errorMessages.join(', ')}`;
      console.error('Form validation errors:', errorMessages);
      return;
    }
    
    // Proceed with form submission
    this.submitting = true;
    const taskData: TaskCreatingDTO = {
      title: this.taskForm.get('title')?.value.trim(),
      description: this.taskForm.get('description')?.value.trim(),
      environment: this.taskForm.get('environment')?.value,
      importance: this.taskForm.get('importance')?.value,
      dueDate: this.taskForm.get('date')?.value, 
    };
    
    console.log('Submitting task data:', taskData);
    
    this.taskService.createTask(taskData).subscribe({
      next: (response) => {
        console.log('Task created successfully', response);
        this.submitting = false;
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        console.error('Full error creating task', error);
        this.submitting = false;
        this.formError = 'Error al crear la tarea. Por favor, inténtalo de nuevo.';
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }
}