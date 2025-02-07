import { Component, OnInit } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { UtilisateurService } from '../../services/user.service';
import { HeaderComponent } from '../header/header.component';
import { Utilisateur, Role } from '../../models/utilisateur.model';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [HeaderComponent, FontAwesomeModule, CommonModule, HttpClientModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  user: Utilisateur | null = null;
  loading: boolean = true;
  error: string | null = null;
  faArrowLeft = faArrowLeft;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private utilisateurService: UtilisateurService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const userId = params['id'];
      if (userId) {
        this.chargerDetailsUtilisateur(userId);
      } else {
        this.error = "ID de l'utilisateur non fourni";
        this.loading = false;
      }
    });
  }

  private chargerDetailsUtilisateur(userId: string): void {
    this.loading = true;
    this.error = null;

    this.utilisateurService.getUtilisateurParId(userId).subscribe({
      next: (response: any) => {
        // Vérifier si la réponse contient les données de l'utilisateur
        if (response && response.utilisateur) {
          this.user = {
            _id: response.utilisateur._id,
            matricule: response.utilisateur.matricule,
            prenom: response.utilisateur.prenom,
            nom: response.utilisateur.nom,
            email: response.utilisateur.email,
            role: response.utilisateur.role as Role,
            actif: response.utilisateur.actif ?? true,
            date_creation: response.utilisateur.date_creation ? new Date(response.utilisateur.date_creation) : new Date(),
            date_modification: response.utilisateur.date_modification ? new Date(response.utilisateur.date_modification) : undefined,
            cardId: response.utilisateur.cardId,
            code: response.utilisateur.code,
            selected: response.utilisateur.selected
          };
        } else if (response && typeof response === 'object') {
          // Si la réponse est directement l'objet utilisateur
          this.user = {
            _id: response._id,
            matricule: response.matricule,
            prenom: response.prenom,
            nom: response.nom,
            email: response.email,
            role: response.role as Role,
            actif: response.actif ?? true,
            date_creation: response.date_creation ? new Date(response.date_creation) : new Date(),
            date_modification: response.date_modification ? new Date(response.date_modification) : undefined,
            cardId: response.cardId,
            code: response.code,
            selected: response.selected
          };
        } else {
          throw new Error('Format de réponse invalide');
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement:', error);
        this.error = "Erreur lors du chargement des détails de l'utilisateur";
        this.loading = false;
      }
    });
  }

  retourListe(): void {
    this.router.navigate(['/gestion-utilisateurs']);
  }
}