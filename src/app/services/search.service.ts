import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'http://localhost:8000/api/backoffice/SearchSitter';
  private apiUrl2 = 'http://localhost:8000/api/backoffice/petowners';
    private apiUrl3 = 'http://localhost:8000/api/backoffice/pets';


  constructor(private http: HttpClient) { }

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
    getPets(): Observable<any[]> {
  return this.http.get<any>(this.apiUrl3).pipe(
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
    

    getSearchs(): Observable<any[]> {
  return this.http.get<any>(this.apiUrl).pipe(
    map(response => {
      // Si la réponse contient "Pets", retourner ce tableau.
      return Array.isArray(response.Searchs) ? response.Searchs : [];
    }),
    catchError(err => {
      console.error('Erreur API:', err);
      return of([]); // on cas derreur , retiurne un tab vide
    })
  );
}
getPetsByOwner(ownerId: number): Observable<any[]> {
  return this.http.get<any>(`http://localhost:8000/api/backoffice/pets/owner/${ownerId}`).pipe(
    map(response => {
      // Vérifie si la clé "Pets" existe et retourne les pets
      return response.Pets || []; // Renvoie les pets ou un tableau vide si aucun pet trouvé
    }),
    catchError(err => {
      console.error('Erreur API (getPetsByOwner):', err);
      return of([]); // Si erreur, renvoie un tableau vide
    })
  );
}




addSearch( searchData: FormData): Observable<any> {
  return this.http.post(`${this.apiUrl}/add`, searchData).pipe(
    catchError(error => {
      if (error.status === 422) {
        // Gestion des erreurs de validation
        return throwError(() => error.error.errors);
      }
      return throwError(() => 'Une erreur est survenue');
    })
  );  }

  updateSearch(searchId: number, searchData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/update/${searchId}`, searchData).pipe(
      catchError(error => {
        if (error.status === 422) {
          // Gestion des erreurs de validation
          return throwError(() => error.error.errors);
        }
        return throwError(() => 'Une erreur est survenue');
      })
    );
  } 
  deleteSearch(searchId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/delete/${searchId}`).pipe(
      catchError(error => {
        console.error('Erreur lors de la suppression:', error);
        return throwError(() => 'Une erreur est survenue lors de la suppression');
      })
    );
  }
  getSearchById(searchId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${searchId}`).pipe(
      catchError(error => {
        console.error('Erreur lors de la récupération de la recherche:', error);
        return throwError(() => 'Une erreur est survenue lors de la récupération de la recherche');
      })
    );
  }
  getByOwnerOrStartDate(term: string): Observable<any[]> {
  return this.http.get<any>(`${this.apiUrl}/search/${term}`).pipe(
    map((response: any) => {
      return Array.isArray(response.searchs) ? response.searchs : [];
    }),
    catchError(err => {
      console.error('Erreur API:', err);
      return of([]);
    })
  );
}




}