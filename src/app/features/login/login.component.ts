import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Login } from '../../shared/models/login.model';
import { CustomValidators } from '../../shared/custom-validators.validator';
import { saveUser } from '../../shared/utils/local-storage.util';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  signinForm: FormGroup;

  private formSubmitAttempt: boolean;
  public loginFailed: boolean;


  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
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
          saveUser(data); // Save the user data into LocalStorage
          this.router.navigate(['/user/infor']); // Navigate to Home page
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
}
