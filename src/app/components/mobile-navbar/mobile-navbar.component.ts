import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { FileCheckIconComponent } from '../../shared/components/file-check-icon/file-check-icon.component';
import { ClockIconComponent } from '../../shared/components/clock-icon/clock-icon.component';
import { CalendarCheckIconComponent } from '../../shared/components/calendar-check-icon/calendar-check-icon.component';
import { SettingsGearIconComponent } from '../../shared/components/settings-gear-icon/settings-gear-icon.component';
import { LayoutPanelTopIconComponent } from '../../shared/components/layout-panel-top-icon/layout-panel-top-icon.component';

@Component({
  selector: 'app-mobile-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FileCheckIconComponent, 
    ClockIconComponent,
    CalendarCheckIconComponent,
    SettingsGearIconComponent,
    LayoutPanelTopIconComponent
  ],
  template: `
    <nav class="mobile-navbar">
      <a 
        routerLink="/dashboard" 
        [class.active]="currentUrl === '/dashboard'" 
        class="nav-item"
        (click)="setActiveLink('dashboard')"
      >
        <app-layout-panel-top-icon class="icon" [size]="24" [isHovered]="activeLink === 'dashboard'"></app-layout-panel-top-icon>
        <span class="nav-text">Inicio</span>
      </a>
      
      <a 
        routerLink="/tasks" 
        [class.active]="currentUrl === '/tasks'" 
        class="nav-item"
        (click)="setActiveLink('tasks')"
      >
        <app-file-check-icon class="icon" [size]="24" [isHovered]="activeLink === 'tasks'"></app-file-check-icon>
        <span class="nav-text">Tareas</span>
      </a>
      
      <a 
        routerLink="/habits" 
        [class.active]="currentUrl === '/habits'" 
        class="nav-item"
        (click)="setActiveLink('habits')"
      >
        <app-clock-icon class="icon" [size]="24" [isHovered]="activeLink === 'habits'"></app-clock-icon>
        <span class="nav-text">Hábitos</span>
      </a>
      
      <a 
        routerLink="/calendar" 
        [class.active]="currentUrl === '/calendar'" 
        class="nav-item"
        (click)="setActiveLink('calendar')"
      >
        <app-calendar-check-icon class="icon" [size]="24" [isHovered]="activeLink === 'calendar'"></app-calendar-check-icon>
        <span class="nav-text">Calendario</span>
      </a>
      
      <a 
        routerLink="/settings" 
        [class.active]="currentUrl === '/settings'" 
        class="nav-item"
        (click)="setActiveLink('settings')"
      >
        <app-settings-gear-icon class="icon" [size]="24" [isHovered]="activeLink === 'settings'"></app-settings-gear-icon>
        <span class="nav-text">Ajustes</span>
      </a>
    </nav>
  `,
  styles: [`
    .mobile-navbar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 60px;
      background-color: var(--background-color);
      display: flex;
      justify-content: space-around;
      align-items: center;
      border-top: 1px solid var(--border-color);
      z-index: 1000;
      box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      /* Manejo seguro para dispositivos con muescas */
      padding-bottom: env(safe-area-inset-bottom, 0);
      /* Asegurar que esté siempre visible */
      position: fixed !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
    }

    .nav-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      color: var(--text-secondary);
      font-size: 0.7rem;
      padding: 5px 0;
      flex: 1;
      transition: all 0.2s ease;
      opacity: 0.7;
      height: 100%;
      box-sizing: border-box;
      
      &:active {
        transform: scale(0.95);
      }
    }

    .nav-item.active {
      color: var(--primary-color);
      opacity: 1;
      font-weight: 500;
    }
    
    .nav-item .icon {
      margin-bottom: 3px;
      transition: transform 0.2s ease;
    }
    
    .nav-item.active .icon {
      transform: translateY(-2px);
    }
    
    .nav-text {
      font-size: 0.65rem;
      margin-top: 2px;
      transition: font-weight 0.2s ease;
    }
    
    .nav-item.active .nav-text {
      font-weight: 600;
    }
    
    /* Ajustes para dispositivos más pequeños */
    @media (max-width: 360px) {
      .nav-text {
        font-size: 0.6rem;
      }
      
      .nav-item .icon {
        transform: scale(0.9);
      }
    }
    
    /* Asegurar que la barra de navegación no se superponga con el área segura en iOS */
    @supports (padding: max(0px)) {
      .mobile-navbar {
        padding-bottom: max(env(safe-area-inset-bottom, 10px), 10px);
      }
    }

    @media (min-width: 769px) {
      .mobile-navbar {
        display: none;
      }
    }
  `]
})
export class MobileNavbarComponent {
  currentUrl: string = '';
  activeLink: string = 'dashboard';
  isMobile: boolean = false;

  constructor(private router: Router) {
    this.checkIfMobile();
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.url;
      this.setActiveLinkFromUrl(event.url);
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkIfMobile();
  }

  private checkIfMobile() {
    this.isMobile = window.innerWidth < 769;
  }

  setActiveLink(link: string) {
    this.activeLink = link;
  }

  private setActiveLinkFromUrl(url: string) {
    if (url.includes('dashboard')) {
      this.activeLink = 'dashboard';
    } else if (url.includes('tasks')) {
      this.activeLink = 'tasks';
    } else if (url.includes('habits')) {
      this.activeLink = 'habits';
    } else if (url.includes('calendar')) {
      this.activeLink = 'calendar';
    } else if (url.includes('settings')) {
      this.activeLink = 'settings';
    }
  }
}
