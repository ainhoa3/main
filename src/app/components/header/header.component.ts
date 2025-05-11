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
        <div class="streak-container">
          <span class="streak-icon">🔥</span>
          <span class="streak-count">{{ userStreak }}</span>
        </div>
        <div class="username">{{ username }}</div>
        <div class="avatar">{{ usernameInitial }}</div>
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
      border-radius: var(--border-radius-sm);
    }

    .streak-icon {
      margin-right: 0.3rem;
      font-size: 1.1rem;
    }

    .streak-count {
      font-weight: 600;
      color: var(--warning-color);
    }

    .username {
      margin-right: 1rem;
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
  username: string = '';
  usernameInitial: string = '';
  userStreak: number = 0;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.username = user.username;
        this.usernameInitial = user.username.charAt(0).toUpperCase();
        this.userStreak = user.streak;
      }
    });
  }
}