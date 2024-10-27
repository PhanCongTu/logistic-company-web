import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CustomValidators } from '../../shared/custom-validators.validator';
import { SignUp } from '../../shared/models/sign-up.model';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { LocalStorageService } from '../../core/services/local-storage.service';
import { ROUTES } from '../../app.routes';


@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, FontAwesomeModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  readonly routes = ROUTES;

  signupForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  private formSubmitAttempt: boolean;
  public signUpFailed: boolean;


  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private localStorageService: LocalStorageService
  ) {
    this.signupForm = this.formBuilder.group({
      username: ['', [Validators.required, CustomValidators.usernameValidator()]],
      password: ['', [Validators.required, CustomValidators.passwordValidator()]],
      confirmPassword: ['', [Validators.required]],
      emailAddress: ['', [Validators.required, CustomValidators.emailValidator()]],
      address: ['', [Validators.required]],
      companyName : ['', [Validators.required]]
    });

    this.formSubmitAttempt = false;
    this.signUpFailed = false;
  }

  ngOnInit(): void {

    this.signupForm?.valueChanges.subscribe(value => {
      this.signUpFailed = false;
      if (this.signupForm.get('password')?.value !== this.signupForm.get('confirmPassword')?.value) {
        this.signupForm.get('confirmPassword')?.setErrors({ passwordNotMatched: true });
      }
    });
  }

  onSubmit() {
    this.formSubmitAttempt = true;
    this.signUpFailed = false;

    

    if (this.signupForm.valid) {
      const signUpData: SignUp = {
        username: this.signupForm.get('username')?.value,
        password: this.signupForm.get('password')?.value,
        address: this.signupForm.get('address')?.value,
        companyName: this.signupForm.get('companyName')?.value,
        emailAddress: this.signupForm.get('emailAddress')?.value,
      }
  
      this.authService.signUp(signUpData).subscribe({
        next: (data) => { 
          this.localStorageService.saveUser(data);
          this.router.navigate([this.routes.home]);
        },   
        error: (error) => { 
          this.signUpFailed = true;
        },
      });

      // Reset the value
      this.reset();
    } 
    
  }

  isFieldValid(field: string) {
    return (!this.signupForm.get(field)?.valid && this.signupForm.get(field)?.touched) ||
      (this.signupForm.get(field)?.untouched && this.formSubmitAttempt);
  }

  reset() {
    this.signupForm.reset();
    this.formSubmitAttempt = false;
    this.signUpFailed = false;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }
  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  
}
