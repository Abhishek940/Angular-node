import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AiResponse {
  success: boolean;
  answer?: string;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AiService {

  private apiUrl = 'http://localhost:3000/api/ai';
  constructor(private http: HttpClient) {}

  askAI(message: string): Observable<AiResponse> {
    return this.http.post<AiResponse>(this.apiUrl,{ message } );
  }
}
