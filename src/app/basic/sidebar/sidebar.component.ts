import { Component, AfterViewInit } from '@angular/core';
import * as bootstrap from 'bootstrap'; // Import Bootstrap
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent  {
   activePage: string = 'dashboard'; // Par défaut, la page active est "dashboard"

  setActive(page: string): void {
    this.activePage = page;
  }
  
  
}