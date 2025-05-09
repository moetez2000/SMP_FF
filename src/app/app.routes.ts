import { Routes } from '@angular/router';
import { LoginComponent } from './basic/login/login.component';
import { AdminManagmentComponent } from './basic/admin-managment/admin-managment.component';
import { DashboardComponent } from './basic/dashboard/dashboard.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginLayoutComponent } from './layouts/login-layout/login-layout.component';
import { PetownerComponent } from './basic/petowner/petowner.component';
import { PetsitterComponent } from './basic/petsitter/petsitter.component';
import { PetComponent } from './basic/pet/pet.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        //canActivate: [AuthGuard], // si tu veux protéger
        children: [
            { path: 'admins', component: AdminManagmentComponent },

          { path: 'dashboard', component: DashboardComponent },
          {path:'petowners' ,component:PetownerComponent},
          {path:'petsitters' ,component:PetsitterComponent},
          {path:'pets' ,component:PetComponent},



          // autres routes privées ici
        ]
      },
      {
        path: '',
        component: LoginLayoutComponent,
        children: [
          { path: 'auth/login', component: LoginComponent },
        ]
      },
      //{ path: '**', redirectTo: 'auth/login' }
    ];


    

