import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CredencialesUserDTO, AuthResponse, User } from '../models/user.model';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5112/DailyFlow/api/users';
  private tokenKey = 'auth_token';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  
  currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(private http: HttpClient) {
    this.initializeUser();
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
    return this.http.get<AuthResponse>(`${this.apiUrl}/RenovarToken`)
      .pipe(
        tap(response => {
          this.saveToken(response.token);
        })
      );
  }

  getUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users`);
  }

  getUserStreak(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/streak`);
  }

  addStreak(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/AddStrike`);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
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
    localStorage.removeItem(this.tokenKey);
    this.currentUserSubject.next(null);
  }
}