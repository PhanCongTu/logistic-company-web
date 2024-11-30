import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-popup.component.html',
  styleUrl: './confirm-popup.component.scss'
})
export class ConfirmPopupComponent {
  @Input() header = 'Header';
  @Input() title = 'This is the title of the popup';
  @Input() confirmButton = 'Confirm';
  @Input() cancelButton = 'Cancel';
  @Input() isNative = false; // color of the confirm button (red/blue)

  isVisible = false;

  @Output() isConfirm = new EventEmitter<boolean>();

  show() {
    this.isVisible = true;
  }

  hide() {
    this.isVisible = false;
  }

  cancel() {
    this.isConfirm.emit(false);
    this.hide();
  }

  confirm() {
    this.isConfirm.emit(true);
    this.hide();
  }
}
