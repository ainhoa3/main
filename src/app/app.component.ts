import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './services/auth.service';
import { SidebarComponent } from './components/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SidebarComponent],
  template: `
    <div class="app-container">
      <app-sidebar *ngIf="isLoggedIn && !isLandingPage"></app-sidebar>
      <div class="main-content" [ngClass]="{'with-sidebar': isLoggedIn && !isLandingPage}">
        <router-outlet></router-outlet>
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
      background-color: var(--background-color);
    }

    .main-content.with-sidebar {
      margin-left: 250px;
    }

    @media (max-width: 768px) {
      .main-content.with-sidebar {
        margin-left: 60px;
      }
    }
  `]
})
export class App {
  isLoggedIn = false;
  isLandingPage = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.checkAuthStatus();
    this.listenToRouteChanges();
  }

  private checkAuthStatus(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
  }

  private listenToRouteChanges(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isLandingPage = event.url === '/' || event.url === '/login' || event.url === '/register';
      this.checkAuthStatus();
    });
  }
}