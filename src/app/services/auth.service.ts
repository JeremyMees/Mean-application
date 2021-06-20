import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthData } from '../models/authData';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

const BACKEND_URL = `${environment.apiUrl}/auth`;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  isAuthenticated = false;
  token: string | null = null;
  authStatusListener$ = new Subject<boolean>();
  tokenTimer: any;
  userId_: string | undefined;

  constructor(private http: HttpClient, private router: Router) {}

  getToken(): string {
    return this.token as string;
  }

  getAuthStatusListener(): Observable<boolean> {
    return this.authStatusListener$.asObservable();
  }

  getIsAuth(): boolean {
    return this.isAuthenticated;
  }

  getUserId(): string {
    return this.userId_ as string;
  }

  createUser(email: string, password: string): void {
    const authData: AuthData = { email: email, password: password };
    this.http.post(`${BACKEND_URL}/signup`, authData).subscribe(
      () => {
        this.router.navigate(['/']);
      },
      (error) => {
        this.authStatusListener$.next(false);
      }
    );
  }

  autoAuthUser(): void {
    const authInformation = this.getAuthData_();
    if (!authInformation) {
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.userId_ = authInformation.userId;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener$.next(true);
    }
  }

  logIn(email: string, password: string): void {
    const authData: AuthData = { email: email, password: password };
    this.http
      .post<{ token: string; expiresIn: number; userId: string }>(
        `${BACKEND_URL}/login`,
        authData
      )
      .subscribe(
        (response) => {
          const token = response.token;
          this.token = token;
          if (token) {
            const expiresInDuration = response.expiresIn;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.userId_ = response.userId;
            this.authStatusListener$.next(true);
            const now = new Date();
            const expirationDate = new Date(
              now.getTime() + expiresInDuration * 1000
            );
            this.saveAuthData_(token, expirationDate, this.userId_);
            this.router.navigate(['/']);
          }
        },
        (error) => {
          this.authStatusListener$.next(false);
        }
      );
  }

  logOut(): void {
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener$.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData_();
    this.userId_ = undefined;
    this.router.navigate(['/']);
  }

  private setAuthTimer(duration: number): void {
    this.tokenTimer = setTimeout(() => {
      this.logOut();
    }, duration * 1000);
  }

  private saveAuthData_(
    token: string,
    expiresInDate: Date,
    userId: string
  ): void {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expiresInDate.toISOString());
    localStorage.setItem('userId', userId);
  }

  private clearAuthData_(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData_():
    | { token: string; expirationDate: Date; userId: string }
    | undefined {
    const token = localStorage.getItem('token') as string;
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId') as string;
    if (!token || !expirationDate) {
      return;
    }
    return {
      token,
      expirationDate: new Date(expirationDate),
      userId: userId,
    };
  }
}
