import { Routes } from '@angular/router';
import { LandingPageComponent } from './components/landing-page/landing-page.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { TaskComponent } from './components/tasks/task.component';
import { CreateTaskComponent } from './components/tasks/create-task/create-task.component';
import { CreateHabitComponent } from './components/habits/create-habit/create-habit.component';
import { CalendarComponent } from './components/calendar/calendar.component';
import { SearchComponent } from './components/search/search.component';
import { HabitsComponent } from './components/habits/habits.component';
import { SettingsComponent } from './components/settings/settings.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: LandingPageComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'settings', 
    component: SettingsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'tasks',
    component: TaskComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'create-task', 
    component: CreateTaskComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'habits', 
    component: HabitsComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'create-habit', 
    component: CreateHabitComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'calendar', 
    component: CalendarComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'search', 
    component: SearchComponent,
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '' }
];