import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faUsers, faClock, faPlusCircle, faHistory } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router'; // Importer Router

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css'],
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

  // onViewHistory() {
  //   console.log("Affichage de l'historique !");
  //   this.router.navigate(['/historique-actions']);
  // }
}