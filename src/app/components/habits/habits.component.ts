import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService } from '../../services/habit.service';
import { HabitPreview } from '../../models/habit.model';
import { Environment, numberToEnvironment, environmentToNumber, getEnvironmentString } from '../../models/task.model';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
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

  getEnvironmentString(environment: Environment): string {
    return environment === Environment.WORK ? 'Trabajo' : 'Personal';
  }

  constructor(private habitService: HabitService) {}

  ngOnInit(): void {
    this.loadHabits();
  }

  loadHabits(): void {
    this.habitService.getHabitsOfTheDayPreview().subscribe({
      next: (habits) => {
        this.allHabits = habits;
        this.filteredHabits = habits;
      },
      error: (error) => {
        console.error('Error loading habits:', error);
      }
    });
  }

  filterEnvironment(environment: Environment): void {
    this.currentFilter = environment;
    const environmentNumber = environmentToNumber(environment);
    this.filteredHabits = this.allHabits.filter(habit => environmentToNumber(habit.environment) === environmentNumber);
    // Update the habits list to show filtered habits
    this.habits = this.filteredHabits;
    console.log('Filtering habits:', { environment, filteredHabitsCount: this.filteredHabits.length });
  }

  clearFilter(): void {
    this.currentFilter = null;
    this.filteredHabits = this.allHabits;
    // Update the habits list to show all habits
    this.habits = this.allHabits;
    console.log('Cleared habits filter');
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

  openHabitDetail(habitId: number): void {
    this.selectedHabitId = habitId;
  }
}