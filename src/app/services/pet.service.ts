import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PetService {
  private apiUrl = 'http://localhost:8000/api/backoffice/pets';
  private apiUrl2 = 'http://localhost:8000/api/backoffice/petowners';


  constructor(private http: HttpClient) { }
  getPets(): Observable<any[]> {
  return this.http.get<any>(this.apiUrl).pipe(
    map(response => {
      // Si la réponse contient "Pets", retourner ce tableau.
      return Array.isArray(response.Pets) ? response.Pets : [];
    }),
    catchError(err => {
      console.error('Erreur API:', err);
      return of([]); // on cas derreur , retiurne un tab vide
    })
  );
}
 getPetOwners(): Observable<any[]> { /* retoune observale contenant tab d'element (les admins)*/
  
      return this.http.get<any>(this.apiUrl2 ).pipe(
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

  getById(petId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${petId}`);
  }
  getPetsByOwner(ownerId: number): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/owner${ownerId}`).pipe(
      map(response => {
        // Si la réponse contient "Pets", retourner ce tableau.
        return Array.isArray(response.Pets) ? response.Pets : [];
      }),
      catchError(err => {
        console.error('Erreur API:', err);
        return of([]); // on cas derreur , retiurne un tab vide
      })
    );
  }

  
  addPet( petData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/add`, petData).pipe(
      catchError(error => {
        if (error.status === 422) {
          // Gestion des erreurs de validation
          return throwError(() => error.error.errors);
        }
        return throwError(() => 'Une erreur est survenue');
      })
    );
  }
  

  updatePet(petId: number, petData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${petId}`, petData).pipe(
      catchError(error => {
        if (error.status === 422) {
          // Gestion des erreurs de validation
          return throwError(() => error.error.errors);
        }
        return throwError(() => 'Une erreur est survenue');
      })
    );
  }
  deletePet(petId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${petId}`).pipe(
      catchError(error => {
        if (error.status === 422) {
          // Gestion des erreurs de validation
          return throwError(() => error.error.errors);
        }
        return throwError(() => 'Une erreur est survenue');
      })
    );
  }
GetByTypeNameGender(term: string): Observable<any[]> {
  return this.http.get<any>(`${this.apiUrl}/search/${term}`).pipe(
    map(response => response.Pets || []),
    catchError(err => {
      console.error('Erreur API:', err);
      return of([]);
    })
  );
}




}
