import { Component, OnInit } from '@angular/core';
import { AuthService, User } from './../../services/auth.service'; 
import { Role, UtilisateurService } from './../../services/user.service';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { Utilisateur } from '../../models/utilisateur.model';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, HeaderComponent, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  user: User | null = null; // Utilisateur connecté

  constructor(private authService: AuthService, private utilisateurService: UtilisateurService) {}

  ngOnInit(): void {
    this.user = this.authService.currentUser;

    if (this.authService.isAuthenticated) {
      console.log('Utilisateur authentifié :', this.user);
    } else {
      console.log('Aucun utilisateur connecté.');
    }
  }

  updateUser(): void {
    if (this.user) {
      if (this.user._id) {
        // Créer un objet compatible avec Partial<Utilisateur>
        const utilisateurToUpdate: Partial<Utilisateur> = {
          matricule: this.user.matricule,
          prenom: this.user.prenom,
          nom: this.user.nom,
          email: this.user.email,
          role: this.user.role as Role, // Assurez-vous que c'est un Role valide
          // Ajoutez d'autres propriétés si nécessaire
        };
  
        this.utilisateurService.modifierUtilisateur(this.user._id, utilisateurToUpdate).subscribe(response => {
          console.log('Utilisateur mis à jour avec succès:', response);
        }, error => {
          console.error('Erreur lors de la mise à jour de l’utilisateur:', error);
        });
      } else {
        console.error('L\'utilisateur n\'a pas d\'ID.');
      }
    }
  }
}