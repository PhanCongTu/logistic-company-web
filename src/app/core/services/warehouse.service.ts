import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalStorageService } from './local-storage.service';
import { Observable } from 'rxjs';
import { AppConfig } from '../../config';
import { PageRequest } from '../../shared/models/requests/page-request.model';
import { RequestParamBuilder } from '../../shared/utils/request-param-builder';

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

  getAllShipmentOfWarehouse(isOriginWareHouse: Boolean = true, pageRequest: PageRequest, statuses: string): Observable<any> {
    const { page, size, search, sortColumn, sortType } = pageRequest;

    let params = new RequestParamBuilder()
      .setPage(page)
      .setSize(size)
      .setSearch(search) // The tracking number
      .setSortColumn(sortColumn)
      .setSortType(sortType)
      .build();

    params = params.set('statuses', statuses ?? []); // List of status

    let path = 'api/warehouse-manager/origin/shipments';
    if (!isOriginWareHouse) {
      path = 'api/warehouse-manager/destination/shipments';
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });

    return this.http.get(`${this.endpoint}/${path}`, { headers, params });
  }

  getAllShipmentOfBothWarehouses(pageRequest: PageRequest, statuses: string): Observable<any> {
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

    return this.http.get(`${this.endpoint}/api/warehouse-manager/all-shipments`, { headers, params });
  }
}
