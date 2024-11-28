import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { DialogModule } from 'primeng/dialog';
import { CoordinatesWithAddress } from '../../../shared/models/common/coordinates.model';
import { MapComponent } from "../../../shared/components/map/map.component";
import { AdminService } from '../../../core/services/admin.service';
import { CreateWarehouseRequest } from '../../../shared/models/requests/create-warehouse-request.model';
import { PageRequest } from '../../../shared/models/requests/page-request.model';
import { PaginatedResponse } from '../../../shared/models/responses/paginated-response.model';
import { Warehouse } from '../../../shared/models/responses/warehouse.model';
import { ConfirmPopupComponent } from '../../../shared/components/confirm-popup/confirm-popup.component';
import { ToastModule } from 'primeng/toast';
import { UpdateWarehouseRequest } from '../../../shared/models/requests/update-warehouse-request.model';
import { Menu, MenuModule } from 'primeng/menu';
import { UserProfile } from '../../../shared/models/responses/user-profile.model';
import { ROLES } from '../../../shared/constants/app-constants.constant';
import { RadioButtonModule } from 'primeng/radiobutton';
import { Router } from '@angular/router';

@Component({
  selector: 'app-warehouse',
  standalone: true,
  imports: [
    BreadcrumbModule,
    DialogModule,
    CommonModule,
    ReactiveFormsModule,
    MapComponent,
    ToastModule,
    ConfirmPopupComponent,
    MenuModule,
    RadioButtonModule,
    FormsModule
  ],
  providers: [MessageService],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.scss'
})
export class WarehouseComponent {
  @ViewChild('confirmDeletePopupComponent') confirmDeletePopupComponent!: ConfirmPopupComponent;
  @ViewChild('confirmActivePopupComponent') confirmActivePopupComponent!: ConfirmPopupComponent;

  items: MenuItem[] | undefined;
  warehouseMenuItems: MenuItem[] | undefined;

  // Forms
  addWarehouseForm: FormGroup;
  updateWarehouseForm: FormGroup;
  searchWarehouseManagerForm: FormGroup;
  searchShipperForm: FormGroup;
  searchWarehouseForm: FormGroup;

  warehouseManagerPageRequest: PageRequest = {
    page: 0,
    search: ''
  };

  shipperPageRequest: PageRequest = {
    page: 0,
    search: ''
  };

  wareHousePageRequest: PageRequest = {
    page: 0,
    search: ''
  };

  selectedWarehouse: Warehouse | undefined;

  selectedWarehouseManager: UserProfile | undefined;
  selectedWarehouseManagerIdSignal: WritableSignal<string | undefined> = signal(undefined);
  selectedShipperIdSignal: WritableSignal<string | undefined> = signal(undefined);

  selectedWarehouseId: number | undefined;
  selectedWarehouseSignal: WritableSignal<Warehouse | undefined> = signal(undefined);

  isAddWarehouseModalOpenSignal: WritableSignal<boolean> = signal(false);
  isUpdateWarehouseModalOpenSignal: WritableSignal<boolean> = signal(false);
  isAssignManagerToWarehouseModalOpenSignal: WritableSignal<boolean> = signal(false);
  isAddShipperToWarehouseModalOpenSignal: WritableSignal<boolean> = signal(false);
  isMapVisibleSignal: WritableSignal<boolean> = signal(false);
  isRequiredChooseLocaltionSignal: WritableSignal<boolean> = signal(false);
  userCoordinatesWithAddressSignal: WritableSignal<CoordinatesWithAddress | undefined> = signal(undefined);
  paginatedWarehouseSignal: WritableSignal<PaginatedResponse<Warehouse> | undefined> = signal(undefined);
  paginatedWarehouseManagerSignal: WritableSignal<PaginatedResponse<UserProfile> | undefined> = signal(undefined);
  paginatedAddShipperSignal: WritableSignal<PaginatedResponse<UserProfile> | undefined> = signal(undefined);

  @ViewChild('warehouseMenu') warehouseMenu!: Menu;

  constructor(
    private formBuilder: FormBuilder,
    private adminService: AdminService,
    private messageService: MessageService,
    private router: Router
  ) {
    // Reactive form
    this.addWarehouseForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      additionalAddress: ['']
    });
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
    this.searchWarehouseForm = this.formBuilder.group({
      searchedWarehouseNameOrAddress: ['']
    });
    this.searchAndPageableWarehouse();
  }

  ngOnInit() {
    this.items = [
      { icon: 'pi pi-home', route: '/' },
      { label: 'Manage' },
      { label: 'Warehouse', route: '/admin/warehouse' },
    ];
    this.warehouseMenuItems = [
      {
        label: 'Update warehouse',
        icon: 'fa-solid fa-pen',
        command: () => {
          this.openUpdateWarehouseModal(this.selectedWarehouse?.id);
        }
      },
      {
        label: 'Active',
        icon: 'fa-solid fa-check',
        command: () => {
          this.openActivePopup(this.selectedWarehouse?.id);
        }
      },
      {
        label: 'Deactivate',
        icon: 'fa-regular fa-trash-can',
        command: () => {
          this.openDeletePopup(this.selectedWarehouse?.id);
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


  // ******* Navigate to warehouse information page *******
  goToWarehouseInfoPage(warehouseId?: number) {
    if (warehouseId) {
      this.router.navigate([`/admin/warehouse/${warehouseId}`]);
    }
  }

  toggleWarehouseMenu(event: MouseEvent, warehouse: Warehouse) {
    event.stopPropagation();
    this.selectedWarehouse = warehouse;
    this.warehouseMenu.toggle(event); // Hiển thị dropdown
  }

  // ********** Add a Shipper to Warehouse ****************

  searchAndPageableShipper() {
    this.adminService.searchAndPageableUserProfile(this.shipperPageRequest, ROLES.ROLE_SHIPPER).subscribe({
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
    this.searchAndPageableShipper();
  }

  closeAddShipperToWarehouseModal() {
    this.selectedShipperIdSignal.set(undefined)
    this.isAddShipperToWarehouseModalOpenSignal.set(false);
  }

  selectShipperRow(userId: string): void {
    this.selectedShipperIdSignal.set(userId);
  }
  searchShipper(even: any) {
    // Avoid refreshing the page
    even.preventDefault();

    const userName = this.searchShipperForm.get("searchedUsername")?.value?.trim();
    this.shipperPageRequest.search = userName;
    this.shipperPageRequest.page = 0;
    this.searchAndPageableShipper();
  }

  previousShipperPage() {
    this.shipperPageRequest.page = this.shipperPageRequest.page! - 1;
    this.searchAndPageableShipper();
  }

  nextShipperPage() {
    this.shipperPageRequest.page = this.shipperPageRequest.page! + 1;
    this.searchAndPageableShipper();
  }

  submitAddShipperToWarehouseModal() {
    if (!this.selectedShipperIdSignal()) {
      this.toastWarning("Bạn cần phải chọn 1 shipper trước!");
      return;
    }
    if (!this.selectedWarehouse || !this.selectedShipperIdSignal()) {
      return;
    }
    this.adminService.addShipperToWarehouse(this.selectedWarehouse.id, Number(this.selectedShipperIdSignal())).subscribe({
      next: (data) => {
        this.toastSuccess("Thêm Shipper thành công!");
        this.searchAndPageableShipper();
      },
      error: (error) => {
        if (error?.error?.errorCode === 'NOT_ACCEPTABLE') {
          if (error?.error?.key === 'NOT_REMOVE_TRANSPORTING_SHIPPER') {
            this.toastFail("Hiện người này đang vận chuyển hàng nên không thể đổi qua kho khác!");
          }
        } else {
          this.toastFail("Có lỗi!Vui lòng thử lại sau.");
        }
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
    this.selectedWarehouse = undefined;
    this.isAssignManagerToWarehouseModalOpenSignal.set(false);
  }

  selectWarehouseManagerRow(userId: string): void {

    this.selectedWarehouseManagerIdSignal.set(userId);
  }

  submitAssignManagerToWarehouseModal() {
    if (!this.selectedWarehouseManagerIdSignal()) {
      this.toastWarning("You must select a warehouse manager first!");
      return;
    }
    if (!this.selectedWarehouse || !this.selectedWarehouseManagerIdSignal()) {
      return;
    }
    this.adminService.assignWarehouseToManager(this.selectedWarehouse.id, Number(this.selectedWarehouseManagerIdSignal())).subscribe({
      next: (data) => {
        this.toastSuccess("Assign to the selected warehouse manager successfully!");
        this.searchAndPageableWarehouseManager();
      },
      error: (error) => {
        this.toastFail("Can not load data. Please try again!");
      },
    });
    this.closeAssignManagerToWarehouseModal();
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
  searchWarehouse(even: any) {
    // Avoid refreshing the page
    even.preventDefault();
    const nameOrAddress = this.searchWarehouseForm.get("searchedWarehouseNameOrAddress")?.value?.trim();
    this.wareHousePageRequest.search = nameOrAddress;
    this.wareHousePageRequest.page = 0;
    this.searchAndPageableWarehouse();
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

  // ********** Get Warehouses ****************

  searchAndPageableWarehouse() {
    this.adminService.searchAndPageableWarehouse(this.wareHousePageRequest).subscribe({
      next: (data: PaginatedResponse<Warehouse>) => {
        this.paginatedWarehouseSignal.set(data);
      },
      error: (error) => {
        this.toastFail("Can not load data. Please try again!");
      },
    });
  }

  previousWarehousePage() {
    this.wareHousePageRequest.page = this.wareHousePageRequest.page! - 1;
    this.searchAndPageableWarehouse();
  }

  nextWarehousePage() {
    this.wareHousePageRequest.page = this.wareHousePageRequest.page! + 1;
    this.searchAndPageableWarehouse();
  }

  // ********** Active/Deactive Warehouses ****************
  openDeletePopup(warehouseId?: number) {
    this.selectedWarehouseId = warehouseId;
    this.confirmDeletePopupComponent.show();
  }

  handleDeactivateWarehouse(confirm: boolean) {
    if (confirm && this.selectedWarehouseId) {
      this.adminService.deactivateWarehouse(this.selectedWarehouseId).subscribe({
        next: (data) => {
          this.toastSuccess("Delete warehouse successfully!");
          this.searchAndPageableWarehouse();
        },
        error: (error) => {
          this.toastFail("Something went wrong! Please try again!");
        },
      });
    }
    this.selectedWarehouseId = undefined;
  }

  openActivePopup(warehouseId?: number) {
    this.selectedWarehouseId = warehouseId;
    this.confirmActivePopupComponent.show();
  }

  handleActiveWarehouse(confirm: boolean) {
    if (confirm && this.selectedWarehouseId) {
      this.adminService.activeWarehouse(this.selectedWarehouseId).subscribe({
        next: (data) => {
          this.toastSuccess("Active warehouse successfully!");
          this.searchAndPageableWarehouse();
        },
        error: (error) => {
          this.toastFail("Something went wrong! Please try again!");
        },
      });
    }
    this.selectedWarehouseId = undefined;
  }

  // ********** Add Warehouse ****************

  openMapModal() {
    this.isMapVisibleSignal.set(true);
    this.isAddWarehouseModalOpenSignal.set(false);
    this.isUpdateWarehouseModalOpenSignal.set(false);
  }

  receivedMapData(data: CoordinatesWithAddress | boolean) {
    if (typeof data !== 'boolean') {
      this.userCoordinatesWithAddressSignal.set(data);
    }
    this.isMapVisibleSignal.set(false);
    if (this.selectedWarehouseId) {
      // It's updateing
      this.isUpdateWarehouseModalOpenSignal.set(true);
    } else {
      // It's adding
      this.isAddWarehouseModalOpenSignal.set(true);
    }
  }

  openAddWarehouseModal() {
    this.isAddWarehouseModalOpenSignal.set(true);
  }

  closeAddWarehouseModal() {
    this.isAddWarehouseModalOpenSignal.set(false);
    // reset the form
    this.addWarehouseForm.reset();
    // reset to initial state
    this.userCoordinatesWithAddressSignal.set(undefined);
    this.isRequiredChooseLocaltionSignal.set(false);
  }

  submitAddWarehouseModal(even: any) {
    // Avoid refreshing the page
    even.preventDefault();

    if (!this.addWarehouseForm.valid) {
      return;
    }

    if (!this.userCoordinatesWithAddressSignal()) {
      // show error message
      this.isRequiredChooseLocaltionSignal.set(true);
      return;
    }
    this.isRequiredChooseLocaltionSignal.set(false);
    const fullAddress = this.addWarehouseForm?.value?.additionalAddress?.trim() + ' ' + this.userCoordinatesWithAddressSignal()?.address;

    const addWarehouseData: CreateWarehouseRequest = {
      name: this.addWarehouseForm?.value?.name,
      address: fullAddress,
      latitude: Number(this.userCoordinatesWithAddressSignal()?.lat),
      longitude: Number(this.userCoordinatesWithAddressSignal()?.lng)
    }

    this.adminService.createWarehouse(addWarehouseData).subscribe({
      next: (data) => {
        this.searchAndPageableWarehouse();
        this.toastSuccess("Warehouse created successfully!");
      },
      error: (error) => {
        this.toastFail("Something went wrong! Please try again!");
      },
    });
    this.closeAddWarehouseModal();
    this.addWarehouseForm.reset();
  }

  // ********** Update Warehouse ****************

  openUpdateWarehouseModal(warehouseId?: number): void {
    this.selectedWarehouseId = warehouseId;
    this.isUpdateWarehouseModalOpenSignal.set(true);
    this.selectedWarehouseSignal.set(this.paginatedWarehouseSignal()?.content.find(warehouse => warehouse.id === this.selectedWarehouseId));
    this.updateWarehouseForm.setValue({
      name: this.selectedWarehouseSignal()?.name,
      additionalAddress: ""
    })
  }

  closeUpdateWarehouseModal() {
    this.selectedWarehouseId = undefined;
    this.selectedWarehouseSignal.set(undefined);
    this.isUpdateWarehouseModalOpenSignal.set(false);
    // reset the form
    this.addWarehouseForm.reset();
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

    if (this.selectedWarehouseId) {
      this.adminService.pacthUpdateWarehouse(this.selectedWarehouseId, updateWarehouseRequest).subscribe({
        next: (data) => {
          this.searchAndPageableWarehouse();
          this.toastSuccess("Warehouse updated successfully!");
        },
        error: (error) => {
          this.toastFail("Something went wrong! Please try again!");
        },
      });
    }
    //
    this.addWarehouseForm.reset();
    this.closeUpdateWarehouseModal();
  }

  isAddWarehouseFormFieldValid(field: string) {
    return (!this.addWarehouseForm.get(field)?.valid && this.addWarehouseForm.get(field)?.touched);
  }

  isUpdateWarehouseFormFieldValid(field: string) {
    return (!this.updateWarehouseForm.get(field)?.valid && this.updateWarehouseForm.get(field)?.touched);
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
