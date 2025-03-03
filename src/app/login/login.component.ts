import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserServiceService } from '../servics/user-service.service';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm!: FormGroup;
  isRegister: boolean = false;
  msg: string='';
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private UserServiceService: UserServiceService,
  ) {}

  ngOnInit(): void {
    this.Register();
  }
  // Toggle between Login and Register
  toggleForm() {
    this.isRegister = !this.isRegister;
  }

  Register() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

   onSubmit(): void {
         
         if (this.loginForm.invalid) {
            if (this.loginForm.get('email')?.invalid) {
              Swal.fire({
                icon: 'error',
                title: 'Error...',
                text: 'Email is required!',
                confirmButtonText: 'OK'
              });
              return;
            }
            if (this.loginForm.get('password')?.invalid) {
              Swal.fire({
                icon: 'error',
                title: 'Error...',
                text: 'Password is required!',
                confirmButtonText: 'OK'
              });
              return;
            }
           } else {
              const credential: { email: any; password: any; } = {
              email: this.loginForm.get('email')?.value,
              password: this.loginForm.get('password')?.value,
             
            };
                
            this.UserServiceService.login(credential).subscribe({
              next:(res:any) => {
                localStorage.setItem('token', res.token);
                localStorage.setItem('refreshToken', res.refreshToken); // Refresh token
                localStorage.setItem('username', res.name);
                localStorage.setItem('role', res.Role);
                          
                Swal.fire({
                  icon: 'success',
                  title: 'Success!',
                  text:res.msg,
                  confirmButtonText: 'OK'
                })
                .then(() => {
                this.router.navigate(['/product']);
               }); 
              },
             error: (error) => {
                console.error('Error:', error);
                let errorMessage = error?.error?.msg || 'An unexpected error occurred';
                Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: errorMessage,
                  confirmButtonText: 'OK'
                });
              }
           });
          }
        }

        /*  refreshToken(refreshToken:any) {
          const refreshTokens = localStorage.getItem('refreshToken');
          console.log('refreshTokens',refreshTokens);
        
          if (!refreshTokens) {
            return this.logout(); // Log the user out if no refresh token is available
          }
          this.UserServiceService.refreshToken(refreshToken).subscribe({
               next: (res: any) => {
                localStorage.setItem('token', res.accessToken); // Update access token
                console.log('Access token refreshed');
              },
              error: (err) => {
                console.error('Refresh token failed', err);
                this.logout(); 
              }
            });
        } 
         */

        refreshToken(): Observable<any> {
          const refreshToken = localStorage.getItem('refreshToken');  // Get the refresh token from localStorage
          if (!refreshToken) {
            this.logout();  // Log out the user if there's no refresh token
           
          }
      
          return this.UserServiceService.refreshToken(refreshToken).pipe(
            switchMap((response: any) => {
              const newAccessToken = response.accessToken;  // Get the new access token
              localStorage.setItem('token', newAccessToken);  // Store the new access token in localStorage
              console.log('New Access Token:', newAccessToken);
              return of(response);  // Return the response to continue the flow
            }),
            catchError((error) => {
              console.error('Error refreshing token:', error);
              this.logout();  // Log out the user if refreshing the token fails
              return throwError(error);
            })
          );
        }
       
      
        // Manual Logout Function - When the user clicks the "Logout" button
        logout(): void {
          // Remove items from localStorage
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('username');
          this.UserServiceService.logout().subscribe({
            next: (response) => {
              console.log('Logged out successfully:', response.msg);
              this.router.navigate(['/']);  
            },
            error: (err) => {
              console.error('Logout failed:', err);
              this.router.navigate(['/']);  
            }
          });
        }
      
        

}
