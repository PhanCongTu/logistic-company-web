import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
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
import { SHIPMENT_STATUS } from '../../../shared/constants/app-constants.constant';
import { PaginatedResponse } from '../../../shared/models/responses/paginated-response.model';
import { Shipment } from '../../../shared/models/responses/shipment.model';
import { WarehouseService } from '../../../core/services/warehouse.service';

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
    RouterLink
  ],
  providers: [MessageService],
  templateUrl: './manage-shipment.component.html',
  styleUrl: './manage-shipment.component.scss'
})
export class ManageShipmentComponent {

  items: MenuItem[] | undefined;
  activeTabItem: string | undefined;
  selectedShipment: Shipment | undefined;
  countShipment: CountShipment | undefined;
  shipmentMenuItems: MenuItem[] | undefined;

  pageRequest: PageRequest = {
    page: 0,
    search: ''
  };

  searchForm: FormGroup;

  paginatedShipmentSignal: WritableSignal<PaginatedResponse<Shipment> | undefined> = signal(undefined);
  isOriginWareHouseSignal: WritableSignal<Boolean> = signal(true);
  isShipmentInforOpenSignal: WritableSignal<boolean> = signal(false);

  @ViewChild('shipmentMenu') shipmentMenu!: Menu;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private warehouseService: WarehouseService,
    private messageService: MessageService,
  ) {
    this.setUpTab();
    this.searchAndPageableShipment();
    this.searchForm = this.formBuilder.group({
      searchedShipment: ['']
    });
  }

  ngOnInit() {
    this.initShipmentMenuItems();
  }

  initShipmentMenuItems() {
    this.shipmentMenuItems = [
      {
        label: 'Chờ xác nhận', icon: 'fa-solid fa-pen',
        visible: this.activeTabItem === '1',
        command: () => {

        }
      }
    ];
  }

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
        label: 'Chuyển tiếp',
        command: () => {
          this.navigateWithQuery('4')
        },
        badge: ((data?.IN_TRANSIT || 0)).toString()
      },
      {
        id: '5',
        label: 'Tiếp nhận',
        command: () => {
          this.navigateWithQuery('5')
        },
        badge: ((data?.TRANSITED || 0)).toString()
      },
      {
        id: '6',
        label: 'Đang giao hàng',
        command: () => {
          this.navigateWithQuery('6')
        },
        badge: data?.OUT_FOR_DELIVERY.toString()
      },
      {
        id: '7',
        label: 'Hoàn thành',
        command: () => {
          this.navigateWithQuery('7')
        },
        badge: data?.DELIVERED.toString()
      },
      {
        id: '8',
        label: 'Đã hủy',
        command: () => {
          this.navigateWithQuery('8')
        },
        badge: data?.CANCELED.toString()
      },
      {
        id: '9',
        label: 'Trả hàng/hoàn tiền',
        command: () => {
          this.navigateWithQuery('9')
        },
        badge: ((data?.RETURNED || 0) + (data?.DELIVERED_FAILED || 0)).toString()
      },

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
      statuses = SHIPMENT_STATUS.IN_TRANSIT + ', ' + SHIPMENT_STATUS.TRANSITED;
    } else if (this.activeTabItem === '4') {
      statuses = SHIPMENT_STATUS.OUT_FOR_DELIVERY;
    } else if (this.activeTabItem === '5') {
      statuses = SHIPMENT_STATUS.DELIVERED;
    } else if (this.activeTabItem === '6') {
      statuses = SHIPMENT_STATUS.CANCELED;
    } else {
      statuses = SHIPMENT_STATUS.RETURNED + ', ' + SHIPMENT_STATUS.DELIVERED_FAILED;
    }
    this.warehouseService.getAllShipmentOfWarehouse(this.isOriginWareHouseSignal(), this.pageRequest, statuses).subscribe({
      next: (data: PaginatedResponse<Shipment>) => {
        this.paginatedShipmentSignal.set(data);

      },
      error: (error) => {
        this.toastFail("Can not load data. Please try again!");
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
