import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export function loginInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {

  // 1. Ne traite que les requêtes vers /auth/login
  if (!req.url.includes('/api/adminlogin')) {
    return next(req); // Laisse passer les autres requêtes
  }
  console.log('🔐 Intercepteur Login activé pour :', req.url); 


  // 2. Ajoute les headers spécifiques au login (optionnel)
  const loginReq = req.clone({
    setHeaders: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });

  // 3. Exécute la requête et capture les erreurs de login
  return next(loginReq).pipe(
    catchError((error) => {
      if (error.status === 401) {
        console.error('Échec du login : Credentiels invalides');
        // Vous pouvez aussi émettre un événement ou rediriger ici
      }
      return throwError(() => error);
    }) 
  );
}