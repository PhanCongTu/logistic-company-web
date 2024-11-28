import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogModule } from 'primeng/dialog';
import { DragDropModule } from 'primeng/dragdrop';
import { DropdownModule } from 'primeng/dropdown';
import { Menu, MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { PageRequest } from '../../../shared/models/requests/page-request.model';
import { UserProfile } from '../../../shared/models/responses/user-profile.model';
import { AdminService } from '../../../core/services/admin.service';
import { PaginatedResponse } from '../../../shared/models/responses/paginated-response.model';
import { Warehouse } from '../../../shared/models/responses/warehouse.model';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { User } from '../../../shared/models/responses/user.model';
import { ROLES } from '../../../shared/constants/app-constants.constant';
import { CoordinatesWithAddress } from '../../../shared/models/common/coordinates.model';
import { UpdateWarehouseRequest } from '../../../shared/models/requests/update-warehouse-request.model';
import { MapComponent } from '../../../shared/components/map/map.component';
import { ConfirmPopupComponent } from '../../../shared/components/confirm-popup/confirm-popup.component';

@Component({
  selector: 'app-warehouse-infor',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbModule,
    ToastModule,
    ReactiveFormsModule,
    DropdownModule,
    FormsModule,
    MenuModule,
    DialogModule,
    DragDropModule,
    MapComponent,
    ConfirmPopupComponent
  ],
  providers: [MessageService],
  templateUrl: './warehouse-infor.component.html',
  styleUrl: './warehouse-infor.component.scss'
})
export class WarehouseInforComponent {
  warehouseId!: string;

  items: MenuItem[] | undefined;
  warehouseMenuItems: MenuItem[] | undefined;

  // Form
  updateWarehouseForm: FormGroup;
  searchWarehouseManagerForm: FormGroup;

  shipperPageRequest: PageRequest = {
    page: 0,
    search: ''
  };
  addShipperPageRequest: PageRequest = {
    page: 0,
    search: ''
  };

  warehouseManagerPageRequest: PageRequest = {
    page: 0,
    search: ''
  };

  dropDownItems: any
  selectedUserProfile: UserProfile | undefined;
  searchShipperForm: FormGroup;
  searchAddShipperForm: FormGroup;
  userItems: MenuItem[] | undefined;
  paginatedAddShipperSignal: WritableSignal<PaginatedResponse<UserProfile> | undefined> = signal(undefined);
  paginatedShipperSignal: WritableSignal<PaginatedResponse<UserProfile> | undefined> = signal(undefined);
  warehouseInforSignal: WritableSignal<Warehouse | undefined> = signal(undefined);
  paginatedWarehouseManagerSignal: WritableSignal<PaginatedResponse<UserProfile> | undefined> = signal(undefined);

  // Update warehouse
  isUpdateWarehouseModalOpenSignal: WritableSignal<boolean> = signal(false);
  userCoordinatesWithAddressSignal: WritableSignal<CoordinatesWithAddress | undefined> = signal(undefined);
  isRequiredChooseLocaltionSignal: WritableSignal<boolean> = signal(false);
  isMapVisibleSignal: WritableSignal<boolean> = signal(false);
  //
  isAssignManagerToWarehouseModalOpenSignal: WritableSignal<boolean> = signal(false);
  isAddShipperToWarehouseModalOpenSignal: WritableSignal<boolean> = signal(false);
  selectedWarehouseManagerIdSignal: WritableSignal<string | undefined> = signal(undefined);
  //
  selectedShipperIdSignal: WritableSignal<string | undefined> = signal(undefined);

  @ViewChild('userMenu') userMenu!: Menu;
  @ViewChild('warehouseMenu') warehouseMenu!: Menu;
  @ViewChild('confirmDeletePopupComponent') confirmDeletePopupComponent!: ConfirmPopupComponent;
  @ViewChild('confirmActivePopupComponent') confirmActivePopupComponent!: ConfirmPopupComponent;
  ngOnInit() {
    this.items = [
      { icon: 'pi pi-home', route: '/' },
      { label: 'Manage' },
      { label: 'Warehouse', route: '/admin/warehouse' },
      { label: this.warehouseId },
    ];
    this.warehouseMenuItems = [
      {
        label: 'Update warehouse',
        icon: 'fa-solid fa-pen',
        command: () => {
          this.openUpdateWarehouseModal();
        }
      },
      {
        label: 'Active',
        icon: 'fa-solid fa-check',
        command: () => {
          this.openActivePopup();
        }
      },
      {
        label: 'Deactivate',
        icon: 'fa-regular fa-trash-can',
        command: () => {
          this.openDeletePopup();
        }
      },
      {
        label: 'Assign to manager',
        icon: 'fa-solid fa-user-plus',
        command: () => {
          this.openAssignManagerToWarehouseModal();
        }
      },
      {
        label: 'Add a shipper',
        icon: 'fa-solid fa-user-plus',
        command: () => {
          this.openAddShipperToWarehouseModal();
        }
      },

    ];
  }

  constructor(
    private route: ActivatedRoute,
    private adminService: AdminService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private localStorageService: LocalStorageService
  ) {
    this.route.params.subscribe((params) => {
      this.warehouseId = params['warehouseId'];
    });

    this.getWarehouseInformation();
    this.searchAndPageableShipperByWarehouseId();

    this.updateWarehouseForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      additionalAddress: ['']
    });

    this.searchWarehouseManagerForm = this.formBuilder.group({
      searchedUsername: ['']
    });
    this.searchShipperForm = this.formBuilder.group({
      searchedUsername: ['']
    });
    this.searchAddShipperForm = this.formBuilder.group({
      searchedUsername: ['']
    });
    this.userItems = [
      {
        label: 'Xóa', icon: 'fa-solid fa-trash', command: () => {

        }
      }
    ];
  }

  toggleWarehouseMenu(event: MouseEvent) {
    event.stopPropagation();
    this.warehouseMenu.toggle(event); // Hiển thị dropdown
  }

  receivedMapData(data: CoordinatesWithAddress | boolean) {
    if (typeof data !== 'boolean') {
      this.userCoordinatesWithAddressSignal.set(data);
    }
    this.isMapVisibleSignal.set(false);
    this.isUpdateWarehouseModalOpenSignal.set(true);
  }

  // ********** Add a Shipper to Warehouse ****************

  searchAndPageableShipperToAdd() {
    this.adminService.searchAndPageableUserProfile(this.addShipperPageRequest, ROLES.ROLE_SHIPPER).subscribe({
      next: (data: PaginatedResponse<UserProfile>) => {
        this.paginatedAddShipperSignal.set(data);
      },
      error: (error) => {
        this.toastFail("Can not load data. Please try again!");
      },
    });
  }

  openAddShipperToWarehouseModal() {
    this.isAddShipperToWarehouseModalOpenSignal.set(true);
    this.searchAndPageableShipperToAdd();
  }

  closeAddShipperToWarehouseModal() {
    this.selectedShipperIdSignal.set(undefined)
    this.isAddShipperToWarehouseModalOpenSignal.set(false);
  }

  selectShipperRow(userId: string): void {
    this.selectedShipperIdSignal.set(userId);
  }
  searchAddShipper(even: any) {
    // Avoid refreshing the page
    even.preventDefault();

    const userName = this.searchAddShipperForm.get("searchedUsername")?.value?.trim();
    this.addShipperPageRequest.search = userName;
    this.addShipperPageRequest.page = 0;
    this.searchAndPageableShipperToAdd();
  }

  previousAddShipperPage() {
    this.addShipperPageRequest.page = this.addShipperPageRequest.page! - 1;
    this.searchAndPageableShipperToAdd();
  }

  nextAddShipperPage() {
    this.addShipperPageRequest.page = this.addShipperPageRequest.page! + 1;
    this.searchAndPageableShipperToAdd();
  }

  submitAddShipperToWarehouseModal() {
    if (!this.selectedShipperIdSignal()) {
      this.toastWarning("Bạn cần phải chọn 1 shipper trước!");
      return;
    }
    if (!this.warehouseInforSignal() || !this.selectedShipperIdSignal()) {
      return;
    }
    this.adminService.addShipperToWarehouse(Number(this.warehouseId), Number(this.selectedShipperIdSignal())).subscribe({
      next: (data) => {
        this.toastSuccess("Thêm Shipper thành công!");
        this.searchAndPageableShipperByWarehouseId();
      },
      error: (error) => {
        this.toastFail("Có lỗi!Vui lòng thử lại sau.");
      },
    });
    this.closeAddShipperToWarehouseModal();
  }

  // ********** Assign Manager to Warehouse Warehouses ****************
  openAssignManagerToWarehouseModal() {
    this.isAssignManagerToWarehouseModalOpenSignal.set(true);
    this.searchAndPageableWarehouseManager();
  }

  closeAssignManagerToWarehouseModal() {
    this.isAssignManagerToWarehouseModalOpenSignal.set(false);
  }

  selectWarehouseManagerRow(userId: string): void {
    this.selectedWarehouseManagerIdSignal.set(userId);
  }

  searchAndPageableWarehouseManager() {
    this.adminService.searchAndPageableUserProfile(this.warehouseManagerPageRequest, ROLES.ROLE_WAREHOUSE_MANAGER).subscribe({
      next: (data: PaginatedResponse<UserProfile>) => {
        this.paginatedWarehouseManagerSignal.set(data);
      },
      error: (error) => {
        this.toastFail("Can not load data. Please try again!");
      },
    });
  }

  searchWarehouseManager(even: any) {
    // Avoid refreshing the page
    even.preventDefault();

    const userName = this.searchWarehouseManagerForm.get("searchedUsername")?.value?.trim();
    this.warehouseManagerPageRequest.search = userName;
    this.warehouseManagerPageRequest.page = 0;
    this.searchAndPageableWarehouseManager();
  }

  previousUserPage() {
    this.warehouseManagerPageRequest.page = this.warehouseManagerPageRequest.page! - 1;
    this.searchAndPageableWarehouseManager();
  }

  nextUserPage() {
    this.warehouseManagerPageRequest.page = this.warehouseManagerPageRequest.page! + 1;
    this.searchAndPageableWarehouseManager();
  }

  submitAssignManagerToWarehouseModal() {
    if (!this.warehouseInforSignal() || !this.warehouseId) {
      return;
    }
    this.adminService.assignWarehouseToManager(Number(this.warehouseId), Number(this.selectedWarehouseManagerIdSignal())).subscribe({
      next: (data) => {
        this.toastSuccess("Assign to the selected warehouse manager successfully!");
        this.getWarehouseInformation();
      },
      error: (error) => {
        this.toastFail("Can not load data. Please try again!");
      },
    });
    this.closeAssignManagerToWarehouseModal();
  }

  // ********** Active/Deactive Warehouses ****************
  openDeletePopup() {
    this.confirmDeletePopupComponent.show();
  }

  handleDeactivateWarehouse(confirm: boolean) {
    if (confirm && this.warehouseId) {
      this.adminService.deactivateWarehouse(Number(this.warehouseId)).subscribe({
        next: (data) => {
          this.toastSuccess("Delete warehouse successfully!");
          this.getWarehouseInformation();
        },
        error: (error) => {
          this.toastFail("Something went wrong! Please try again!");
        },
      });
    }
  }

  openActivePopup() {
    this.confirmActivePopupComponent.show();
  }

  handleActiveWarehouse(confirm: boolean) {
    if (confirm && this.warehouseId) {
      this.adminService.activeWarehouse(Number(this.warehouseId)).subscribe({
        next: (data) => {
          this.getWarehouseInformation();
          this.toastSuccess("Active warehouse successfully!");
        },
        error: (error) => {
          this.toastFail("Something went wrong! Please try again!");
        },
      });
    }
  }

  // ********** Update Warehouse ****************

  openMapModal() {
    this.isMapVisibleSignal.set(true);
    this.isUpdateWarehouseModalOpenSignal.set(false);
  }

  openUpdateWarehouseModal(): void {
    this.isUpdateWarehouseModalOpenSignal.set(true);
    this.updateWarehouseForm.setValue({
      name: this.warehouseInforSignal()?.name,
      additionalAddress: ""
    })
  }

  closeUpdateWarehouseModal() {
    this.isUpdateWarehouseModalOpenSignal.set(false);
    // reset to initial state
    this.userCoordinatesWithAddressSignal.set(undefined);
    this.isRequiredChooseLocaltionSignal.set(false);
  }

  submitUpdateWarehouseModal(even: any) {
    // Avoid refreshing the page
    even.preventDefault();

    if (!this.updateWarehouseForm.valid) {
      return;
    }

    const updateWarehouseRequest: UpdateWarehouseRequest = {
      name: this.updateWarehouseForm?.value?.name
    }
    if (this.userCoordinatesWithAddressSignal()) {
      updateWarehouseRequest.address = this.updateWarehouseForm?.value?.additionalAddress?.trim() + ' ' + this.userCoordinatesWithAddressSignal()?.address;
      updateWarehouseRequest.longitude = Number(this.userCoordinatesWithAddressSignal()?.lng);
      updateWarehouseRequest.latitude = Number(this.userCoordinatesWithAddressSignal()?.lat);
    }

    if (this.warehouseId) {
      this.adminService.pacthUpdateWarehouse(Number(this.warehouseId), updateWarehouseRequest).subscribe({
        next: (data) => {
          this.getWarehouseInformation();
          this.toastSuccess("Warehouse updated successfully!");
        },
        error: (error) => {
          this.toastFail("Something went wrong! Please try again!");
        },
      });
    }
    //
    this.closeUpdateWarehouseModal();
  }


  isUpdateWarehouseFormFieldValid(field: string) {
    return (!this.updateWarehouseForm.get(field)?.valid && this.updateWarehouseForm.get(field)?.touched);
  }

  // ********* Get all shippers ***************
  searchAndPageableShipperByWarehouseId() {
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

  getWarehouseInformation() {
    this.adminService.getWarehouseInfo(this.warehouseId).subscribe({
      next: (data: Warehouse) => {
        this.warehouseInforSignal.set(data);
      },
      error: (error) => {
        this.toastFail("Không tìm thấy thông tin về kho này!");
      },
    });
  }

  toggleUserMenu(event: MouseEvent, user: UserProfile) {
    this.selectedUserProfile = user;
    this.userMenu.toggle(event); // Hiển thị dropdown
  }

  searchShipper(even: any) {
    // Avoid refreshing the page
    even.preventDefault();

    const userName = this.searchShipperForm.get("searchedUsername")?.value?.trim();
    this.shipperPageRequest.search = userName;
    this.shipperPageRequest.page = 0;
    this.searchAndPageableShipperByWarehouseId();
  }

  previousPage() {
    this.shipperPageRequest.page = this.shipperPageRequest.page! - 1;
  }

  nextPage() {
    this.shipperPageRequest.page = this.shipperPageRequest.page! + 1;
  }

  // ********** Toast Warehouse ****************
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
