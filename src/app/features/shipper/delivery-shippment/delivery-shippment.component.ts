import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { BadgeModule } from 'primeng/badge';
import { DialogModule } from 'primeng/dialog';
import { Menu, MenuModule } from 'primeng/menu';
import { TabMenuModule } from 'primeng/tabmenu';
import { ToastModule } from 'primeng/toast';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { AdminService } from '../../../core/services/admin.service';
import { ShipmentService } from '../../../core/services/shipment.service';
import { Shipment } from '../../../shared/models/responses/shipment.model';
import { PaginatedResponse } from '../../../shared/models/responses/paginated-response.model';
import { SHIPMENT_STATUS, SHIPPER_TYPE } from '../../../shared/constants/app-constants.constant';
import { PageRequest } from '../../../shared/models/requests/page-request.model';
import { CountShipment } from '../../../shared/models/responses/count-shipment.model';
import { ConfirmPopupComponent } from '../../../shared/components/confirm-popup/confirm-popup.component';

@Component({
  selector: 'app-delivery-shippment',
  standalone: true,
  imports: [
    CommonModule,
    TabMenuModule,
    BadgeModule,
    MenuModule,
    ToastModule,
    DialogModule,
    ReactiveFormsModule,
    RouterLink,
    FormsModule,
    ConfirmPopupComponent
  ],
  providers: [MessageService],
  templateUrl: './delivery-shippment.component.html',
  styleUrl: './delivery-shippment.component.scss'
})
export class DeliveryShippmentComponent {
  tabItems: MenuItem[] | undefined;
  activeTabItem: string | undefined;
  selectedShipment: Shipment | undefined;
  shipmentMenuItems: MenuItem[] | undefined;
  countShipment: CountShipment | undefined;

  pageRequest: PageRequest = {
    page: 0,
    search: ''
  };

  searchShipmentForm: FormGroup;

  paginatedShipmentSignal: WritableSignal<PaginatedResponse<Shipment> | undefined> = signal(undefined);
  isShipmentInforOpenSignal: WritableSignal<boolean> = signal(false);

  @ViewChild('shipmentMenu') shipmentMenu!: Menu;
  @ViewChild('confirmIsPaidPopupComponent') confirmIsPaidPopupComponent!: ConfirmPopupComponent;
  @ViewChild('warningNeedToPaidPopupComponent') warningNeedToPaidPopupComponent!: ConfirmPopupComponent;

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

  initShipmentMenuItems() {
    this.shipmentMenuItems = [
      {
        label: 'Bắt đầu lấy hàng', icon: 'fa-solid fa-truck-ramp-box',
        visible: this.activeTabItem === '1',
        command: () => {
          this.startPickUpShipment();
        }
      },
      {
        label: 'Lấy hàng thành công', icon: 'fa-solid fa-check',
        visible: this.activeTabItem === '2',
        command: () => {
          this.openIsPaidPopupPopup();
        }
      },
      {
        label: 'Bắt đầu giao hàng', icon: 'fa-solid fa-truck-arrow-right',
        visible: this.activeTabItem === '3',
        command: () => {
          this.startDeliveryShipment();
        }
      },
      {
        label: 'Bắt đầu giao hàng', icon: 'fa-solid fa-check',
        visible: this.activeTabItem === '4',
        command: () => {
          this.openWarningNeedToPaidPopup();
        }
      }
    ];
  }

  countUserShipments() {
    let sipperId = this.localStorageService.getUser()?.userId;
    this.shipmentService.countShipperShipments(Number(sipperId)).subscribe({
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
        label: 'Cần lấy hàng',
        command: () => {
          this.navigateWithQuery('1');
        },
        badge: data?.PICKUP_SCHEDULED.toString()
      },
      {
        id: '2',
        label: 'Đang lấy hàng',
        command: () => {
          this.navigateWithQuery('2')
        },
        badge: data?.OUT_FOR_PICKUP.toString()
      },
      {
        id: '3',
        label: 'Cần giao hàng',
        command: () => {
          this.navigateWithQuery('3')
        },
        badge: data?.DELIVERY_SCHEDULED.toString()
      },
      {
        id: '4',
        label: 'Đang giao hàng',
        command: () => {
          this.navigateWithQuery('4')
        },
        badge: data?.OUT_FOR_DELIVERY.toString()
      }
    ];
    this.activeTabItem = this.activeTabItem || this.tabItems[0].id;
  }

  // ************* Start delivery shipment ****************
  startDeliveryShipment() {
    this.isShipmentInforOpenSignal.set(false);
    if (!this.selectedShipment) {
      this.toastWarning("Vui lòng chọn một đơn hàng trước!")
      return;
    };
    this.shipmentService.startDeliveryShipment(this.selectedShipment?.id.toString()).subscribe({
      next: (data) => {
        this.searchAndPageableShipment();
        this.toastSuccess("Đã bắt đầu giao đơn hàng!");
      },
      error: (error) => {
        this.toastFail("Có lỗi! Vui lòng thử lại!");
      },
    });
    this.selectedShipment = undefined;
  }

  // ************* Complete delivery shipment ****************
  openWarningNeedToPaidPopup() {
    this.isShipmentInforOpenSignal.set(false);
    if (this.selectedShipment?.isPaid) {
      this.completeDeliveryShipment(true);
    } else {
      this.warningNeedToPaidPopupComponent.show();
    }
  }
  completeDeliveryShipment(isConfirmed: boolean) {
    if (!this.selectedShipment) {
      this.toastWarning("Vui lòng chọn một đơn hàng trước!")
      return;
    };
    if (this.selectedShipment && isConfirmed) {
      this.shipmentService.completeDeliveryShipment(this.selectedShipment?.id.toString()).subscribe({
        next: (data) => {
          this.searchAndPageableShipment();
          this.toastSuccess("Đã giao hàng thành công!");
        },
        error: (error) => {
          this.toastFail("Có lỗi! Vui lòng thử lại!");
        },
      });
    }
    this.selectedShipment = undefined;
  }

  // ************* Start pick up shipment ****************
  startPickUpShipment() {
    this.isShipmentInforOpenSignal.set(false);
    if (!this.selectedShipment) {
      this.toastWarning("Vui lòng chọn một đơn hàng trước!")
      return;
    };
    this.shipmentService.startPickUpShipment(this.selectedShipment?.id.toString()).subscribe({
      next: (data) => {
        this.searchAndPageableShipment();
        this.toastSuccess("Đã bắt đầu lấy đơn hàng!");
      },
      error: (error) => {
        this.toastFail("Có lỗi! Vui lòng thử lại!");
      },
    });
    this.selectedShipment = undefined;
  }

  // ************* Complete pick up shipment ****************
  openIsPaidPopupPopup() {
    this.isShipmentInforOpenSignal.set(false);
    this.confirmIsPaidPopupComponent.show();
  }
  completePickUpShipment(isPaid: boolean) {
    if (!this.selectedShipment) {
      this.toastWarning("Vui lòng chọn một đơn hàng trước!")
      return;
    };
    if (this.selectedShipment) {

      this.shipmentService.completePickUpShipment(this.selectedShipment?.id.toString(), isPaid).subscribe({
        next: (data) => {
          this.searchAndPageableShipment();
          this.toastSuccess("Đã lấy hàng thành công!");
        },
        error: (error) => {
          this.toastFail("Có lỗi! Vui lòng thử lại!");
        },
      });
    }
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
    let shipperType = ''
    if (this.activeTabItem === '1') {
      statuses = SHIPMENT_STATUS.PICKUP_SCHEDULED;
      shipperType = SHIPPER_TYPE.PICKER;
    } else if (this.activeTabItem === '2') {
      statuses = SHIPMENT_STATUS.OUT_FOR_PICKUP;
      shipperType = SHIPPER_TYPE.PICKER;
    } else if (this.activeTabItem === '3') {
      statuses = SHIPMENT_STATUS.DELIVERY_SCHEDULED;
      shipperType = SHIPPER_TYPE.DELIVERY;
    } else if (this.activeTabItem === '4') {
      statuses = SHIPMENT_STATUS.OUT_FOR_DELIVERY;
      shipperType = SHIPPER_TYPE.DELIVERY;
    }

    this.shipmentService.getAllShipmentOfShipperByStatusAndType(this.pageRequest, statuses, shipperType).subscribe({
      next: (data: PaginatedResponse<Shipment>) => {
        this.paginatedShipmentSignal.set(data);

      },
      error: (error) => {
        this.toastFail("Có lỗi! Vui lòng thử lại!");
      },
    });

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
