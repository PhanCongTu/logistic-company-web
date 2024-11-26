import { Injectable } from '@angular/core';
import { AppConfig } from '../../config';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { UpdateUserRequest } from '../../shared/models/requests/update-user-request.model';
import { Observable } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { ChangePaswordRequest } from '../../shared/models/requests/change-pasword-request.model';
import { ResetPasswordRequest } from '../../shared/models/requests/reset-password-request.model';
import { PageRequest } from '../../shared/models/requests/page-request.model';
import { RequestParamBuilder } from '../../shared/utils/request-param-builder';
import { UpdateShipmentRequest } from '../../shared/models/requests/update-shipment-request.model';
import { CreateShipmentRequest } from '../../shared/models/requests/create-shipment-request.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private endpoint = AppConfig.apiUrl;  // URL API

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) { }

  createShipment(data: CreateShipmentRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });

    return this.http.post(`${this.endpoint}/api/shipment/create`, data, { headers });
  }

  updateShipment(data: UpdateShipmentRequest, shipmentId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });
    const params = {
      'shipmentId': shipmentId
    };
    return this.http.patch(`${this.endpoint}/api/shipment/update`, data, { headers, params });
  }

  countMyShipments(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });
    return this.http.get(`${this.endpoint}/api/shipment/me/count`, { headers });
  }

  searchAndPageableShipment(pageRequest: PageRequest, statuses: string): Observable<any> {
    const { page, size, search, sortColumn, sortType } = pageRequest;

    let params = new RequestParamBuilder()
      .setPage(page)
      .setSize(size)
      .setSearch(search) // The tracking number
      .setSortColumn(sortColumn)
      .setSortType(sortType)
      .build();

    params = params.set('statuses', statuses ?? []); // List of status

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });
    return this.http.get(`${this.endpoint}/api/shipment/me`, { headers, params });
  }

  /**
   * Update user information
   * @param data : the UpdateUser interface
   * @returns 
   */
  updateUser(data: UpdateUserRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });
    return this.http.patch(`${this.endpoint}/api/user/update`, data, { headers });
  }

  /**
   * Change the user password
   * @param data  : The ChangePaswordRequest interface
   * @returns 
   */
  changePassword(data: ChangePaswordRequest): Observable<any> {
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
    return this.http.get(`${this.endpoint}/api/user/me`, { headers });
  }

  sendResetPassword(verifiedEmail: string): Observable<any> {
    return this.http.post(`${this.endpoint}/api/user/password/reset/request/EMAIL:${verifiedEmail}`, null);
  }

  /**
   * Verify the reset password code
   * @param userId : The user's id
   * @param code : The reset password code
   * @returns 
   */
  verifyResetPasswordCode(userId: string, code: string): Observable<any> {
    const params = {
      'userId': userId,
      'code': code
    };
    return this.http.post(`${this.endpoint}/api/user/password/reset/verify`, null, { params });
  }

  /**
   * Reset the user's password
   * @param userId : The user'id
   * @param data : The ResetPassword
   * @returns 
   */
  resetPassword(userId: string, data: ResetPasswordRequest): Observable<any> {
    const params = {
      'userId': userId
    };
    return this.http.post(`${this.endpoint}/api/user/password/reset/complete`, data, { params });
  }
}
