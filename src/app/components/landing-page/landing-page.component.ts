import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CredencialesUserDTO } from '../../models/user.model';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="landing-page">
      <header class="header">
        <div class="logo">DailyFlow</div>
        <div class="nav-buttons">
          <button class="btn btn-outline" (click)="showLoginModal = true">Iniciar Sesión</button>
          <button class="btn btn-primary" (click)="showRegisterModal = true">Registrarse</button>
        </div>
      </header>

      <main class="main-content">
        <div class="hero">
          <h1>Gestiona tu día a día con DailyFlow</h1>
          <p>Una aplicación simple pero poderosa para organizar tus tareas y construir hábitos positivos.</p>
          <button class="btn btn-primary hero-cta" (click)="showRegisterModal = true">
            Empieza ahora - ¡Es gratis!
          </button>
        </div>

        <div class="features">
          <div class="feature-card">
            <div class="feature-icon">📋</div>
            <h3>Gestión de tareas</h3>
            <p>Organiza tus tareas diarias, establece prioridades y cumple con tus objetivos.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🔄</div>
            <h3>Seguimiento de hábitos</h3>
            <p>Crea y mantén hábitos saludables que te ayuden a mejorar cada día.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Visualiza tu progreso</h3>
            <p>Mantén tu racha de días consecutivos y visualiza tus tareas en un calendario.</p>
          </div>
        </div>
      </main>

      <footer class="footer">
        <p>© 2025 DailyFlow - Todos los derechos reservados</p>
      </footer>

      <!-- Login Modal -->
      <div class="modal-backdrop" *ngIf="showLoginModal" (click)="closeModals($event)">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Iniciar Sesión</h2>
            <button class="close-btn" (click)="showLoginModal = false">✕</button>
          </div>
          <div class="modal-body">
            <form [formGroup]="loginForm" (ngSubmit)="login()">
              <div class="form-group">
                <label for="loginEmail">Email</label>
                <input 
                  type="email" 
                  id="loginEmail" 
                  formControlName="email" 
                  class="form-control"
                  [ngClass]="{'error': loginFormSubmitted && loginForm.get('email')?.errors}"
                >
                <div class="error-message" *ngIf="loginFormSubmitted && loginForm.get('email')?.errors">
                  <span *ngIf="loginForm.get('email')?.errors?.['required']">Email es requerido</span>
                  <span *ngIf="loginForm.get('email')?.errors?.['email']">Formato de email inválido</span>
                </div>
              </div>

              <div class="form-group">
                <label for="loginPassword">Contraseña</label>
                <input 
                  type="password" 
                  id="loginPassword" 
                  formControlName="password" 
                  class="form-control"
                  [ngClass]="{'error': loginFormSubmitted && loginForm.get('password')?.errors}"
                >
                <div class="error-message" *ngIf="loginFormSubmitted && loginForm.get('password')?.errors">
                  <span *ngIf="loginForm.get('password')?.errors?.['required']">Contraseña es requerida</span>
                </div>
              </div>

              <div class="error-message" *ngIf="loginError">
                {{ loginError }}
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" (click)="showLoginModal = false">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="login()">Iniciar Sesión</button>
          </div>
        </div>
      </div>

      <!-- Register Modal -->
      <div class="modal-backdrop" *ngIf="showRegisterModal" (click)="closeModals($event)">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Registrarse</h2>
            <button class="close-btn" (click)="showRegisterModal = false">✕</button>
          </div>
          <div class="modal-body">
            <form [formGroup]="registerForm" (ngSubmit)="register()">
              <div class="form-group">
                <label for="registerUsername">Nombre de usuario</label>
                <input 
                  type="text" 
                  id="registerUsername" 
                  formControlName="username" 
                  class="form-control"
                  [ngClass]="{'error': registerFormSubmitted && registerForm.get('username')?.errors}"
                >
                <div class="error-message" *ngIf="registerFormSubmitted && registerForm.get('username')?.errors">
                  <span *ngIf="registerForm.get('username')?.errors?.['required']">Nombre de usuario es requerido</span>
                </div>
              </div>

              <div class="form-group">
                <label for="registerEmail">Email</label>
                <input 
                  type="email" 
                  id="registerEmail" 
                  formControlName="email" 
                  class="form-control"
                  [ngClass]="{'error': registerFormSubmitted && registerForm.get('email')?.errors}"
                >
                <div class="error-message" *ngIf="registerFormSubmitted && registerForm.get('email')?.errors">
                  <span *ngIf="registerForm.get('email')?.errors?.['required']">Email es requerido</span>
                  <span *ngIf="registerForm.get('email')?.errors?.['email']">Formato de email inválido</span>
                </div>
              </div>

              <div class="form-group">
                <label for="registerPassword">Contraseña</label>
                <input 
                  type="password" 
                  id="registerPassword" 
                  formControlName="password" 
                  class="form-control"
                  [ngClass]="{'error': registerFormSubmitted && registerForm.get('password')?.errors}"
                >
                <div class="error-message" *ngIf="registerFormSubmitted && registerForm.get('password')?.errors">
                  <span *ngIf="registerForm.get('password')?.errors?.['required']">Contraseña es requerida</span>
                  <span *ngIf="registerForm.get('password')?.errors?.['minlength']">La contraseña debe tener al menos 6 caracteres</span>
                </div>
              </div>

              <div class="error-message" *ngIf="registerError">
                {{ registerError }}
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline" (click)="showRegisterModal = false">Cancelar</button>
            <button type="button" class="btn btn-primary" (click)="register()">Registrarse</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .landing-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      background-color: white;
      box-shadow: var(--shadow-sm);
    }

    .logo {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--primary-color);
    }

    .nav-buttons {
      display: flex;
      gap: 1rem;
    }

    .main-content {
      flex: 1;
      padding: 2rem 1.5rem;
    }

    .hero {
      max-width: 800px;
      margin: 3rem auto 5rem;
      text-align: center;
    }

    .hero h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: var(--text-color);
    }

    .hero p {
      font-size: 1.2rem;
      color: var(--text-secondary);
      margin-bottom: 2rem;
    }

    .hero-cta {
      padding: 0.75rem 2rem;
      font-size: 1.1rem;
    }

    .features {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .feature-card {
      background-color: white;
      border-radius: var(--border-radius-md);
      padding: 2rem;
      text-align: center;
      box-shadow: var(--shadow-md);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
    }

    .feature-card p {
      color: var(--text-secondary);
    }

    .footer {
      background-color: var(--text-color);
      color: white;
      text-align: center;
      padding: 1.5rem;
      margin-top: auto;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: var(--text-secondary);
      cursor: pointer;
    }

    .close-btn:hover {
      color: var(--text-color);
    }

    input.error {
      border-color: var(--error-color);
    }

    @media (max-width: 768px) {
      .hero h1 {
        font-size: 2rem;
      }
      
      .hero p {
        font-size: 1rem;
      }

      .features {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class LandingPageComponent {
  showLoginModal = false;
  showRegisterModal = false;
  loginForm: FormGroup;
  registerForm: FormGroup;
  loginFormSubmitted = false;
  registerFormSubmitted = false;
  loginError = '';
  registerError = '';

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  closeModals(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (target.classList.contains('modal-backdrop')) {
      this.showLoginModal = false;
      this.showRegisterModal = false;
    }
  }

  login(): void {
    this.loginFormSubmitted = true;
    this.loginError = '';

    if (this.loginForm.valid) {
      const credentials: CredencialesUserDTO = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: () => {
          this.showLoginModal = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Login error:', error);
          this.loginError = 'Credenciales inválidas. Por favor, intente de nuevo.';
        }
      });
    }
  }

  register(): void {
    this.registerFormSubmitted = true;
    this.registerError = '';

    if (this.registerForm.valid) {
      const credentials: CredencialesUserDTO = {
        username: this.registerForm.value.username,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };

      this.authService.register(credentials).subscribe({
        next: () => {
          this.showRegisterModal = false;
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          console.error('Register error:', error);
          this.registerError = 'Error al registrar. Por favor, intente con otro email.';
        }
      });
    }
  }
}