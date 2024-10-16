import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Login } from '../../shared/models/login.model';
import { AppConfig } from '../../config';
import { SignUp } from '../../shared/models/sign-up.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private endpoint = AppConfig.apiUrl;  // URL API

  constructor(private http: HttpClient) { }

  /**
   * Service use to user login
   * @param data : The Login interface
   * @returns 
   */
  login(data: Login): Observable<any> {
    return this.http.post(`${this.endpoint}/api/login`, data);
  }

  /**
   * Service use to user register a new account
   * @param data : The SignUp interface
   * @returns 
   */
  signUp(data: SignUp): Observable<any> {
    return this.http.post(`${this.endpoint}/api/signup`, data);
  }
}
