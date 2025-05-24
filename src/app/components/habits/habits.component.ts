import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { HabitService } from '../../services/habit.service';
import { Habit, HabitPreview, HabitUpdatingDTO } from '../../models/habit.model';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TemplateRef } from '@angular/core';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbModule, SpinnerComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.css']
})
export class HabitsComponent implements OnInit {
  habits: HabitPreview[] = [];
  allHabits: HabitPreview[] = [];
  filteredHabits: HabitPreview[] = [];

  currentFilter: string | null = null;
  selectedHabitId: number | null = null;
  habitDetail!: Habit;
  modalRef!: NgbModalRef;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;
  isEditing = false;
  habitForm!: FormGroup;
  loading = false;

  constructor(
    private habitService: HabitService,
    @Inject(NgbModal) private modalService: NgbModal,
    private fb: FormBuilder
  ) {
    this.habitForm = this.fb.group({
      title: ['', [Validators.required]],
      description: [''],
      programmDays: [1, [Validators.min(1)]],
      startingDay: [new Date()],
      environment: [0]
    });
    this.loadHabits();
  }

  loadHabits(): void {
    this.habitService.getHabitsOfTheDayPreview().subscribe({
      next: (habits: HabitPreview[]) => {
        this.habits = habits;
        this.allHabits = [...habits];
        this.filteredHabits = habits;
      },
      error: (error: any) => {
        console.error('Error loading habits:', error);
      }
    });
  }

  filterEnvironment(environment: string): void {
    this.currentFilter = environment;
    this.applyFilter();
  }

  clearFilter(): void {
    this.currentFilter = null;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.currentFilter === null) {
      this.filteredHabits = [...this.allHabits];
    } else {
      this.filteredHabits = this.allHabits.filter(habit => {
        // Handle both string and number comparisons
        const envValue = habit._Environment?.toString().toLowerCase();
        const filterValue = this.currentFilter?.toLowerCase();
        return envValue === filterValue || 
               (filterValue === 'work' && (envValue === '1' || envValue === 'work')) ||
               (filterValue === 'personal' && (envValue === '0' || envValue === 'personal'));
      });
    }
  }

  markAsDone(habitId: number): void {
    const habit = this.habits.find(h => h.id === habitId);
    if (habit) {
      const updatedHabit: HabitUpdatingDTO = {
        title: habit.title,
        description: habit.description,
        done: !habit.done,
        programmDays: habit.programmDays,
        lastDay: habit.lastDay,
        environment: habit._Environment === 'work' ? 1 : 0
      };
      
      this.habitService.updateHabit(habitId, updatedHabit).subscribe(() => {
        const index = this.habits.findIndex(h => h.id === habitId);
        if (index !== -1) {
          this.habits[index] = {
            id: habit.id,
            title: habit.title,
            description: habit.description,
            _Environment: habit._Environment,
            done: !habit.done,
            programmDays: habit.programmDays,
            lastDay: habit.lastDay
          };
          this.applyFilter();
        }
      });
    }
  }



  getEnvironmentString(_Environment: string): string {
    return _Environment === 'work' ? 'Trabajo' : 'Personal';
  }

  convertEnvironmentToNumber(_Environment: string): number {
    return _Environment === 'work' ? 1 : 0;
  }

  ngOnInit(): void {
    this.loadHabits();
  }

  openHabitDetail(habitId: number): void {
    this.habitService.getHabit(habitId).subscribe({
      next: (habit) => {
        this.habitDetail = habit;
        this.isEditing = false;
        this.modalRef = this.modalService.open(this.modalContent, {
          size: 'lg',
          backdrop: false,
          keyboard: true,
          windowClass: 'habit-detail-modal',
          centered: true,
          scrollable: true
        });
        this.modalRef.result.then((result) => {
          console.log(`Closed with: ${result}`);
        }).catch((reason) => {
          console.log(`Dismissed ${reason}`);
        });
      },
      error: (error) => {
        console.error('Error loading habit details:', error);
      }
    });
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.modalRef.close();
    }
  }

  startEditing(): void {
    this.isEditing = true;
    this.habitForm = this.fb.group({
      title: [this.habitDetail.title, [Validators.required]],
      description: [this.habitDetail.description],
      _Environment: [this.habitDetail._Environment],
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
      const updatedHabit: HabitUpdatingDTO = {
        title: this.habitForm.get('title')?.value,
        description: this.habitForm.get('description')?.value,
        environment: this.convertEnvironmentToNumber(this.habitForm.get('_Environment')?.value),
        programmDays: this.habitForm.get('programmDays')?.value,
        lastDay: this.habitForm.get('lastDay')?.value,
        done: this.habitForm.get('done')?.value
      };

      this.habitService.updateHabit(this.habitDetail.id, updatedHabit).subscribe({
        next: (updated) => {
          // Update the habit in the list
          const index = this.habits.findIndex(h => h.id === this.habitDetail.id);
          if (index !== -1) {
            this.habits[index] = {
              id: this.habitDetail.id,
              title: updated.title,
              description: updated.description,
              _Environment: updated._Environment,
              done: this.habits[index].done,
              programmDays: this.habits[index].programmDays,
              lastDay: this.habits[index].lastDay
            };
            this.filteredHabits = [...this.habits];
            this.applyFilter();
          }
          this.isEditing = false;
          this.habitForm.reset();
          this.modalRef.close();
        },
        error: (error) => {
          console.error('Error updating habit:', error);
        }
      });
    }
  }
}