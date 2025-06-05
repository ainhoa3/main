import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from './cookie.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserUpdatingDTO } from '../models/user.model';
import { StrikeDTO } from '../models/strike.model';
import { CredencialesUserDTO, AuthResponse, User } from '../models/user.model';
import { jwtDecode } from 'jwt-decode';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://dailyflowapi-d6ged4dtbrdbh0d6.spaincentral-01.azurewebsites.net/DailyFlow/api/users';
  private tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<UserUpdatingDTO | null>(null);
  
  currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(
    private http: HttpClient, 
    private cookieService: CookieService,
    private cacheService: CacheService
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
              email: apiUser.email,
              streak: apiUser.streak
            };
            
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

  addStreak(): Observable<number> {
    const token = this.getToken();
    return this.http.get<number>(`${this.apiUrl}/AddStrike`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
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
    if (expirationDate) {
      // Calculate days until expiration
      const expDate = new Date(expirationDate);
      const currentDate = new Date();
      const daysUntilExpiration = Math.ceil((expDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Save token with calculated expiration
      this.cookieService.setCookie(this.tokenKey, token, daysUntilExpiration);
    } else {
      // Fallback: save token for 7 days if no expiration provided
      this.cookieService.setCookie(this.tokenKey, token, 7);
    }
  }

  getToken(): string | null {
    return this.cookieService.getCookie(this.tokenKey);
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
    // Clear all cookies
    this.cookieService.deleteAllCookies();
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear cache service
    this.cacheService.clearCache();
    
    // Clear current user subject
    this.currentUserSubject.next(null);
    
    // Clear any remaining token
    this.cookieService.deleteCookie(this.tokenKey);
    
    // Ensure all subscriptions are unsubscribed
    this.currentUserSubject.complete();
    
    // Clear any other storage
    window.sessionStorage.clear();
    window.localStorage.clear();
  }
}