
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { GoogleMapsModule } from '@angular/google-maps'
import { MapComponent } from '../../../shared/components/map/map.component';
import { Coordinates, CoordinatesWithAddress, isCoordinates } from '../../../shared/models/coordinates.model';
import { DirectionMapComponent } from '../../../shared/components/direction-map/direction-map.component';
import { User } from '../../../shared/models/user.model';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomValidators } from '../../../shared/custom-validators.validator';
import { UpdateUser } from '../../../shared/models/update-user.model';
import { UserService } from '../../../core/services/user.service';
import { ChangePasword } from '../../../shared/models/change-pasword.model';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-user-infor',
  standalone: true,
  imports: [
    CommonModule, 
    GoogleMapsModule, 
    MapComponent, 
    DirectionMapComponent, 
    DialogModule, 
    ButtonModule, 
    ReactiveFormsModule,
    ToastModule,
    TooltipModule
  ],
  providers: [MessageService],
  templateUrl: './user-infor.component.html',
  styleUrl: './user-infor.component.scss'
})
export class UserInforComponent implements OnInit {

  // Forms
  changeEmailForm: FormGroup;
  changePasswordForm: FormGroup;

  // Signals
  userInfoSignal: WritableSignal<User | undefined> = signal(undefined);
  isMapVisibleSignal: WritableSignal<boolean> = signal(false);
  isDirectionMapVisibleSignal: WritableSignal<boolean> = signal(false);
  isChangeEmailModalOpenSignal: WritableSignal<boolean> = signal(false);
  isVerifyEmailModalOpenSignal: WritableSignal<boolean> = signal(false);
  isChangePasswordModalOpenSignal: WritableSignal<boolean> = signal(false);
  isChangeAddressModalOpenSignal: WritableSignal<boolean> = signal(false);
  userCoordinatesWithAddressSignal: WritableSignal<CoordinatesWithAddress| undefined> = signal(undefined);

  isShowOldPassword: WritableSignal<boolean> = signal(false);
  isShowNewPassword: WritableSignal<boolean> = signal(false);

  isRequiredChooseLocaltionSignal: WritableSignal<boolean> = signal(false);
  isRequiredVerificationCodeSignal: WritableSignal<boolean> = signal(false);

  // check it's submmitted form.
  isChangedEmailSubmitted: boolean  = false;
  isChangedPasswordSubmitted: boolean  = false;

  // User address
  additonalAddress = new FormControl('');
  verificationCode = new FormControl('');
  
  constructor(
    private localStorageService: LocalStorageService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private messageService: MessageService
  ) {
    // Reactive form
    this.changeEmailForm = this.formBuilder.group({
      emailAddress: ['', [Validators.required, CustomValidators.emailValidator()]]
    });

    this.changePasswordForm = this.formBuilder.group({
      oldPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, CustomValidators.passwordValidator()]]
    });
  }

  ngOnInit() {
    // Get the user information from local storage
    this.localStorageService.userInfo$.subscribe(userInformation => {
      this.userInfoSignal.set(userInformation);
    });
  }

  toggleOldPassword() {
    this.isShowOldPassword.update(value => !value);
  }
  toggleNewPassword() {
    this.isShowNewPassword.update(value => !value);
  }

  receivedMapData(data: CoordinatesWithAddress | boolean) {
    if (typeof data !== 'boolean') {
      this.userCoordinatesWithAddressSignal.set(data);
    } 
    this.openChangeAddressModal();
    this.isMapVisibleSignal.set(false);
  }

  updateUserCoordinatesWithAddress(pointData: CoordinatesWithAddress) {
    const updatePointData: UpdateUser = {
      coordinatesWithAddress: pointData
    }
    this.userService.updateUser(updatePointData).subscribe({
      next: (data) => { 
        this.toastSuccess('Change address successfully!');

        const user: User = this.localStorageService.getUser();
        const newUser: User = {...user, address: pointData.address};
        this.localStorageService.saveUser(newUser);
      },   
      error: (error) => {
        this.toastFail('Change address failed!');
      }
    });
  }

  receivedDirectionMapData(data: boolean) {
    if (typeof data === 'boolean') {
      this.isDirectionMapVisibleSignal.set(data);
    } 
  }

  // ********** Change user email address ****************
  openChangeEmailModal() {
    this.isChangeEmailModalOpenSignal.set(true);
  }

  closeChangedEmailModal() {
    this.isChangeEmailModalOpenSignal.set(false);
    // reset the form
    this.changeEmailForm.reset();
  }

  submitChangedEmailModal(even: any) 
  {
    // Avoid refreshing the page
    even.preventDefault();

    const changedEmailData: UpdateUser = {
      emailAddress: this.changeEmailForm.value.emailAddress
    }

    this.isChangedEmailSubmitted  = true;
    if (this.changeEmailForm.valid) {
      this.userService.updateUser(changedEmailData).subscribe({
        next: (data) => { 
          this.toastSuccess('Change email address successfully!');
          this.toastInfo('Please check your email to verification!');
          this.refreshUserInfo();
          this.openVerifyEmailModal();
        },   
        error: (error) => {
          this.toastFail('Change email address failed!');
        }
      });
      this.isChangedEmailSubmitted = false;
      this.closeChangedEmailModal();
    }
    
  }

  // ********* Verify Email ********************
  openVerifyEmailModal() {
    this.isVerifyEmailModalOpenSignal.set(true);
  }

  closeVerifyEmailModal() {
    this.isVerifyEmailModalOpenSignal.set(false);
    this.verificationCode.setValue('');
    this.isRequiredVerificationCodeSignal.set(false);
  }

  sendVerificationCode() {
    this.userService.resendVerificationEmail().subscribe({
      next: (data) => { 
        this.toastSuccess('Please check your email address!');
      },   
      error: (error) => {
        this.toastFail('Please try later!');
      }
    });
  }

  submitVerifyEmailModal(event: any) {
    const verificationCode = this.verificationCode?.value?.trim();

    if (!verificationCode) {
      this.isRequiredVerificationCodeSignal.set(true);
      return;
    }
    
    this.userService.verifyEmail(verificationCode).subscribe({
      next: (data) => { 
        this.toastSuccess('Successfully verified email address!');
        this.refreshUserInfo();
      },   
      error: (error) => {
        this.toastFail('Unsuccessfully verified email address!');
      }
    });

    // Close the modal
    this.isRequiredVerificationCodeSignal.set(false);
    this.closeVerifyEmailModal();
  }

  refreshUserInfo(): void {
    this.userService.getMyinfo().subscribe({
      next: (data) => {
        const user: User = this.localStorageService.getUser();
        const newUser: User = {
          ...user, 
          emailAddress: data.emailAddress,
          newEmailAddress: data.newEmailAddress,
          isEmailAddressVerified: data.isEmailAddressVerified
        };
        this.localStorageService.saveUser(newUser);
      },
      error: (error) => {

      }
    });

  }

  // ********* Change user password ****************
  openChangePasswordModal() {
    this.isChangePasswordModalOpenSignal.set(true);
  }

  closeChangePasswordModal() {
    this.isChangePasswordModalOpenSignal.set(false);
    // reset the form
    this.changePasswordForm.reset();
  }

  submitChangedPasswordModal(even: any) 
  {
    // Avoid refreshing the page
    even.preventDefault();

    const changedPasswordData: ChangePasword = {
      oldPassword: this.changePasswordForm.value.oldPassword,
      newPassword: this.changePasswordForm.value.newPassword,
    }

    this.isChangedPasswordSubmitted  = true;
    if (this.changePasswordForm.valid) {
      this.userService.changePassword(changedPasswordData).subscribe({
        next: (data) => { 
          this.toastSuccess("Change Password Successfully!");
        },   
        error: (error) => {
          this.toastFail("Your old password may not incorrectly!")
        }
      });
      this.isChangedPasswordSubmitted = false;
      this.closeChangePasswordModal();
    }
  }

  // ************ Change user address  ****************
  openChangeAddressModal() {
    this.isChangeAddressModalOpenSignal.set(true);
  }

  closeChangeAddressModal() {
    this.isChangeAddressModalOpenSignal.set(false);
    // reset to initial state
    this.userCoordinatesWithAddressSignal.set(undefined);
    this.additonalAddress.setValue('')
    this.isRequiredChooseLocaltionSignal.set(false);
  }

  openMapModal() {
    this.isMapVisibleSignal.set(true);
    this.isChangeAddressModalOpenSignal.set(false);
  }

  openDirectionMapModal() {
    this.isDirectionMapVisibleSignal.set(true);
  }

  submitChangedAddressModal(even: any) 
  {
    // Avoid refreshing the page
    even.preventDefault();

    if (!this.userCoordinatesWithAddressSignal()) {
      // show error message
      this.isRequiredChooseLocaltionSignal.set(true);
      return;
    }
    this.isRequiredChooseLocaltionSignal.set(false);
    const fullAddress = this.additonalAddress?.value?.trim() + ' ' + this.userCoordinatesWithAddressSignal()?.address;
    this.userCoordinatesWithAddressSignal.update(currentValue => {
      if (currentValue) {
        return {
          ...currentValue,
          address: fullAddress,
        };
      }
      return undefined;
    })

    const changedAddressData: UpdateUser = {
      coordinatesWithAddress: this.userCoordinatesWithAddressSignal()
    }

    if (this.userCoordinatesWithAddressSignal()) {
      this.userService.updateUser(changedAddressData).subscribe({
        next: (data) => { 
          this.toastSuccess('Change address successfully!');
          const user: User = this.localStorageService.getUser();
          const newUser: User = {...user, address: fullAddress};
          this.localStorageService.saveUser(newUser);
        },   
        error: (error) => {
          this.toastFail('Change address failed!');
        }
      });
      this.closeChangeAddressModal();
    }
  }

  isChangeEmailFormFieldValid(field: string) {
    return (!this.changeEmailForm.get(field)?.valid && this.changeEmailForm.get(field)?.touched) ||
      (this.changeEmailForm.get(field)?.untouched && this.isChangedEmailSubmitted);
  }

  isChangePasswordFormFieldValid(field: string) {
    return (!this.changePasswordForm.get(field)?.valid && this.changePasswordForm.get(field)?.touched) ||
      (this.changePasswordForm.get(field)?.untouched && this.isChangedPasswordSubmitted);
  }

  toastSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail:  message});
  }

  toastInfo(message: string) {
    this.messageService.add({ severity: 'info', summary: 'Info', detail:  message});
  }

  toastFail(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail:  message});
  }
}
