// user-details.component.ts

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UtilisateurService } from '../../services/user.service';
import { HeaderComponent } from '../header/header.component';
import { Utilisateur, Role } from '../../models/utilisateur.model'; // Chemin d'accès au modèle
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [HeaderComponent, FontAwesomeModule, CommonModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.scss']
})
export class UserDetailsComponent implements OnInit {
  user: Utilisateur | null = null; // Utilisez votre modèle ici
  loading: boolean = true;
  error: string | null = null;

  faArrowLeft = faArrowLeft;

  constructor(
    private route: ActivatedRoute,
    private utilisateurService: UtilisateurService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const userId = params['id'];
      if (userId) {
        this.chargerDetailsUtilisateur(userId);
      }
    });
  }

  private chargerDetailsUtilisateur(userId: string): void {
    this.loading = true;
    this.utilisateurService.getUtilisateurParId(userId).subscribe({
      next: (user: Utilisateur) => {
        this.user = user;
        this.loading = false;
      },
      error: (error) => {
        this.error = 'Erreur lors du chargement des détails de l\'utilisateur';
        this.loading = false;
        console.error('Erreur:', error);
      }
    });
  }

  retourListe(): void {
    window.history.back();
  }
}