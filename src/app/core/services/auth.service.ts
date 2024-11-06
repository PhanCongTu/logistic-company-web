import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Login } from '../../shared/models/login.model';
import { AppConfig } from '../../config';
import { SignUp } from '../../shared/models/sign-up.model';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private endpoint = AppConfig.apiUrl;  // URL API

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) { }

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

  /**
   * Service use to refresh the user access token
   * @returns 
   */
  refreshToken(): Observable<any> {
    const data = {
      refreshToken: this.localStorageService.getUser()?.refreshToken
    };
    return this.http.post(`${this.endpoint}/api/refresh_token`, data);
  }
}
