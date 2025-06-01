import { Component, Input, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit } from '../../../models/habit.model';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { HabitService } from '../../../services/habit.service';

@Component({
  selector: 'app-habit-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{ habit?.title }}</h4>
      <button type="button" class="btn-close" aria-label="Close" (click)="modalRef.close()"></button>
    </div>
    <div class="modal-body">
      <div class="habit-detail-content">
        <div class="habit-description">
          <h5>Descripción</h5>
          <p>{{ habit?.description }}</p>
        </div>
        <div class="habit-info">
          <div class="habit-info-item">
            <strong>Estado:</strong>
            <span>{{ habit?.done ? 'Completado' : 'Pendiente' }}</span>
          </div>
          <div class="habit-info-item">
            <strong>Frecuencia:</strong>
            <span>{{ habit?.programmDays }} días</span>
          </div>
          <div class="habit-info-item">
            <strong>Último día:</strong>
            <span>{{ habit?.lastDay }}</span>
          </div>
          <div class="habit-info-item">
            <strong>Entorno:</strong>
            <span>{{ getEnvironmentString(habit?._Environment ?? null) }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <div class="btn-group">
        <button type="button" class="btn btn-danger" (click)="deleteHabit()" title="Eliminar hábito">
          <i class="fas fa-trash-alt"></i> Eliminar
        </button>
      </div>
      <button type="button" class="btn btn-secondary" (click)="modalRef.close()">Cerrar</button>
      <span *ngIf="isDeleting">Eliminando...</span>
    </div>
  `,
  styles: [`
    .habit-detail-content {
      padding: 1rem;
    }

    .habit-description {
      margin-bottom: 1.5rem;
    }

    .habit-info {
      display: grid;
      gap: 1rem;
    }

    .habit-info-item {
      display: flex;
      justify-content: space-between;
      padding: 0.5rem;
      border-bottom: 1px solid #eee;
    }

    .habit-info-item:last-child {
      border-bottom: none;
    }

    .habit-info-item strong {
      color: #666;
      width: 100px;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }
  `]
})
export class HabitDetailComponent {
  @Input() habit: Habit | null = null;
  modalRef!: NgbModalRef;
  isDeleting: boolean = false;

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
}
