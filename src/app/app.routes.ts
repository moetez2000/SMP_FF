import { Routes } from '@angular/router';
import { LoginComponent } from './basic/login/login.component';
import { AdminManagmentComponent } from './basic/admin-managment/admin-managment.component';
import { DashboardComponent } from './basic/dashboard/dashboard.component';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { LoginLayoutComponent } from './layouts/login-layout/login-layout.component';
import { PetownerComponent } from './basic/petowner/petowner.component';
import { PetsitterComponent } from './basic/petsitter/petsitter.component';
import { PetComponent } from './basic/pet/pet.component';
import { SearchComponent } from './basic/search/search.component';
import { PostulationComponent } from './basic/postulation/postulation.component';
import { SidebarComponent } from './basic/sidebar/sidebar.component';

export const routes: Routes = [
   {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full' // très important
  },
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
          {path:'searchs' ,component:SearchComponent},
          {path:'postulations' ,component:PostulationComponent},






          // autres routes privées ici
        ]
      },
      {
    path: 'login',
    component: LoginLayoutComponent,
    children: [
      { path: '', component: LoginComponent } // <- attention ici aussi
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
    ];


    

