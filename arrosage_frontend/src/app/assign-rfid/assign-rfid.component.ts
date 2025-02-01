import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-assign-rfid',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assign-rfid.component.html',
  styleUrls: ['./assign-rfid.component.css']
})
export class AssignRfidComponent {
  @Input() user: any;
  @Output() close = new EventEmitter<void>();
  rfid: string = '';
  selectedUser: any;

  ngOnInit() {
    this.selectedUser = this.user;
  }

  onSubmit() {
    console.log('RFID assigned successfully', this.rfid);
    this.closeModal();
    this.openSuccessModal();
  }

  closeModal() {
    const modal = document.getElementById('assignRFIDModal');
    if (modal) {
      modal.style.display = 'none';
    }
    this.close.emit();
  }

  openSuccessModal() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
      successModal.style.display = 'block';
    }
  }

  closeSuccessModal() {
    const successModal = document.getElementById('successModal');
    if (successModal) {
      successModal.style.display = 'none';
    }
  }
}
