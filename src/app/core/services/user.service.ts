import { Injectable } from '@angular/core';
import { AppConfig } from '../../config';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UpdateUser } from '../../shared/models/update-user.model';
import { Observable } from 'rxjs';
import { LocalStorageService } from './local-storage.service';
import { ChangePasword } from '../../shared/models/change-pasword.model';

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
}
