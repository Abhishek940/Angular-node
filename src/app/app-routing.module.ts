import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ProductComponent } from './product/product.component';
import {RegistrationComponent} from './registration/registration.component'
import { AuthGuard } from './auth.guard';
import { RoleGuard } from './role.guard';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import { RoleComponent } from './role/role.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path:'register',component:RegistrationComponent},
  { path:'forgot/password',component:ForgotPasswordComponent},
  { path:'reset-password/:resetToken',component:ResetPasswordComponent},
  { path: 'product', component: ProductComponent,canActivate:[AuthGuard] },
  { path:'role',component:RoleComponent,canActivate:[AuthGuard,RoleGuard]},
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
