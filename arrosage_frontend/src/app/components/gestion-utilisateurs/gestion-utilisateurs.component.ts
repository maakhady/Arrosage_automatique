import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faEye, faEdit, faTrash, faBan, faUserPlus, faHome } from '@fortawesome/free-solid-svg-icons';
import { UtilisateurService, Utilisateur } from './../../services/user.service';
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestion-utilisateurs',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule, HeaderComponent],
  templateUrl: './gestion-utilisateurs.component.html',
  styleUrls: ['./gestion-utilisateurs.component.css']
})
export class GestionUtilisateursComponent implements OnInit {
  // Déclarer les icônes comme propriétés publiques
  faEye = faEye;
  faEdit = faEdit;
  faTrash = faTrash;
  faBan = faBan;
  faUserPlus = faUserPlus;
  faHome = faHome;

  searchQuery: string = '';
  users: Utilisateur[] = [];

  // Propriétés pour la modale d'ajout
  showAddModal: boolean = false;
  newUser: Utilisateur = {
    prenom: '',
    nom: '',
    email: '',
    matricule: '',
    password: '',
    role: 'utilisateur',
    actif: true,
    selected: false
  };

  // Propriétés pour la modale de modification
  showEditModal: boolean = false;
  userToEdit: Utilisateur | null = null;
  selectAll: boolean = false;

  private _filteredUsers: Utilisateur[] = [];

  

  selectedFile: File | null = null;

  // Propriétés pour la pagination
  currentPage: number = 1; // Page actuelle
  pageSize: number = 12; // Nombre d'utilisateurs par page
  totalPages: number = 1; // Nombre total de pages

  // Propriété pour contrôler l'affichage de la modale de suppression
  showDeleteModal: boolean = false;

  // Propriété pour stocker l'ID de l'utilisateur à supprimer
  userIdToDelete: string | undefined;


  // Méthode pour ouvrir la modale de suppression
ouvrirModaleSuppression(id: string | undefined): void {
  if (!id) {
    console.error('ID de l\'utilisateur non défini');
    return;
  }
  this.userIdToDelete = id;
  this.showDeleteModal = true;
}


// Méthode pour fermer la modale de suppression
closeDeleteModal(): void {
  this.showDeleteModal = false;
  this.userIdToDelete = undefined;
}

// Méthode pour confirmer la suppression
confirmDelete(): void {
  if (this.userIdToDelete) {
    this.utilisateurService.supprimerUtilisateur([this.userIdToDelete]).subscribe(
      (response) => {
        console.log('Utilisateur supprimé:', response);
        this.chargerUtilisateurs(); // Recharger la liste
        this.closeDeleteModal(); // Fermer la modale après suppression
      },
      (error) => {
        console.error('Erreur lors de la suppression:', error);
        this.closeDeleteModal(); // Fermer la modale en cas d'erreur
      }
    );
  } else {
    console.error('Aucun utilisateur à supprimer');
  }
}

  @ViewChild('fileInput') fileInput: any; // Référence au champ de fichier

  constructor(
    private utilisateurService: UtilisateurService,
    private router: Router,
    library: FaIconLibrary
  ) {
    // Ajouter les icônes FontAwesome à la bibliothèque
    library.addIcons(faEye, faEdit, faTrash, faBan, faUserPlus, faHome);
  }

  ngOnInit(): void {
    this.chargerUtilisateurs();
  }

  // Rediriger vers le tableau de bord
  redirectToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleSelectAll() {
    this.selectAll = !this.selectAll;
    
    if (this.filteredUsers) {
      this.filteredUsers.forEach(user => {
        user.selected = this.selectAll;
      });
    }
  }


   // Méthode pour mettre à jour les utilisateurs filtrés et la pagination
   // Méthode pour mettre à jour les utilisateurs filtrés
  updateFilteredUsers(): void {
    this._filteredUsers = this.users.filter(user =>
      `${user.prenom} ${user.nom}`.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.matricule.toLowerCase().includes(this.searchQuery.toLowerCase())
    );

    // Calculer le nombre total de pages
    this.totalPages = Math.ceil(this._filteredUsers.length / this.pageSize);

    // S'assurer que la page actuelle est valide
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages > 0 ? this.totalPages : 1;
    }
  }

  // Méthode pour obtenir les utilisateurs de la page actuelle
  get paginatedUsers(): Utilisateur[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this._filteredUsers.slice(startIndex, endIndex);
  }

  // Méthode pour changer de page
  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  // Méthode pour aller à la page précédente
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Méthode pour aller à la page suivante
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }


  // Charger la liste des utilisateurs
  chargerUtilisateurs(): void {
    this.utilisateurService.getTousUtilisateurs().subscribe({
      next: (response) => {
        if (response.success && Array.isArray(response.utilisateurs)) {
          this.users = response.utilisateurs.map(user => ({
            ...user,
            selected: false
          }));
          this.updateFilteredUsers(); // Mettre à jour les utilisateurs filtrés
          console.log('Utilisateurs chargés :', this.users);
        } else {
          console.error('La réponse de l\'API n\'est pas valide :', response);
          this.users = [];
          this.updateFilteredUsers();
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des utilisateurs :', error);
      }
    });
  }

  // Filtrer les utilisateurs
  get filteredUsers(): Utilisateur[] {
    return this.users.filter(user =>
      `${user.prenom} ${user.nom}`.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      user.matricule.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  // Générer un matricule
  generateMatricule(): string {
    const nombreAleatoire = Math.floor(1000 + Math.random() * 9000); // Génère un nombre entre 1000 et 9999
    return 'NAAT' + nombreAleatoire; // Combine le préfixe avec le nombre aléatoire
  }

  // Voir les détails d'un utilisateur
  voirUtilisateur(id: string | undefined): void {
    if (!id) {
      console.error('ID de l\'utilisateur non défini');
      return;
    }
    
    this.router.navigate(['/user-details', id]);
  }

  // Ouvrir la modale de modification
  ouvrirModaleModification(user: Utilisateur): void {
    this.userToEdit = { ...user }; // Créer une copie de l'utilisateur à modifier
    this.showEditModal = true; // Afficher la modale
  }

  // Soumettre le formulaire de modification
  onSubmitEditUser(): void {
    if (this.userToEdit) {
      this.utilisateurService.modifierUtilisateur(this.userToEdit._id!, this.userToEdit).subscribe({
        next: (response) => {
          console.log('Utilisateur modifié:', response);
          this.chargerUtilisateurs(); // Recharger la liste
          this.closeEditModal(); // Fermer la modale
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
        }
      });
    } else {
      console.error('Aucun utilisateur à modifier');
    }
  }

  // Fermer la modale d'édition
  closeEditModal(): void {
    this.showEditModal = false;
    this.userToEdit = null; // Réinitialiser l'utilisateur à modifier
  }

  // Supprimer un utilisateur
  supprimerUtilisateur(id: string | undefined): void {
    if (!id) {
      console.error('ID de l\'utilisateur non défini');
      return;
    }
    this.utilisateurService.supprimerUtilisateur([id]).subscribe(
      (response) => {
        console.log('Utilisateur supprimé:', response);
        this.chargerUtilisateurs(); // Recharger la liste
      },
      (error) => {
        console.error('Erreur lors de la suppression:', error);
      }
    );
  }

  // Activer/Désactiver un utilisateur
  toggleActivationUtilisateur(id: string | undefined): void {
    if (!id) {
      console.error('ID de l\'utilisateur non défini');
      return;
    }
    this.utilisateurService.toggleActivationUtilisateur(id).subscribe(
      (response) => {
        console.log('Statut de l\'utilisateur modifié:', response);
        this.chargerUtilisateurs(); // Recharger la liste
      },
      (error) => {
        console.error('Erreur lors de la modification du statut:', error);
      }
    );
  }

  // Assigner une carte RFID
  assignerCarteRFID(id: string | undefined): void {
    if (!id) {
      console.error('ID de l\'utilisateur non défini');
      return;
    }
    const cardId = 'RFID123'; // Exemple de carte RFID
    this.utilisateurService.assignerCarteRFID(id, cardId).subscribe(
      (response) => {
        console.log('Carte RFID assignée:', response);
        this.chargerUtilisateurs(); // Recharger la liste
      },
      (error) => {
        console.error('Erreur lors de l\'assignation de la carte:', error);
      }
    );
  }

  // Supprimer la sélection
  // supprimerSelection(): void {
  //   const selectedIds = this.users
  //     .filter(user => user.selected)
  //     .map(user => user._id)
  //     .filter((id): id is string => !!id);

  //   if (selectedIds.length === 0) {
  //     alert('Aucun utilisateur sélectionné.');
  //     return;
  //   }

  //   this.utilisateurService.supprimerUtilisateur(selectedIds).subscribe({
  //     next: (response) => {
  //       console.log('Utilisateurs supprimés:', response);
  //       this.chargerUtilisateurs(); // Recharger la liste
  //     },
  //     error: (error) => {
  //       console.error('Erreur lors de la suppression:', error);
  //     }
  //   });
  // }


  supprimerSelection() {
    if (!this.selectAll) {
      return; // Ne rien faire si selectAll n'est pas activé
    }

    const selectedUsers = this.filteredUsers.filter(user => user.selected);
    
    if (selectedUsers.length === 0) {
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer ${selectedUsers.length} utilisateur(s) ?`)) {
      // Votre logique de suppression multiple ici
      const selectedIds = selectedUsers.map(user => user._id);
      // Appel à votre service pour supprimer les utilisateurs
      // this.utilisateurService.supprimerUtilisateurs(selectedIds).subscribe(...)
    }
  }

  // Ajouter un utilisateur
  ajouterUtilisateur(): void {
    console.log('Ajouter un utilisateur');
    this.showAddModal = true;
  }

  // Gérer la sélection de fichier CSV
  onFileSelected(event: Event): void {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.selectedFile = fileInput.files[0]; // Récupérer le fichier sélectionné
      this.ajouterParCSV(); // Appeler la méthode pour traiter le fichier CSV
    } else {
      this.selectedFile = null; // Réinitialiser si aucun fichier n'est sélectionné
    }
  }

  // Ajouter des utilisateurs par CSV
  ajouterParCSV(): void {
    if (this.selectedFile) { // Ce check est correct
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const csvData: string = e.target.result;
        const users = this.parseCSV(csvData);
        
        // Ici on peut faire un "type assertion" car on sait que this.selectedFile n'est pas null
        // grâce au if (this.selectedFile) au début de la méthode
        this.utilisateurService.importerUtilisateursCSV(this.selectedFile as File).subscribe({
          next: (response) => {
            console.log('Utilisateurs importés avec succès:', response);
            this.chargerUtilisateurs();
            this.selectedFile = null;
          },
          error: (error) => {
            console.error('Erreur lors de l\'importation des utilisateurs:', error);
          }
        });
      };
      reader.readAsText(this.selectedFile);
    } else {
      console.error('Aucun fichier sélectionné');
    }
}

  // Convertir le CSV en tableau d'utilisateurs
  parseCSV(csvData: string): any[] {
    const lines = csvData.split('\n');
    const headers = lines[0].split(','); // Première ligne = en-têtes
    const users = [];

    for (let i = 1; i < lines.length; i++) {
      const data = lines[i].split(',');
      if (data.length === headers.length) {
        const user: any = {};
        for (let j = 0; j < headers.length; j++) {
          user[headers[j].trim()] = data[j].trim();
        }
        users.push(user);
      }
    }

    return users;
  }

  // Fermer la modale d'ajout
  closeAddModal(): void {
    this.showAddModal = false;
    this.newUser = {
      prenom: '',
      nom: '',
      email: '',
      matricule: '',
      role: 'utilisateur',
      actif: true,
      selected: false
    };
  }

  // Soumettre le formulaire d'ajout
  onSubmitAddUser() {
    this.newUser.matricule = this.generateMatricule(); // Générer le matricule
    this.utilisateurService.creerUtilisateur(this.newUser).subscribe({
      next: (response) => {
        console.log('Utilisateur ajouté:', response);
        this.closeAddModal(); // Fermer la modale après ajout
      },
      error: (error) => {
        console.error('Erreur lors de l\'ajout de l\'utilisateur:', error);
        if (error.status === 401) {
          alert('Authentification requise. Veuillez vous connecter.');
        }
      }
    });
  }
}