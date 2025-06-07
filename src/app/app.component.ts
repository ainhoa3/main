import { Component, ViewChild, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthService } from './services/auth.service';
import { HeaderComponent } from './components/header/header.component';
import { PageTitleService } from './services/page-title.service';
import { MobileNavbarComponent } from './components/mobile-navbar/mobile-navbar.component';
import { StreakCelebrationComponent } from './components/streak-celebration/streak-celebration.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    SidebarComponent, 
    HeaderComponent, 
    MobileNavbarComponent,
    StreakCelebrationComponent
  ],
  template: `
    <div class="app-container">
      <app-sidebar 
        *ngIf="isLoggedIn && !isLandingPage && !isMobile"
        (toggleCollapse)="onSidebarToggle($event)"
        [collapsed]="isSidebarCollapsed"
      ></app-sidebar>
      
      <div 
        class="main-content" 
        [ngClass]="{
          'with-sidebar': isLoggedIn && !isLandingPage && !isMobile,
          'sidebar-collapsed': isLoggedIn && !isLandingPage && isSidebarCollapsed && !isMobile,
          'sidebar-expanded': isLoggedIn && !isLandingPage && !isSidebarCollapsed && !isMobile,
          'mobile-view': isMobile
        }"
      >
        <app-header *ngIf="isLoggedIn && !isLandingPage" [pageName]="currentPageName"></app-header>
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </div>
      
      <app-mobile-navbar *ngIf="isMobile && isLoggedIn && !isLandingPage"></app-mobile-navbar>
      <app-streak-celebration></app-streak-celebration>
    </div>
  `,
  styles: [`
    .app-container {
      display: flex;
      min-height: 100vh;
      flex-direction: column;
      position: relative;
      padding-bottom: 60px; /* Space for mobile navbar */
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      background-color: var(--background-color);
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      width: 100%;
      position: relative;
    }

    /* Expanded state (default) */
    .main-content.with-sidebar.sidebar-expanded {
      margin-left: 260px;
      width: calc(100% - 260px);
    }

    /* Collapsed state */
    .main-content.with-sidebar.sidebar-collapsed {
      margin-left: 80px;
      width: calc(100% - 80px);
    }

    .content-wrapper {
      flex: 1;
      padding: 2rem;
      padding-top: 1rem;
      overflow-y: auto;
      height: calc(100vh - 70px);
      transition: all 0.3s ease;
      -webkit-overflow-scrolling: touch;
    }

    /* Mobile styles */
    @media (max-width: 768px) {
      .app-container {
        padding-bottom: 60px; /* Height of mobile navbar */
      }

      .main-content.with-sidebar.sidebar-expanded,
      .main-content.with-sidebar.sidebar-collapsed {
        margin-left: 0;
        width: 100%;
      }

      .content-wrapper {
        padding: 1rem;
        height: calc(100vh - 130px); /* Account for header and navbar */
        padding-bottom: 20px; /* Extra space at bottom */
      }

      /* Ensure content doesn't hide behind navbar */
      .main-content.mobile-view {
        padding-bottom: 0;
      }
    }

    /* Make sure the mobile navbar is always on top */
    app-mobile-navbar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }
  `]
})
export class App implements OnInit {
  isSidebarCollapsed = false;
  isLoggedIn = false;
  isLandingPage = true;
  isMobile = window.innerWidth < 768;

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkIfMobile();
  }

  private checkIfMobile() {
    this.isMobile = window.innerWidth < 768;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private pageTitleService: PageTitleService
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
    this.listenToRouteChanges();
    this.checkIfMobile();
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