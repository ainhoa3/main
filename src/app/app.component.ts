import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthService } from './services/auth.service';
import { HeaderComponent } from './components/header/header.component';
import { PageTitleService } from './services/page-title.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent, HeaderComponent],
  template: `
    <div class="app-container">
      <app-sidebar 
        *ngIf="isLoggedIn && !isLandingPage"
        (toggleCollapse)="onSidebarToggle($event)"
        [collapsed]="isSidebarCollapsed"
      ></app-sidebar>
      <div 
        class="main-content" 
        [ngClass]="{
          'with-sidebar': isLoggedIn && !isLandingPage,
          'sidebar-collapsed': isLoggedIn && !isLandingPage && isSidebarCollapsed,
          'sidebar-expanded': isLoggedIn && !isLandingPage && !isSidebarCollapsed
        }"
      >
        <app-header *ngIf="isLoggedIn && !isLandingPage" [pageName]="currentPageName"></app-header>
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: var(--background-color);
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    /* Expanded state (default) */
    .main-content.with-sidebar.sidebar-expanded {
      margin-left: 260px;
    }

    /* Collapsed state */
    .main-content.with-sidebar.sidebar-collapsed {
      margin-left: 80px;
    }

    .content-wrapper {
      flex: 1;
      padding: 2rem;
      padding-top: 1rem;
      overflow-y: auto;
      height: calc(100vh - 70px);
      transition: all 0.3s ease;
    }

    @media (max-width: 768px) {
      .main-content.with-sidebar.sidebar-expanded,
      .main-content.with-sidebar.sidebar-collapsed {
        margin-left: 0;
      }

      .main-content.with-sidebar.sidebar-expanded {
        margin-left: 0;
      }

      .content-wrapper {
        padding: 1rem;
      }
    }
  `]
})
export class App {
  isSidebarCollapsed = false;
  isLoggedIn = false;
  isLandingPage = true;

  constructor(
    private authService: AuthService,
    private router: Router,
    private pageTitleService: PageTitleService
  ) {
    this.checkAuthStatus();
    this.listenToRouteChanges();
  }

  get currentPageName(): string {
    return this.pageTitleService.getPageTitle();
  }

  private checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
  }

  onSidebarToggle(isCollapsed: boolean) {
    this.isSidebarCollapsed = isCollapsed;
  }

  private listenToRouteChanges(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isLandingPage = event.url === '/' || event.url === '/login' || event.url === '/register';
      this.checkAuthStatus();
      
      // Update page name based on the route
      const url = event.url;
      if (url.includes('habits')) {
        this.pageTitleService.setPageTitle('Hábitos');
      } else if (url.includes('tasks')) {
        this.pageTitleService.setPageTitle('Tareas');
      } else if (url.includes('goals')) {
        this.pageTitleService.setPageTitle('Objetivos');
      } else if (url.includes('calendar')) {
        this.pageTitleService.setPageTitle('Calendario');
      } else if (url.includes('search')) {
        this.pageTitleService.setPageTitle('Buscar');
      } else if (url.includes('dashboard')) {
        this.pageTitleService.setPageTitle('Dashboard');
      } else {
        this.pageTitleService.setPageTitle('Dashboard');
      }
    });
  }
}