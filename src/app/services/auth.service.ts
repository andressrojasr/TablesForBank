import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor() {}

  isAuthenticated(): boolean {
    const user = localStorage.getItem('user');
    return !!user;
  }

  login(userData: any) {
    localStorage.setItem('user', JSON.stringify(userData));
  }

  logout() {
    localStorage.removeItem('user');
  }

  getUser() {
    return JSON.parse(localStorage.getItem('user') || 'null');
  }
}
