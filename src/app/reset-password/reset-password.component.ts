import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserServiceService } from '../servics/user-service.service';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-reset-passqord',
  standalone: false,
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {

  resetToken: string='';
  newPassword: string = '';
  confirmPassword: string = '';
 
  restPasswordForm!: FormGroup;

  constructor(
      private fb: FormBuilder,
      private userService: UserServiceService,
      private router: Router,
      private route: ActivatedRoute,
  
      ) {}

   ngOnInit(): void {
    this.resepasstForm();
    // get the reset token from the URL
    this.route.paramMap.subscribe(params => {
      this.resetToken = params.get('resetToken')!;
      console.log('token',this.resetToken);
    });
  }

  resepasstForm(): void {
    this.restPasswordForm = this.fb.group({
      password:[''],
      token:[''],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]],
        
    });
  }
  ; 
  
  onSubmit(): void {
   
    const password = this.restPasswordForm.get('password')?.value;
    const confirmPassword = this.restPasswordForm.get('confirmPassword')?.value;
    const resetToken = this.route.snapshot.paramMap.get('resetToken'); 
  
    // Check if the new password and confirm password match
    if (password !== confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Password Mismatch',
        text: 'Passwords do not match!',
      });
      return;
    }
    
    this.userService.resetPassword(this.resetToken, password).subscribe({
      next:res => {
        console.log('response',res);
        Swal.fire({
          icon: 'success',
          text: 'Your password has been successfully reset!!',
        });
       this.router.navigate(['/']); 
     },
      error:error => {
        Swal.fire({
            icon: 'error',
            title: 'Failed to reset password. Please try again',
          });
      }
  });
  }

}
