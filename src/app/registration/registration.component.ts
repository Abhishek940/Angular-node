import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserServiceService } from '../servics/user-service.service';
@Component({
  selector: 'app-registration',
  standalone: false,
  
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.css'
})
export class RegistrationComponent {

  registrationForm!: FormGroup;
    isRegister: boolean = false;
  
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
      this.registrationForm = this.fb.group({
        name:['',[Validators.required]],
        mobile:['',[Validators.required,Validators.minLength(10)]],
        email: ['', [Validators.required]],
        password: ['', [Validators.required]],
      });
    }
  
     onSubmit(): void {
           
           if (this.registrationForm.invalid) {
             if (this.registrationForm.get('name')?.invalid) {
                Swal.fire({
                  icon: 'error',
                  title: 'Error...',
                  text: 'Name is required!',
                  confirmButtonText: 'OK'
                });
                return;
              }
              if (this.registrationForm.get('mobile')?.invalid) {
                Swal.fire({
                  icon: 'error',
                  title: 'Error...',
                  text: 'MobileNO is required!',
                  confirmButtonText: 'OK'
                });
                return;
              }
              if (this.registrationForm.get('email')?.invalid) {
                Swal.fire({
                  icon: 'error',
                  title: 'Error...',
                  text: 'EmailId is required!',
                  confirmButtonText: 'OK'
                });
                return;
              }
              if (this.registrationForm.get('password')?.invalid) {
                Swal.fire({
                  icon: 'error',
                  title: 'Error...',
                  text: 'Password is required!',
                  confirmButtonText: 'OK'
                });
                return;
              }
            } else {
            
              // Prepare the data to send to the backend
              const userData: { name: any; mobile: any; email: any; password:any } = {
                name: this.registrationForm.get('name')?.value,
                mobile: this.registrationForm.get('mobile')?.value,
                email: this.registrationForm.get('email')?.value,
                password:this.registrationForm.get('password')?.value,
              };
                     
             this.UserServiceService.addUser(userData).subscribe(
                (res:any) => {
                  Swal.fire({
                    icon: 'success',
                    title: 'Success!',
                    text: res.msg,
                    confirmButtonText: 'OK'
                  })
                  .then(() => {
                   this.router.navigate(['/']);
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
  }
  

