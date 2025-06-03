import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PageTitleService } from '../../services/page-title.service';
import { HabitService } from '../../services/habit.service';
import { Habit, HabitPreview, HabitUpdatingDTO } from '../../models/habit.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

interface HabitFilter {
  type: string;
  environment: string;
}

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.css', './modal-styles.css']
})
export class HabitsComponent implements OnInit {
  @ViewChild('modalContent') habitModalContent!: TemplateRef<any>;

  habits: HabitPreview[] = [];
  allHabits: HabitPreview[] = [];
  filteredHabits: HabitPreview[] = [];

  currentFilter: string | null = null;
  selectedHabitId: number | null = null;
  selectedHabit: Habit | null = null;
  habitDetail: Habit | null = null;
  modalRef: NgbModalRef | null = null;

  isEditing = false;
  habitForm!: FormGroup;
  loading = false;

  constructor(
    private habitService: HabitService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private router: Router,
    private pageTitleService: PageTitleService
  ) {
    if (this.router.url.includes('habits')) {
      this.pageTitleService.setPageTitle('Hábitos');
    }
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadHabits();
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = null;
    }
    this.selectedHabit = null;
    this.habitDetail = null;
    this.isEditing = false;
    this.habitForm.reset();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.modalRef && (event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  // Form and Data Handling
  initializeForm(): void {
    if (this.habitDetail) {
      const lastDay = new Date(this.habitDetail.lastDay);
      const formattedDate = lastDay.toISOString().split('T')[0];
      
      this.habitForm = this.formBuilder.group({
        title: [this.habitDetail.title, Validators.required],
        description: [this.habitDetail.description || ''],
        environment: [this.habitDetail._Environment === 'work' ? 1 : 0, Validators.required],
        programmDays: [this.habitDetail.programmDays, [Validators.required, Validators.min(1)]],
        lastDay: [formattedDate, Validators.required],
        done: [this.habitDetail.done || false]
      });
    } else {
      this.habitForm = this.formBuilder.group({
        title: ['', Validators.required],
        description: [''],
        environment: [0, Validators.required],
        programmDays: [1, [Validators.required, Validators.min(1)]],
        lastDay: [new Date().toISOString().split('T')[0], Validators.required],
        done: [false]
      });
    }
  }

  // Data Loading
  loadHabits(): void {
    this.loading = true;
    this.habitService.getHabitsOfTheDayPreview().subscribe({
      next: (habits: HabitPreview[]) => {
        this.habits = habits;
        this.allHabits = [...habits];
        this.filteredHabits = [...habits];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading habits:', error);
        this.loading = false;
      }
    });
  }

  loadHabitDetail(habitId: number): void {
    this.loading = true;
    this.habitService.getHabit(habitId).subscribe({
      next: (habit: Habit) => {
        this.habitDetail = habit;
        this.selectedHabit = habit;
        this.initializeForm();
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading habit details:', error);
        this.loading = false;
      }
    });
  }

  // CRUD Operations
  confirmDelete(habitId: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este hábito?')) {
      this.habitService.deleteHabit(habitId).subscribe({
        next: () => {
          this.habits = this.habits.filter(h => h.id !== habitId);
          this.allHabits = this.allHabits.filter(h => h.id !== habitId);
          this.filteredHabits = this.filteredHabits.filter(h => h.id !== habitId);
          this.closeModal();
        },
        error: (error: any) => {
          console.error('Error deleting habit:', error);
        }
      });
    }
  }

  onSave(): void {
    if (this.habitForm.valid && this.selectedHabit) {
      const formValue = this.habitForm.value;
      const lastDay = new Date(formValue.lastDay);
      
      const updatedHabit: HabitUpdatingDTO = {
        title: formValue.title,
        description: formValue.description || '',
        environment: formValue.environment,
        programmDays: formValue.programmDays,
        lastDay: lastDay.toISOString(),
        done: formValue.done || false
      };

      if (this.selectedHabit.id) {
        this.habitService.updateHabit(this.selectedHabit.id, updatedHabit).subscribe({
          next: () => {
            this.loadHabits();
            this.isEditing = false;
          },
          error: (error: any) => {
            console.error('Error updating habit:', error);
          }
        });
      }
    }
  }

  deleteHabit(habitId: number): void {
    if (!habitId) return;
    
    if (confirm('¿Estás seguro de que deseas eliminar este hábito?')) {
      this.habitService.deleteHabit(habitId).subscribe({
        next: () => {
          this.habits = this.habits.filter(h => h.id !== habitId);
          this.allHabits = this.allHabits.filter(h => h.id !== habitId);
          this.filteredHabits = this.filteredHabits.filter(h => h.id !== habitId);
          this.closeModal();
        },
        error: (error: any) => {
          console.error('Error deleting habit:', error);
        }
      });
    }
  }

  markAsDone(habitId: number): void {
    const habit = this.habits.find(h => h.id === habitId);
    if (habit) {
      this.habitService.markHabitAsDone(habitId).subscribe({
        next: (updated: HabitPreview) => {
          const index = this.habits.findIndex(h => h.id === habitId);
          if (index !== -1) {
            this.habits[index] = updated;
          }
        },
        error: (error: any) => {
          console.error('Error marking habit as done:', error);
        }
      });
    }
  }

  // UI Helpers
  startEditing(): void {
    if (!this.habitDetail) return;
    this.isEditing = true;
  }

  cancelEdit(): void {
    this.isEditing = false;
    if (this.habitDetail) {
      this.initializeForm();
    }
  }

  openHabitDetail(habit: HabitPreview): void {
    this.habitService.getHabit(habit.id).subscribe({
      next: (habitDetail: Habit) => {
        this.habitDetail = habitDetail;
        this.selectedHabit = { ...habitDetail };
        this.isEditing = false;
        
        this.modalRef = this.modalService.open(this.habitModalContent, {
          size: 'lg',
          backdrop: false,
          keyboard: true,
          windowClass: 'habit-detail-modal',
          centered: true,
          scrollable: true
        });
        
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading habit details:', error);
        this.loading = false;
      }
    });
  }

  // Navigation
  navigateToCreate(): void {
    this.router.navigate(['/habits/create']);
  }

  // Filtering
  clearFilter(): void {
    this.filteredHabits = [...this.allHabits];
    this.currentFilter = null;
  }

  applyFilter(filterValue: string): void {
    if (filterValue === 'todos') {
      this.filteredHabits = [...this.allHabits];
    } else {
      this.filteredHabits = this.allHabits.filter(h => {
        if (filterValue === '0') {
          return h._Environment === 'personal';
        } else if (filterValue === '1') {
          return h._Environment === 'work';
        }
        return true;
      });
    }
    this.currentFilter = filterValue;
  }

  // Helpers
  getEnvironmentName(environment: string): string {
    return environment === 'work' ? 'Trabajo' : 'Personal';
  }

  getEnvironmentClass(environment: string): string {
    return environment === 'work' ? 'environment-work' : 'environment-personal';
  }

  convertEnvironmentToNumber(environment: string): number {
    return environment === 'work' ? 1 : 0;
  }
}
