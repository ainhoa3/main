import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CookieService } from './cookie.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UserUpdatingDTO } from '../models/user.model';
import { StrikeDTO } from '../models/strike.model';
import { CredencialesUserDTO, AuthResponse, User } from '../models/user.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'https://dailyflowapi-d6ged4dtbrdbh0d6.spaincentral-01.azurewebsites.net/DailyFlow/api/users';
  private tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<UserUpdatingDTO | null>(null);
  
  currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(private http: HttpClient, private cookieService: CookieService) {
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

  getCurrentUser(): UserUpdatingDTO | null {
    return this.currentUserSubject.value;
  }

  private initializeUser(): void {
    const token = this.getToken();
    
    if (token) {
      try {
        const decodedToken: any = jwtDecode(token);
        if (decodedToken) {
          const user: User = {
            id: decodedToken.nameid || 0,
            username: decodedToken.unique_name || '',
            email: decodedToken.email || '',
            streak: 0
          };
          this.currentUserSubject.next(user);
          this.getUserStreak().subscribe(streak => {
            const updatedUser = { ...user, streak };
            this.currentUserSubject.next(updatedUser);
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
    const token = this.getToken();
    return this.http.get<User>(`${this.apiUrl}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  getUserStreak(): Observable<number> {
    const token = this.getToken();
    return this.http.get<number>(`${this.apiUrl}/streak`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  }

  getCurrentUser$(): Observable<UserUpdatingDTO> {
    const token = this.getToken();
    if (!token) {
      return new Observable<UserUpdatingDTO>((subscriber) => {
        subscriber.error('No token available');
      });
    }
    return this.http.get<UserUpdatingDTO>(`${this.apiUrl}/GetCurrentUser`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).pipe(
      tap((user) => {
        this.currentUserSubject.next(user);
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
    this.cookieService.deleteCookie(this.tokenKey);
  }
}