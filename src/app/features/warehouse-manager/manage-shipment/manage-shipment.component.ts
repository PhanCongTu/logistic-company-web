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
import { CountShipment } from '../../../shared/models/responses/count-shipment.model';
import { UserService } from '../../../core/services/user.service';
import { PageRequest } from '../../../shared/models/requests/page-request.model';
import { ROLES, SHIPMENT_STATUS } from '../../../shared/constants/app-constants.constant';
import { PaginatedResponse } from '../../../shared/models/responses/paginated-response.model';
import { Shipment } from '../../../shared/models/responses/shipment.model';
import { WarehouseService } from '../../../core/services/warehouse.service';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { AdminService } from '../../../core/services/admin.service';
import { UserProfile } from '../../../shared/models/responses/user-profile.model';
import { ShipmentService } from '../../../core/services/shipment.service';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-manage-shipment',
  standalone: true,
  imports: [
    CommonModule,
    TabMenuModule,
    BadgeModule,
    MenuModule,
    ToastModule,
    DialogModule,
    ReactiveFormsModule,
    FormsModule,
    DropdownModule
  ],
  providers: [MessageService],
  templateUrl: './manage-shipment.component.html',
  styleUrl: './manage-shipment.component.scss'
})
export class ManageShipmentComponent {
  warehouseId: string;
  items: MenuItem[] | undefined;
  activeTabItem: string | undefined;
  selectedShipment: Shipment | undefined;
  countShipment: CountShipment | undefined;
  shipmentMenuItems: MenuItem[] | undefined;

  pageRequest: PageRequest = {
    page: 0,
    search: ''
  };

  shipperPageRequest: PageRequest = {
    page: 0,
    search: ''
  };

  transporterPageRequest: PageRequest = {
    page: 0,
    search: ''
  };

  searchForm: FormGroup;
  searchChoosingShipperForm: FormGroup;
  searchChoosingTransporterForm: FormGroup;

  paginatedShipmentSignal: WritableSignal<PaginatedResponse<Shipment> | undefined> = signal(undefined);
  isOriginWareHouseSignal: WritableSignal<Boolean> = signal(true);
  isShipmentInforOpenSignal: WritableSignal<boolean> = signal(false);
  isChoosingShipperModalOpenSignal: WritableSignal<boolean> = signal(false);
  isChoosingTransporterModalOpenSignal: WritableSignal<boolean> = signal(false);
  selectedShipperIdSignal: WritableSignal<string | undefined> = signal(undefined);
  selectedTransporterIdSignal: WritableSignal<string | undefined> = signal(undefined);
  paginatedShipperSignal: WritableSignal<PaginatedResponse<UserProfile> | undefined> = signal(undefined);
  paginatedTransporterSignal: WritableSignal<PaginatedResponse<UserProfile> | undefined> = signal(undefined);

  @ViewChild('shipmentMenu') shipmentMenu!: Menu;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private warehouseService: WarehouseService,
    private messageService: MessageService,
    private localStorageService: LocalStorageService,
    private adminService: AdminService,
    private ShipmentService: ShipmentService
  ) {
    this.warehouseId = this.localStorageService.getUser().warehouseId?.toString() || '';
    this.setUpTab();
    this.searchAndPageableShipment();
    this.searchForm = this.formBuilder.group({
      searchedShipment: ['']
    });
    this.searchChoosingShipperForm = this.formBuilder.group({
      searchedUsername: ['']
    });
    this.searchChoosingTransporterForm = this.formBuilder.group({
      searchedUsername: ['']
    });

  }

  ngOnInit() {

    this.initShipmentMenuItems();
  }

  searchShipment(even: any) {
    // Avoid refreshing the page
    even.preventDefault();

    const trackingNumber = this.searchForm.get("searchedShipment")?.value?.trim();

    this.pageRequest.search = trackingNumber;
    this.pageRequest.page = 0;
    this.searchAndPageableShipment();
  }

  initShipmentMenuItems() {
    this.shipmentMenuItems = [
      {
        label: 'Xác nhận', icon: 'fa-solid fa-check',
        visible: this.activeTabItem === '1',
        command: () => {
          this.confirmToPickUp();
        }
      },
      {
        label: 'Giao hàng', icon: 'fa-solid fa-truck-arrow-right',
        visible: this.activeTabItem === '3' && this.selectedShipment?.originWarehouseId === this.selectedShipment?.destinationWarehouseId,
        command: () => {
          this.confirmToPickUp();
        }
      },
      {
        label: 'Chuyển tiếp', icon: 'fa-solid fa-truck-plane',
        visible: this.activeTabItem === '3' && this.selectedShipment?.originWarehouseId !== this.selectedShipment?.destinationWarehouseId,
        command: () => {
          this.confirmToTransit();
        }
      },
      {
        label: 'Giao hàng', icon: 'fa-solid fa-truck-arrow-right',
        visible: this.activeTabItem === '4',
        command: () => {
          this.confirmToPickUp();
        }
      },
    ];
  }
  onValueChange(event: any) {
    this.searchAndPageableShipment();
  }
  // *********** Choose shipper model ***************

  openChoosingShipperModal() {
    this.isChoosingShipperModalOpenSignal.set(true);
    this.searchAndPageableShipperOfWarehouse();
  }
  closeChoosingShipperModal() {
    // this.selectedShipment = undefined;
    this.isChoosingShipperModalOpenSignal.set(false);
    this.selectedShipperIdSignal.set(undefined);
  }
  selectShipperRow(shipperId: string): void {
    this.selectedShipperIdSignal.set(shipperId);
  }

  searchChoosingShipper(even: any) {
    // Avoid refreshing the page
    even.preventDefault();
    const userName = this.searchChoosingShipperForm.get("searchedUsername")?.value?.trim();
    this.shipperPageRequest.search = userName;
    this.shipperPageRequest.page = 0;
    this.searchAndPageableShipperOfWarehouse();
  }

  previousChoosingShipperPage() {
    this.shipperPageRequest.page = this.shipperPageRequest.page! - 1;
    this.searchAndPageableShipperOfWarehouse();
  }

  nextChoosingShipperPage() {
    this.shipperPageRequest.page = this.shipperPageRequest.page! + 1;
    this.searchAndPageableShipperOfWarehouse();
  }

  searchAndPageableShipperOfWarehouse() {
    if (!this.warehouseId) {
      this.toastFail("Không thể tìm thấy nhà kho nào!")
    }
    let warehouseIdLong = Number(this.warehouseId);

    this.adminService.searchAndPageableShipperByWarehouseId(warehouseIdLong, this.shipperPageRequest).subscribe({
      next: (data: PaginatedResponse<UserProfile>) => {
        this.paginatedShipperSignal.set(data);
      },
      error: (error) => {
        this.toastFail("Không tìm thấy người vận chuyển nào của kho này!");
      },
    });
  }


  // *********** Choose Transporter model ***************

  openChoosingTransporterModal() {
    this.isChoosingTransporterModalOpenSignal.set(true);
    this.searchAndPageableTranspoter();
  }
  closeChoosingTransporterModal() {
    // this.selectedShipment = undefined;
    this.isChoosingTransporterModalOpenSignal.set(false);
    this.selectedTransporterIdSignal.set(undefined);
  }
  selectTransporterRow(transporterId: string): void {
    this.selectedTransporterIdSignal.set(transporterId);
  }

  searchChoosingTransporter(even: any) {
    // Avoid refreshing the page
    even.preventDefault();
    const userName = this.searchChoosingTransporterForm.get("searchedUsername")?.value?.trim();
    this.transporterPageRequest.search = userName;
    this.transporterPageRequest.page = 0;
    this.searchAndPageableTranspoter();
  }

  previousChoosingTransporterPage() {
    this.transporterPageRequest.page = this.transporterPageRequest.page! - 1;
    this.searchAndPageableTranspoter();
  }

  nextChoosingTransporterPage() {
    this.transporterPageRequest.page = this.transporterPageRequest.page! + 1;
    this.searchAndPageableTranspoter();
  }

  searchAndPageableTranspoter() {
    if (!this.warehouseId) {
      this.toastFail("Không thể tìm thấy nhà kho nào!")
    }
    let warehouseIdLong = Number(this.warehouseId);

    this.adminService.searchAndPageableTranspoter(this.shipperPageRequest).subscribe({
      next: (data: PaginatedResponse<UserProfile>) => {
        this.paginatedTransporterSignal.set(data);
      },
      error: (error) => {
        this.toastFail("Không tìm thấy tài xế xe tải đường dài nào!");
      },
    });
  }

  shubmitChoosingTranspoterModal() {
    if (!this.selectedShipment || !this.selectedTransporterIdSignal()) {
      return;
    }
    if (this.activeTabItem === '3') {
      this.ShipmentService.transitShipment(this.selectedShipment?.id.toString(), this.selectedTransporterIdSignal() || '').subscribe({
        next: (data) => {
          this.toastSuccess("Thành công!");
          this.searchAndPageableShipment();
        },
        error: (error) => {
          this.toastFail("Có lỗi sảy ra khi chọn shipper này!");
        },
      });
    }
    this.selectedShipment = undefined;
    this.closeChoosingTransporterModal();
    this.closeShipmentInforModal();
  }

  // ****************** TRANSIT *****************************
  confirmToTransit() {
    if (!this.selectedShipment) {
      this.toastWarning("Hãy chọn 1 đơn hàng trước!");
    }
    this.openChoosingTransporterModal();
  }

  // ****************** PICK UP / DELIVERY **********************
  confirmToPickUp() {
    if (!this.selectedShipment) {
      this.toastWarning("Hãy chọn 1 đơn hàng trước!");
    }
    this.openChoosingShipperModal();
  }

  shubmitChoosingShipperModal() {
    if (!this.selectedShipment || !this.selectedShipperIdSignal()) {
      return;
    }
    if (this.activeTabItem === '1' || this.activeTabItem === '3' || this.activeTabItem === '4') {
      this.ShipmentService.deliveryShipment(this.selectedShipment?.id.toString(), this.selectedShipperIdSignal() || '').subscribe({
        next: (data) => {
          this.toastSuccess("Thành công!");
          this.searchAndPageableShipment();
        },
        error: (error) => {
          this.toastFail("Có lỗi sảy ra khi chọn shipper này!");
        },
      });
    }
    this.selectedShipment = undefined;
    this.closeChoosingShipperModal();
    this.closeShipmentInforModal();
  }

  // ********************************************

  navigateWithQuery(tab: string): void {
    this.activeTabItem = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge', // Giữ lại các query param khác
    });
    this.pageRequest.page = 0; // Reset to the first page
    this.initShipmentMenuItems();
    this.searchAndPageableShipment();
  }

  setUpTab(data?: CountShipment) {
    this.items = [
      {
        id: '1',
        label: 'Chờ xác nhận',
        command: () => {
          this.navigateWithQuery('1');
        },
        badge: data?.ORDER_RECEIVED.toString()
      },
      {
        id: '2',
        label: 'Đang lấy hàng',
        command: () => {
          this.navigateWithQuery('2')
        },
        badge: ((data?.PICKUP_SCHEDULED || 0) + (data?.OUT_FOR_PICKUP || 0)).toString()
      },
      {
        id: '3',
        label: 'Đã lấy hàng',
        command: () => {
          this.navigateWithQuery('3')
        },
        badge: ((data?.PICKED_UP || 0)).toString()
      },
      {
        id: '4',
        label: 'Được chuyển tiếp',
        command: () => {
          this.navigateWithQuery('4')
        },
        badge: ((data?.IN_TRANSIT || 0) + (data?.TRANSITED || 0)).toString()
      },
      {
        id: '5',
        label: 'Đang giao hàng',
        command: () => {
          this.navigateWithQuery('5')
        },
        badge: data?.OUT_FOR_DELIVERY.toString()
      },
      {
        id: '6',
        label: 'Hoàn thành',
        command: () => {
          this.navigateWithQuery('6')
        },
        badge: data?.DELIVERED.toString()
      },
      // {
      //   id: '7',
      //   label: 'Đã hủy',
      //   command: () => {
      //     this.navigateWithQuery('7')
      //   },
      //   badge: data?.CANCELED.toString()
      // },
      // {
      //   id: '8',
      //   label: 'Trả hàng',
      //   command: () => {
      //     this.navigateWithQuery('8')
      //   },
      //   badge: ((data?.RETURNED || 0) + (data?.DELIVERED_FAILED || 0)).toString()
      // },

    ];
    this.activeTabItem = this.items[0].id;
  }


  previousPage() {
    this.pageRequest.page = this.pageRequest.page! - 1;
    this.searchAndPageableShipment();
  }

  nextPage() {
    this.pageRequest.page = this.pageRequest.page! + 1;
    this.searchAndPageableShipment();
  }
  searchAndPageableShipment() {
    let statuses = '';
    if (this.activeTabItem === '1') {
      statuses = SHIPMENT_STATUS.ORDER_RECEIVED;
    } else if (this.activeTabItem === '2') {
      statuses = SHIPMENT_STATUS.PICKUP_SCHEDULED + ', ' + SHIPMENT_STATUS.OUT_FOR_PICKUP;
    } else if (this.activeTabItem === '3') {
      statuses = SHIPMENT_STATUS.PICKED_UP;
    } else if (this.activeTabItem === '4') {
      statuses = SHIPMENT_STATUS.IN_TRANSIT + ', ' + SHIPMENT_STATUS.TRANSITED;
    } else if (this.activeTabItem === '5') {
      statuses = SHIPMENT_STATUS.OUT_FOR_DELIVERY;
    } else if (this.activeTabItem === '6') {
      statuses = SHIPMENT_STATUS.DELIVERED;
    } else if (this.activeTabItem === '7') {
      statuses = SHIPMENT_STATUS.CANCELED;
    } else {
      statuses = SHIPMENT_STATUS.RETURNED + ', ' + SHIPMENT_STATUS.DELIVERED_FAILED;
    }

    if (this.activeTabItem === '6') {
      this.warehouseService.getAllShipmentOfBothWarehouses(this.pageRequest, statuses).subscribe({
        next: (data: PaginatedResponse<Shipment>) => {
          this.paginatedShipmentSignal.set(data);
        },
        error: (error) => {
          this.toastFail("Can not load data. Please try again!");
        },
      });
    } else {
      let isOriginWareHouse = !['4', '5'].includes(this.activeTabItem || '0');
      this.warehouseService.getAllShipmentOfWarehouse(isOriginWareHouse, this.pageRequest, statuses).subscribe({
        next: (data: PaginatedResponse<Shipment>) => {
          this.paginatedShipmentSignal.set(data);
        },
        error: (error) => {
          this.toastFail("Can not load data. Please try again!");
        },
      });
    }
  }

  // ************  Shipment information model ********************************

  openShipmentInforModal(shipment: Shipment) {
    this.selectedShipment = shipment;
    this.isShipmentInforOpenSignal.set(true);
  }

  closeShipmentInforModal() {
    this.isShipmentInforOpenSignal.set(false);
  }

  // ************ 
  toggleShipmentMenu(event: MouseEvent, shipment: Shipment) {
    event.stopPropagation();
    this.selectedShipment = shipment;
    this.shipmentMenu.toggle(event); // Hiển thị dropdown
    this.initShipmentMenuItems();
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
