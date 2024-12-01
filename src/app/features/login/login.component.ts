import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../shared/models/requests/login-request.model';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { ROUTES } from '../../app.routes';
import { AppConstants, ROLES } from '../../shared/constants/app-constants.constant';
import { UserService } from '../../core/services/user.service';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { User } from '../../shared/models/responses/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterLink,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  readonly routes = ROUTES;

  signinForm: FormGroup;
  showPassword = false;

  private formSubmitAttempt: boolean;
  public loginFailed: boolean;


  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private localStorageService: LocalStorageService,
    private messageService: MessageService

  ) {
    this.signinForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });

    this.formSubmitAttempt = false;
    this.loginFailed = false;
  }

  ngOnInit(): void {

    this.signinForm?.valueChanges.subscribe(value => {
      this.loginFailed = false;
    });

  }

  onSubmit() {
    this.formSubmitAttempt = true;
    this.loginFailed = false;
    if (this.signinForm.valid) {
      const loginData: LoginRequest = {
        username: this.signinForm.get('username')?.value,
        password: this.signinForm.get('password')?.value,
      }

      this.authService.login(loginData).subscribe({
        next: (data: User) => {
          this.localStorageService.saveUser(data); // Save the user data into LocalStorage
          if (data.roles?.includes(ROLES.ROLE_USER)) {
            this.router.navigate([this.routes.user.userShipment]);
          } else if (data.roles?.includes(ROLES.ROLE_ADMIN)) {
            this.router.navigate([this.routes.admin.adminWarehouse]);
          } else if (data.roles?.includes(ROLES.ROLE_WAREHOUSE_MANAGER)) {
            this.router.navigate([this.routes.warehouseManager.manageShipment]);
          } else if (data.roles?.includes(ROLES.ROLE_SHIPPER)) {
            this.router.navigate([this.routes.shipper.deliveryShipment]);
          } else if (data.roles?.includes(ROLES.ROLE_TRANSPORTER)) {
            this.router.navigate([this.routes.transporter.transportingShipment]);
          }
          this.reset(); // Reset the value
        },
        error: (error) => {
          this.loginFailed = true;
        },
      });


    }

  }

  sendResetPassword() {
    this.signinForm.get('password')?.setErrors(null);
    if (!AppConstants.EMAIL_REGEX.test(this.signinForm.get('username')?.value)) {
      this.signinForm.get('username')?.setErrors({ emailRequired: true });
      return;
    }
    this.signinForm.get('username')?.setErrors(null);

    // Send reset password request
    this.userService.sendResetPassword(this.signinForm.get('username')?.value).subscribe({
      next: (data) => {
        this.toastSuccess("Please check your verified email address!")
        this.toastInfo("Only the verified email address can recieve reset password email!");
        this.signinForm.reset();
      },
      error: (error) => {
        this.toastFail("Something went wrong! Please try again!");
      },
    });
  }

  /**
   * Check the input field is valid or not
   * @param field : The input field
   * @returns false if the field is not valid and vice versa
   */
  isFieldValid(field: string) {
    return (!this.signinForm.get(field)?.valid && this.signinForm.get(field)?.touched) ||
      (this.signinForm.get(field)?.untouched && this.formSubmitAttempt);
  }

  /**
   * Reset to initial state
   */
  reset() {
    this.signinForm.reset();
    this.formSubmitAttempt = false;
    this.loginFailed = false;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toastSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
  }

  toastInfo(message: string) {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: message });
  }

  toastFail(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }
}
