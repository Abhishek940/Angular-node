import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { UserServiceService } from './servics/user-service.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(readonly userService: UserServiceService, readonly router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get access token from localStorage
    let accessToken = localStorage.getItem('token'); 

    // If access token exists, add it to request headers
    if (accessToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}` // Add Authorization header
        }
      });
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401 || error.status === 403) {
          console.error('Token expired or invalid, attempting to refresh or logout...');
          // Get refresh token from localStorage
          const refreshToken = localStorage.getItem('refreshToken');
          if (refreshToken) {
            return this.userService.refreshToken(refreshToken).pipe(
              switchMap((response: any) => {
                const newAccessToken = response.accessToken;
                localStorage.setItem('token', newAccessToken); // Store new access token in localStorage

                // Clone the original request with the new access token
                const clonedRequest = req.clone({
                  setHeaders: {
                    Authorization: `Bearer ${newAccessToken}`
                  }
                });

                // Retry the original request with the new access token
                return next.handle(clonedRequest);
              }),
              catchError((refreshError) => {
                // If refresh fails, log out the user
              if (refreshError.status === 400 || refreshError.status === 402) {
                  // Handle the case where the refresh token itself is expired
                  console.log('Refresh token expired, logging out...');
                }
                this.userService.logout();
                this.router.navigate(['/'])
                return throwError(()=> new Error('Error refreshing token'));
              })
            );
          } else {
            // No refresh token available, log out immediately
            console.log('No refresh token available, logging out...');
            this.userService.logout();
            this.router.navigate(['/'])
            return throwError(() => new Error('No refresh token available')); 
          }
        }

        //  other errors
        return throwError(()=>(error));
      })
    );
  }

  
}
