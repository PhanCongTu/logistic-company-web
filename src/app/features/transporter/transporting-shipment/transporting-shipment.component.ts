import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { Menu, MenuModule } from 'primeng/menu';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { ConfirmPopupComponent } from '../../../shared/components/confirm-popup/confirm-popup.component';
import { CountShipment } from '../../../shared/models/responses/count-shipment.model';
import { ActivatedRoute, Router } from '@angular/router';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { AdminService } from '../../../core/services/admin.service';
import { ShipmentService } from '../../../core/services/shipment.service';
import { SHIPMENT_STATUS, SHIPPER_TYPE, TRANSPORTER_TYPE } from '../../../shared/constants/app-constants.constant';
import { Shipment } from '../../../shared/models/responses/shipment.model';
import { PaginatedResponse } from '../../../shared/models/responses/paginated-response.model';
import { PageRequest } from '../../../shared/models/requests/page-request.model';

@Component({
  selector: 'app-transporting-shipment',
  standalone: true,
  imports: [
    CommonModule,
    TabMenuModule,
    BadgeModule,
    MenuModule,
    ToastModule,
    DialogModule,
    ReactiveFormsModule,
    FormsModule
  ],
  providers: [MessageService],
  templateUrl: './transporting-shipment.component.html',
  styleUrl: './transporting-shipment.component.scss'
})
export class TransportingShipmentComponent {

  tabItems: MenuItem[] | undefined;
  activeTabItem: string | undefined;
  selectedShipment: Shipment | undefined;
  shipmentMenuItems: MenuItem[] | undefined;
  countShipment: CountShipment | undefined;

  searchShipmentForm: FormGroup;

  pageRequest: PageRequest = {
    page: 0,
    search: ''
  };

  paginatedShipmentSignal: WritableSignal<PaginatedResponse<Shipment> | undefined> = signal(undefined);
  isShipmentInforOpenSignal: WritableSignal<boolean> = signal(false);

  @ViewChild('shipmentMenu') shipmentMenu!: Menu;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private warehouseService: WarehouseService,
    private messageService: MessageService,
    private localStorageService: LocalStorageService,
    private adminService: AdminService,
    private shipmentService: ShipmentService
  ) {
    this.setUpTab();
    this.countUserShipments();
    this.searchShipmentForm = this.formBuilder.group({
      searchedShipment: ['']
    });
  }

  ngOnInit() {
    this.searchAndPageableShipment();
  }

  searchShipment(even: any) {
    // Avoid refreshing the page
    even.preventDefault();

    const trackingNumber = this.searchShipmentForm.get("searchedShipment")?.value?.trim();

    this.pageRequest.search = trackingNumber;
    this.pageRequest.page = 0;
    this.searchAndPageableShipment();
  }

  countUserShipments() {
    let transporterId = this.localStorageService.getUser()?.userId;
    this.shipmentService.countTransporterShipments(Number(transporterId)).subscribe({
      next: (data: CountShipment) => {
        this.countShipment = data;
        this.setUpTab(data);
      },
      error: (error) => {
        this.toastFail("Không thể đếm đơn hàng, vui lòng thử lại sau!");
      },
    });
  }

  setUpTab(data?: CountShipment) {
    this.tabItems = [
      {
        id: '1',
        label: 'Cần chuyển kho',
        command: () => {
          this.navigateWithQuery('1');
        },
        badge: data?.TRANSIT_SCHEDULED.toString()
      },
      {
        id: '2',
        label: 'Đang chuyển kho',
        command: () => {
          this.navigateWithQuery('2')
        },
        badge: data?.IN_TRANSIT.toString()
      }
    ];
    this.activeTabItem = this.activeTabItem || this.tabItems[0].id;
  }
  // ********************************************

  navigateWithQuery(tab: string): void {
    this.activeTabItem = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge', // Giữ lại các query param khác
    });
    this.searchAndPageableShipment();
  }

  initShipmentMenuItems() {
    this.shipmentMenuItems = [
      {
        label: 'Bắt đầu chuyển hàng', icon: 'fa-solid fa-truck-ramp-box',
        visible: this.activeTabItem === '1',
        command: () => {
          this.startTransit();
        }
      },
      {
        label: 'Chuyển hàng thành công', icon: 'fa-solid fa-check',
        visible: this.activeTabItem === '2',
        command: () => {
          this.completeTransit();
        }
      }
    ];
  }

  // ************* Start transit the shipment ********************
  startTransit() {
    this.isShipmentInforOpenSignal.set(false);
    if (!this.selectedShipment) {
      this.toastWarning("Vui lòng chọn một đơn hàng trước!")
      return;
    };

    //
    this.shipmentService.startTransit(this.selectedShipment?.id.toString()).subscribe({
      next: (data) => {
        this.searchAndPageableShipment();
        this.toastSuccess("Đã bắt đầu chuyển đơn hàng này!");
      },
      error: (error) => {
        this.toastFail("Có lỗi! Vui lòng thử lại!");
      },
    });

    this.selectedShipment = undefined;
  }

  // ************* Complete transit the shipment ********************
  completeTransit() {
    this.isShipmentInforOpenSignal.set(false);
    if (!this.selectedShipment) {
      this.toastWarning("Vui lòng chọn một đơn hàng trước!")
      return;
    };

    //
    this.shipmentService.completeTransit(this.selectedShipment?.id.toString()).subscribe({
      next: (data) => {
        this.searchAndPageableShipment();
        this.toastSuccess("Đã chuyển đơn hàng này thành công!");
      },
      error: (error) => {
        this.toastFail("Có lỗi! Vui lòng thử lại!");
      },
    });

    this.selectedShipment = undefined;
  }

  // ************* Get shipping information **********************
  previousPage() {
    this.pageRequest.page = this.pageRequest.page! - 1;
    this.searchAndPageableShipment();
  }

  nextPage() {
    this.pageRequest.page = this.pageRequest.page! + 1;
    this.searchAndPageableShipment();
  }
  searchAndPageableShipment() {
    this.initShipmentMenuItems();
    this.countUserShipments();
    let statuses = '';
    let transporterType = ''
    if (this.activeTabItem === '1') {
      statuses = SHIPMENT_STATUS.TRANSIT_SCHEDULED;
      transporterType = TRANSPORTER_TYPE.TRANSPORTER;
    } else if (this.activeTabItem === '2') {
      statuses = SHIPMENT_STATUS.IN_TRANSIT;
      transporterType = TRANSPORTER_TYPE.TRANSPORTER;
    }

    this.shipmentService.getAllShipmentOfTransporterByStatusAndType(this.pageRequest, statuses, transporterType).subscribe({
      next: (data: PaginatedResponse<Shipment>) => {
        this.paginatedShipmentSignal.set(data);
      },
      error: (error) => {
        this.toastFail("Có lỗi! Vui lòng thử lại!");
      },
    });
  }

  // ************  Shipment information model ********************************

  openShipmentInforModal(shipment: Shipment) {
    this.selectedShipment = shipment;
    this.isShipmentInforOpenSignal.set(true);
  }

  closeShipmentInforModal() {
    this.selectedShipment = undefined;
    this.isShipmentInforOpenSignal.set(false);
  }

  // ************ 
  toggleShipmentMenu(event: MouseEvent, shipment: Shipment) {
    event.stopPropagation();
    this.selectedShipment = shipment;
    this.shipmentMenu.toggle(event); // Hiển thị dropdown
  }

  toastSuccess(message: string) {
    this.messageService.add({ severity: 'success', summary: 'Success', detail: message });
  }

  toastInfo(message: string) {
    this.messageService.add({ severity: 'info', summary: 'Info', detail: message });
  }

  toastFail(message: string) {
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  toastWarning(message: string) {
    this.messageService.add({ severity: 'warn', summary: 'Warn', detail: message });
  }
}
