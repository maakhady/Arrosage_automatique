import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUsers, faClock, faPlusCircle, faHistory } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router'; // Importer Router

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  template: `
    <div class="menu-container">
      <button class="menu-item menu-header" (click)="onManageUsers()" style="background-color: #4EB49C;">
        <fa-icon [icon]="faUsers" style="color: #fff;"></fa-icon>
        <h3 style="color: #fff;">Gestion des utilisateurs</h3>
      </button>
      
      <button class="menu-item" (click)="onSchedule()" style="background-color: #50A24C;">
        <fa-icon [icon]="faClock" style="color: #fff;"></fa-icon>
        <span style="color: #fff;">Programmer un arrosage</span>
      </button>

      <button class="menu-item" (click)="onAddZone()" style="background-color: #0D99FF;">
        <fa-icon [icon]="faPlusCircle" style="color: #fff;"></fa-icon>
        <span style="color: #fff;">Gestion des plantes</span>
      </button>

      <button class="menu-item" (click)="onViewHistory()" style="background-color: #DAA974;">
        <fa-icon [icon]="faHistory" style="color: #fff;"></fa-icon>
        <span style="color: #fff;">Voir Historique</span>
      </button>
    </div>
  `,
  styles: [`
    .menu-container {
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .menu-item {
      display: flex;
      align-items: center;
      padding: 12px;
      border: none;
      background: #f8f8f8;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s;
      text-align: left;
    }
    .menu-item:hover {
      background: #e0e0e0;
    }
    .menu-item fa-icon {
      font-size: 18px;
      color: #4CAF50;
      margin-right: 8px;
    }
    .menu-item span, .menu-item h3 {
      font-size: 16px;
      color: #555;
      margin: 0;
    }
    .menu-header {
      font-weight: bold;
      font-size: 18px;
      background: #e8f5e9;
    }
  `]
})
export class MenuComponent {
  faUsers = faUsers;
  faClock = faClock;
  faPlusCircle = faPlusCircle;
  faHistory = faHistory;

  constructor(library: FaIconLibrary, private router: Router) { // Injecter Router
    library.addIcons(faUsers, faClock, faPlusCircle, faHistory);
  }

  onManageUsers() {
    this.router.navigate(['/gestion-utilisateurs']); // Redirection vers la route souhaitée
  }

  onSchedule() {
    console.log("Programmation d'arrosage !");
  }

  onAddZone() {
    console.log("Ajout d'une nouvelle zone !");
  }

  onViewHistory() {
    console.log("Affichage de l'historique !");
    this.router.navigate(['/historique-actions']);
  }
}