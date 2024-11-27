import { Injectable } from '@angular/core';
import { AppConfig } from '../../config';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { LocalStorageService } from './local-storage.service';
import { Observable } from 'rxjs';
import { CreateWarehouseRequest } from '../../shared/models/requests/create-warehouse-request.model';
import { PageRequest } from '../../shared/models/requests/page-request.model';
import { RequestParamBuilder } from '../../shared/utils/request-param-builder';
import { UpdateWarehouseRequest } from '../../shared/models/requests/update-warehouse-request.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private endpoint = AppConfig.apiUrl;  // URL API

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) { }

  addShipperToWarehouse(warehouseId: number, shipperId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });
    const params = {
      'shipperId': shipperId,
      'warehouseId': warehouseId
    };
    return this.http.post(`${this.endpoint}/api/admin/warehouse/add-shipper`, null, { headers, params });
  }

  assignWarehouseToManager(warehouseId: number, warehouseManagerId: number) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });
    const params = {
      'managerId': warehouseManagerId,
      'warehouseId': warehouseId
    };
    return this.http.post(`${this.endpoint}/api/admin/warehouse/assign-manager`, null, { headers, params });
  }

  updateRolesToUser(userId: string, newRoles: string[]) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });
    const data = {
      "userId": userId || undefined,
      "roles": newRoles
    };
    return this.http.post(`${this.endpoint}/api/admin/update-role`, data, { headers });
  }
  /**
   * Create a new warehouse
   * @param data : the CreateWarehouseRequest Interface
   * @returns 
   */
  createWarehouse(data: CreateWarehouseRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });
    return this.http.post(`${this.endpoint}/api/admin/warehouse/create`, data, { headers });
  }

  pacthUpdateWarehouse(warehouseId: number, data: UpdateWarehouseRequest): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });
    const params = {
      'warehouseId': warehouseId
    };
    return this.http.patch(`${this.endpoint}/api/admin/warehouse/update`, data, { headers, params });
  }

  /**
   * Delete (Deactivate) the warehouse status
   * @param warehouseId : the id of the warehouse
   * @returns 
   */
  deactivateWarehouse(warehouseId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });
    const params = {
      'warehouseId': warehouseId
    };
    return this.http.delete(`${this.endpoint}/api/admin/warehouse/deactivate`, { headers, params });
  }

  /**
   * Activate the warehouse status
   * @param warehouseId : the id of the warehouse
   * @returns 
   */
  activeWarehouse(warehouseId: number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });
    const params = {
      'warehouseId': warehouseId
    };
    return this.http.put(`${this.endpoint}/api/admin/warehouse/active`, null, { headers, params });
  }

  /**
   * Search the paginated warehouse
   * @param pageRequest : the PageRequest interface
   * @returns the {@link PaginatedResponse} of {@link Warehouse}
   */
  searchAndPageableWarehouse(pageRequest: PageRequest): Observable<any> {

    const { page, size, search, sortColumn, sortType } = pageRequest;

    const params = new RequestParamBuilder()
      .setPage(page)
      .setSize(size)
      .setSearch(search)
      .setSortColumn(sortColumn)
      .setSortType(sortType)
      .build();

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });
    return this.http.get(`${this.endpoint}/api/admin/warehouse`, { headers, params });
  }

  searchAndPageableUserProfile(pageRequest: PageRequest, role: string): Observable<any> {

    const { page, size, search, sortColumn, sortType } = pageRequest;

    let params = new RequestParamBuilder()
      .setPage(page)
      .setSize(size)
      .setSearch(search)
      .setSortColumn(sortColumn)
      .setSortType(sortType)
      .build();

    params = params.set('role', role ?? '');


    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });
    return this.http.get(`${this.endpoint}/api/admin/users`, { headers, params });
  }
}
