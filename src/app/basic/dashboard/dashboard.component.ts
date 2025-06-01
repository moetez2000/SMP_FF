import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
    userName = 'Amal Dahmen';
  totalPets = 5;
  upcomingAppointments = 3;

  messages = 12;  ngOnInit() {
    console.log('DashboardComponent chargé');
  }
  
}
