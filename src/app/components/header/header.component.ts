import { Component, Input, OnInit } from '@angular/core';
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
        <div class="page-title">{{ pageName }}</div>
        <div class="header-actions">
          <button class="action-btn" (click)="navigateToCreateTask()">
            Nueva tarea
          </button>
          <button class="action-btn" (click)="navigateToCreateHabit()">
            Nuevo hábito
          </button>
          <div class="user-info">
            <div *ngIf="userStreak !== undefined" class="streak-container" (click)="navigateToStreakMetrics()">
              <span class="streak-icon">🔥</span>
              <span class="streak-count">{{ userStreak }}</span>
            </div>
            <div *ngIf="username !== undefined" class="username">{{ username }}</div>
            <div *ngIf="usernameInitial !== undefined" class="avatar">{{ usernameInitial }}</div>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      width: 100%;
      background-color: white;
      border-bottom: 1px solid var(--border-color);
      min-height: 70px;
      position: relative;
      z-index: 100;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
      height: 100%;
      width: 100%;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .user-info {
      display: flex;
      align-items: center;
    }

    .streak-container {
      display: flex;
      align-items: center;
      margin-right: 1.5rem;
      background-color: rgba(243, 156, 18, 0.1);
      padding: 0.35rem 0.75rem;
      border-radius: 4px;
      min-width: 60px;
      justify-content: center;
      cursor: pointer;
    }

    .streak-icon {
      margin-right: 0.3rem;
      font-size: 1.1rem;
      color: var(--warning-color, #ff4444);
    }

    .streak-count {
      font-weight: 600;
      color: var(--warning-color, #ff4444);
    }

    .username {
      margin-right: 0.75rem;
      font-weight: 500;
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: var(--primary-color);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
      white-space: nowrap;
      font-size: 0.9rem;
    }

    .action-btn:hover {
      background-color: var(--primary-dark);
      transform: translateY(-1px);
    }

    .action-btn:active {
      transform: translateY(0);
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0.5rem 1rem;
        justify-content: flex-end;
      }

      .page-title {
        display: none;
      }

      .username {
        display: none;
      }

      .action-btn {
        padding: 0.5rem 0.8rem;
        font-size: 0.85rem;
      }

      .avatar {
        width: 36px;
        height: 36px;
        font-size: 0.9rem;
      }

      .streak-container {
        margin-right: 1rem;
        min-width: 50px;
        padding: 0.25rem 0.6rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Input() pageName: string = '';
  username: string | undefined = undefined;
  usernameInitial: string | undefined = undefined;
  userStreak: number | undefined = undefined;
  isMobileMenuOpen = false;
  currentUser: any = {
    id: 0,
    username: '',
    email: '',
    streak: 0,
    preference: ''
  };

  constructor(private authService: AuthService, private router: Router) {
    // Initialize user info immediately
    const currentUser = this.authService.getCurrentUser();
    if (currentUser?.username) {
      this.username = currentUser.username;
      this.usernameInitial = currentUser.username.charAt(0).toUpperCase();
      this.userStreak = currentUser.streak ?? 0;
    }
  }

  ngOnInit(): void {
    // Subscribe to changes
    this.authService.currentUser$.subscribe(user => {
      if (user?.username) {
        this.username = user.username;
        this.usernameInitial = user.username.charAt(0).toUpperCase();
        this.userStreak = user.streak ?? 0;
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
       this.username =this.currentUser.username;
      
      }
      
    });
  }
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('show-mobile-menu');
    }
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