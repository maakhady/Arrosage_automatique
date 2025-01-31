import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-details.component.html',
  styleUrls: ['./user-details.component.css']
})
export class UserDetailsComponent {
  @Input() user: any;
  @Output() close = new EventEmitter<void>();

  // Méthode pour fermer la modal
  closeModal() {
    const modal = document.getElementById('detailsModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.close.emit();
  }
}
