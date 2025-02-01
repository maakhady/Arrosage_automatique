import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserRegistrationComponent } from '../user-registration/user-registration.component';
import { UserDetailsComponent } from '../user-details/user-details.component';
import { UserEditComponent } from '../user-edit/user-edit.component';
import { AssignRfidComponent } from '../assign-rfid/assign-rfid.component';
declare var bootstrap: any; // Import Bootstrap
import * as Papa from 'papaparse'; // Import PapaParse for CSV parsing

interface User {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  role: string;
  status: string;
  selected: boolean;
  rfid?: string; // Ajouter le champ rfid si nécessaire
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, UserRegistrationComponent, UserDetailsComponent, UserEditComponent, AssignRfidComponent],
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {
  users: User[] = [
    { id: '1', matricule: '001', firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', address: '123 Street', role: 'utilisateur', status: 'active', selected: false },
    { id: '2', matricule: '002', firstName: 'Jane', lastName: 'Doe', email: 'jane.doe@example.com', address: '456 Avenue', role: 'admin', status: 'active', selected: false }
  ];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  searchQuery: string = '';
  anySelected: boolean = false;

  @ViewChild('fileInput') fileInput!: ElementRef;

  ngOnInit() {
    this.filteredUsers = this.users; // Initialiser la liste filtrée avec tous les utilisateurs
  }

  selectAllUsers(event: any) {
    const checked = event.target.checked;
    this.filteredUsers.forEach(user => user.selected = checked);
    this.updateButtonState();
  }

  updateButtonState() {
    this.anySelected = this.filteredUsers.some(user => user.selected);
  }

  deleteSelectedUsers() {
    const selectedUsers = this.filteredUsers.filter(user => user.selected);
    console.log('Users deleted successfully', selectedUsers);
    this.ngOnInit(); // Rafraîchir la liste des utilisateurs
  }

  blockSelectedUsers() {
    const selectedUsers = this.filteredUsers.filter(user => user.selected);
    console.log('Users blocked successfully', selectedUsers);
    this.ngOnInit(); // Rafraîchir la liste des utilisateurs
  }

  viewUser(user: User) {
    this.selectedUser = user;
  }

  editUser(user: User) {
    this.selectedUser = user;
  }

  deleteUser(user: User) {
    console.log('User deleted successfully', user);
    this.ngOnInit(); // Rafraîchir la liste des utilisateurs
  }

  blockUser(user: User) {
    console.log('User blocked successfully', user);
    this.ngOnInit(); // Rafraîchir la liste des utilisateurs
  }

  assignRFID(user: User) {
    this.selectedUser = user;
    this.openAssignRFIDModal();
  }

  openRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    if (modal) {
      const bootstrapModal = new bootstrap.Modal(modal);
      bootstrapModal.show();
    }
  }

  closeRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    if (modal) {
      const bootstrapModal = bootstrap.Modal.getInstance(modal);
      bootstrapModal.hide();
    }
  }

  closeDetailsModal() {
    this.selectedUser = null;
  }

  closeEditModal() {
    this.selectedUser = null;
  }

  closeAssignRFIDModal() {
    this.selectedUser = null;
  }

  filterUsers() {
    const query = this.searchQuery.toLowerCase();
    this.filteredUsers = this.users.filter(user =>
      user.firstName.toLowerCase().includes(query) ||
      user.lastName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.matricule.toLowerCase().includes(query)
    );
  }

  importCSV(event: any) {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results: Papa.ParseResult<any>) => {
          const validUsers = results.data.filter((row: any) => this.validateCSVRow(row));
          this.users = this.users.concat(validUsers.map((row: any) => ({
            id: (this.users.length + 1).toString(),
            matricule: row.matricule,
            firstName: row.firstName,
            lastName: row.lastName,
            email: row.email,
            address: row.address,
            role: row.role,
            status: 'active',
            selected: false
          })));
          this.filteredUsers = this.users; // Mettre à jour la liste filtrée
        }
      });
    }
  }

  validateCSVRow(row: any): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^\+221\d{9}$/;
    return row.firstName && row.lastName && emailPattern.test(row.email) && row.address && row.role && phonePattern.test(row.phone);
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
}
