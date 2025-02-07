import { Component, ViewChild, OnInit, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UtilisateurService, Utilisateur } from './../../services/user.service';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-gestion-utilisateurs',
  standalone: true,
  imports: [FormsModule, CommonModule, HeaderComponent],
  templateUrl: './gestion-utilisateurs.component.html',
  styleUrls: ['./gestion-utilisateurs.component.css']
})
export class GestionUtilisateursComponent implements OnInit {
  @ViewChild('userModal') userModal!: ElementRef<HTMLDivElement>;
  @ViewChild('confirmDeleteModal') confirmDeleteModal!: ElementRef<HTMLDivElement>;
  @ViewChild('viewUserModal') viewUserModal!: ElementRef<HTMLDivElement>;

  searchQuery: string = '';
  anySelected: boolean = false;
  isEditing: boolean = false;
  successMessage: string = '';
  error: string = '';

  currentUser: Utilisateur = {
    _id: '',
    matricule: '',
    prenom: '',
    nom: '',
    email: '',
    role: 'utilisateur',
    actif: true
  };

  users: Utilisateur[] = [];
  filteredUsers: Utilisateur[] = [];
  selectedUsers: Utilisateur[] = [];
  userToDelete: Utilisateur | null = null;

  constructor(private utilisateurService: UtilisateurService) {}

  ngOnInit() {
    this.getAllUsers();
  }

  getAllUsers() {
    this.utilisateurService.getTousUtilisateurs().subscribe(
      response => {
        if (response.success) {
          this.users = response.utilisateurs;
          this.filteredUsers = [...this.users];
        }
      },
      error => {
        this.error = "Erreur lors de la récupération des utilisateurs.";
        console.error(error);
      }
    );
  }

  openUserModal(user?: Utilisateur) {
    this.isEditing = !!user;
    this.currentUser = user ? { ...user } : {
      _id: '',
      matricule: '',
      prenom: '',
      nom: '',
      email: '',
      role: 'utilisateur',
      actif: true
    };
    this.showModal(this.userModal);
  }

  viewUser(user: Utilisateur) {
    this.currentUser = { ...user };
    this.showModal(this.viewUserModal);
  }

  editUser(user: Utilisateur) {
    this.openUserModal(user);
  }

  confirmDeleteUser(user?: Utilisateur) {
    this.userToDelete = user || null;
    this.showModal(this.confirmDeleteModal);
  }

  deleteUsers() {
    if (this.userToDelete) {
      this.utilisateurService.supprimerUtilisateur([this.userToDelete._id!]).subscribe(
        response => {
          this.successMessage = 'Utilisateur supprimé avec succès';
          this.getAllUsers();
        },
        error => {
          this.error = "Erreur lors de la suppression de l'utilisateur.";
          console.error(error);
        }
      );
    } else {
      const idsToDelete = this.selectedUsers.map(user => user._id!);
      this.utilisateurService.supprimerUtilisateur(idsToDelete).subscribe(
        response => {
          this.successMessage = 'Utilisateurs supprimés avec succès';
          this.getAllUsers();
        },
        error => {
          this.error = "Erreur lors de la suppression des utilisateurs.";
          console.error(error);
        }
      );
    }
    this.hideModal(this.confirmDeleteModal);
    setTimeout(() => this.successMessage = '', 3000);
  }

  onSubmit() {
    // Check if at least one authentication method is provided
    if (!this.currentUser.code && !this.currentUser.email) {
      this.error = "Au moins une méthode d'authentification est requise (code ou email)";
      return;
    }
  
    const request = this.isEditing
      ? this.utilisateurService.modifierUtilisateur(this.currentUser._id!, this.currentUser)
      : this.utilisateurService.creerUtilisateur(this.currentUser);
  
    request.subscribe(
      response => {
        this.successMessage = `Utilisateur ${this.isEditing ? 'modifié' : 'ajouté'} avec succès`;
        this.getAllUsers();
      },
      error => {
        this.error = `Erreur lors de la ${this.isEditing ? 'modification' : 'création'} de l'utilisateur.`;
        console.error(error);
      }
    );
    this.hideModal(this.userModal);
    setTimeout(() => this.successMessage = '', 3000);
  }

  selectAllUsers(event: any) {
    const checked = event.target.checked;
    this.users.forEach(user => user.selected = checked);
    this.updateButtonState();
  }

  updateButtonState() {
    this.anySelected = this.users.some(user => user.selected);
    this.selectedUsers = this.users.filter(user => user.selected);
  }

  filterUsers() {
    this.filteredUsers = this.users.filter(user => 
      user.nom.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.utilisateurService.importerUtilisateursCSV(file).subscribe(
        response => {
          this.successMessage = 'Utilisateurs importés avec succès';
          this.getAllUsers();
        },
        error => {
          this.error = 'Erreur lors de l\'importation des utilisateurs';
          console.error(error);
        }
      );
    }
  }

  toggleActivationUtilisateur(user: Utilisateur) {
    this.utilisateurService.toggleActivationUtilisateur(user._id!).subscribe(
      response => {
        user.actif = !user.actif;
        this.successMessage = 'Statut de l\'utilisateur mis à jour avec succès';
        setTimeout(() => this.successMessage = '', 3000);
      },
      error => {
        this.error = 'Erreur lors de la mise à jour du statut de l\'utilisateur';
        console.error(error);
      }
    );
  }

  assignerCarteRFID(user: Utilisateur) {
    // Implémentation de l'assignation de la carte RFID
    const cardId = prompt("Veuillez entrer le numéro de la carte RFID:");
    if (cardId) {
      this.utilisateurService.assignerCarteRFID(user._id!, cardId).subscribe(
        response => {
          this.successMessage = 'Carte RFID assignée avec succès';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error => {
          this.error = 'Erreur lors de l\'assignation de la carte RFID';
          console.error(error);
        }
      );
    }
  }

  showModal(modal: ElementRef<HTMLDivElement>) {
    modal.nativeElement.style.display = 'block';
  }

  hideModal(modal?: ElementRef<HTMLDivElement>) {
      if (modal) {
        modal.nativeElement.style.display = 'none';
      } else {
        this.userModal.nativeElement.style.display = 'none';
      }
    }
}