import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HabitService } from '../../services/habit.service';
import { HabitPreview } from '../../models/habit.model';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, HeaderComponent],
  template: `
    <div class="habits-container">
      <app-header [pageName]="'Hábitos'"></app-header>
      
      <div class="habits-content">
        <div class="habits-header">
          <h1>Mis Hábitos</h1>
          <button class="btn btn-primary" routerLink="/create-habit">Nuevo Hábito</button>
        </div>
        
        <div class="habits-list" *ngIf="habits.length > 0">
          <div *ngFor="let habit of habits" 
            class="habit-item"
            [ngClass]="getPriorityClass(habit.priority)">
            <h3>{{ habit.title }}</h3>
            <div class="habit-environment">{{ habit.environment }}</div>
          </div>
        </div>
        
        <div class="no-habits" *ngIf="habits.length === 0">
          <p>No tienes hábitos configurados</p>
          <button class="btn btn-primary" routerLink="/create-habit">Crear mi primer hábito</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .habits-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .habits-content {
      padding: 2rem;
      margin-left: 250px;
      min-height: calc(100vh - 70px);
    }

    .habits-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .habits-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .habit-item {
      background-color: white;
      border-radius: var(--border-radius-md);
      padding: 1.5rem;
      box-shadow: var(--shadow-sm);
      transition: all var(--transition-fast);
    }

    .habit-item:hover {
      box-shadow: var(--shadow-md);
      transform: translateY(-3px);
    }

    .habit-item h3 {
      margin-bottom: 0.5rem;
    }

    .habit-environment {
      font-size: 0.85rem;
      color: var(--text-secondary);
      text-transform: capitalize;
    }

    .no-habits {
      text-align: center;
      padding: 3rem;
      background-color: white;
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-sm);
    }

    .no-habits p {
      margin-bottom: 1.5rem;
      color: var(--text-secondary);
    }

    .priority-high {
      border-top: 3px solid var(--error-color);
    }

    .priority-medium {
      border-top: 3px solid var(--warning-color);
    }

    .priority-low {
      border-top: 3px solid var(--success-color);
    }

    @media (max-width: 768px) {
      .habits-content {
        margin-left: 60px;
        padding: 1rem;
      }

      .habits-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
      }

      .habits-list {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HabitsComponent implements OnInit {
  habits: HabitPreview[] = [];
  
  constructor(private habitService: HabitService) {}

  ngOnInit(): void {
    this.loadHabits();
  }

  loadHabits(): void {
    this.habitService.getHabitsOfTheDayPreview().subscribe({
      next: (habits) => {
        this.habits = habits;
      },
      error: (error) => {
        console.error('Error loading habits:', error);
      }
    });
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
}