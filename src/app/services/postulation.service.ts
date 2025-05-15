import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PostulationService {
  private apiUrl = 'http://localhost:8000/api/postulations';

  constructor(private http: HttpClient) { }
  getPostulations(): Observable<any[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => {
        // Si la réponse contient "Pets", retourner ce tableau.
        return Array.isArray(response.Postulations) ? response.Postulations : [];
      }),
      catchError(err => {
        console.error('Erreur API:', err);
        return of([]); // on cas derreur , retiurne un tab vide
      })
    );
  }

  addPostulation(postulationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, postulationData).pipe(
      catchError(error => {
        if (error.status === 422) {
          // Gestion des erreurs de validation
          return throwError(() => error.error.errors);
        }
        return throwError(() => 'Une erreur est survenue');
      })
    );
  }
  
  addPostulations(postulationData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/addMultiple`, postulationData).pipe(
      catchError(error => {
        if (error.status === 422) {
          // Gestion des erreurs de validation
          return throwError(() => error.error.errors);
        }
        return throwError(() => 'Une erreur est survenue');
      })
    );
  }
  updateStatut(postulationId: number, statut: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateStatut/${postulationId}`, { statut }).pipe(
      catchError(error => {
        if (error.status === 422) {
          // Gestion des erreurs de validation
          return throwError(() => error.error.errors);
        }
        return throwError(() => 'Une erreur est survenue');
      })
    );
  }
  searchByOwnerOrSitter(term: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/search/${term}`).pipe(
      map(response => {
        // Si la réponse contient "Pets", retourner ce tableau.
return Array.isArray(response.Postulations) ? response.Postulations : [];
      }),
      catchError(err => {
        console.error('Erreur API:', err);
        return of([]); // on cas derreur , retiurne un tab vide
      })
    );
  }






}
