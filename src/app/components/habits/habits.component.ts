import { Component, OnInit, OnDestroy, ViewChild, TemplateRef, Inject } from '@angular/core';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { PageTitleService } from '../../services/page-title.service';
import { HabitService } from '../../services/habit.service';
import { Habit, HabitPreview, HabitUpdatingDTO } from '../../models/habit.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { AuthService } from '../../services/auth.service';

interface HabitFilter {
  type: string;
  environment: string;
}

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],

  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.css', './modal-styles.css']
})
export class HabitsComponent implements OnInit, OnDestroy {
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;

  habits: Habit[] = [];
  allHabits: Habit[] = [];
  filteredHabits: Habit[] = [];
  currentFilter: string | null = null;
  selectedHabitId: number | null = null;
  selectedHabit: Habit | null = null;
  isEditing = false;
  habitForm: FormGroup = this.fb.group({
    id: [null],
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: [''],
    environment: [0, Validators.required],
    programmDays: [1, [Validators.required, Validators.min(1)]],
    lastDay: [new Date().toISOString().split('T')[0], Validators.required],
    done: [false],
    _Environment: [0]
  });
  modalRef: NgbModalRef | null = null;
  loading = false;

  // Form controls for better type safety
  get title(): AbstractControl | null { return this.habitForm.get('title'); }
  get description(): AbstractControl | null { return this.habitForm.get('description'); }
  get environment(): AbstractControl | null { return this.habitForm.get('environment'); }
  get programmDays(): AbstractControl | null { return this.habitForm.get('programmDays'); }
  get lastDay(): AbstractControl | null { return this.habitForm.get('lastDay'); }
  get done(): AbstractControl | null { return this.habitForm.get('done'); }

  constructor(
    private habitService: HabitService,
    @Inject(NgbModal) private modalService: NgbModal,
    private fb: FormBuilder,
    private router: Router,
    private pageTitleService: PageTitleService,
    private authService: AuthService
  ) {
    if (this.router.url.includes('habits')) {
      this.pageTitleService.setPageTitle('Hábitos');
    }
  }

  ngOnInit(): void {
    this.loadHabits();
    this.initForm();
  }

  ngOnDestroy(): void {
    // Add any necessary cleanup code here
  }

  closeModal(): void {
    if (this.modalRef) {
      this.modalRef.close();
      this.modalRef = null;
    }
    this.selectedHabit = null;
    this.isEditing = false;
    this.habitForm.reset();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.modalRef && (event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  private initForm(habit?: Habit): void {
    if (habit) {
      this.habitForm.patchValue({
        id: habit.id,
        title: habit.title,
        description: habit.description || '',
        environment: habit._Environment ?? 0,
        programmDays: habit.programmDays || 1,
        lastDay: this.formatDateForInput(habit.lastDay),
        done: habit.done || false,
        _Environment: habit._Environment ?? 0
      });
    } else {
      this.habitForm.reset({
        title: '',
        description: '',
        environment: 0,
        programmDays: 1,
        lastDay: new Date().toISOString().split('T')[0],
        done: false,
        _Environment: 0
      });
    }
  }

  private formatDateForInput(date: string | Date): string {
    if (!date) return new Date().toISOString().split('T')[0];
    const d = new Date(date);
    return d.toISOString().split('T')[0];
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

  deleteHabit(habitId: number): void {
    if (!habitId) return;

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

  loadHabit(habitId: number): void {
    this.loading = true;
    this.habitService.getHabit(habitId).subscribe({
      next: (habit: Habit) => {
        this.selectedHabit = habit;
        this.initForm(habit);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading habit:', error);
        this.loading = false;
      }
    });
  }

  // CRUD Operations
  confirmDelete(habitId: number): void {
    if (!habitId) return;

    if (confirm('¿Estás seguro de que deseas eliminar este hábito? Esta acción no se puede deshacer.')) {
      this.deleteHabit(habitId);
    }
  }

  onSave(): void {
    if (this.habitForm.invalid || !this.selectedHabit) return;

    const formValue = this.habitForm.value;
    const updatedHabit: HabitUpdatingDTO = {
      title: formValue.title,
      description: formValue.description,
      environment: formValue.environment,
      programmDays: formValue.programmDays,
      lastDay: formValue.lastDay,
      done: formValue.done
    };

    this.habitService.updateHabit(this.selectedHabit.id, updatedHabit).subscribe({
      next: (habit) => {
        // Update the habit in the list
        const index = this.habits.findIndex(h => h.id === habit.id);
        if (index !== -1) {
          this.habits[index] = {
            ...this.habits[index],
            title: habit.title,
            description: habit.description,
            _Environment: habit._Environment,
            programmDays: habit.programmDays,
            lastDay: habit.lastDay,
            done: habit.done
          };
          this.allHabits = [...this.habits];
          this.applyFilter(this.currentFilter);
        }
        this.isEditing = false;
        this.selectedHabit = habit;

        // Show success message or feedback
        // You can add a toast or alert here if needed
      },
      error: (error: any) => {
        console.error('Error updating habit:', error);
        // Show error message to the user
      }
    });
  }

  markHabitAsDone(habitId: number): void {
    const habit = this.habits.find(h => h.id === habitId);
    if (habit && habit.done) {
      this.authService.addStrike().subscribe();
    }
    
    this.habitService.markHabitAsDone(habitId).subscribe({
      next: (updated: HabitPreview) => {
        const index = this.habits.findIndex(h => h.id === habitId);
        if (index !== -1) {
          this.habits[index] = updated;
          this.allHabits[index] = updated;
          const filteredIndex = this.filteredHabits.findIndex(h => h.id === habitId);
          if (filteredIndex !== -1) {
            this.filteredHabits[filteredIndex] = updated;
          }
        }
      },
      error: (error: any) => {
        console.error('Error marking habit as done:', error);
      }
    });
  }

  // UI Helpers
  startEditing(): void {
    if (!this.selectedHabit) return;
    this.isEditing = true;
    // Scroll to top when editing starts
    const modalContent = document.querySelector('.modal-body');
    if (modalContent) {
      modalContent.scrollTop = 0;
    }
  }

  cancelEdit(): void {
    if (this.selectedHabit) {
      this.isEditing = false;
      this.initForm(this.selectedHabit);

      // Reset any validation errors
      this.habitForm.markAsPristine();
      this.habitForm.markAsUntouched();
      Object.keys(this.habitForm.controls).forEach(key => {
        const control = this.habitForm.get(key);
        if (control) {
          control.setErrors(null);
        }
      });
    }
  }

  openHabitDetail(habit: HabitPreview, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    this.loadHabit(habit.id);
    this.isEditing = false;

    // Close any open modal
    if (this.modalRef) {
      this.modalRef.close();
    }

    // Open the modal
    const modalOptions: NgbModalOptions = {
      size: 'lg',
      backdrop: false,
      keyboard: true,
      centered: true,
      scrollable: true,
      windowClass: 'habit-modal'
    };

    this.modalRef = this.modalService.open(this.modalContent, modalOptions);

    // Handle modal dismissal
    this.modalRef.result.then(
      () => {
        this.modalRef = null;
      },
      () => {
        this.modalRef = null;
      }
    );
  }

  // Navigation
  navigateToCreate(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/habits/create']);
  }

  // Filtering
  applyFilter(filterValue: string | null): void {
    if (filterValue === null) {
      this.clearFilter();
      return;
    }
    
    this.currentFilter = filterValue;

    if (filterValue === 'todos') {
      this.filteredHabits = [...this.allHabits];
    } else {
      this.filteredHabits = this.allHabits.filter(habit => 
        habit._Environment?.toString() === filterValue
      );
    }
  }

  clearFilter(): void {
    this.currentFilter = null;
    this.filteredHabits = [...this.allHabits];
  }

  // Helper methods
  getEnvironmentName(environment: number): string {
    return environment === 0 ? 'Trabajo' : 'Personal';
  }

  getEnvironmentClass(environment: number): string {
    return environment === 0 ? 'work' : 'personal';
  }

  convertEnvironmentToNumber(environment: string): number {
    return environment === 'work' ? 0 : 1;
  }
}
