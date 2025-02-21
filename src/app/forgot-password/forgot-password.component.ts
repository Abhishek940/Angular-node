import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { UserServiceService } from '../servics/user-service.service';
@Component({
  selector: 'app-forgot-password',
  standalone: false,
  
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent {

  forgotPasswordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private UserServiceService: UserServiceService,

    ) {}

  ngOnInit(): void {
    this.forgotPass();
  }
  forgotPass(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['',Validators['required']],
    
    });
  }

  onSubmit(){
    
    if (this.forgotPasswordForm.get('email')?.invalid) {
      Swal.fire({
        icon: 'error',
        title: 'Required',
        text: 'UserId is required.',
      });
    }
    if (this.forgotPasswordForm.valid) {
      const email = this.forgotPasswordForm.value;
      this.UserServiceService.forgotPassword(email).subscribe({
       next: (res: any) => {
            Swal.fire({
            icon: 'success',
            title: 'Reset password link sent to Email',
           
          })
        },
       error: (error: any) => {
          Swal.fire({
            icon: 'error',
            title: 'Invalid UserId',
          
          });
        }
      }

    );

    }


  }

}
