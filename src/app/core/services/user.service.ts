import { Injectable } from '@angular/core';
import { AppConfig } from '../../config';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UpdateUser } from '../../shared/models/update-user.model';
import { Observable } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { ChangePasword } from '../../shared/models/change-pasword.model';
import { ResetPassword } from '../../shared/models/reset-password.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private endpoint = AppConfig.apiUrl;  // URL API

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) { }

  /**
   * Update user information
   * @param data : the UpdateUser interface
   * @returns 
   */
  updateUser(data: UpdateUser): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer ' + this.localStorageService.getToken(), 
    });
    return this.http.patch(`${this.endpoint}/api/user/update`, data, { headers });
  }

  /**
   * Change the user password
   * @param data  : The ChangePasword interface
   * @returns 
   */
  changePassword(data: ChangePasword): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer ' + this.localStorageService.getToken(), 
    });
    return this.http.post(`${this.endpoint}/api/user/change-password`, data, { headers });
  }

  /**
   * Resent the verification email address to user email
   * @returns 
   */
  resendVerificationEmail(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer ' + this.localStorageService.getToken(), 
    });
    return this.http.post(`${this.endpoint}/api/user/email/resend-verify`, null, { headers });
  }

  /**
   * Verify user's email address
   * @param code : the verification code
   * @returns 
   */
  verifyEmail(code: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer ' + this.localStorageService.getToken(), 
    });
    const params = {
      'code': code
    };
    return this.http.post(`${this.endpoint}/api/user/email/verify`, null, { headers, params });
  }

  /**
   * Get current user's information
   * @returns 
   */
  getMyinfo(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json', 
      'Authorization': 'Bearer ' + this.localStorageService.getToken(), 
    });
    return this.http.get(`${this.endpoint}/api/user/me`, { headers});
  }

  sendResetPassword(verifiedEmail: string): Observable<any> {
    return this.http.post(`${this.endpoint}/api/user/password/reset/request/EMAIL:${verifiedEmail}`, null);
  }
  
  verifyResetPasswordCode(userId: string, code: string): Observable<any> {
    const params = {
      'userId': userId,
      'code': code
    };
    return this.http.post(`${this.endpoint}/api/user/password/reset/verify`, null, { params });
  }

  resetPassword(userId: string, data: ResetPassword): Observable<any> {
    const params = {
      'userId': userId
    };
    return this.http.post(`${this.endpoint}/api/user/password/reset/complete`, data, { params });
  }
}
