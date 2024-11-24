import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild, WritableSignal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
    ConfirmPopupComponent
  ],
  providers: [MessageService],
  templateUrl: './warehouse.component.html',
  styleUrl: './warehouse.component.scss'
})
export class WarehouseComponent {
  @ViewChild('confirmDeletePopupComponent') confirmDeletePopupComponent!: ConfirmPopupComponent;
  @ViewChild('confirmActivePopupComponent') confirmActivePopupComponent!: ConfirmPopupComponent;

  items: MenuItem[] | undefined;

  // Forms
  addWarehouseForm: FormGroup;
  updateWarehouseForm: FormGroup;

  pageRequest: PageRequest = {
    page: 0,
    search: ''
  };

  selectedWarehouseId: number | undefined;
  selectedWarehouseSignal: WritableSignal<Warehouse | undefined> = signal(undefined);

  isAddWarehouseModalOpenSignal: WritableSignal<boolean> = signal(false);
  isUpdateWarehouseModalOpenSignal: WritableSignal<boolean> = signal(false);
  isMapVisibleSignal: WritableSignal<boolean> = signal(false);
  isRequiredChooseLocaltionSignal: WritableSignal<boolean> = signal(false);
  userCoordinatesWithAddressSignal: WritableSignal<CoordinatesWithAddress | undefined> = signal(undefined);
  paginatedWarehouseSignal: WritableSignal<PaginatedResponse<Warehouse> | undefined> = signal(undefined);

  constructor(
    private formBuilder: FormBuilder,
    private adminService: AdminService,
    private messageService: MessageService
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
    this.searchAndPageableWarehouse();
  }

  ngOnInit() {
    this.items = [
      { icon: 'pi pi-home', route: '/' },
      { label: 'Manage' },
      { label: 'Warehouse', route: '/admin/warehouse' },
    ];

  }

  // ********** Get Warehouses ****************

  previousPage() {
    this.pageRequest.page = this.pageRequest.page! - 1;
    this.searchAndPageableWarehouse();
  }

  nextPage() {
    this.pageRequest.page = this.pageRequest.page! + 1;
    this.searchAndPageableWarehouse();
  }

  searchAndPageableWarehouse() {
    this.adminService.searchAndPageableWarehouse(this.pageRequest).subscribe({
      next: (data: PaginatedResponse<Warehouse>) => {
        this.paginatedWarehouseSignal.set(data);
      },
      error: (error) => {
        this.toastFail("Can not load data. Please try again!");
      },
    });
  }

  // ********** Active/Deactive Warehouses ****************
  openDeletePopup(warehouseId?: number) {
    this.selectedWarehouseId = warehouseId;
    this.confirmDeletePopupComponent.show();
  }

  handleDelete(confirm: boolean) {
    if (confirm && this.selectedWarehouseId) {
      this.adminService.deleteWarehouse(this.selectedWarehouseId).subscribe({
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

  handleActive(confirm: boolean) {
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
}
