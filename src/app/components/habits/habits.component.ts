import { Component, OnInit, ViewChild, Inject, ElementRef } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TemplateRef } from '@angular/core';
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
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgbModule, SpinnerComponent, HeaderComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './habits.component.html',
  styleUrls: ['./habits.component.css']
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
  modalRef!: NgbModalRef;
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
      this.filteredHabits = this.allHabits.filter(h => h._Environment === environment);
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
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.modalRef.close();
    }
  }

  startEditing(): void {
    if (!this.habitDetail) return;
    
    this.isEditing = true;
    this.habitForm = this.formBuilder.group({
      title: [this.habitDetail.title, [Validators.required]],
      description: [this.habitDetail.description],
      environment: [this.habitDetail._Environment],
      programmDays: [this.habitDetail.programmDays, [Validators.min(1)]],
      lastDay: [this.habitDetail.lastDay],
      done: [this.habitDetail.done]
    });

    this.modalRef = this.modalService.open(this.editModal, {
      size: 'lg',
      backdrop: false,
      keyboard: true,
      windowClass: 'habit-detail-modal',
      centered: true,
      scrollable: true
    });
  }

  cancelEdit(): void {
    this.modalRef.close();
    this.isEditing = false;
  }

  openHabitDetail(habitId: number): void {
    this.habitService.getHabit(habitId).subscribe({
      next: (habit: Habit) => {
        this.habitDetail = habit;
        this.isEditing = false;
        this.modalRef = this.modalService.open(this.detailModal, {
          size: 'lg',
          backdrop: false,
          keyboard: true,
          windowClass: 'habit-detail-modal',
          centered: true,
          scrollable: true
        });
      },
      error: (error: any) => {
        console.error('Error loading habit details:', error);
      }
    });
  }

  saveHabit(): void {
    if (this.habitForm.valid) {
      const habitData: HabitUpdatingDTO = {
        title: this.habitForm.get('title')?.value,
        description: this.habitForm.get('description')?.value,
        environment: this.habitForm.get('environment')?.value,
        programmDays: this.habitForm.get('programmDays')?.value,
        lastDay: this.habitForm.get('lastDay')?.value,
        done: this.habitForm.get('done')?.value
      };
      this.habitService.updateHabit(this.habitDetail.id, habitData).subscribe({
        next: (updated: Habit) => {
          const index = this.habits.findIndex(h => h.id === this.habitDetail.id);
          if (index !== -1) {
            this.habits[index] = updated;
            this.modalRef.close();
            this.isEditing = false;
            this.habitForm.reset();
          }
        },
        error: (error: any) => {
          console.error('Error updating habit:', error);
        }
      });
    }
  }
}