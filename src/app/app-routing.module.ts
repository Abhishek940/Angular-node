import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ProductComponent } from './product/product.component';
import {RegistrationComponent} from './registration/registration.component'
import { AuthGuard } from './auth.guard';
const routes: Routes = [

  { path: '', component: LoginComponent },
  { path:'register',component:RegistrationComponent},
  { path: 'product', component: ProductComponent,canActivate:[AuthGuard] },
 
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
