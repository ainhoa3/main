import { Component, Input, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit } from '../../../models/habit.model';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { HabitService } from '../../../services/habit.service';
import { DeleteIconComponent } from '../../../shared/components/delete-icon/delete-icon.component';

@Component({
  selector: 'app-habit-detail',
  standalone: true,
  imports: [CommonModule, DeleteIconComponent],
  template: `
    <div class="modal-backdrop" (click)="onBackdropClick($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 class="modal-title">{{ habit?.title }}</h2>
          <button type="button" class="close-btn" (click)="close()" aria-label="Cerrar">×</button>
        </div>
        <div class="modal-body">
          <div class="habit-view" *ngIf="habit">
            <div class="habit-meta">
              <span class="environment" [ngClass]="getEnvironmentClass(convertEnvironmentToNumber(habit._Environment))">
                {{ getEnvironmentString(habit._Environment) }}
              </span>
              <span class="program-days">Días: {{ habit.programmDays }}</span>
              <span class="last-day" *ngIf="habit.lastDay">Último día: {{ habit.lastDay | date:'dd/MM/yyyy' }}</span>
            </div>
            
            <div class="habit-description" *ngIf="habit.description">
              <h4>Descripción</h4>
              <p>{{ habit.description }}</p>
            </div>
            
            <div class="habit-status">
              <span class="status" [ngClass]="{'completed': habit.done, 'pending': !habit.done}">
                {{ habit.done ? 'Completado' : 'Pendiente' }}
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline" (click)="close()">Cerrar</button>
          <button type="button" class="btn btn-success" 
                  (click)="markHabitAsDone()" 
                  [disabled]="!habit?.id">
            <span>{{ habit?.done ? 'Marcar como pendiente' : 'Marcar como completado' }}</span>
          </button>
          <button type="button" class="btn btn-danger d-flex align-items-center gap-2" 
                  (click)="deleteHabit()" 
                  (mouseenter)="deleteHover = true" 
                  (mouseleave)="deleteHover = false"
                  [disabled]="isDeleting">
            <app-delete-icon [size]="18" [isHovered]="deleteHover"></app-delete-icon>
            <span>{{ isDeleting ? 'Eliminando...' : 'Eliminar' }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1050;
      padding: 1rem;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      overflow: hidden;
    }

    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #343a40;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.75rem;
      font-weight: 700;
      line-height: 1;
      color: #6c757d;
      cursor: pointer;
      padding: 0.25rem;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .close-btn:hover {
      opacity: 1;
      color: #343a4f;
    }

    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
      flex-grow: 1;
    }

    .habit-view {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .habit-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .environment, .program-days, .last-day {
      display: inline-flex;
      align-items: center;
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .environment {
      background-color: #e9ecef;
      color: #495057;
    }

    .environment.work {
      background-color: #e3f2fd;
      color: #0d6efd;
    }

    .environment.personal {
      background-color: #e8f5e9;
      color: #198754;
    }

    .program-days, .last-day {
      background-color: #f8f9fa;
      color: #6c757d;
    }

    .habit-description {
      margin-top: 1rem;
    }

    .habit-description h4 {
      font-size: 1.1rem;
      margin-bottom: 0.75rem;
      color: #495057;
    }

    .habit-description p {
      color: #6c757d;
      line-height: 1.6;
      margin: 0;
    }

    .habit-status {
      margin-top: 0.5rem;
    }

    .status {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .status.completed {
      background-color: #e8f5e9;
      color: #198754;
    }

    .status.pending {
      background-color: #fff3cd;
      color: #e6a700;
    }

    .modal-footer {
      padding: 1rem 1.5rem;
      border-top: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      background-color: #f8f9fa;
    }

    .btn {
      padding: 0.5rem 1.25rem;
      border-radius: 20px;
      font-weight: 500;
      font-size: 0.95rem;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      border: 1px solid transparent;
    }

    .btn:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }

    .btn-outline {
      background-color: transparent;
      border-color: #6c757d;
      color: #6c757d;
    }

    .btn-outline:hover:not(:disabled) {
      background-color: #f8f9fa;
      border-color: #6c757d;
      color: #495057;
    }

    .btn-success {
      background-color: #198754;
      color: white;
    }

    .btn-success:hover:not(:disabled) {
      background-color: #157347;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background-color: #bb2d3b;
    }
  `]
})
export class HabitDetailComponent {
  @Input() habit: Habit | null = null;
  modalRef!: NgbModalRef;
  isDeleting: boolean = false;
  deleteHover: boolean = false;
  
  close() {
    this.modalRef.close();
  }
  
  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  convertEnvironmentToNumber(env: any): number {
    if (typeof env === 'number') return env;
    if (typeof env === 'string') return parseInt(env, 10);
    return 0; // Valor por defecto
  }

  getEnvironmentClass(env: number): string {
    return env === 0 ? 'work' : 'personal';
  }

  constructor(
    @Inject(NgbModal) private modalService: NgbModal,
    private habitService: HabitService
  ) {}

  open(habit: Habit): NgbModalRef {
    const modalRef = this.modalService.open(HabitDetailComponent, { size: 'lg' });
    modalRef.componentInstance.habit = habit;
    return modalRef;
  }

  getEnvironmentString(environment: string | null): string {
    return environment === 'work' ? 'Trabajo' : 'Personal';
  }

  deleteHabit(): void {
    if (confirm('¿Estás seguro de que quieres eliminar este hábito?')) {
      this.isDeleting = true;
      this.habitService.deleteHabit(this.habit?.id ?? 0).subscribe({
        next: () => {
          this.modalRef.close();
        },
        error: (error) => {
          console.error('Error deleting habit:', error);
          alert('Error al eliminar el hábito. Por favor, inténtalo de nuevo.');
        },
        complete: () => {
          this.isDeleting = false;
        }
      });
    }
  }

  markHabitAsDone(): void {
    if (this.habit?.id) {
      this.habitService.markHabitAsDone(this.habit.id).subscribe({
        next: (response) => {
          this.habit = response;
        },
        error: (error) => {
          console.error('Error al marcar el hábito como completado:', error);
          alert('Error al marcar el hábito como completado. Por favor, inténtalo de nuevo.');
        }
      });
    }
  }
}
