import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Login } from '../../shared/models/login.model';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { ROUTES } from '../../app.routes';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
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
    private router: Router,
    private localStorageService: LocalStorageService
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
      const loginData: Login = {
        username: this.signinForm.get('username')?.value,
        password: this.signinForm.get('password')?.value,
      }
  
      this.authService.login(loginData).subscribe({
        next: (data) => { 
          this.localStorageService.saveUser(data); // Save the user data into LocalStorage
          this.router.navigate([this.routes.userInfo]); 
          this.reset(); // Reset the value
        },   
        error: (error) => { 
          this.loginFailed = true;
        },
      });

      
    } 
    
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
}
