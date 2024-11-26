import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { Observable } from 'rxjs';
import { AppConfig } from '../../config';

@Injectable({
  providedIn: 'root'
})
export class WarehouseService {

  private endpoint = AppConfig.apiUrl;  // URL API

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) { }

  getWarehouseInfo(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    return this.http.get(`${this.endpoint}/api/warehouse-manager/all-warehouse-coordinates`, { headers });
  }
}
