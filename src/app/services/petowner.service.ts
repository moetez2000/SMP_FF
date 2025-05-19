import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PetownerService {
  private apiUrl = 'http://localhost:8000/api/backoffice/petowners';


  constructor(private http: HttpClient) {}
  getPetOwners(): Observable<any[]> { /* retoune observale contenant tab d'element (les admins)*/
  
      return this.http.get<any>(this.apiUrl ).pipe(
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
  updateStatut(petOwnerId: number, newStatus: string): Observable<any> {
    console.log('Service called with', petOwnerId, newStatus);
    // Assurez-vous que l'URL et les paramètres sont corrects
    return this.http.put(`${this.apiUrl}/updateStatut/${petOwnerId}`, { status: newStatus });
  }
  addPetOwner(petOwnerData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, petOwnerData).pipe(
      catchError(error => {
        if (error.status === 422) {
          // Gestion des erreurs de validation
          return throwError(() => error.error.errors);
        }
        return throwError(() => 'Une erreur est survenue');
      })
    );
  }

  updatePetOwner(petOwnerId: number, petOwnerData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${petOwnerId}`, petOwnerData).pipe(
      catchError(error => {
        if (error.status === 422) {
          // Gestion des erreurs de validation
          return throwError(() => error.error.errors);
        }
        return throwError(() => 'Une erreur est survenue');
      })
    );

  }
  getPetOwnerById(petOwnerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${petOwnerId}`);
  }
  
  deletePetOwner(petOwnerId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${petOwnerId}`).pipe(
      catchError(error => {
        if (error.status === 422) {
          // Gestion des erreurs de validation
          return throwError(() => error.error.errors);
        }
        return throwError(() => 'Une erreur est survenue');
      })
    );
  }
  getByEmailOrName(term: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getByEmailOrName/${term}`).pipe(
      map((response: any) => {
        return Array.isArray(response) ? response : 
            response.data ? response.data : 
            [response];
      }),
      catchError(err => {
        console.error('Erreur API:', err);
        return of([]);
      })
    );
  }
  getByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getByStatut/${status}`).pipe(
      map((response: any) => {
        return Array.isArray(response) ? response : 
            response.data ? response.data : 
            [response];
      }),
      catchError(err => {
        console.error('Erreur API:', err);
        return of([]);
      })
    );
  }
  restoreOwner(petOwnerId: number): Observable<any> {
    return this.http.post<Response>(`${this.apiUrl}/restore/${petOwnerId}`, {});

  }   
  forceDelete(petOwnerId: number): Observable<any> {
    return this.http.delete<Response>(`${this.apiUrl}/forceDelete/${petOwnerId}`, {});
  }


}

  




  

