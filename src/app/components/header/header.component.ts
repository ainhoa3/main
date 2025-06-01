import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="header">
      <div class="page-title">{{ pageName }}</div>
      <div class="user-info">
        <div *ngIf="userStreak !== undefined" class="streak-container">
          <span class="streak-icon">🔥</span>
          <span class="streak-count">{{ userStreak }}</span>
        </div>
        <div *ngIf="username !== undefined" class="username">{{ username }}</div>
        <div *ngIf="usernameInitial !== undefined" class="avatar">{{ usernameInitial }}</div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background-color: white;
      border-bottom: 1px solid var(--border-color);
      min-height: 70px;
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

    @media (max-width: 768px) {
      .username {
        display: none;
      }

      .page-title {
        font-size: 1.2rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  @Input() pageName: string = '';
  username: string | undefined = undefined;
  usernameInitial: string | undefined = undefined;
  userStreak: number | undefined = undefined;

  constructor(private authService: AuthService) {
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
  }
}