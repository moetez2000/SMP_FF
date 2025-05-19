import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PostulationService {
  private apiUrl = 'http://localhost:8000/api/backoffice/postulations';

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
   getPetsitterss(): Observable<any[]> { /* retoune observale contenant tab d'element ()*/

        return this.http.get<any>(`${this.apiUrl}/sitters/get` ).pipe(
  // faire une requete Get vers 'apiUrl' avec les headers
    //pipe: faire des traitements sur la reponse
    map(response => {
      /*but est renvoyé un tab toujour 
      si response est deja un table --> retourne le 
      et si la reponse est  objet qui contient une clé data on retorune : response.data
      et si ni tableau ni objet avec data donc enveloppe le dans un tab */
      return Array.isArray(response) ? response : 
          response.data ? response.data : 
          [response];
  }),
    catchError(err => {
      console.error('Erreur API:', err);
      return of([]);
      //en cas d'erreur : echec de requete : retourne un tab vide
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
getByStatut(statut: string): Observable<any[]> {
  return this.http.get<any>(`${this.apiUrl}/filterStatut/${statut}`).pipe(
    map(response => {
      // Si la réponse contient "Pets", retourner ce tableau.
      return Array.isArray(response.Postulations) ? response.Postulations : [];
    }),
    catchError(err => {
      console.error('Erreur API:', err);
      return of([]); // on cas derreur , retiurne un tab vide
    })
  );}
}
