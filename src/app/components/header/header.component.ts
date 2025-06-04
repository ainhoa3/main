import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { MediaMatcher } from '@angular/cdk/layout';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <button class="toggle-sidebar-btn" (click)="toggleSidebar()">
            <i class="fas fa-bars"></i>
          </button>
          <h1 class="page-title">{{ pageName }}</h1>
        </div>
        <div class="header-actions">
          <button class="action-btn" (click)="navigateToCreateTask()">
            <i class="fas fa-plus"></i>
            <span class="btn-text">Nueva tarea</span>
          </button>
          <button class="action-btn" (click)="navigateToCreateHabit()">
            <i class="fas fa-plus"></i>
            <span class="btn-text">Nuevo hábito</span>
          </button>
          <button class="action-btn" (click)="navigateToStreakMetrics()">
            <i class="fas fa-fire"></i>
            <span class="btn-text">Rachas</span>
          </button>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="user-name hide-mobile">{{ userName }}</span>
            <button class="user-avatar">
              <i class="fas fa-user"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background-color: white;
      border-bottom: 1px solid var(--border-color);
      position: sticky;
      top: 0;
      z-index: 100;
      width: 100%;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-actions {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .header-right {
      display: flex;
      align-items: center;
    }

    .toggle-sidebar-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      color: var(--text-color);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .toggle-sidebar-btn:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-color);
      margin: 0;
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 4px;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .action-btn:hover {
      background-color: var(--primary-dark);
    }

    .btn-text {
      display: inline-block;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #f0f0f0;
      border: none;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .user-avatar:hover {
      background-color: #e0e0e0;
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0.75rem 1rem;
      }

      .btn-text {
        display: none;
      }

      .action-btn {
        padding: 0.5rem;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        justify-content: center;
      }

      .page-title {
        font-size: 1.25rem;
      }
    }
  `]
})
export class HeaderComponent {
  @Input() pageName: string = '';
  @Input() userName: string = 'Usuario';
  @Output() toggleSidebarEvent = new EventEmitter<void>();

  // Propiedades para el usuario
  username: string = '';
  usernameInitial: string = '';
  userStreak: number = 0;
  isMobileMenuOpen: boolean = false;
  currentUser: any = {
    id: 0,
    username: '',
    email: '',
    streak: 0,
    preference: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    // Inicializar información del usuario
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.username) {
      this.username = currentUser.username;
      this.usernameInitial = currentUser.username.charAt(0).toUpperCase();
      this.userStreak = currentUser.streak ?? 0;
      this.userName = currentUser.username;
    }
  }

  toggleSidebar() {
    this.toggleSidebarEvent.emit();
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.toggleSidebarEvent.emit();
    
    // Alternar la clase en el sidebar directamente
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('show-mobile-menu');
    }
  }

  ngOnInit(): void {
    // Suscribirse a cambios en el usuario
    this.authService.currentUser$.subscribe(user => {
      if (user?.username) {
        this.username = user.username;
        this.usernameInitial = user.username.charAt(0).toUpperCase();
        this.userStreak = user.streak ?? 0;
        this.userName = user.username;
      }
    });
    
    this.loadUserData();
  }

  private loadUserData(): void {
    this.authService.getCurrentUser$().subscribe({
      next: (userData) => {
        this.currentUser = {
          ...this.currentUser,
          ...userData,
          preference: (userData as any).preference || ''
        };
        this.username = this.currentUser.username;
        this.userName = this.currentUser.username;
      }
    });
  }

  navigateToCreateTask(): void {
    this.router.navigate(['/create-task']);
  }

  navigateToCreateHabit(): void {
    this.router.navigate(['/create-habit']);
  }

  navigateToStreakMetrics(): void {
    this.router.navigate(['/streak-metrics']);
  }
}