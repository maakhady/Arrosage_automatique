import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-admin.component.html',
  styleUrls: ['./dashboard-admin.component.css']
})
export class DashboardAdminComponent {
  zones = [
    { name: 'Poivrons', status: 'En arrêt' },
    { name: 'Tomates', status: 'En croissance' },
    { name: 'Salades', status: 'En pause' },
    { name: 'Carottes', status: 'Actif' }
  ];

  reservoirVolume = 50;
}
