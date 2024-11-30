import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig } from '../../config';
import { LocalStorageService } from './local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {

  private endpoint = AppConfig.apiUrl;  // URL API

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) { }

  deliveryShipment(shipmentId: string, pickUpShipperId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });

    const params = {
      'shipmentId': shipmentId,
      'pickUpShipperId': pickUpShipperId
    };

    return this.http.post(`${this.endpoint}/api/shipment/delivery-shipment`, null, { headers, params });
  }
}
