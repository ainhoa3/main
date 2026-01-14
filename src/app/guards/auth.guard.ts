import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate() {
    // Verificar si el usuario está autenticado
    const isAuthenticated = this.authService.isAuthenticated();
    
    // Si no está autenticado, redirigir a landing
    if (!isAuthenticated) {
      this.router.navigate(['/landing']);
      return false;
    }

    // Verificar si hay un usuario actual
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.router.navigate(['/landing']);
      return false;
    }

    return true;
  }
}