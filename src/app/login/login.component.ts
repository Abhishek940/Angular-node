import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserServiceService } from '../servics/user-service.service';
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
             console.log('loginData',credential);      
            this.UserServiceService.login(credential).subscribe(
              (res:any) => {
                console.log('res',res);
                localStorage.setItem('token', res.token);
                localStorage.setItem('username', res.name);
                            
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
              (error) => {
                console.error('Error:', error);
                let errorMessage = error?.error?.msg || 'An unexpected error occurred';
                Swal.fire({
                  icon: 'error',
                  title: 'Error!',
                  text: errorMessage,
                  confirmButtonText: 'OK'
                });
              }
            );
          }
        }

        onLogout() {
          this.UserServiceService.logout();
          this.router.navigate(['/login'])
        }

}
