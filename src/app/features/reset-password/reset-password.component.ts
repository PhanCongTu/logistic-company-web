import { CommonModule } from '@angular/common';
import { Component, signal, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ROUTES } from '../../app.routes';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { CustomValidators } from '../../shared/custom-validators.validator';
import { ResetPasswordRequest } from '../../shared/models/requests/reset-password-request.model';
import { UserService } from '../../core/services/user.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, ToastModule],
  providers: [MessageService],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  readonly routes = ROUTES;

  userId : string;
  code : string;

  resetPasswordForm: FormGroup;

  isCodeValidSignal : WritableSignal<boolean> = signal(false);
  isShowNewPasswordSignal : WritableSignal<boolean> = signal(false);
  isShowConfirmNewPasswordSignal : WritableSignal<boolean> = signal(false);

  private formSubmitAttempt = false;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private messageService: MessageService,
    private route: ActivatedRoute
  ) {
    this.resetPasswordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, CustomValidators.passwordValidator()]],
      confirmNewPassword: ['']
    });

    this.userId = this.route.snapshot.queryParams['userId'];
    this.code = this.route.snapshot.queryParams['code'];
  }

  ngOnInit(): void {

    this.userService.verifyResetPasswordCode(this.userId, this.code).subscribe({
      next: (data) => {
        this.isCodeValidSignal.set(true);
      },   
      error: (error) => { 
        this.isCodeValidSignal.set(false);
      },
    });

    this.resetPasswordForm?.valueChanges.subscribe(value => {
      if (this.resetPasswordForm.get('newPassword')?.value !== this.resetPasswordForm.get('confirmNewPassword')?.value) {
        this.resetPasswordForm.get('confirmNewPassword')?.setErrors({ passwordNotMatched: true });
      }
    });
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      const resetPasswordData: ResetPasswordRequest = {
        newPassword: this.resetPasswordForm.get('newPassword')?.value,
        code: this.code
      }
  
      this.userService.resetPassword(this.userId, resetPasswordData).subscribe({
        next: (data) => { 
          this.toastSuccess('Reset password successfully!');
          setTimeout(() => {
            this.router.navigate([this.routes.login]);
          }, 1500);
        },   
        error: (error) => { 
          this.isCodeValidSignal.set(false);
          this.toastFailure('Failed to reset password!');
        },
      });
      this.reset(); // Reset the value
    } 
  }

  /**
   * Check the input field is valid or not
   * @param field : The input field
   * @returns false if the field is not valid and vice versa
   */
  isFieldValid(field: string) {
    return (!this.resetPasswordForm.get(field)?.valid && this.resetPasswordForm.get(field)?.touched) ||
      (this.resetPasswordForm.get(field)?.untouched && this.formSubmitAttempt);
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.resetPasswordForm.reset();
    this.formSubmitAttempt = false;
  }

  toggleNewPassword() {
    this.isShowNewPasswordSignal.update( value => !value );
  }

  toggleConfirmNewPassword() {
    this.isShowConfirmNewPasswordSignal.update( value =>! value );
  }

  toastSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail:  message});
  }

  toastInfo(message: string) {
    this.messageService.add({ severity: 'info', summary: 'Info', detail:  message});
  }

  toastFailure(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail:  message});
  }
}
