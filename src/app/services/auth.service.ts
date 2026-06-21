import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthUser } from '../models/auth-user.model';

interface FirebaseAuthResponse {
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly storageKey = 'bagcraftUser';
  private readonly authBaseUrl = 'https://identitytoolkit.googleapis.com/v1/accounts';
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();
  private tokenTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  register(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<FirebaseAuthResponse>(`${this.authBaseUrl}:signUp?key=${environment.firebaseApiKey}`, {
        email,
        password,
        returnSecureToken: true
      })
      .pipe(
        map(response => this.handleAuth(response)),
        catchError(error => this.handleError(error))
      );
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.http
      .post<FirebaseAuthResponse>(`${this.authBaseUrl}:signInWithPassword?key=${environment.firebaseApiKey}`, {
        email,
        password,
        returnSecureToken: true
      })
      .pipe(
        map(response => this.handleAuth(response)),
        catchError(error => this.handleError(error))
      );
  }

  autoLogin(): void {
    const rawUser = localStorage.getItem(this.storageKey);
    if (!rawUser) {
      return;
    }

    const user = JSON.parse(rawUser) as AuthUser;
    if (user.expiresAt <= Date.now()) {
      this.logout(false);
      return;
    }

    this.currentUserSubject.next(user);
    this.autoLogout(user.expiresAt - Date.now());
  }

  logout(redirect = true): void {
    localStorage.removeItem(this.storageKey);
    this.currentUserSubject.next(null);
    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
      this.tokenTimer = null;
    }
    if (redirect) {
      this.router.navigateByUrl('/login');
    }
  }

  autoLogout(durationMs: number): void {
    if (this.tokenTimer) {
      clearTimeout(this.tokenTimer);
    }
    this.tokenTimer = setTimeout(() => this.logout(), durationMs);
  }

  getCurrentUser(): AuthUser | null {
    const subjectValue = this.currentUserSubject.value;
    if (subjectValue) {
      return subjectValue;
    }

    const rawUser = localStorage.getItem(this.storageKey);
    if (!rawUser) {
      return null;
    }

    const user = JSON.parse(rawUser) as AuthUser;
    return user.expiresAt > Date.now() ? user : null;
  }

  getToken(): string {
    const token = this.getCurrentUser()?.token;
    if (!token) {
      throw new Error('Korisnik nije prijavljen.');
    }
    return token;
  }

  getUserId(): string {
    const userId = this.getCurrentUser()?.id;
    if (!userId) {
      throw new Error('Korisnik nije prijavljen.');
    }
    return userId;
  }

  getUserEmail(): string {
    return this.getCurrentUser()?.email ?? '';
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }

  isAdmin(): boolean {
    const email = this.getUserEmail().toLowerCase();
    return environment.adminEmails.map(adminEmail => adminEmail.toLowerCase()).includes(email);
  }

  private handleAuth(response: FirebaseAuthResponse): AuthUser {
    const expiresAt = Date.now() + Number(response.expiresIn) * 1000;
    const user: AuthUser = {
      id: response.localId,
      email: response.email,
      token: response.idToken,
      expiresAt
    };

    localStorage.setItem(this.storageKey, JSON.stringify(user));
    this.currentUserSubject.next(user);
    this.autoLogout(Number(response.expiresIn) * 1000);
    return user;
  }

  private handleError(error: any): Observable<never> {
    const code = error?.error?.error?.message;
    let message = 'Došlo je do greške. Pokušaj ponovo.';

    if (code === 'EMAIL_EXISTS') {
      message = 'Korisnik sa ovom email adresom već postoji.';
    } else if (code === 'EMAIL_NOT_FOUND' || code === 'INVALID_PASSWORD' || code === 'INVALID_LOGIN_CREDENTIALS') {
      message = 'Email ili lozinka nisu ispravni.';
    } else if (code === 'WEAK_PASSWORD : Password should be at least 6 characters') {
      message = 'Lozinka mora imati najmanje 6 karaktera.';
    } else if (code === 'INVALID_EMAIL') {
      message = 'Email adresa nije ispravna.';
    }

    return throwError(() => new Error(message));
  }
}
