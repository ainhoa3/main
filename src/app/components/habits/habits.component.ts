import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { NgbModal, NgbModalRef, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PageTitleService } from '../../services/page-title.service';
import { HabitService } from '../../services/habit.service';
import { Habit, HabitPreview, HabitUpdatingDTO } from '../../models/habit.model';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { HeaderComponent } from '../../components/header/header.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

interface HabitFilter {
  type: string;
  environment: string;
}

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbModule, SpinnerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.css', './modal-styles.css']
})
export class HabitsComponent implements OnInit {
  @ViewChild('editModal') editModal!: TemplateRef<any>;
  @ViewChild('detailModal') detailModal!: TemplateRef<any>;

  habits: HabitPreview[] = [];
  allHabits: HabitPreview[] = [];
  filteredHabits: HabitPreview[] = [];

  currentFilter: string | null = null;
  selectedHabitId: number | null = null;
  habitDetail!: Habit;
  private _modalRef: NgbModalRef | null = null;
  
  get modalRef(): NgbModalRef | null {
    return this._modalRef;
  }
  
  set modalRef(ref: NgbModalRef | null) {
    this._modalRef = ref;
  }
  isEditing = false;
  habitForm!: FormGroup;
  loading = false;

  closeModal(): void {
    if (this._modalRef) {
      this._modalRef.close();
      this._modalRef = null;
    }
  }


  constructor(
    private habitService: HabitService,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private router: Router,
    private pageTitleService: PageTitleService
  ) {
    // Set page name for header
    if (this.router.url.includes('habits')) {
      this.pageTitleService.setPageTitle('Hábitos');
    }
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadHabits();
  }

  initializeForm(): void {
    this.habitForm = this.formBuilder.group({
      title: ['', Validators.required],
      description: [''],
      programmDays: [1, [Validators.required, Validators.min(1)]],
      startingDay: [new Date(), Validators.required],
      environment: [0, Validators.required]
    });
  }

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

  filterEnvironment(environment: string): void {
    if (environment === 'all') {
      this.filteredHabits = [...this.allHabits];
    } else {
      // Convert string to number (0 for personal, 1 for work)
      const envNumber = environment === 'work' ? 1 : 0;
      this.filteredHabits = this.allHabits.filter(h => Number(h._Environment) === envNumber);
    }
    this.currentFilter = environment;
  }

  clearFilter(): void {
    this.filteredHabits = [...this.allHabits];
    this.currentFilter = null;
  }

  applyFilter(filterValue: string, envValue: string): void {
    if (filterValue === 'all' && envValue === 'all') {
      this.filteredHabits = [...this.allHabits];
    } else {
      this.filteredHabits = this.allHabits.filter(h => {
        const matchesFilter = filterValue === 'all' || 
          (filterValue === 'personal' && h._Environment === 'personal') ||
          (filterValue === 'work' && h._Environment === 'work');
        const matchesEnv = envValue === 'all' || 
          (envValue === '0' && h._Environment === 'personal') ||
          (envValue === '1' && h._Environment === 'work');
        return matchesFilter && matchesEnv;
      });
    }
    this.currentFilter = `${filterValue}-${envValue}`;
  }

  getEnvironmentString(_Environment: string): string {
    return _Environment === 'work' ? 'Trabajo' : 'Personal';
  }

  convertEnvironmentToNumber(_Environment: string): number {
    return _Environment === 'work' ? 1 : 0;
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.modalRef && (event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.modalRef.close();
      this.modalRef = null;
    }
  }

  closeHabitModal(): void {
    this.isEditing = false;
    this.habitDetail = null as any; // Reset the habit detail
    this.habitForm.reset(); // Reset the form
    this.closeModal();
  }

  openEditModal(habit: Habit): void {
    this.habitDetail = habit;
    this.isEditing = true;
    
    // Initialize the form with the habit data
    this.habitForm = this.formBuilder.group({
      title: [habit.title, [Validators.required]],
      description: [habit.description],
      environment: [habit._Environment === 'work' ? 1 : 0, [Validators.required]],
      programmDays: [habit.programmDays, [Validators.required, Validators.min(1)]],
      lastDay: [new Date(habit.lastDay).toISOString().split('T')[0], [Validators.required]],
      done: [habit.done || false]
    });

    this.modalRef = this.modalService.open(this.editModal, {
      size: 'lg',
      backdrop: true,
      keyboard: true,
      windowClass: 'habit-detail-modal',
      centered: true,
      scrollable: true
    });
  }

  cancelEdit(): void {
    if (this.habitDetail) {
      // Reset the form with the original habit data
      this.habitForm.patchValue({
        title: this.habitDetail.title,
        description: this.habitDetail.description,
        environment: this.habitDetail._Environment === 'work' ? 1 : 0,
        programmDays: this.habitDetail.programmDays,
        lastDay: new Date(this.habitDetail.lastDay).toISOString().split('T')[0],
        done: this.habitDetail.done || false
      });
    }
    this.isEditing = false;
  }

  startEditing(): void {
    if (!this.habitDetail) return;
    
    this.isEditing = true;
    this.habitForm = this.formBuilder.group({
      title: [this.habitDetail.title, [Validators.required]],
      description: [this.habitDetail.description],
      environment: [this.habitDetail._Environment === 'work' ? 1 : 0, [Validators.required]],
      programmDays: [this.habitDetail.programmDays, [Validators.required, Validators.min(1)]],
      lastDay: [new Date(this.habitDetail.lastDay).toISOString().split('T')[0], [Validators.required]],
      done: [this.habitDetail.done || false]
    });
  }

  openHabitDetail(habitId: number): void {
    this.selectedHabitId = habitId;
    this.loading = true;
    this.habitService.getHabit(habitId).subscribe({
      next: (habit: Habit) => {
        this.habitDetail = habit;
        this.isEditing = false;
        // Initialize the form with the habit data
        this.habitForm = this.formBuilder.group({
          title: [habit.title, [Validators.required]],
          description: [habit.description],
          environment: [habit._Environment === 'work' ? 1 : 0, [Validators.required]],
          programmDays: [habit.programmDays, [Validators.required, Validators.min(1)]],
          lastDay: [new Date(habit.lastDay).toISOString().split('T')[0], [Validators.required]],
          done: [habit.done || false]
        });
        this.loading = false;
        const modalRef = this.modalService.open(this.detailModal, {
          size: 'lg',
          backdrop: false,
          keyboard: true,
          windowClass: 'habit-detail-modal',
          centered: true,
          scrollable: true
        });
        this.modalRef = modalRef;
        
        modalRef.result.then(
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
      error: (error: any) => {
        console.error('Error loading habit detail:', error);
      }
    });
  }

  saveHabit(): void {
    if (this.habitForm.valid && this.habitDetail) {
      const formValue = this.habitForm.value;
      const habitData: HabitUpdatingDTO = {
        title: formValue.title,
        description: formValue.description || '',
        environment: formValue.environment, // This should be a number (0 or 1)
        programmDays: formValue.programmDays,
        lastDay: formValue.lastDay,
        done: formValue.done || false
      };

      this.loading = true;
      this.habitService.updateHabit(this.habitDetail.id, habitData).subscribe({
        next: (updated: Habit) => {
          // Update the habit in the list
          const habitIndex = this.habits.findIndex(h => h.id === this.habitDetail?.id);
          if (habitIndex !== -1) {
            this.habits[habitIndex] = {
              ...this.habits[habitIndex],
              title: updated.title,
              _Environment: updated._Environment,
              done: updated.done,
              programmDays: updated.programmDays,
              lastDay: updated.lastDay
            };
          }
          
          // Update the displayed habit detail
          this.habitDetail = updated;
          this.isEditing = false;
          this.loading = false;
          
          // Refresh the habits list
          this.loadHabits();
        },
        error: (error: any) => {
          console.error('Error updating habit:', error);
          this.loading = false;
        }
      });
    }
  }
}