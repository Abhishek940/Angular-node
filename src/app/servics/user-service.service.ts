import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class UserServiceService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Get all items
   getProducts(): Observable<any> {
    return this.http.post(`${this.apiUrl}/getProduct`, {});  
  }
  
  // get product by id
  getProductById(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/getProductById`, { id });
  }
  
  // Create 
  addOrUpdateProduct(product: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, product);
  }

  // Update 
  updateItem(id: number, updatedItem: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/items/${id}`, updatedItem);
  }

  // Delete 
   deleteProduct(id: number): Observable<any> {
      return this.http.post(`${this.apiUrl}/products/${id}`,{id});
  }

  // add user
  addUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/addUser`, user);
  }

// login
  login(userData:any){
    return this.http.post(`${this.apiUrl}/login`,userData)
  }

//forgot password
  forgotPassword(post:any){
    return this.http.post<any>(`${this.apiUrl}/forgotPass`,post)
  }

//reset-pass
resetPassword(resetToken: string, password: string): Observable<any> {
  return this.http.post<any>(`${this.apiUrl}/reset-password`, {resetToken,password
  });
}

refreshToken(refreshToken:any){
  const storedRefreshToken = localStorage.getItem('refreshToken');
  return this.http.post<any>(`${this.apiUrl}/refresh-token`, { refreshToken: storedRefreshToken });
}

  logout(){
      localStorage.removeItem('token');  
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('username'); 
      return this.http.post<any>(`${this.apiUrl}/logout`,{})
    }
}
