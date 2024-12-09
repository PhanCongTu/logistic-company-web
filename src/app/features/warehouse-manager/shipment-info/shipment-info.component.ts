import { Component, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { MessageService } from 'primeng/api';
import { FormBuilder } from '@angular/forms';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { Shipment } from '../../../shared/models/responses/shipment.model';
import { ShipmentService } from '../../../core/services/shipment.service';
import { TimelineModule } from 'primeng/timeline';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shipment-info',
  standalone: true,
  imports: [
    CommonModule,
    TimelineModule
  ],
  providers: [MessageService],
  templateUrl: './shipment-info.component.html',
  styleUrl: './shipment-info.component.scss'
})
export class ShipmentInfoComponent {
  trackingNumber: string | null = '';
  events: any[];
  shipmentInfoSignal: WritableSignal<Shipment | undefined> = signal(undefined);
  statusId: WritableSignal<Number> = signal(1);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private shipmentService: ShipmentService
  ) {
    this.events = [
      { id: 1, code: 'ORDER_RECEIVED', status: 'Ordered', date: '15/10/2020 10:30', icon: 'pi pi-shopping-cart', color: '#9C27B0' },
      { id: 2, code: 'PICKUP_SCHEDULED', status: 'Processing', date: '15/10/2020 14:00', icon: 'pi pi-cog', color: '#673AB7' },
      { id: 3, code: 'OUT_FOR_PICKUP', status: 'Shipped', date: '15/10/2020 16:15', icon: 'pi pi-shopping-cart', color: '#FF9800' },
      { id: 4, code: 'PICKED_UP', status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' },
      { id: 5, code: 'IN_TRANSIT', status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' },
      { id: 6, code: 'TRANSITED', status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' },
      { id: 7, code: 'DELIVERY_SCHEDULED', status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' },
      { id: 8, code: 'OUT_FOR_DELIVERY', status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' },
      { id: 9, code: 'DELIVERED', status: 'Delivered', date: '16/10/2020 10:00', icon: 'pi pi-check', color: '#607D8B' },
    ];

  }

  ngOnInit() {
    this.trackingNumber = this.route.snapshot.paramMap.get('trackingNumber')
    this.initShipmentInfo();

  }

  initShipmentInfo() {
    if (this.trackingNumber) {
      this.shipmentService.getShipmentInfoByTrackingNumber(this.trackingNumber).subscribe({
        next: (data: Shipment) => {
          this.shipmentInfoSignal.set(data);
          let currentStatus = this.events.find(statusA => statusA.code === data?.status);
          this.statusId = currentStatus?.id;
        },
        error: (error) => {
        },
      })
    }
  }
}
