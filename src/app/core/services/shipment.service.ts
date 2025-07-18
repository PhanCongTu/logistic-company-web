import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppConfig } from '../../config';
import { LocalStorageService } from './local-storage.service';
import { PageRequest } from '../../shared/models/requests/page-request.model';
import { RequestParamBuilder } from '../../shared/utils/request-param-builder';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {

  private endpoint = AppConfig.apiUrl;  // URL API

  constructor(
    private http: HttpClient,
    private localStorageService: LocalStorageService
  ) { }

  getShipmentInfoByTrackingNumber(trackingNumber: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      // 'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });

    return this.http.get(`${this.endpoint}/api/shipment/code/${trackingNumber}`, { headers });
  }

  transitShipment(shipmentId: string, transporterId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });

    const params = {
      'shipmentId': shipmentId,
      'transporterId': transporterId
    };

    return this.http.post(`${this.endpoint}/api/shipment/transit-shipment`, null, { headers, params });
  }

  countManagerShipments(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });
    return this.http.get(`${this.endpoint}/api/warehouse-manager/shipment/count`, { headers });
  }

  countShipperShipments(shipperId: Number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });
    return this.http.get(`${this.endpoint}/api/shipper/${shipperId}/shipment/count`, { headers });
  }

  countTransporterShipments(transporterId: Number): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });
    return this.http.get(`${this.endpoint}/api/transporter/${transporterId}/shipment/count`, { headers });
  }



  startDeliveryShipment(shipmentId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });

    const params = {
      'shipmentId': shipmentId
    };

    return this.http.post(`${this.endpoint}/api/shipper/delivery`, null, { headers, params });
  }

  completeDeliveryShipment(shipmentId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });

    const params = {
      'shipmentId': shipmentId
    };

    return this.http.post(`${this.endpoint}/api/shipper/complete-delivery`, null, { headers, params });
  }

  startPickUpShipment(shipmentId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });

    const params = {
      'shipmentId': shipmentId
    };

    return this.http.post(`${this.endpoint}/api/shipper/pickup`, null, { headers, params });
  }

  completePickUpShipment(shipmentId: string, isPaid: boolean): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });

    const params = {
      'shipmentId': shipmentId,
      'isPaid': isPaid
    };

    return this.http.post(`${this.endpoint}/api/shipper/complete-pickup`, null, { headers, params });
  }


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

  getAllShipmentOfShipperByStatusAndType(pageRequest: PageRequest, statuses: string, shipperType: string): Observable<any> {
    const { page, size, search, sortColumn, sortType } = pageRequest;

    let params = new RequestParamBuilder()
      .setPage(page)
      .setSize(size)
      .setSearch(search) // The tracking number
      .setSortColumn(sortColumn)
      .setSortType(sortType)
      .build();

    params = params.set('statuses', statuses ?? []); // List of status
    params = params.set('shipperType', shipperType); // List of status

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });

    return this.http.get(`${this.endpoint}/api/shipper/me`, { headers, params });
  }

  getAllShipmentOfTransporterByStatusAndType(pageRequest: PageRequest, statuses: string, transporterType: string): Observable<any> {
    const { page, size, search, sortColumn, sortType } = pageRequest;

    let params = new RequestParamBuilder()
      .setPage(page)
      .setSize(size)
      .setSearch(search) // The tracking number
      .setSortColumn(sortColumn)
      .setSortType(sortType)
      .build();

    params = params.set('statuses', statuses ?? []); // List of status
    params = params.set('transporterType', transporterType); // List of status

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });

    return this.http.get(`${this.endpoint}/api/transporter/me`, { headers, params });
  }

  startTransit(shipmentId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });

    const params = {
      'shipmentId': shipmentId
    };

    return this.http.post(`${this.endpoint}/api/transporter/start-transporting`, null, { headers, params });
  }

  completeTransit(shipmentId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.localStorageService.getToken(),
    });

    const params = {
      'shipmentId': shipmentId
    };

    return this.http.post(`${this.endpoint}/api/transporter/complete-transporting`, null, { headers, params });
  }
}
