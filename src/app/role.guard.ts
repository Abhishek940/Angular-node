import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class RoleGuard implements CanActivate {
  constructor( private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> | Promise<boolean> | boolean {
    const role = localStorage.getItem('role');
    if (role == 'admin')  {
      return true;
    } else {
      this.router.navigate(['/product']);
      return false;
    }
  }
}
