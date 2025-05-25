import { Component, HostListener, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-text">DailyFlow</span>
        </div>
        <button class="toggle-btn" (click)="toggleSidebar()" aria-label="Toggle sidebar">
          <span class="hamburger">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
      <nav class="nav-menu">
        <ul>
          <li>
            <a 
              routerLink="/dashboard" 
              [class.active]="currentUrl === '/dashboard'" 
              class="nav-link"
            >
              <span class="icon">📊</span>
              <span class="text">Dashboard</span>
            </a>
          </li>
          <li>
            <a 
              routerLink="/tasks" 
              [class.active]="currentUrl === '/tasks'" 
              class="nav-link"
            >
              <span class="icon">📝</span>
              <span class="text">Tareas</span>
            </a>
          </li>
          <li>
            <a 
              routerLink="/habits" 
              [class.active]="currentUrl === '/habits'" 
              class="nav-link"
            >
              <span class="icon">🔄</span>
              <span class="text">Hábitos</span>
            </a>
          </li>
          <li>
            <a 
              routerLink="/calendar" 
              [class.active]="currentUrl === '/calendar'" 
              class="nav-link"
            >
              <span class="icon">📆</span>
              <span class="text">Calendario</span>
            </a>
          </li>
          <li>
            <a 
              routerLink="/search" 
              [class.active]="currentUrl === '/search'" 
              class="nav-link"
            >
              <span class="icon">🔍</span>
              <span class="text">Buscar</span>
            </a>
          </li>
        </ul>
      </nav>
      <div class="sidebar-footer">
        <a routerLink="/settings" class="nav-link">
          <span class="icon">⚙️</span>
          <span class="text">Ajustes</span>
        </a>
        <button (click)="logout()" class="nav-link logout">
          <span class="icon">🚪</span>
          <span class="text">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  `,
  styles: [`
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
    }

    .hamburger {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 20px;
      height: 14px;
      position: relative;
    }

    .hamburger span {
      display: block;
      width: 100%;
      height: 2px;
      background: var(--primary-color, #2ecc71);
      border-radius: 2px;
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
      
      .logo span {
        display: none;
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
  isMobile = false;

  constructor(private router: Router) {
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
    // Call auth service logout method
    this.router.navigate(['/']);
  }
}