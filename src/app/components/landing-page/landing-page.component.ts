import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CredencialesUserDTO } from '../../models/user.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUser, faLock, faEnvelope, faArrowRight, faEye, faEyeSlash, faCheck, faXmark, faTasks, faChartLine, faCalendarCheck } from '@fortawesome/free-solid-svg-icons';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  template: `
    <div class="landing-page">
      <header class="header">
        <div class="logo">DailyFlow</div>
        <div class="nav-buttons">
          <button class="btn btn-outline" (click)="showLoginModal = true">
            <fa-icon [icon]="faLock"></fa-icon>
            Iniciar Sesión
          </button>
          <button class="btn btn-primary" (click)="showRegisterModal = true">
            <fa-icon [icon]="faUser"></fa-icon>
            Registrarse
          </button>
        </div>
      </header>

      <main class="main-content">
        <div class="hero">
          <h1>Gestiona tu día a día con DailyFlow</h1>
          <p>Una aplicación simple pero poderosa para organizar tus tareas y construir hábitos positivos.</p>
          <button class="btn btn-primary hero-cta" (click)="showRegisterModal = true">
            <fa-icon [icon]="faArrowRight"></fa-icon>
            Empieza ahora - ¡Es gratis!
          </button>
        </div>

        <div class="features">
          <div class="feature-card">
            <div class="feature-icon">
              <fa-icon [icon]="faTasks"></fa-icon>
            </div>
            <h3>Gestión de tareas</h3>
            <p>Organiza tus tareas diarias, establece prioridades y cumple con tus objetivos.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <fa-icon [icon]="faChartLine"></fa-icon>
            </div>
            <h3>Seguimiento de hábitos</h3>
            <p>Crea y mantén hábitos saludables que te ayuden a mejorar cada día.</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">
              <fa-icon [icon]="faCalendarCheck"></fa-icon>
            </div>
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
            <button class="close-btn" (click)="showLoginModal = false">
            <fa-icon [icon]="faXmark"></fa-icon>
          </button>
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
            <button type="button" class="btn btn-outline" (click)="showLoginModal = false">
              <fa-icon [icon]="faXmark"></fa-icon>
              Cancelar
            </button>
            <button type="button" class="btn btn-primary" (click)="login()">
              <fa-icon [icon]="faLock"></fa-icon>
              Iniciar Sesión
            </button>
          </div>
        </div>
      </div>

      <!-- Register Modal -->
      <div class="modal-backdrop" *ngIf="showRegisterModal" (click)="closeModals($event)">
        <div class="modal-content">
          <div class="modal-header">
            <h2>Registrarse</h2>
            <button class="close-btn" (click)="showRegisterModal = false">
            <fa-icon [icon]="faXmark"></fa-icon>
          </button>
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
            <button type="button" class="btn btn-outline" (click)="showRegisterModal = false">
              <fa-icon [icon]="faXmark"></fa-icon>
              Cancelar
            </button>
            <button type="button" class="btn btn-primary" (click)="register()">
              <fa-icon [icon]="faUser"></fa-icon>
              Registrarse
            </button>
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

    /* Header Styles */
    .header {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background-color: white;
      box-shadow: var(--shadow-sm);
      gap: 1rem;
    }

    .logo {
      font-size: var(--font-size-3xl);
      font-weight: 700;
      color: var(--primary-color);
      margin: 0;
    }

    .nav-buttons {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
      width: 100%;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      padding: 1.5rem 1rem;
    }

    /* Hero Section */
    .hero {
      max-width: 800px;
      margin: 2rem auto 3rem;
      text-align: center;
      padding: 0 1rem;
    }

    .hero h1 {
      font-size: var(--font-size-3xl);
      margin-bottom: 1rem;
      color: var(--text-color);
      line-height: 1.2;
    }

    .hero p {
      font-size: var(--font-size-lg);
      color: var(--text-secondary);
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .hero-cta {
      padding: 0.75rem 1.5rem;
      font-size: var(--font-size-base);
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    /* Features Section */
    .features {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1rem;
    }

    .feature-card {
      background-color: white;
      border-radius: var(--border-radius-md);
      padding: 1.5rem;
      text-align: center;
      box-shadow: var(--shadow-md);
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .feature-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg);
    }

    .feature-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: var(--primary-color);
    }

    .feature-card h3 {
      font-size: var(--font-size-xl);
      margin-bottom: 0.75rem;
      color: var(--text-color);
    }

    .feature-card p {
      color: var(--text-secondary);
      margin: 0;
      font-size: var(--font-size-base);
      line-height: 1.6;
    }

    /* Footer */
    .footer {
      background-color: var(--text-color);
      color: white;
      text-align: center;
      padding: 1.5rem 1rem;
      margin-top: auto;
      font-size: var(--font-size-sm);
    }

    /* Tablet Styles */
    @media (min-width: 640px) {
      .header {
        flex-direction: row;
        padding: 1rem 1.5rem;
      }

      .nav-buttons {
        width: auto;
        justify-content: flex-end;
      }

      .hero {
        margin: 3rem auto 4rem;
      }

      .hero h1 {
        font-size: var(--font-size-4xl);
      }

      .features {
        grid-template-columns: repeat(2, 1fr);
        gap: 1.5rem;
      }
    }

    /* Desktop Styles */
    @media (min-width: 1024px) {
      .main-content {
        padding: 2rem 1.5rem;
      }

      .hero {
        margin: 4rem auto 5rem;
      }

      .hero h1 {
        font-size: 3rem;
      }

      .features {
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
        padding: 0 2rem;
      }

      .feature-card {
        padding: 2rem;
      }
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
export class LandingPageComponent implements OnInit {
  // Icons
  faUser = faUser;
  faLock = faLock;
  faEnvelope = faEnvelope;
  faArrowRight = faArrowRight;
  faEye = faEye;
  faEyeSlash = faEyeSlash;
  faCheck = faCheck;
  faXmark = faXmark;
  faTasks = faTasks;
  faChartLine = faChartLine;
  faCalendarCheck = faCalendarCheck;

  // Form controls
  loginForm: FormGroup;
  registerForm: FormGroup;
  loginFormSubmitted = false;
  registerFormSubmitted = false;
  loginError = '';
  registerError = '';
  showLoginModal = false;
  showRegisterModal = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private library: FaIconLibrary
  ) {
    // Add icons to the library
    this.library.addIcons(
      faUser, faLock, faEnvelope, faArrowRight, 
      faEye, faEyeSlash, faCheck, faXmark, 
      faTasks, faChartLine, faCalendarCheck
    );

    // Initialize forms
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

  ngOnInit(): void {
    // Component initialization
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