import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';


@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule, FormsModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent {
  constructor(private router: Router) {}
  zones = [
    { name: 'Poivrons', status: 'En arrêt' },
    { name: 'Tomates', status: 'En croissance' },
    { name: 'Salades', status: 'En pause' },
    { name: 'Carottes', status: 'Actif' }
  ];

  reservoirVolume = 50;
}
