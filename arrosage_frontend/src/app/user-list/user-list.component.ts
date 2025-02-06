import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserRegistrationComponent } from '../user-registration/user-registration.component';
import { UserDetailsComponent } from '../user-details/user-details.component';
import { UserEditComponent } from '../user-edit/user-edit.component';
import { AssignRfidComponent } from '../assign-rfid/assign-rfid.component';
import { UtilisateurService, Utilisateur, ImportResponse } from '../services/utilisateur.service';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2';
import { HeaderComponent } from '../components/header/header.component';
import { HttpErrorResponse } from '@angular/common/http';
declare var bootstrap: any;
declare var $: any; // Pour utiliser jQuery avec Bootstrap


@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UserRegistrationComponent, UserDetailsComponent, UserEditComponent, AssignRfidComponent, HeaderComponent],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: Utilisateur[] = [];
  filteredUsers: Utilisateur[] = [];
  selectedUser: Utilisateur | null = null;
  searchQuery: string = '';
  anySelected: boolean = false;
  userToDelete: Utilisateur | null = null;
  userToBlock: Utilisateur | null = null;

  // Propriétés de pagination
  currentPage: number = 1;
  itemsPerPage: number = 5;

  successMessage: string | null = null;
  error: string | null = null;
  Math = Math;


  @ViewChild('fileInput') fileInput!: ElementRef;

  constructor(private utilisateurService: UtilisateurService, private authService: AuthService) {}

  ngOnInit() {
    this.loadUsers();
    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });
  }

  loadUsers() {
    this.utilisateurService.getTousUtilisateurs().subscribe(
      (response: any) => {
        const users = response.utilisateurs || response;
        if (Array.isArray(users)) {
          this.users = users;
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
    this.loadUsers(); // Recharge la liste des utilisateurs
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

  // openDeleteConfirmationModal(user?: Utilisateur) {
  //   if (user) {
  //     if (user.role === 'super-admin') {
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Impossible de supprimer',
  //         text: 'Impossible de supprimer un super-admin. Pour supprimer ce dernier, il faut qu\'il soit d\'abord un utilisateur ',
  //         timer: 4000, // Durée de 2 secondes
  //         timerProgressBar: true,
  //         showConfirmButton: false
  //       });
  //       return;
  //     }
  //     this.userToDelete = user;
  //     Swal.fire({
  //       title: 'Confirmer la suppression',
  //       text: 'Êtes-vous sûr de vouloir supprimer cet utilisateur ?',
  //       icon: 'warning',
  //       showCancelButton: true,
  //       confirmButtonText: 'Oui',
  //       cancelButtonText: 'Non'
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //         this.confirmDeleteUser();
  //       }
  //     });
  //   } else {
  //     const selectedUsers = this.filteredUsers.filter(user => user.selected);
  //     if (selectedUsers.length === 0) {
  //       return;
  //     }

  //     const hasSuperAdmin = selectedUsers.some(user => user.role === 'super-admin');
  //     if (hasSuperAdmin) {
  //       Swal.fire({
  //         icon: 'error',
  //         title: 'Supprimer',
  //         text: 'Impossible de supprimer un super-admin.',
  //         timer: 2000, // Durée de 2 secondes
  //         timerProgressBar: true,
  //         showConfirmButton: false
  //       });
  //       return;
  //     }

  //     Swal.fire({
  //       title: 'Confirmer la suppression',
  //       text: `Êtes-vous sûr de vouloir supprimer ${selectedUsers.length} utilisateur(s) sélectionné(s) ?`,
  //       icon: 'warning',
  //       showCancelButton: true,
  //       confirmButtonText: 'Oui',
  //       cancelButtonText: 'Non'
  //     }).then((result) => {
  //       if (result.isConfirmed) {
  //         this.confirmDeleteUsers(selectedUsers);
  //       }
  //     });
  //   }
  // }

  openDeleteConfirmationModal(user?: Utilisateur) {
    if (user) {
      // Suppression d'un seul utilisateur
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
      // Suppression multiple
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
            timer: 2000, // Durée de 2 secondes
            timerProgressBar: true,
            showConfirmButton: false
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur!',
            text: 'Une erreur est survenue lors de la suppression.',
            timer: 2000, // Durée de 2 secondes
            timerProgressBar: true,
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
          timer: 2000, // Durée de 2 secondes
          timerProgressBar: true,
          showConfirmButton: false
        });
      },
      (error) => {
        Swal.fire({
          icon: 'error',
          title: 'Erreur!',
          text: 'Une erreur est survenue lors de la suppression.',
          timer: 2000, // Durée de 2 secondes
          timerProgressBar: true,
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
            timer: 2000, // Durée de 2 secondes
            timerProgressBar: true,
            showConfirmButton: false
          });
        },
        (error) => {
          Swal.fire({
            icon: 'error',
            title: 'Erreur!',
            text: 'Une erreur est survenue lors du blocage.',
            timer: 2000, // Durée de 2 secondes
            timerProgressBar: true,
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
    this.openAssignRFIDModal();
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

    // Pagination logic
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

    // Vérification du type de fichier
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

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= Math.ceil(this.users.length / this.itemsPerPage)) {
      this.currentPage = page;
      this.filterUsers();
    }
  }

    // Mettre à jour les méthodes existantes de pagination
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
}
