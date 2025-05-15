import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class PetsitterService {
  private apiUrl = 'http://localhost:8000/api/petsitters';


  constructor(private http: HttpClient) { }
getPetsitters(): Observable<any[]> { /* retoune observale contenant tab d'element (les admins)*/

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
updateStatut(petSitterId: number, newStatus: string): Observable<any> {
      console.log('Service called with', petSitterId, newStatus);
      // Assurez-vous que l'URL et les paramètres sont corrects
      return this.http.put(`${this.apiUrl}/updateStatut/${petSitterId}`, { status: newStatus });
    }
 addPetSitter(petSitterData: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}/add`, petSitterData).pipe(
    catchError(error => {
      if (error.status === 422) {
        return throwError(() => error.error.errors);
      }
      return throwError(() => 'Une erreur est survenue');
    })
  );
}

 updatePetSitter(petSitterId: number, petSitterData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${petSitterId}`, petSitterData).pipe(
      catchError(error => {
        if (error.status === 422) {
          // Gestion des erreurs de validation
          return throwError(() => error.error.errors);
        }
        return throwError(() => 'Une erreur est survenue');
      })
    );
  }
  getPetSitterById(petSitterId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${petSitterId}`);
    
  }

  deletePetSitter(petSitterId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${petSitterId}`);
  }
  getByEmailPhoneName(term: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/getByEmailPhoneOrName/${term}`).pipe(
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
  restoreSitter(petSitterId: number): Observable<any> {
    return this.http.post<Response>(`${this.apiUrl}/restore/${petSitterId}`, {});

  }
  forceDelete(petSitterId: number): Observable<any> {
    return this.http.delete<Response>(`${this.apiUrl}/forceDelete/${petSitterId}`, {});
  }



 
  


 
}
   
  
  
  