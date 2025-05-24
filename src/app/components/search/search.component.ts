import { Component, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TaskService } from '../../services/task.service';
import { HabitService } from '../../services/habit.service';
import { TaskPreview } from '../../models/task.model';
import { HabitPreview, Environment, Habit } from '../../models/habit.model';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TaskDetailComponent } from '../tasks/task-detail/task-detail.component';
import { SpinnerComponent } from '../shared/spinner/spinner.component';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    TaskDetailComponent,
    SpinnerComponent
  ],
  template: `
    <div class="search-page">
      <h1>Búsqueda</h1>
      
      <!-- Detalle de Tarea -->
      <app-task-detail 
        *ngIf="showTaskDetail" 
        [taskId]="selectedTaskId" 
        (close)="closeTaskDetail()"
        (taskUpdated)="search()">
      </app-task-detail>

      <!-- Modal de Detalle de Hábito -->
      <ng-template #modalContent>
        <div class="modal-backdrop" (click)="onBackdropClick($event)">
          <div class="modal-content habit-detail">
            <div class="modal-header">
              <h2>{{ isEditing ? 'Editar Hábito' : 'Detalle de Hábito' }}</h2>
              <button class="close-btn" (click)="closeHabitModal()">✕</button>
            </div>
            <div class="modal-body">
              <div *ngIf="!isEditing && habitDetail" class="habit-view">
                <h3 class="habit-title">{{ habitDetail.title }}</h3>
                <div class="habit-meta">
                  <span class="habit-environment">{{ getEnvironmentString(habitDetail.environment) }}</span>
                  <span class="habit-date">Último día: {{ habitDetail.lastDay | date:'dd/MM/yyyy' }}</span>
                </div>
                <p class="habit-description">{{ habitDetail.description }}</p>
                <div class="habit-metrics">
                  <div class="metric">
                    <span class="label">Estado:</span>
                    <span class="value status" [ngClass]="{ 
                      'status-success': habitDetail.done,
                      'status-pending': !habitDetail.done
                    }">
                      {{ habitDetail.done ? 'Completado' : 'Pendiente' }}
                    </span>
                  </div>
                  <div class="metric">
                    <span class="label">Frecuencia:</span>
                    <span class="value">{{ habitDetail.programmDays }} días</span>
                  </div>
                </div>
              </div>

              <form *ngIf="isEditing && habitForm" [formGroup]="habitForm" class="edit-form">
                <div class="form-group">
                  <label for="title">Título</label>
                  <input type="text" id="title" formControlName="title" class="form-control">
                  <div *ngIf="habitForm && habitForm.get('title')?.invalid && habitForm.get('title')?.touched" class="error-message">
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
                    <option [value]="Environment.WORK">Trabajo</option>
                    <option [value]="Environment.PERSONAL">Personal</option>
                  </select>
                </div>
                
                <div class="form-group">
                  <label for="programmDays">Frecuencia (días)</label>
                  <input type="number" id="programmDays" formControlName="programmDays" class="form-control" min="1">
                </div>
                
                <div class="form-group">
                  <label for="lastDay">Último día</label>
                  <input type="date" id="lastDay" formControlName="lastDay" class="form-control">
                </div>
                
                <div class="form-group checkbox-group">
                  <label class="checkbox">
                    <input type="checkbox" formControlName="done">
                    <span>Marcar como completado</span>
                  </label>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button *ngIf="!isEditing" class="btn btn-outline" (click)="startEditing()">Editar</button>
              <button *ngIf="isEditing" class="btn btn-outline" (click)="cancelEdit()">Cancelar</button>
              <button *ngIf="isEditing" class="btn btn-primary" (click)="saveHabit()" [disabled]="habitForm.invalid">Guardar</button>
              <button *ngIf="!isEditing" class="btn btn-primary" (click)="closeHabitModal()">Cerrar</button>
            </div>
          </div>
        </div>
      </ng-template>
      
      <div class="search-container">
        <input 
          type="text" 
          [(ngModel)]="searchTerm" 
          placeholder="Buscar tareas o hábitos..." 
          class="search-input"
          (keyup.enter)="search()"
        >
        <button class="btn btn-primary" (click)="search()">Buscar</button>
      </div>

      <div class="results-container">
        <div class="loading-container" *ngIf="loading">
          <app-spinner></app-spinner>
        </div>
        <div class="tasks-section" *ngIf="hasSearched">
          <h2>Tareas</h2>
          <div *ngIf="tasks.length === 0" class="no-results">
            No se encontraron tareas relacionadas con "{{ searchTerm }}"
          </div>
          <div class="results-list" *ngIf="tasks.length > 0">
            <div *ngFor="let task of tasks" 
              class="result-item task-result" 
              [class.completed]="task.done" 
              [ngClass]="getPriorityClass(task.priority)"
              (click)="openTaskDetail(task.id)">
              <h3 [ngClass]="{'completed-title': task.done}">{{ task.title }}</h3>
              <div class="task-environment {{ getEnvironmentString(task.environment).toLowerCase() }}">{{ getEnvironmentString(task.environment) }}</div>
              <p class="task-description">{{ task.description }}</p>
            </div>
          </div>
        </div>

        <div class="habits-section" *ngIf="hasSearched">
          <h2>Hábitos</h2>
          <div *ngIf="habits.length === 0" class="no-results">
            No se encontraron hábitos relacionados con "{{ searchTerm }}"
          </div>
          <div class="results-list" *ngIf="habits.length > 0">
            <div *ngFor="let habit of habits" 
              class="result-item habit-result"
              (click)="openHabitDetail(habit.id)">
              <h3>{{ habit.title }}</h3>
              <div class="habit-environment">{{ habit.environment }}</div>
            </div>
          </div>
        </div>
      </div>

      <app-task-detail 
        *ngIf="showTaskDetail" 
        [taskId]="selectedTaskId" 
        (close)="closeTaskDetail()"
        (taskUpdated)="search()">
      </app-task-detail>

      <ng-template #habitModal let-modal>
        <div class="modal-header">
          <h4 class="modal-title">Detalles del Hábito</h4>
          <button type="button" class="btn-close" (click)="closeHabitModal()" aria-label="Close"></button>
        </div>
        <div class="modal-body">
              <!-- El contenido del hábito se muestra directamente aquí -->
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .search-page {
      padding: 2rem;
      min-height: calc(100vh - 70px);
      position: relative;
      background-color: #f8f9fa;
    }

    /* Habit Detail Modal Styles */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 1);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1050;
    }

    .habit-detail {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      margin: 1rem;
      width: 90%;
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0.5rem;
    }

    .close-btn:hover {
      color: #333;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #e0e0e0;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .habit-view {
      text-align: left;
    }

    .habit-title {
      color: #333;
      margin-bottom: 15px;
      font-size: 1.5em;
    }

    .habit-meta {
      margin-bottom: 20px;
      display: flex;
      gap: 1rem;
      color: #666;
      font-size: 0.9em;
    }

    .habit-description {
      margin-bottom: 20px;
      line-height: 1.6;
      color: #333;
    }

    .habit-metrics {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-top: 20px;
    }

    .metric {
      display: flex;
      align-items: center;
    }

    .label {
      color: #666;
      margin-right: 10px;
    }

    .value {
      font-weight: 500;
    }

    .status {
      padding: 5px 10px;
      border-radius: 4px;
      font-weight: 600;
    }

    .status-success {
      background: #d4edda;
      color: #155724;
    }

    .status-pending {
      background: #fff3cd;
      color: #856404;
    }

    /* Form Styles */
    .edit-form .form-group {
      margin-bottom: 1.5rem;
    }

    .edit-form label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .edit-form .form-control {
      width: 100%;
      padding: 0.5rem 0.75rem;
      font-size: 1rem;
      line-height: 1.5;
      color: #495057;
      background-color: #fff;
      background-clip: padding-box;
      border: 1px solid #ced4da;
      border-radius: 0.25rem;
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .edit-form .form-control:focus {
      border-color: #80bdff;
      outline: 0;
      box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
    }

    .checkbox-group {
      display: flex;
      align-items: center;
    }

    .checkbox {
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .checkbox input[type="checkbox"] {
      margin-right: 0.5rem;
    }

    .error-message {
      color: #dc3545;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    /* Button Styles */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1rem;
      font-size: 1rem;
      font-weight: 500;
      line-height: 1.5;
      text-align: center;
      text-decoration: none;
      white-space: nowrap;
      vertical-align: middle;
      cursor: pointer;
      user-select: none;
      border: 1px solid transparent;
      border-radius: 0.25rem;
      transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out,
                  border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
    }

    .btn-primary {
      color: #fff;
      background-color: #007bff;
      border-color: #007bff;
    }

    .btn-primary:hover {
      background-color: #27ae60;
      border-color: #27ae60;
    }

    .btn-outline {
      color: #6c757d;
      background-color: transparent;
      background-image: none;
      border-color: #6c757d;
    }

    .btn-outline:hover {
      color: #fff;
      background-color: #6c757d;
      border-color: #6c757d;
    }

    .search-container {
      display: flex;
      gap: 1rem;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 0;
    }

    .search-input {
      flex: 1;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      border: 1px solid #ced4da;
      border-radius: 0.25rem;
      transition: border-color 0.15s ease-in-out;
    }

    .btn-primary {
      color: #fff;
      background-color: #2ecc71;
      border-color: #2ecc71;
      padding: 0.75rem 1.5rem;
      border-radius: 0.25rem;
      transition: all 0.2s ease;
    }

    .btn-primary:hover {
      background-color: #27ae60;
      border-color: #27ae60;
      transform: translateY(-1px);
    }

    .search-input:focus {
      border-color: #2ecc71;
      box-shadow: 0 0 0 3px rgba(46, 204, 113, 0.1);
    }

    .results-container {
      display: grid;
      grid-template-columns: 1fr;
      gap: 2rem;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
    }

    .results-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .result-item {
      background-color: white;
      padding: 1rem;
      border-radius: var(--border-radius-sm);
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
    }

    .task-result {
      cursor: pointer;
    }

    .task-result:hover {
      box-shadow: var(--shadow-md);
    }

    .result-item h3 {
      margin-bottom: 0.3rem;
      font-size: 1.1rem;
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
      font-size: 0.85rem;
      color: var(--text-secondary);
      margin-top: 0.5rem;
    }

    .task-description.completed {
      color: var(--text-tertiary);
    }

    .no-results {
      padding: 1.5rem;
      color: var(--text-secondary);
      background-color: var(--background-color);
      border-radius: var(--border-radius-sm);
      text-align: center;
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

    .tasks-section h2, .habits-section h2 {
      margin-bottom: 1rem;
      font-size: 1.3rem;
    }

    /* Estilos para el modal de hábitos */
    :host ::ng-deep .habit-detail-modal .modal-content {
      background: transparent;
      border: none;
      box-shadow: none;
    }

    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1050;
    }

    .modal-content.habit-detail {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      max-width: 600px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #333;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0.5rem;
    }

    .close-btn:hover {
      color: #333;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .habit-detail .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e0e0e0;
    }

    .habit-detail .modal-body {
      padding: 1.5rem;
    }

    .habit-detail .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #666;
      padding: 0 10px;
    }

    .habit-detail .close-btn:hover {
      color: #333;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      padding: 20px;
      width: 100%;
      position: relative;
      border: none;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #eee;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
      padding: 5px;
    }

    .modal-body {
      padding: 20px 0;
    }

    .modal-dialog {
      max-width: 800px;
      margin: 1.75rem auto;
      min-height: calc(100% - 3.5rem);
      display: flex;
      align-items: center;
      opacity: 1 !important;
    }
    
    .modal-content {
      width: 100%;
      border: none;
      border-radius: 0.5rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .modal.show {
      display: block !important;
      opacity: 1 !important;
      background-color: rgba(0, 0, 0, 0.5);
    }

    .modal-backdrop {
      opacity: 1 !important;
      border: none;
      border-radius: 0.5rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .modal-header {
      border-bottom: 1px solid #dee2e6;
      padding: 1rem 1.5rem;
      background-color: #f8f9fa;
      border-top-left-radius: 0.5rem;
      border-top-right-radius: 0.5rem;
    }
    
    .modal-title {
      margin: 0;
      font-weight: 600;
      color: #333;
    }
    
    .modal-body {
      padding: 1.5rem;
      max-height: 70vh;
      overflow-y: auto;
    }
    
    .btn-close {
      margin: -0.5rem -0.5rem -0.5rem auto;
      padding: 0.5rem;
      background-size: 1.25em;
    }

    .modal-backdrop {
      background-color: rgba(0, 0, 0, 0.5);
    }

    /* Ensure modal is on top of other content */
    .modal {
      z-index: 1060;
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
    }
    
    .modal-dialog {
      max-width: 800px;
      margin: 1.75rem auto;
      position: relative;
      width: auto;
    }

    @media (min-width: 768px) {
      .results-container {
        grid-template-columns: 1fr 1fr;
      }
    }
  `]
})
export class SearchComponent {
  @ViewChild('modalContent') habitModalContent!: TemplateRef<any>;
  modalRef: NgbModalRef | null = null;
  habitDetail: Habit | null = null;
  isEditing = false;
  habitForm!: FormGroup;
  
  // Hacer que Environment esté disponible en la plantilla
  Environment = Environment;
  
  // Declarar controles del formulario para TypeScript
  get titleControl() { return this.habitForm?.get('title') as FormControl; }
  get descriptionControl() { return this.habitForm?.get('description') as FormControl; }
  get environmentControl() { return this.habitForm?.get('environment') as FormControl; }
  get programmDaysControl() { return this.habitForm?.get('programmDays') as FormControl; }
  get lastDayControl() { return this.habitForm?.get('lastDay') as FormControl; }
  get doneControl() { return this.habitForm?.get('done') as FormControl; }
  
  searchTerm: string = '';
  tasks: TaskPreview[] = [];
  habits: HabitPreview[] = [];
  hasSearched: boolean = false;
  showTaskDetail: boolean = false;
  selectedTaskId: number = 0;
  selectedHabitId: number | null = null;
  loading: boolean = false;
  
  getEnvironmentString(environment: Environment): string {
    return environment === Environment.WORK ? 'Trabajo' : 'Personal';
  }

  constructor(
    private taskService: TaskService,
    private habitService: HabitService,
    private modalService: NgbModal,
    private fb: FormBuilder
  ) { }

  search(): void {
    if (this.searchTerm.trim()) {
      this.loading = true;
      
      // Search tasks
      this.taskService.searchTasks(this.searchTerm).subscribe({
        next: (tasks) => {
          this.tasks = tasks;
          this.hasSearched = true;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error searching tasks:', error);
          this.loading = false;
        }
      });

      // Search habits
      this.habitService.searchHabits(this.searchTerm).subscribe({
        next: (habits) => {
          this.habits = habits;
          this.hasSearched = true;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error searching habits:', error);
          this.loading = false;
        }
      });
    }
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

  openHabitDetail(habitId: number): void {
    this.habitService.getHabit(habitId).subscribe({
      next: (habit: Habit) => {
        this.habitDetail = habit;
        this.isEditing = false;
        this.modalRef = this.modalService.open(this.habitModalContent, {
          size: 'lg',
          backdrop: false,
          keyboard: true,
          windowClass: 'habit-detail-modal',
          centered: true,
          scrollable: true
        });
        this.modalRef.result.then(
          () => {
            // Se ejecuta cuando el modal se cierra con modalRef.close()
            this.modalRef = null;
          },
          () => {
            // Se ejecuta cuando el modal se descarta (con tecla ESC o haciendo clic fuera)
            this.modalRef = null;
          }
        );
      },
      error: (error) => {
        console.error('Error loading habit details:', error);
      }
    });
  }

  closeHabitModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = null;
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.modalRef && (event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.modalRef.close();
    }
  }

  startEditing(): void {
    if (!this.habitDetail) {
      console.error('No habit detail available for editing');
      return;
    }
    
    this.isEditing = true;
    this.habitForm = this.fb.group({
      title: [this.habitDetail.title, [Validators.required]],
      description: [this.habitDetail.description],
      environment: [this.habitDetail.environment],
      programmDays: [this.habitDetail.programmDays, [Validators.min(1)]],
      lastDay: [this.habitDetail.lastDay],
      done: [this.habitDetail.done]
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.habitForm.reset();
  }

  saveHabit(): void {
    if (this.habitForm.valid) {
      const updatedHabit: any = {
        title: this.habitForm.get('title')?.value,
        description: this.habitForm.get('description')?.value,
        environment: this.habitForm.get('environment')?.value,
        programmDays: this.habitForm.get('programmDays')?.value,
        lastDay: this.habitForm.get('lastDay')?.value,
        done: this.habitForm.get('done')?.value
      };

      if (this.habitDetail) {
        this.habitService.updateHabit(this.habitDetail.id, updatedHabit).subscribe({
          next: (updated) => {
            this.isEditing = false;
            this.habitForm.reset();
            this.modalRef?.close();
            this.search(); // Refresh the search results
          },
          error: (error) => {
            console.error('Error updating habit:', error);
          }
        });
      } else {
        console.error('Habit detail is null');
      }
    }
  }

  onHabitUpdated(): void {
    // Refresh the search results when a habit is updated
    this.search();
  }

  onHabitDeleted(): void {
    // Close the modal and refresh the search results when a habit is deleted
    this.closeHabitModal();
    this.search();
  }
}