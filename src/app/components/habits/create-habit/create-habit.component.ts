import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HabitService } from '../../../services/habit.service';
import { HabitCreatingDTO } from '../../../models/habit.model';
import { Router } from '@angular/router';
import { Environment } from '../../../models/task.model';

@Component({
  selector: 'app-create-habit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="create-habit-container">
      <h1>Crear Nuevo Hábito</h1>
      
      <form [formGroup]="habitForm" (ngSubmit)="onSubmit()" class="habit-form">
        <div class="form-group">
          <label for="title">Título</label>
          <input type="text" id="title" formControlName="title" class="form-control">
          <div *ngIf="habitForm.get('title')?.invalid && (habitForm.get('title')?.dirty || habitForm.get('title')?.touched)" class="error-message">
            <div *ngIf="habitForm.get('title')?.errors?.['required']">El título es requerido</div>
            <div *ngIf="habitForm.get('title')?.errors?.['minlength']">El título debe tener al menos 3 caracteres</div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="description">Descripción</label>
          <textarea id="description" formControlName="description" class="form-control" rows="4"></textarea>
          <div *ngIf="habitForm.get('description')?.invalid && (habitForm.get('description')?.dirty || habitForm.get('description')?.touched)" class="error-message">
            La descripción es requerida
          </div>
        </div>
        
        <div class="form-group">
          <label for="environment">Entorno</label>
          <select id="environment" formControlName="environment" class="form-control">
            <option [value]="Environment.WORK">Trabajo</option>
            <option [value]="Environment.PERSONAL">Personal</option>
          </select>
          <div *ngIf="habitForm.get('environment')?.invalid && (habitForm.get('environment')?.dirty || habitForm.get('environment')?.touched)" class="error-message">
            Selecciona un entorno
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label>Importancia</label>
            <div class="star-rating">
              <span *ngFor="let star of [1, 2, 3, 4, 5]" 
                    (click)="setImportance(star)" 
                    class="star">
                {{ star <= habitForm.get('importance')?.value ? '★' : '☆' }}
              </span>
            </div>
          </div>
          <div *ngIf="habitForm.get('importance')?.invalid && (habitForm.get('importance')?.dirty || habitForm.get('importance')?.touched)" class="error-message">
            Selecciona un valor entre 1 y 10
          </div>
          <div class="form-group half">
            <label for="priority">Prioridad (1-10)</label>
            <input type="number" id="priority" formControlName="priority" min="1" max="10" class="form-control">
            <div *ngIf="habitForm.get('priority')?.invalid && (habitForm.get('priority')?.dirty || habitForm.get('priority')?.touched)" class="error-message">
              Selecciona un valor entre 1 y 10
            </div>
          </div>
        </div>
        
        <div *ngIf="formError" class="global-error-message">
          {{ formError }}
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-outline" (click)="onCancel()">Cancelar</button>
          <button type="submit" class="btn btn-primary" [disabled]="habitForm.invalid || submitting">Crear Hábito</button>
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
    .create-habit-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }

    h1 {
      margin-bottom: 1.5rem;
    }

    .habit-form {
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

    .star-rating .star {
      cursor: pointer;
      font-size: 24px;
      color: #ffc107;
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
export class CreateHabitComponent {
  habitForm: FormGroup;
  submitting = false;
  successMessage = '';
  formError = '';
  Environment = Environment;

  constructor(
    private fb: FormBuilder,
    private habitService: HabitService,
    private router: Router
  ) {
    this.habitForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      environment: [Environment.PERSONAL, [Validators.required]],
      importance: [''],
      priority: ['']
    });
  }

  onSubmit(): void {
    this.formError = '';
    
    // Mark all fields as touched to trigger validation messages
    Object.keys(this.habitForm.controls).forEach(key => {
      const control = this.habitForm.get(key);
      control?.markAsTouched();
    });
    
    if (this.habitForm.valid) {
      this.submitting = true;
      const habitData: HabitCreatingDTO = {
        title: this.habitForm.value.title.trim(),
        description: this.habitForm.value.description.trim(),
        environment: this.habitForm.value.environment,
        importance: this.habitForm.value.importance,
        priority: this.habitForm.value.priority
      };

      this.habitService.createHabit(habitData).subscribe({
        next: () => {
          this.submitting = false;
          this.successMessage = '¡Hábito creado con éxito!';
          setTimeout(() => {
            this.router.navigate(['/habits']);
          }, 2000);
        },
        error: (error) => {
          this.submitting = false;
          this.formError = 'Error al crear el hábito. Por favor, inténtalo de nuevo.';
          console.error('Error creating habit:', error);
        }
      });
    } else {
      this.formError = 'Por favor, completa todos los campos correctamente.';
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard']);
  }

  setImportance(stars: number): void {
    if (stars < 1) {
      stars = 1;
    }
    this.habitForm.get('importance')?.setValue(stars);
  }
}