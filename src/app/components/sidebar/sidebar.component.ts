import { Component, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FileCheckIconComponent } from '../../shared/components/file-check-icon/file-check-icon.component';
import { AuthService } from '../../services/auth.service';
import { ClockIconComponent } from '../../shared/components/clock-icon/clock-icon.component';
import { CalendarCheckIconComponent } from '../../shared/components/calendar-check-icon/calendar-check-icon.component';
import { SearchIconComponent } from '../../shared/components/search-icon/search-icon.component';
import { SettingsGearIconComponent } from '../../shared/components/settings-gear-icon/settings-gear-icon.component';
import { LayoutPanelTopIconComponent } from '../../shared/components/layout-panel-top-icon/layout-panel-top-icon.component';
import { LogoutIconComponent } from '../../shared/components/logout-icon/logout-icon.component';
import { MenuIconComponent } from '../../shared/components/menu-icon/menu-icon.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FileCheckIconComponent, 
    ClockIconComponent,
    CalendarCheckIconComponent,
    SearchIconComponent,
    SettingsGearIconComponent,
    LayoutPanelTopIconComponent,
    LogoutIconComponent,
    MenuIconComponent
  ],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed" (mouseleave)="resetAllHoverStates()">
      <div class="sidebar-header">
        <div class="logo">
        <img src="../../assets/logo.png" alt="DailyFlow Logo"  class="logo-image">
        </div>
        <button 
          class="toggle-btn" 
          (click)="toggleSidebar()" 
          aria-label="Toggle sidebar"
          (mouseenter)="onMenuHover(true)"
          (mouseleave)="onMenuHover(false)"
        >
          <app-menu-icon 
            class="menu-icon" 
            [size]="24" 
            [isAnimated]="isMenuHovered"
            [isOpen]="!collapsed"
          ></app-menu-icon>
        </button>
      </div>
      <nav class="nav-menu">
        <ul>
          <li class="nav-item">
            <a 
              routerLink="/dashboard" 
              [class.active]="currentUrl === '/dashboard'" 
              class="nav-link"
              (mouseenter)="onDashboardHover(true)"
              (mouseleave)="onDashboardHover(false)"
            >
              <app-layout-panel-top-icon class="icon" [size]="20" [isHovered]="isDashboardHovered"></app-layout-panel-top-icon>
              <span class="text">Dashboard</span>
            </a>
          </li>
          <li class="nav-item">
            <a 
              routerLink="/tasks" 
              [class.active]="currentUrl === '/tasks'" 
              class="nav-link"
              #tasksLink
              (mouseenter)="onTaskHover(true)"
              (mouseleave)="onTaskHover(false)"
            >
              <app-file-check-icon class="icon" [size]="20" [isHovered]="isTaskHovered"></app-file-check-icon>
              <span class="text">Tareas</span>
            </a>
          </li>
          <li class="nav-item">
            <a 
              routerLink="/habits" 
              [class.active]="currentUrl === '/habits'" 
              class="nav-link"
              (mouseenter)="onHabitsHover(true)"
              (mouseleave)="onHabitsHover(false)"
            >
              <app-clock-icon class="icon" [size]="20" [isHovered]="isHabitsHovered"></app-clock-icon>
              <span class="text">Hábitos</span>
            </a>
          </li>
          <li class="nav-item">
            <a 
              routerLink="/calendar" 
              [class.active]="currentUrl === '/calendar'" 
              class="nav-link"
              (mouseenter)="onCalendarHover(true)"
              (mouseleave)="onCalendarHover(false)"
            >
              <app-calendar-check-icon class="icon" [size]="20" [isHovered]="isCalendarHovered"></app-calendar-check-icon>
              <span class="text">Calendario</span>
            </a>
          </li>
          <li class="nav-item">
            <a 
              routerLink="/search" 
              [class.active]="currentUrl === '/search'" 
              class="nav-link"
              (mouseenter)="onSearchHover(true)"
              (mouseleave)="onSearchHover(false)"
            >
              <app-search-icon class="icon" [size]="20" [isHovered]="isSearchHovered"></app-search-icon>
              <span class="text">Buscar</span>
            </a>
          </li>
        </ul>
      </nav>
      <div class="sidebar-footer">
        <a 
          routerLink="/settings" 
          [class.active]="currentUrl === '/settings'" 
          class="nav-link"
          (mouseenter)="onSettingsHover(true)"
          (mouseleave)="onSettingsHover(false)"
        >
          <app-settings-gear-icon class="icon" [size]="20" [isHovered]="isSettingsHovered"></app-settings-gear-icon>
          <span class="text">Ajustes</span>
        </a>
        <button 
          (click)="logout()" 
          class="nav-link logout"
          (mouseenter)="onLogoutHover(true)"
          (mouseleave)="onLogoutHover(false)"
        >
          <app-logout-icon class="icon" [size]="20" [isHovered]="isLogoutHovered"></app-logout-icon>
          <span class="text">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
    .nav-item {
      position: relative;
      overflow: hidden;
    }
    
    .nav-item .nav-link {
      position: relative;
      z-index: 1;
      transition: all 0.3s ease;
    }
    
    .nav-item:hover .nav-link {
      transform: translateX(5px);
    }
    
    .sidebar {
      width: 260px;
      height: 100vh;
      background: linear-gradient(135deg, var(--primary-dark) 0%, var(--primary-medium) 100%);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 1000;
      padding: var(--spacing-md);
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    }

    .sidebar.collapsed {
      width: 80px;
    }

    .sidebar-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: var(--spacing-md);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: var(--spacing-md);
    }

    .logo {
      display: flex;
      align-items: center;
      color: var(--text-on-dark);
      transition: opacity 0.2s ease;
      white-space: nowrap;
      overflow: hidden;
    }

    .logo-text {
      transition: opacity 0.3s ease, margin-left 0.3s ease;
      opacity: 1;
      margin-left: 0.5rem;
    }

    .collapsed .logo-text {
      opacity: 0;
      width: 0;
      margin-left: 0;
      display: none;
    }

    .toggle-btn {
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      transition: background-color 0.2s;
      color: #000;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
        color: var(--primary-color, #2ecc71);
      }
    }

    .nav-menu {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-menu ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      color: var(--text-on-dark);
      text-decoration: none;
      transition: all var(--transition-fast);
      border-radius: 0;
      white-space: nowrap;
      overflow: hidden;
    }

    .nav-link .text {
      transition: opacity 0.3s ease, margin-left 0.3s ease;
      opacity: 1;
      margin-left: 0.75rem;
    }

    .collapsed .nav-link .text {
      opacity: 0;
      width: 0;
      margin-left: 0;
      display: none;
    }

    .nav-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .nav-link.active {
      background-color: var(--primary-medium);
      color: var(--text-on-dark);
    }

    .icon {
      margin-right: 0.75rem;
      width: 20px;
      display: inline-block;
      text-align: center;
    }

    .sidebar-footer {
      padding: 1rem 0;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logout {
      width: 100%;
      text-align: left;
      background: none;
      border: none;
      cursor: pointer;
      font-family: inherit;
      font-size: 1rem;
      color: var(--error-color);
    }

    .logo-image {
        width : 40%;
        min-width: 50px;
      }
    .logout:hover {
      background-color: rgba(231, 76, 60, 0.1);
    }

    @media (max-width: 768px) {
      .sidebar {
        width: 60px;
      }
      
      .text {
        display: none;
      }
      
      .icon {
        margin-right: 0;
      }
      
      
      
      .logo::after {
        content: "DF";
        font-weight: bold;
      }
    }
  `]
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Output() toggleCollapse = new EventEmitter<boolean>();
  
  currentUrl: string = '';
  isTaskHovered = false;
  isHabitsHovered = false;
  isCalendarHovered = false;
  isSearchHovered = false;
  isSettingsHovered = false;
  isDashboardHovered = false;
  isLogoutHovered = false;
  isMenuHovered = false;
  isMobile = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.checkIfMobile();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.url;
      // Auto-close sidebar on mobile when navigating
      if (this.isMobile) {
        this.collapsed = true;
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkIfMobile();
  }

  private checkIfMobile() {
    this.isMobile = window.innerWidth < 768;
    if (this.isMobile) {
      this.collapsed = true;
    }
  }

  toggleSidebar() {
    this.collapsed = !this.collapsed;
    this.toggleCollapse.emit(this.collapsed);
  }

  logout(): void {
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Call auth service logout method
    this.authService.logout();
    
    // Navigate to landing page
    this.router.navigate(['/landing']);
  }

  onTaskHover(isHovered: boolean): void {
    this.isTaskHovered = isHovered;
  }

  onHabitsHover(isHovered: boolean): void {
    this.isHabitsHovered = isHovered;
  }

  onCalendarHover(isHovered: boolean): void {
    this.isCalendarHovered = isHovered;
  }

  onSearchHover(isHovered: boolean): void {
    this.isSearchHovered = isHovered;
  }

  onSettingsHover(isHovered: boolean): void {
    this.isSettingsHovered = isHovered;
  }

  onDashboardHover(isHovered: boolean): void {
    this.isDashboardHovered = isHovered;
  }

  onLogoutHover(isHovered: boolean): void {
    this.isLogoutHovered = isHovered;
  }

  onMenuHover(isHovered: boolean): void {
    this.isMenuHovered = isHovered;
  }

  resetAllHoverStates(): void {
    this.isTaskHovered = false;
    this.isHabitsHovered = false;
    this.isCalendarHovered = false;
    this.isSearchHovered = false;
    this.isSettingsHovered = false;
    this.isDashboardHovered = false;
    this.isLogoutHovered = false;
    this.isMenuHovered = false;
  }
}