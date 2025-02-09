import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserRegistrationComponent } from '../user-registration/user-registration.component';
import { UserDetailsComponent } from '../user-details/user-details.component';
import { UserEditComponent } from '../user-edit/user-edit.component';
import { AssignRfidComponent } from '../assign-rfid/assign-rfid.component';
import { UtilisateurService, Utilisateur, ImportResponse } from '../services/utilisateur.service';
import { AuthService } from '../services/auth.service';
import { HeaderComponent } from './../components/header/header.component';
import Swal from 'sweetalert2';
import { HttpErrorResponse } from '@angular/common/http';
import $ from 'jquery';
import 'bootstrap';

declare var bootstrap: any;

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UserRegistrationComponent,
    UserDetailsComponent,
    UserEditComponent,
    AssignRfidComponent,
    HeaderComponent
  ],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit, OnDestroy {
  users: Utilisateur[] = [];
  filteredUsers: Utilisateur[] = [];
  selectedUser: Utilisateur | null = null;
  searchQuery: string = '';
  anySelected: boolean = false;
  userToDelete: Utilisateur | null = null;
  userToBlock: Utilisateur | null = null;

  currentPage: number = 1;
  itemsPerPage: number = 5;

  successMessage: string | null = null;
  error: string | null = null;
  Math = Math;

  private socket: WebSocket;
  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private utilisateurService: UtilisateurService, private authService: AuthService) {
    this.socket = new WebSocket('ws://localhost:3004');
  }

  ngOnInit() {
    this.loadUsers();
    $(document).ready(() => {
      $('[data-toggle="tooltip"]').tooltip();
    });

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'rfid-scan') {
          this.assignCardToUser(this.selectedUser!, data.cardID);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
  }

  ngOnDestroy() {
    this.socket.close();
  }

  loadUsers() {
    this.utilisateurService.getTousUtilisateurs().subscribe(
      (response: any) => {
        const users = response.utilisateurs || response;
        if (Array.isArray(users)) {
          this.users = users;
          this.restoreButtonStates(); // Restaurer l'état des boutons après le chargement des utilisateurs
          this.filterUsers();
        } else {
          this.users = [];
          this.filteredUsers = [];
        }
      },
      error => {
        this.users = [];
        this.filteredUsers = [];
      }
    );
  }

  onUserAdded() {
    this.loadUsers();
  }

  selectAllUsers(event: any) {
    const checked = event.target.checked;
    this.filteredUsers.forEach(user => user.selected = checked);
    this.updateButtonState();
  }

  updateButtonState() {
    this.anySelected = this.filteredUsers.some(user => user.selected);
  }

  onUserCheckboxChange(user: Utilisateur) {
    this.updateButtonState();
  }

  openDeleteConfirmationModal(user?: Utilisateur) {
    if (user) {
      this.userToDelete = user;
      Swal.fire({
        title: 'Confirmer la suppression',
        text: user.role === 'super-admin'
          ? 'Attention : Vous êtes sur le point de supprimer un super-admin. Cette action est irréversible.'
          : 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
      }).then((result) => {
        if (result.isConfirmed) {
          this.confirmDeleteUser();
        }
      });
    } else {
      const selectedUsers = this.filteredUsers.filter(user => user.selected);
      if (selectedUsers.length === 0) {
        return;
      }

      const superAdminCount = selectedUsers.filter(user => user.role === 'super-admin').length;
      const warningText = superAdminCount > 0
        ? `Attention : ${superAdminCount} super-admin(s) seront supprimés. Cette action est irréversible.\n\nTotal : ${selectedUsers.length} utilisateur(s)`
        : `Êtes-vous sûr de vouloir supprimer ${selectedUsers.length} utilisateur(s) sélectionné(s) ?`;

      Swal.fire({
        title: 'Confirmer la suppression',
        text: warningText,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Oui, supprimer',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6'
      }).then((result) => {
        if (result.isConfirmed) {
          this.confirmDeleteUsers(selectedUsers);
        }
      });
    }
  }

  confirmDeleteUser() {
    if (this.userToDelete && this.userToDelete._id) {
      this.utilisateurService.supprimerUtilisateur(this.userToDelete._id).subscribe(
        () => {
          this.loadUsers();
          Swal.fire({
            icon: 'success',
            title: 'Supprimé!',
            text: 'L\'utilisateur a été supprimé.',
            timer: 2000,
            showConfirmButton: false
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur!',
            text: 'Une erreur est survenue lors de la suppression.',
            timer: 2000,
            showConfirmButton: false
          });
        }
      );
    }
  }

  confirmDeleteUsers(users: Utilisateur[]) {
    const ids = users.map(user => user._id);
    this.utilisateurService.supprimerUtilisateurs(ids).subscribe(
      () => {
        this.loadUsers();
        Swal.fire({
          icon: 'success',
          title: 'Supprimé!',
          text: 'Les utilisateurs ont été supprimés.',
          timer: 2000,
          showConfirmButton: false
        });
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur!',
          text: 'Une erreur est survenue lors de la suppression.',
          timer: 2000,
          showConfirmButton: false
        });
      }
    );
  }

  openBlockConfirmationModal(user?: Utilisateur) {
    this.userToBlock = user || null;
    if (!this.userToBlock || !this.userToBlock._id) {
      return;
    }

    const action = this.userToBlock.actif ? 'bloqué' : 'débloqué';
    const message = this.userToBlock.actif
      ? 'Êtes-vous sûr de vouloir débloquer cet utilisateur ?'
      : 'Êtes-vous sûr de vouloir bloquer cet utilisateur ?';

    Swal.fire({
      title: `Confirmer le ${action}`,
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        this.confirmBlockUser();
      }
    });
  }

  confirmBlockUser() {
    if (this.userToBlock && this.userToBlock._id) {
      this.utilisateurService.toggleActivationUtilisateur(this.userToBlock._id).subscribe(
        () => {
          this.loadUsers();
          const action = this.userToBlock && this.userToBlock.actif ? 'bloqué' : 'débloqué';
          Swal.fire({
            icon: 'success',
            title: 'Succès!',
            text: `L'utilisateur a été ${action}.`,
            timer: 2000,
            showConfirmButton: false
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur!',
            text: 'Une erreur est survenue lors du blocage.',
            timer: 2000,
            showConfirmButton: false
          });
        }
      );
    }
  }

  viewUser(user: Utilisateur) {
    this.selectedUser = user;
    this.openDetailsModal();
  }

  editUser(user: Utilisateur) {
    this.selectedUser = user;
    this.openEditModal();
  }

  openDetailsModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
      new bootstrap.Modal(modal).show();
    }
  }

  openEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
      new bootstrap.Modal(modal).show();
    }
  }

  assignRFID(user: Utilisateur) {
    this.selectedUser = user;
    Swal.fire({
      title: 'Scanner votre carte RFID',
      text: `Veuillez approcher votre carte RFID du lecteur pour l'utilisateur ${user.nom}.`,
      icon: 'info',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonText: 'Annuler',
      cancelButtonText: 'Fermer'
    });
  }

  assignCardToUser(user: Utilisateur, cardID: string) {
    if (user && user._id && cardID) {
      if (!user.actif) {
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: `L'utilisateur ${user.nom} ${user.prenom} est inactif ou bloqué.`,
        });
        return;
      }
      this.utilisateurService.assignerCarteRFID(user._id, cardID).subscribe(
        () => {
          user.cardId = cardID;
          // Enregistrement de l'état dans le localStorage
          localStorage.setItem(`user_${user._id}_assigned`, 'true');
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: `Carte attribuée avec succès à ${user.nom} ${user.prenom}`,
            timer: 2000,
            showConfirmButton: false
          });
          this.closeAssignRFIDModal();
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Cette carte est déjà assignée à un utilisateur',
          });
          console.error('Erreur lors de l\'assignation de la carte RFID', error);
        }
      );
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'ID de l\'utilisateur ou RFID non défini',
      });
      console.error('ID de l\'utilisateur ou RFID non défini');
    }
  }

  openUnassignConfirmationModal(user: Utilisateur) {
    Swal.fire({
      title: 'Confirmer la désassignation',
      text: `Êtes-vous sûr de vouloir désassigner la carte RFID de l'utilisateur ${user.prenom} ${user.nom} ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui, désassigner',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6'
    }).then((result) => {
      if (result.isConfirmed) {
        this.unassignRFID(user);
      }
    });
  }

  unassignRFID(user: Utilisateur) {
    console.log('Désassignation de la carte RFID pour l\'utilisateur:', user);
    if (user && user._id) {
      console.log('Appel de l\'API pour désassigner la carte RFID pour l\'utilisateur ID:', user._id);
      this.utilisateurService.desassignerCarteRFID(user._id).subscribe(
        () => {
          console.log('Désassignation réussie pour l\'utilisateur:', user);
          user.cardId = undefined;
          // Suppression de l'état du localStorage
          localStorage.removeItem(`user_${user._id}_assigned`);
          Swal.fire({
            icon: 'success',
            title: 'Succès',
            text: `Carte RFID désassignée avec succès pour l'utilisateur ${user.prenom} ${user.nom}`,
            timer: 2000,
            showConfirmButton: false
          });
        },
        (error: HttpErrorResponse) => {
          console.error('Erreur lors de la désassignation de la carte RFID pour l\'utilisateur:', user, 'Erreur:', error);
          if (error.error && error.error.message === 'Aucune carte RFID assignée à cet utilisateur') {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Aucune carte RFID assignée à cet utilisateur',
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: 'Erreur lors de la désassignation de la carte RFID',
            });
          }
        }
      );
    } else {
      console.error('Utilisateur ou ID d\'utilisateur non défini pour la désassignation');
    }
  }

  isCardAssigned(user: Utilisateur): boolean {
    return !!user.cardId;
  }

  openRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    if (modal) {
      new bootstrap.Modal(modal).show();
    }
  }

  closeRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    if (modal) {
      bootstrap.Modal.getInstance(modal)?.hide();
    }
  }

  closeDetailsModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
      bootstrap.Modal.getInstance(modal)?.hide();
    }
    this.selectedUser = null;
  }

  closeEditModal() {
    const modal = document.getElementById('editModal');
    if (modal) {
      bootstrap.Modal.getInstance(modal)?.hide();
    }
    this.selectedUser = null;
  }

  closeAssignRFIDModal() {
    this.selectedUser = null;
  }

  filterUsers() {
    const query = this.searchQuery.toLowerCase();
    let filtered = this.users.filter(user =>
      user.prenom.toLowerCase().includes(query) ||
      user.nom.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.matricule.toLowerCase().includes(query)
    );

    this.filteredUsers = filtered.slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage);
  }

  onFileSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez sélectionner un fichier CSV.',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      Swal.fire({
        icon: 'error',
        title: 'Type de fichier incorrect',
        text: 'Veuillez sélectionner un fichier CSV.',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false
      });
      return;
    }

    Swal.fire({
      title: 'Import en cours...',
      text: 'Veuillez patienter...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.utilisateurService.importerUtilisateursCSV(file).subscribe({
      next: (response: ImportResponse) => {
        Swal.close();
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Import réussi',
            text: `${response.resultats.importes} utilisateurs importés avec succès`,
            timer: 2000,
            timerProgressBar: true,
            showConfirmButton: false
          });
          this.loadUsers();
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('Erreur détaillée:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur d\'importation',
          text: error.error?.message || 'Une erreur est survenue lors de l\'importation. Vérifiez le format de votre fichier CSV.',
          showConfirmButton: true
        });
      },
      complete: () => {
        target.value = '';
      }
    });
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  openAssignRFIDModal() {
    const modal = document.getElementById('assignRFIDModal');
    if (modal) {
      modal.style.display = 'block';
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= Math.ceil(this.users.length / this.itemsPerPage)) {
      this.currentPage = page;
      this.filterUsers();
    }
  }

  nextPage() {
    if (this.currentPage < Math.ceil(this.users.length / this.itemsPerPage)) {
      this.currentPage++;
      this.filterUsers();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterUsers();
    }
  }

  updateUser(updatedUser: Utilisateur) {
    if (this.selectedUser && this.selectedUser._id) {
      this.utilisateurService.modifierUtilisateur(this.selectedUser._id, updatedUser).subscribe(
        () => {
          this.loadUsers();
        },
        (error) => {
          Swal.fire('Erreur!', 'Une erreur est survenue lors de la mise à jour.', 'error');
        }
      );
    }
  }

  backToDashboard(): void {
    window.history.back();
  }

  restoreButtonStates() {
    this.users.forEach(user => {
      if (localStorage.getItem(`user_${user._id}_assigned`)) {
        user.cardId = 'assigned'; // Assurez-vous que cela correspond à votre logique pour afficher le bouton Désassigner
      } else {
        user.cardId = undefined;
      }
    });
  }
}
