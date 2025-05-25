import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TodayTasksComponent } from '../tasks/today-tasks/today-tasks.component';
import { ExtraTasksComponent } from '../tasks/extra-tasks/extra-tasks.component';

@Component({
  selector: 'app-task',
  standalone: true,
  imports: [
    CommonModule,
    TodayTasksComponent,
    ExtraTasksComponent
  ],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-content">
        <div class="tasks-container">
          <div class="today-tasks">
            <app-today-tasks></app-today-tasks>
          </div>
          <div class="extra-tasks">
            <app-extra-tasks></app-extra-tasks>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    
    .dashboard-content {
      padding: 2rem;
      margin-left: 250px;
      min-height: calc(100vh - 70px);
    }

    .tasks-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .today-tasks, .extra-tasks {
      background-color: white;
      border-radius: var(--border-radius-md);
      box-shadow: var(--shadow-md);
      overflow: hidden;
      min-height: 400px;
    }

    @media (max-width: 768px) {
      .dashboard-content {
        margin-left: 60px;
        padding: 1rem;
      }

      .tasks-container {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class TaskComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
