import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HabitService } from '../../services/habit.service';
import { Habit, HabitPreview, HabitUpdatingDTO } from '../../models/habit.model';
import { Environment, numberToEnvironment, environmentToNumber, getEnvironmentString } from '../../models/task.model';
import { HeaderComponent } from '../header/header.component';
import { NgbModal, NgbModalRef, NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TemplateRef } from '@angular/core';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, HeaderComponent, NgbModule, ReactiveFormsModule],
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.css']
})
export class HabitsComponent implements OnInit {
  habits: HabitPreview[] = [];
  allHabits: HabitPreview[] = [];
  filteredHabits: HabitPreview[] = [];
  Environment = Environment;
  currentFilter: Environment | null = null;
  selectedHabitId: number | null = null;
  habitDetail!: Habit;
  modalRef!: NgbModalRef;
  @ViewChild('modalContent') modalContent!: TemplateRef<any>;
  isEditing: boolean = false;
  habitForm!: FormGroup;

  constructor(
    private habitService: HabitService,
    @Inject(NgbModal) private modalService: NgbModal,
    private fb: FormBuilder
  ) {
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

  filterEnvironment(environment: Environment): void {
    this.currentFilter = environment;
    this.applyFilter();
  }

  clearFilter(): void {
    this.currentFilter = null;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.currentFilter === null) {
      this.filteredHabits = this.allHabits;
    } else {
      this.filteredHabits = this.allHabits.filter(habit => habit.environment === this.currentFilter);
    }
  }

  getEnvironmentClass(environment: Environment): string {
    if (environment === Environment.WORK) return 'work-habit';
    return 'personal-habit';
  }

  getEnvironmentString(environment: Environment): string {
    return environment === Environment.WORK ? 'Trabajo' : 'Personal';
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
      const updatedHabit: HabitUpdatingDTO = {
        title: this.habitForm.get('title')?.value,
        description: this.habitForm.get('description')?.value,
        environment: this.habitForm.get('environment')?.value,
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
              environment: updated.environment
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