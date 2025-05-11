import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { TaskPreview } from '../../models/task.model';
import { TaskDetailComponent } from '../tasks/task-detail/task-detail.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, TaskDetailComponent],
  template: `
    <div class="calendar-page">
      <h1>Calendario de Tareas</h1>
      
      <div class="calendar-controls">
        <button class="btn btn-outline" (click)="previousMonth()">&lt; Anterior</button>
        <h2>{{ currentMonthYear }}</h2>
        <button class="btn btn-outline" (click)="nextMonth()">Siguiente &gt;</button>
      </div>
      
      <div class="calendar">
        <div class="weekdays">
          <div class="weekday">Dom</div>
          <div class="weekday">Lun</div>
          <div class="weekday">Mar</div>
          <div class="weekday">Mié</div>
          <div class="weekday">Jue</div>
          <div class="weekday">Vie</div>
          <div class="weekday">Sáb</div>
        </div>
        
        <div class="days">
          <div 
            *ngFor="let day of calendarDays" 
            class="day" 
            [class.other-month]="!day.isCurrentMonth"
            [class.today]="day.isToday"
            [class.has-tasks]="day.tasks.length > 0"
            (click)="selectDay(day)"
          >
            <div class="day-number">{{ day.day }}</div>
            <div class="day-tasks" *ngIf="day.tasks.length > 0">
              <div 
                *ngFor="let task of day.tasks.slice(0, 3)" 
                class="day-task" 
                [ngClass]="getPriorityClass(task.priority)"
              >
                {{ task.title }}
              </div>
              <div *ngIf="day.tasks.length > 3" class="more-tasks">+{{ day.tasks.length - 3 }} más</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="day-detail" *ngIf="selectedDay">
        <h3>{{ formatSelectedDay() }}</h3>
        
        <div *ngIf="selectedDay.tasks.length === 0" class="no-tasks">
          No hay tareas para este día
        </div>
        
        <div *ngIf="selectedDay.tasks.length > 0" class="day-tasks-list">
          <div 
            *ngFor="let task of selectedDay.tasks" 
            class="task-item" 
            [class.completed]="task.done" 
            [ngClass]="getPriorityClass(task.priority)"
            (click)="openTaskDetail(task.id)"
          >
            <div class="task-title" [ngClass]="{'completed-title': task.done}">{{ task.title }}</div>
            <div class="task-environment">{{ task.environment }}</div>
          </div>
        </div>
      </div>

      <app-task-detail 
        *ngIf="showTaskDetail" 
        [taskId]="selectedTaskId" 
        (close)="closeTaskDetail()"
        (taskUpdated)="refreshCalendar()"
      ></app-task-detail>
    </div>
  `,
  styles: [`
    .calendar-page {
      padding: 2rem;
    }

    h1 {
      margin-bottom: 1.5rem;
    }

    .calendar-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .calendar-controls h2 {
      margin: 0;
    }

    .calendar {
      background-color: white;
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-md);
      overflow: hidden;
    }

    .weekdays {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      background-color: var(--primary-color);
      color: white;
    }

    .weekday {
      padding: 0.75rem;
      text-align: center;
      font-weight: 600;
    }

    .days {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
    }

    .day {
      min-height: 100px;
      border: 1px solid var(--border-color);
      padding: 0.5rem;
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .day:hover {
      background-color: rgba(46, 204, 113, 0.1);
    }

    .day-number {
      font-weight: 600;
      margin-bottom: 0.5rem;
    }

    .other-month {
      opacity: 0.5;
      background-color: #f9f9f9;
    }

    .today {
      background-color: rgba(46, 204, 113, 0.1);
      font-weight: bold;
    }

    .has-tasks {
      position: relative;
    }

    .has-tasks::after {
      content: "";
      position: absolute;
      top: 5px;
      right: 5px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: var(--primary-color);
    }

    .day-tasks {
      font-size: 0.8rem;
      overflow: hidden;
    }

    .day-task {
      margin-bottom: 2px;
      padding: 2px 4px;
      border-radius: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      background-color: rgba(46, 204, 113, 0.1);
    }

    .more-tasks {
      font-size: 0.7rem;
      text-align: center;
      color: var(--text-secondary);
    }

    .day-detail {
      margin-top: 2rem;
      background-color: white;
      border-radius: var(--border-radius-md);
      padding: 1.5rem;
      box-shadow: var(--shadow-md);
    }

    .day-detail h3 {
      margin-bottom: 1rem;
      font-size: 1.2rem;
    }

    .day-tasks-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .no-tasks {
      padding: 2rem;
      text-align: center;
      color: var(--text-secondary);
    }

    .task-item {
      display: flex;
      flex-direction: column;
      padding: 0.75rem;
      background-color: var(--background-color);
      border-radius: var(--border-radius-sm);
      cursor: pointer;
      transition: background-color var(--transition-fast);
    }

    .task-item:hover {
      background-color: rgba(46, 204, 113, 0.1);
    }

    .task-title {
      font-weight: 500;
      margin-bottom: 0.25rem;
    }

    .completed-title {
      text-decoration: line-through;
      color: var(--text-secondary);
    }

    .task-environment {
      font-size: 0.8rem;
      color: var(--text-secondary);
      text-transform: capitalize;
    }

    .priority-high {
      border-left: 3px solid var(--error-color);
    }

    .priority-medium {
      border-left: 3px solid var(--warning-color);
    }

    .priority-low {
      border-left: 3px solid var(--success-color);
    }

    @media (max-width: 768px) {
      .days {
        grid-template-columns: repeat(7, 1fr);
      }
      
      .day {
        min-height: 80px;
        padding: 0.25rem;
        font-size: 0.85rem;
      }

      .day-task {
        display: none;
      }

      .day-detail {
        margin-top: 1rem;
        padding: 1rem;
      }
    }
  `]
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  currentMonth: number;
  currentYear: number;
  calendarDays: {
    day: number;
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    tasks: TaskPreview[];
  }[] = [];
  
  selectedDay: {
    day: number;
    date: Date;
    isCurrentMonth: boolean;
    isToday: boolean;
    tasks: TaskPreview[];
  } | null = null;
  
  showTaskDetail = false;
  selectedTaskId = 0;

  constructor(private taskService: TaskService) {
    this.currentMonth = this.currentDate.getMonth();
    this.currentYear = this.currentDate.getFullYear();
  }

  ngOnInit(): void {
    this.generateCalendar();
  }

  get currentMonthYear(): string {
    return new Intl.DateTimeFormat('es-ES', { 
      month: 'long', 
      year: 'numeric' 
    }).format(new Date(this.currentYear, this.currentMonth, 1));
  }

  generateCalendar(): void {
    const firstDayOfMonth = new Date(this.currentYear, this.currentMonth, 1);
    const lastDayOfMonth = new Date(this.currentYear, this.currentMonth + 1, 0);
    
    // Previous month days
    const firstDayWeekday = firstDayOfMonth.getDay();
    const daysFromPrevMonth = firstDayWeekday === 0 ? 0 : firstDayWeekday;
    
    // Current and next month days
    const totalDays = 42; // 6 weeks
    const today = new Date();
    
    this.calendarDays = [];

    // Add days from previous month
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(this.currentYear, this.currentMonth, -i);
      this.calendarDays.push({
        day: date.getDate(),
        date: date,
        isCurrentMonth: false,
        isToday: this.isSameDay(date, today),
        tasks: []
      });
    }

    // Add days from current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(this.currentYear, this.currentMonth, i);
      this.calendarDays.push({
        day: i,
        date: date,
        isCurrentMonth: true,
        isToday: this.isSameDay(date, today),
        tasks: []
      });
    }

    // Add days from next month
    const remainingDays = totalDays - this.calendarDays.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(this.currentYear, this.currentMonth + 1, i);
      this.calendarDays.push({
        day: i,
        date: date,
        isCurrentMonth: false,
        isToday: this.isSameDay(date, today),
        tasks: []
      });
    }

    // Fetch tasks for each day in the calendar
    this.loadTasksForCalendar();
  }

  isSameDay(date1: Date, date2: Date): boolean {
    return date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear();
  }

  loadTasksForCalendar(): void {
    const startDate = this.calendarDays[0].date;
    const endDate = this.calendarDays[this.calendarDays.length - 1].date;

    // For each day, fetch tasks
    this.calendarDays.forEach((day, index) => {
      this.taskService.getTasksByDate(day.date).subscribe({
        next: (tasks) => {
          // Update the tasks for this day
          this.calendarDays[index].tasks = tasks;
          
          // If this is the selected day, update the selected day's tasks
          if (this.selectedDay && this.isSameDay(this.selectedDay.date, day.date)) {
            this.selectedDay.tasks = tasks;
          }
        },
        error: (error) => {
          console.error(`Error loading tasks for ${day.date.toDateString()}:`, error);
        }
      });
    });
  }

  previousMonth(): void {
    this.currentMonth--;
    if (this.currentMonth < 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    this.generateCalendar();
    this.selectedDay = null;
  }

  nextMonth(): void {
    this.currentMonth++;
    if (this.currentMonth > 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    this.generateCalendar();
    this.selectedDay = null;
  }

  selectDay(day: typeof this.calendarDays[0]): void {
    this.selectedDay = { ...day };
  }

  formatSelectedDay(): string {
    if (!this.selectedDay) return '';
    
    return new Intl.DateTimeFormat('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    }).format(this.selectedDay.date);
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

  openTaskDetail(taskId: number): void {
    this.selectedTaskId = taskId;
    this.showTaskDetail = true;
  }

  closeTaskDetail(): void {
    this.showTaskDetail = false;
  }

  refreshCalendar(): void {
    this.loadTasksForCalendar();
  }
}