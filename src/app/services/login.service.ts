import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';


const baseUrl = "http://localhost:8000"; 
@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) {}
  
  loginUser(loginData: any): Observable<any> {
    return this.http.post(baseUrl + "/api/login", loginData).pipe(
      tap((response: any) => {
        // Stockage du token dans localStorage s'il existe        
        if (response?.token) {
          localStorage.setItem('auth_token', response.token);
        }

        // Stockage des infos utilisateur (si présentes)
        if (response?.user_information) {
          localStorage.setItem('current_user', JSON.stringify(response.user_information));
        } 
      })
    );
  }

  // Méthode utilitaire pour récupérer le token (utile pour les autres services)
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

}
