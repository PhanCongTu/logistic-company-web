import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { TabMenuModule } from 'primeng/tabmenu';
import { BadgeModule } from 'primeng/badge';
import { Shipment } from '../../../shared/models/responses/shipment.model';
import { PaginatedResponse } from '../../../shared/models/responses/paginated-response.model';
import { PageRequest } from '../../../shared/models/requests/page-request.model';
import { UserService } from '../../../core/services/user.service';
import { Menu, MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { CountShipment } from '../../../shared/models/responses/count-shipment.model';
import { SHIPMENT_STATUS } from '../../../shared/constants/app-constants.constant';
import { DialogModule } from 'primeng/dialog';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CoordinatesWithAddress } from '../../../shared/models/common/coordinates.model';
import { UpdateShipmentRequest } from '../../../shared/models/requests/update-shipment-request.model';
import { MapComponent } from '../../../shared/components/map/map.component';
import { ROUTES } from '../../../app.routes';
import { CreateShipmentRequest } from '../../../shared/models/requests/create-shipment-request.model';

@Component({
  selector: 'app-user-shipment',
  standalone: true,
  imports: [
    CommonModule,
    TabMenuModule,
    BadgeModule,
    MenuModule,
    ToastModule,
    DialogModule,
    ReactiveFormsModule,
    MapComponent,
    RouterLink
  ],
  providers: [MessageService],
  templateUrl: './user-shipment.component.html',
  styleUrl: './user-shipment.component.scss'
})
export class UserShipmentComponent {
  readonly appRoutes = ROUTES;

  items: MenuItem[] | undefined;
  activeTabItem: string | undefined;
  selectedShipment: Shipment | undefined;
  countShipment: CountShipment | undefined;
  shipmentItems: MenuItem[] | undefined;

  upsertShipmentForm: FormGroup;

  paginatedShipmentSignal: WritableSignal<PaginatedResponse<Shipment> | undefined> = signal(undefined);
  isUpdateShipmentModalOpenSignal: WritableSignal<boolean> = signal(false);
  isCreateShipmentModalOpenSignal: WritableSignal<boolean> = signal(false);
  isLocationWarningModalOpenSignal: WritableSignal<boolean> = signal(false);
  locationWarningModalOpenSignal: WritableSignal<string | undefined> = signal(undefined);
  isShipmentInforOpenSignal: WritableSignal<boolean> = signal(false);

  // Create shipment
  isChoosingPickUpAddress = false
  isChoosingRecipientAddress = false
  // Update shipment
  isMapVisibleSignal: WritableSignal<boolean> = signal(false);
  recipientCoordinatesWithAddressSignal: WritableSignal<CoordinatesWithAddress | undefined> = signal(undefined);
  pickUpCoordinatesWithAddressSignal: WritableSignal<CoordinatesWithAddress | undefined> = signal(undefined);
  isRequiredChooseRecipientAddressSignal: WritableSignal<boolean> = signal(false);
  isRequiredChoosePickUpAddressSignal: WritableSignal<boolean> = signal(false);
  isUpdatingPickUpAddress = false
  isUpdatingRecipientAddress = false
  // ******************

  pageRequest: PageRequest = {
    page: 0,
    search: ''
  };
  searchForm: FormGroup;


  @ViewChild('shipmentMenu') shipmentMenu!: Menu;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private messageService: MessageService,
  ) {
    this.setUpTab();
    this.searchAndPageableShipment();


    this.searchForm = this.formBuilder.group({
      searchedShipment: ['']
    });

    this.upsertShipmentForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      recipientAddress: ['', [Validators.required]],
      recipientAdditionalAddress: [''],
      pickUpAddress: ['', [Validators.required]],
      pickUpAdditionalAddress: [''],
      recipientPhone: ['', [Validators.required]],
      recipientName: ['', [Validators.required]],
      notes: ['']
    });
  }
  ngOnInit() {
    this.shipmentItems = [
      {
        label: 'Cập nhật đơn hàng', icon: 'fa-solid fa-pen',
        command: () => {
          this.openUpdateShipmentModal();
        }
      }
    ];
  }

  searchUser(even: any) {
    // Avoid refreshing the page
    even.preventDefault();

    const trackingNumber = this.searchForm.get("searchedShipment")?.value?.trim();

    this.pageRequest.search = trackingNumber;
    this.pageRequest.page = 0;
    this.searchAndPageableShipment();
  }

  // *********
  closeLocationWarningModal() {
    this.isLocationWarningModalOpenSignal.set(false);
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

  // *********** Create new shipment
  openCreatShipmentModal() {
    this.upsertShipmentForm.reset();
    this.isCreateShipmentModalOpenSignal.set(true);
  }

  closeCreatShipmentModal() {
    this.upsertShipmentForm.reset();
    this.isCreateShipmentModalOpenSignal.set(false);
  }

  openChoosePickUpAddressModal() {
    this.isChoosingPickUpAddress = true;
    this.isChoosingRecipientAddress = false;
    this.isMapVisibleSignal.set(true);
    this.isCreateShipmentModalOpenSignal.set(false);
  }

  openChooseRecipientAddressModal() {
    this.isChoosingPickUpAddress = false;
    this.isChoosingRecipientAddress = true;
    this.isMapVisibleSignal.set(true);
    this.isCreateShipmentModalOpenSignal.set(false);
  }

  submitCreateShipmentModal(even: any) {
    // Avoid refreshing the page
    even.preventDefault();

    if (!this.pickUpCoordinatesWithAddressSignal() || !this.recipientCoordinatesWithAddressSignal()) {
      this.toastWarning("Hãy chọn 1 đơn hàng!");
      this.closeUpdateShipmentModal();
      return;
    }

    if (this.upsertShipmentForm.valid) {
      const createShipmentBody: CreateShipmentRequest = {
        name: this.upsertShipmentForm.get("name")?.value,
        pickUpAddress: this.upsertShipmentForm.get("pickUpAdditionalAddress")?.value.trim() + " " + this.pickUpCoordinatesWithAddressSignal()?.address || '',
        pickUpLatitude: this.pickUpCoordinatesWithAddressSignal()?.lat || 0,
        pickUpLongitude: this.pickUpCoordinatesWithAddressSignal()?.lng || 0,
        recipientAddress: this.upsertShipmentForm.get("recipientAdditionalAddress")?.value.trim() + " " + this.recipientCoordinatesWithAddressSignal()?.address || '',
        recipientLatitude: this.recipientCoordinatesWithAddressSignal()?.lat || 0,
        recipientLongitude: this.recipientCoordinatesWithAddressSignal()?.lng || 0,
        recipientPhone: this.upsertShipmentForm.get("recipientPhone")?.value,
        recipientName: this.upsertShipmentForm.get("recipientName")?.value,
        notes: this.upsertShipmentForm.get("notes")?.value,
      }

      this.userService.createShipment(createShipmentBody).subscribe({
        next: (data) => {
          this.toastSuccess('Tạo đơn hàng thành công!');
          this.searchAndPageableShipment();
        },
        error: (error) => {

          if (error?.error?.errorCode === 'NOT_SUPPORTED') {
            this.isLocationWarningModalOpenSignal.set(true)
            if (error?.error?.key === 'PICK_UP') {
              this.locationWarningModalOpenSignal.set('PICK_UP');
            }
            if (error?.error?.key === 'RECIPIENT') {
              this.locationWarningModalOpenSignal.set('RECIPIENT');
            }
          }
          this.toastFail('Tạo đơn hàng thất bại!');

        }
      });
      this.pickUpCoordinatesWithAddressSignal.set(undefined);
      this.recipientCoordinatesWithAddressSignal.set(undefined);

      this.upsertShipmentForm.reset();
      this.closeCreatShipmentModal();
    }

  }


  // ********** Update shipment

  openUpdateShipmentModal() {
    if (this.selectedShipment?.status !== SHIPMENT_STATUS.ORDER_RECEIVED) {
      this.toastWarning("This shipment cannot be updated anymore!")
      return;
    }
    this.upsertShipmentForm.setValue({
      name: this.selectedShipment?.name,
      recipientAddress: this.selectedShipment?.recipientAddress,
      recipientAdditionalAddress: '',
      pickUpAddress: this.selectedShipment?.pickUpAddress,
      pickUpAdditionalAddress: '',
      recipientPhone: this.selectedShipment?.recipientPhone,
      recipientName: this.selectedShipment?.recipientName,
      notes: this.selectedShipment?.notes
    })
    this.isUpdateShipmentModalOpenSignal.set(true);
  }

  submitUpdateShipmentModal(even: any) {
    // Avoid refreshing the page
    even.preventDefault();

    if (!this.selectedShipment) {
      this.toastWarning("Hãy chọn 1 đơn hàng!");
      this.closeUpdateShipmentModal();
      return;
    }
    if (this.upsertShipmentForm.valid) {
      const updateShipmentBody: UpdateShipmentRequest = {
        name: this.upsertShipmentForm.get("name")?.value,
        recipientPhone: this.upsertShipmentForm.get("recipientPhone")?.value,
        recipientName: this.upsertShipmentForm.get("recipientName")?.value,
        notes: this.upsertShipmentForm.get("notes")?.value,
      }
      if (this.pickUpCoordinatesWithAddressSignal()) {
        updateShipmentBody.pickUpAddress = this.pickUpCoordinatesWithAddressSignal()?.address,
          updateShipmentBody.pickUpLatitude = this.pickUpCoordinatesWithAddressSignal()?.lat,
          updateShipmentBody.pickUpLongitude = this.pickUpCoordinatesWithAddressSignal()?.lng
      }
      if (this.recipientCoordinatesWithAddressSignal()) {
        updateShipmentBody.recipientAddress = this.recipientCoordinatesWithAddressSignal()?.address,
          updateShipmentBody.recipientLatitude = this.recipientCoordinatesWithAddressSignal()?.lat,
          updateShipmentBody.recipientLongitude = this.recipientCoordinatesWithAddressSignal()?.lng
      }
      this.userService.updateShipment(updateShipmentBody, this.selectedShipment?.id).subscribe({
        next: (data) => {
          this.toastSuccess('Cập nhật đơn hàng thành công!');
          this.searchAndPageableShipment();
        },
        error: (error) => {
          this.toastFail('Cập nhật đơn hàng thất bại!');
        }
      });
      this.pickUpCoordinatesWithAddressSignal.set(undefined);
      this.recipientCoordinatesWithAddressSignal.set(undefined);
      this.selectedShipment = undefined;
      this.upsertShipmentForm.reset();
      this.closeUpdateShipmentModal();
    }
  }
  closeUpdateShipmentModal() {
    this.isUpdateShipmentModalOpenSignal.set(false);
  }

  openChangePickUpAddressModal() {
    this.isUpdatingPickUpAddress = true;
    this.isUpdatingRecipientAddress = false;
    this.isMapVisibleSignal.set(true);
    this.isUpdateShipmentModalOpenSignal.set(false);
  }

  openRecipientAddressUpAddressModal() {
    this.isUpdatingPickUpAddress = false;
    this.isUpdatingRecipientAddress = true;
    this.isMapVisibleSignal.set(true);
    this.isUpdateShipmentModalOpenSignal.set(false);
  }

  receivedMapData(data: CoordinatesWithAddress | boolean) {
    if (typeof data !== 'boolean') {
      if (this.isUpdatingPickUpAddress || this.isChoosingPickUpAddress) {
        this.pickUpCoordinatesWithAddressSignal.set(data);
        this.upsertShipmentForm.patchValue({
          pickUpAddress: data.address
        });
      } else {
        this.recipientCoordinatesWithAddressSignal.set(data);
        this.upsertShipmentForm.patchValue({
          recipientAddress: data.address
        });
      }
    }

    this.isMapVisibleSignal.set(false);
    if (this.isUpdatingPickUpAddress || this.isUpdatingRecipientAddress) {
      this.isUpdateShipmentModalOpenSignal.set(true);
      this.isUpdatingPickUpAddress = false;
      this.isUpdatingRecipientAddress = false;
    } else {
      this.isCreateShipmentModalOpenSignal.set(true);
      this.isChoosingPickUpAddress = false;
      this.isChoosingRecipientAddress = false;
    }

  }

  isUpsertShipmentFormFieldValid(field: string) {
    return (!this.upsertShipmentForm.get(field)?.valid && this.upsertShipmentForm.get(field)?.touched);
  }

  // *********

  navigateWithQuery(tab: string): void {
    this.activeTabItem = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge', // Giữ lại các query param khác
    });
    this.pageRequest.page = 0; // Reset to the first page
    this.searchAndPageableShipment();
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
    this.countUserShipments();
    let statuses = '';
    if (this.activeTabItem === '1') {
      statuses = SHIPMENT_STATUS.ORDER_RECEIVED;
    } else if (this.activeTabItem === '2') {
      statuses = SHIPMENT_STATUS.PICKUP_SCHEDULED + ', ' + SHIPMENT_STATUS.OUT_FOR_PICKUP;
    } else if (this.activeTabItem === '3') {
      statuses = SHIPMENT_STATUS.IN_TRANSIT + ', ' + SHIPMENT_STATUS.TRANSITED;
    } else if (this.activeTabItem === '4') {
      statuses = SHIPMENT_STATUS.DELIVERY_SCHEDULED + ', ' + SHIPMENT_STATUS.OUT_FOR_DELIVERY;
    } else if (this.activeTabItem === '5') {
      statuses = SHIPMENT_STATUS.DELIVERED;
    } else if (this.activeTabItem === '6') {
      statuses = SHIPMENT_STATUS.CANCELED;
    } else {
      statuses = SHIPMENT_STATUS.RETURNED + ', ' + SHIPMENT_STATUS.DELIVERED_FAILED;
    }
    this.userService.searchAndPageableShipment(this.pageRequest, statuses).subscribe({
      next: (data: PaginatedResponse<Shipment>) => {
        this.paginatedShipmentSignal.set(data);
      },
      error: (error) => {
        this.toastFail("Can not load data. Please try again!");
      },
    });
  }

  countUserShipments() {
    this.userService.countMyShipments().subscribe({
      next: (data: CountShipment) => {
        this.setUpTab(data);

      },
      error: (error) => {
        this.toastFail("Can not load data. Please try again!");
      },
    });
  }

  setUpTab(data?: CountShipment) {
    this.items = [
      {
        id: '1',
        label: 'Đã đặt',
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
        label: 'Đang vận chuyển',
        command: () => {
          this.navigateWithQuery('3')
        },
        badge: ((data?.IN_TRANSIT || 0) + (data?.TRANSITED || 0)).toString()
      },
      {
        id: '4',
        label: 'Chờ giao hàng',
        command: () => {
          this.navigateWithQuery('4')
        },
        badge: ((data?.DELIVERY_SCHEDULED || 0) + (data?.OUT_FOR_DELIVERY || 0)).toString()
      },
      {
        id: '5',
        label: 'Hoàn thành',
        command: () => {
          this.navigateWithQuery('5')
        },
        badge: data?.DELIVERED.toString()
      },
      // {
      //   id: '6',
      //   label: 'Đã hủy',
      //   command: () => {
      //     this.navigateWithQuery('6')
      //   },
      //   badge: data?.CANCELED.toString()
      // },
      // {
      //   id: '7',
      //   label: 'Trả hàng/hoàn tiền',
      //   command: () => {
      //     this.navigateWithQuery('7')
      //   },
      //   badge: ((data?.RETURNED || 0) + (data?.DELIVERED_FAILED || 0)).toString()
      // },

    ];
    this.activeTabItem = this.activeTabItem || this.items[0].id;
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
