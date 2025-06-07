import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-mobile-navbar',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule
  ],
  template: `
    <nav class="mobile-navbar">
      <a 
        routerLink="/dashboard" 
        [class.active]="currentUrl === '/dashboard'" 
        class="nav-item"
        (click)="setActiveLink('dashboard')"
      >
        <span class="nav-text">Inicio</span>
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
      padding-bottom: env(safe-area-inset-bottom, 0);
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
  `]
})
export class MobileNavbarComponent {
  currentUrl: string = '';
  activeLink: string = 'dashboard';
  isMobile: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
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
    }
  }
}
