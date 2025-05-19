import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
//HttpClient:pour faire des appels HTTP
import { Injectable } from '@angular/core';
//Injectable : indiquer que ce service  sera injecté dans d'autres componenet
import { BehaviorSubject, Observable, of } from 'rxjs';
//observable: gerer des reponses asynchrones
//
import { catchError, map } from 'rxjs/operators';
//tchError, map : des operateurs pour transformer les donnes  et gerer les erreur
import { throwError } from 'rxjs';

interface AdminData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  gender: string;
}
interface ApiResponse {
  success: boolean;
  message: string;
  admin: any;
  errors?: any;
}

@Injectable({
  providedIn: 'root'
}) // rend service disponible partout dans l'app : pas besoin de le declarer dans un module
export class AdminManagmentService {
  private apiUrl = 'http://localhost:8000/api/backoffice/admins';
  //url vers le backend  
  private adminsSubject = new BehaviorSubject<any[]>([]);
  admins = this.adminsSubject.asObservable();


  constructor(private http: HttpClient) {}



  getAdmins(): Observable<any[]> { /* retoune observale contenant tab d'element (les admins)*/
    
  

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
//scenario: 
/* Ton composant appelle getAdmins() au démarrage.

Le service vérifie s’il y a un token dans le navigateur.

Il construit une requête GET avec un header Authorization.

L’API Laravel répond avec un objet contenant la liste des admins.

Le map() adapte la réponse pour renvoyer un tableau d’administrateurs propre.

Ton composant les affiche dans le tableau.*/
  // Nouvelle méthode dédiée à la recherche
  getByEmailOrPhone(term: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/getByEmailOrPhone/${term}`).pipe(
      map(response => {
        return Array.isArray(response) ? response :
               response.admins ? response.admins :
               [response];
      }),
      catchError(err => {
        console.error('Erreur recherche:', err);
        return of([]);
      })
    );
  }
  getAdminsByStatus(status: string): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/getByStatut/${status}`).pipe(
      map(response => {
        // Si la réponse contient un tableau d'admins, on le retourne
        return Array.isArray(response.admins) ? response.admins : [];
      }),
      catchError(err => {
        console.error('Erreur lors du filtrage par statut:', err);
        return of([]); // Retourner un tableau vide en cas d'erreur
      })
    );
  }
  
 
  
/*
getFilteredAdmins(filters: any): Observable<any[]> {
  let params = new HttpParams();

  // Ajouter chaque filtre s'il a une valeur
  Object.keys(filters).forEach(key => {
    if (filters[key] !== null && filters[key] !== '') {
      params = params.append(key, filters[key]);
    }
  });

  return this.http.get<any>(this.apiUrl, { params }).pipe(
    map(response => {
      return Array.isArray(response) ? response : 
             response.data ? response.data : 
             [response];
    }),
    catchError(err => {
      console.error('Erreur API:', err);
      return of([]);
    })
  );
} */

updateStatus(adminId: number, newStatus: string): Observable<any> {
  console.log('Service called with', adminId, newStatus);
  // Assurez-vous que l'URL et les paramètres sont corrects
  return this.http.put(`${this.apiUrl}/updateStatus/${adminId}`, { status: newStatus });
}


  getAdminById(adminId:number):Observable<any>{
  
    return this.http.get(`${this.apiUrl}/${adminId}`, );
  }

  
  addAdmin(adminData: AdminData) {
   
    return this.http.post<ApiResponse>(`${this.apiUrl}/add`, adminData).pipe(
      catchError(error => {
        if (error.status === 422) {
          // Gestion des erreurs de validation
          return throwError(() => error.error.errors);
        }
        return throwError(() => 'Une erreur est survenue');
      })
    );
  }

  updateAdmin(adminId: number, adminData: AdminData) {
   
    return this.http.put<ApiResponse>(`${this.apiUrl}/update/${adminId}`, adminData).pipe(
      catchError(error => {
        if (error.status === 422) {
          // Gestion des erreurs de validation
          return throwError(() => error.error.errors);
        }
        return throwError(() => 'Une erreur est survenue');
      })
    );
    }

  deleteAdmin(adminId: number): Observable<any> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/delete/${adminId}`).pipe(
      catchError(error => {
        if (error.status === 422) {
          // Gestion des erreurs de validation
          return throwError(() => error.error.errors);
        }
        return throwError(() => 'Une erreur est survenue');
      })
    );
  }
  restoreAdmin(adminId: number): Observable<any> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/restore/${adminId}`, {});
  }
  forceDelete(adminId: number): Observable<any> {
    return this.http.delete<ApiResponse>(`${this.apiUrl}/forceDelete/${adminId}`);
}


    
  
}