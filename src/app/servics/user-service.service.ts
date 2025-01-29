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
   deleteItem(id: number): Observable<any> {
      return this.http.post(`${this.apiUrl}/products/${id}`,{id});
  }

  // add user

  addUser(user: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/addUser`, user);
  }

  login(userData:any){
    return this.http.post(`${this.apiUrl}/login`,userData)
  }

  logout() {
  
    localStorage.removeItem('token');  
    localStorage.removeItem('username');  
  
  }
  
}
