import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="sidebar">
      <div class="logo">
        <span>DailyFlow</span>
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
      width: 250px;
      height: 100vh;
      background-color: white;
      border-right: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 10;
    }

    .logo {
      padding: 1.5rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-color);
      border-bottom: 1px solid var(--border-color);
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
      color: var(--text-color);
      text-decoration: none;
      transition: all var(--transition-fast);
      border-radius: 0;
    }

    .nav-link:hover {
      background-color: rgba(46, 204, 113, 0.1);
    }

    .nav-link.active {
      background-color: var(--primary-color);
      color: white;
    }

    .icon {
      margin-right: 0.75rem;
      width: 20px;
      display: inline-block;
      text-align: center;
    }

    .sidebar-footer {
      padding: 1rem 0;
      border-top: 1px solid var(--border-color);
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
  currentUrl: string = '';

  constructor(private router: Router) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.currentUrl = event.url;
    });
  }

  logout(): void {
    // Call auth service logout method
    this.router.navigate(['/']);
  }
}