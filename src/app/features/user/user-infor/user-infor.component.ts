
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps'
import { MapComponent } from '../../../shared/components/map/map.component';
import { Coordinates, isCoordinates } from '../../../shared/models/coordinates.model';
import { DirectionMapComponent } from '../../../shared/components/direction-map/direction-map.component';

@Component({
  selector: 'app-user-infor',
  standalone: true,
  imports: [CommonModule, GoogleMapsModule, MapComponent, DirectionMapComponent],
  templateUrl: './user-infor.component.html',
  styleUrl: './user-infor.component.scss'
})
export class UserInforComponent {

  receivedData: Coordinates | undefined;
  isMapVisible: boolean | false;
  isDirectionMapVisible: boolean | false;

  constructor() {
    this.isMapVisible = false;
    this.isDirectionMapVisible = false;
  }

  user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Admin'
  };

  isEditModalOpen = false;
  isChangePasswordModalOpen = false;
  currentPassword = '';
  newPassword = '';

  receiveMapData(data: Coordinates | boolean) {
    if (isCoordinates(data)) {
      this.receivedData = data; 
      this.isMapVisible = false;
      console.log(data)
    }
    if (typeof data === 'boolean') {
      this.isMapVisible = data;
      console.log(data)
    } 
  }

  receiveDirectionMapData(data: boolean) {
    if (typeof data === 'boolean') {
      this.isDirectionMapVisible = data;
    } 
  }

  openMapModal() {
    this.isMapVisible = true;
  }

  openDirectionMapModal() {
    this.isDirectionMapVisible = true;
  }

  openEditModal() {
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
  }

  saveChanges() {
    // Logic to save user information
    this.closeEditModal();
  }

  openChangePasswordModal() {
    this.isChangePasswordModalOpen = true;
  }

  closeChangePasswordModal() {
    this.isChangePasswordModalOpen = false;
  }

  changePassword() {
    // Logic to change password
    this.closeChangePasswordModal();
  }
}
