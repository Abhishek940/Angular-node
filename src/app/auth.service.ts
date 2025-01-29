import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() { }

  // This method can be used to check if the user is logged in
  isAuthenticated(): boolean {
    // You can check for a token in localStorage or sessionStorage
    return !!localStorage.getItem('token');
  }

  // This method can be used to log the user out
  logout(): void {
    localStorage.removeItem('token');
  }

  // This method can be used to log the user in
  login(token: string): void {
    localStorage.setItem('token', token);
  }
}
