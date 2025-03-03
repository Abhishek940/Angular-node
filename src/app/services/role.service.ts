import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Create 
  addOrUpdateRole(role: any): Observable<any> {
    console.log(role);
    return this.http.post(`${this.apiUrl}/addRole`, role);
  }

  // get all role
  getRole():Observable<any>{
    return this.http.post(`${this.apiUrl}/getRole`,{})
  }
}
