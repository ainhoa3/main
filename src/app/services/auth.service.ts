import { Injectable, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserUpdatingDTO } from '../models/user.model';
import { StrikeDTO } from '../models/strike.model';
import { CredencialesUserDTO, AuthResponse, User } from '../models/user.model';
import { jwtDecode } from 'jwt-decode';
import { CacheService } from './cache.service';
import { StreakCelebrationService } from '../components/streak-celebration/streak-celebration.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://dailyflowapi-d6ged4dtbrdbh0d6.spaincentral-01.azurewebsites.net/DailyFlow/api/users';
  private tokenKey = 'auth_token';
  private tokenExpirationKey = 'auth_token_expiration';
  private currentUserSubject = new BehaviorSubject<UserUpdatingDTO | null>(null);
  
  currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(
    private http: HttpClient, 
    private cacheService: CacheService,
    @Inject(StreakCelebrationService) private streakCelebrationService: StreakCelebrationService
  ) {
    this.initializeUser();
  }

  addStrike(): Observable<any> {
    const token = this.getToken();
    return this.http.get<any>(`${this.apiUrl}/AddStrike`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  getStrikesOfYear(): Observable<StrikeDTO[]> {
    const token = this.getToken();
    const currentYear = new Date().getFullYear();
    return this.http.get<StrikeDTO[]>(`${this.apiUrl}/GetStrikesByYear/${currentYear}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  getStrikesOfMonth(): Observable<StrikeDTO[]> {
    const token = this.getToken();
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    return this.http.get<StrikeDTO[]>(`${this.apiUrl}/GetStrikesByMonth/${currentYear}/${currentMonth}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  getCurrentUser(): Observable<UserUpdatingDTO | null> {
    return this.currentUser$;
  }

  getCurrentUserId(): number | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.id || null;
  }

  private initializeUser(): void {
    const token = this.getToken();
    
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        if (decodedToken) {
          // First get user data from API
          this.getUser().subscribe(apiUser => {
            const user: User = {
              id: apiUser.id,
              username: apiUser.username,
              email: apiUser.userEmail,
              userEmail: apiUser.userEmail,
              streak: apiUser.streak,
              preference: apiUser.preference
            };
            
            // Save user data to localStorage
            localStorage.setItem('user', JSON.stringify(apiUser));
            
            // Update current user subject
            this.currentUserSubject.next(user);
            
            // Cache the user data
            this.cacheService.setUser(user);
            
            // Get streak from API
            this.getUserStreak().subscribe(streak => {
              const updatedUser = { ...user, streak };
              this.currentUserSubject.next(updatedUser);
              this.cacheService.setUser(updatedUser);
            });
          });
        }
      } catch (error) {
        console.error('Error decoding token:', error);
        this.logout();
      }
    }
  }

  register(credentials: CredencialesUserDTO): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/RegistroUsuario`, credentials)
      .pipe(
        tap(response => {
          this.saveToken(response.token);
          this.initializeUser();
        })
      );
  }

  login(credentials: CredencialesUserDTO): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/LoginUsuario`, credentials)
      .pipe(
        tap(response => {
          this.saveToken(response.token);
          this.initializeUser();
        })
      );
  }

  renewToken(): Observable<AuthResponse> {
    const token = this.getToken();
    return this.http.get<AuthResponse>(`${this.apiUrl}/RenovarToken`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(response => {
        this.saveToken(response.token, response.tokenExpiration);
      })
    );
  }

  getUser(): Observable<User> {
    const cachedUser = this.cacheService.getUser();
    if (cachedUser) {
      return new Observable<User>(observer => {
        observer.next(cachedUser);
        observer.complete();
      });
    }

    const token = this.getToken();
    return this.http.get<User>(`${this.apiUrl}/GetCurrentUser`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(user => {
        // Cache the user data from API
        this.cacheService.setUser(user);
        
        // Update current user subject with all properties
        this.currentUserSubject.next({
          id: user.id,
          username: user.username,
          email: user.email,
          userEmail: user.userEmail,
          streak: user.streak,
          preference: user.preference
        });
      })
    );
  }

  getUserStreak(): Observable<number> {
    const cachedUser = this.cacheService.getUser();
    if (cachedUser) {
      return new Observable<number>(observer => {
        observer.next(cachedUser.streak);
        observer.complete();
      });
    }

    const token = this.getToken();
    return this.http.get<number>(`${this.apiUrl}/streak`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(streak => {
        // Update cache with API value
        const currentUser = this.cacheService.getUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, streak };
          this.cacheService.setUser(updatedUser);
        }
      })
    );
  }

  addStreak(): Observable<{ date: string, streak: number, userId: string }> {
    const token = this.getToken();
    return this.http.get<{ date: string, streak: number, userId: string }>(`${this.apiUrl}/AddStrike`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(response => {
        // Mostrar celebración cuando se complete una racha
        this.streakCelebrationService.showCelebration();
        
        // Actualizar el usuario en caché con la nueva racha
        const currentUser = this.cacheService.getUser();
        if (currentUser) {
          const updatedUser = { ...currentUser, streak: response.streak };
          this.cacheService.setUser(updatedUser);
          this.currentUserSubject.next(updatedUser);
        }
      })
    );
  }

  deleteUser(): Observable<void> {
    const token = this.getToken();
    return this.http.delete<void>(`${this.apiUrl}/DeleteUser`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(() => {
        this.logout();
      })
    );
  }

  updateUser(user: UserUpdatingDTO): Observable<void> {
    const token = this.getToken();
    return this.http.post<void>(`${this.apiUrl}/UpdateUser`, user, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap(() => {
        this.initializeUser();
      })
    );
  }

  saveToken(token: string, expirationDate?: string): void {
    // Guardar el token en localStorage
    localStorage.setItem(this.tokenKey, token);
    
    // Si hay una fecha de expiración, guardarla también
    if (expirationDate) {
      localStorage.setItem(this.tokenExpirationKey, expirationDate);
    }
  }

  getToken(): string | null {
    // Verificar si el token ha expirado
    const expiration = localStorage.getItem(this.tokenExpirationKey);
    if (expiration) {
      const expirationDate = new Date(expiration);
      if (expirationDate <= new Date()) {
        this.logout();
        return null;
      }
    }
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const decodedToken: any = jwtDecode(token);
      const expirationDate = new Date(0);
      expirationDate.setUTCSeconds(decodedToken.exp);
      
      return expirationDate > new Date();
    } catch (error) {
      return false;
    }
  }

  logout(): void {
    // Eliminar solo los items específicos de autenticación
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.tokenExpirationKey);
    
    // Limpiar el servicio de caché
    this.cacheService.clearCache();
    
    // Limpiar el usuario actual
    this.currentUserSubject.next(null);
    
    // Completar el subject
    this.currentUserSubject.complete();
    
    // Limpiar sessionStorage por si acaso
    sessionStorage.clear();
  }
}