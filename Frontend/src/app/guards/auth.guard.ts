import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root', // Makes the guard globally available
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (token) {
      return true; // Allow navigation if token exists
    } else {
      this.router.navigate(['/sign-in']); // Redirect to sign-in page if no token
      return false;
    }
  }
}