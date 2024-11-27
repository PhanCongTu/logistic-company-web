import { CommonModule } from '@angular/common';
import { Component, signal, ViewChild, WritableSignal } from '@angular/core';
import { MenuItem, MessageService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { PaginatedResponse } from '../../../shared/models/responses/paginated-response.model';
import { UserProfile } from '../../../shared/models/responses/user-profile.model';
import { AdminService } from '../../../core/services/admin.service';
import { PageRequest } from '../../../shared/models/requests/page-request.model';
import { ToastModule } from 'primeng/toast';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ROLES } from '../../../shared/constants/app-constants.constant';
import { Menu } from 'primeng/menu';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { DragDropModule } from 'primeng/dragdrop';
@Component({
  selector: 'app-user',
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
    DragDropModule
  ],
  providers: [MessageService],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {
  items: MenuItem[] | undefined;

  pageRequest: PageRequest = {
    page: 0,
    search: ''
  };
  dropDownItems: any
  roles: any[];
  selectedRole: any;
  selectedUserProfile: UserProfile | undefined;
  searchForm: FormGroup;
  searchedUsername = new FormControl('');
  userItems: MenuItem[] | undefined;

  // Add roles
  availableRoles: string[] = [];
  selectedRoles: string[] = [];
  draggedRole: any | undefined | null;

  paginatedUserProfileSignal: WritableSignal<PaginatedResponse<UserProfile> | undefined> = signal(undefined);

  isUpdateUserRolesSignal: WritableSignal<boolean> = signal(false);

  @ViewChild('userMenu') userMenu!: Menu;

  ngOnInit() {
    this.items = [
      { icon: 'pi pi-home', route: '/' },
      { label: 'Manage' },
      { label: 'Users', route: '/admin/user' },
    ];

  }



  constructor(
    private adminService: AdminService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
  ) {
    this.searchAndPageableUserProfile();
    this.searchForm = this.formBuilder.group({
      searchedUsername: ['']
    });

    this.roles = Object.entries(ROLES).map(([key, value]) => ({ name: key, code: value }));

    this.selectedRole = undefined;
    this.userItems = [
      {
        label: 'Add/remove roles', icon: 'fa-solid fa-plus-minus', command: () => {
          this.openUpdateUserRolesModal();
        }
      }
    ];
  }

  toggleUserMenu(event: MouseEvent, user: UserProfile) {
    this.selectedUserProfile = user;
    this.userMenu.toggle(event); // Hiển thị dropdown
  }

  // ********* Add user roles ***************

  // ********* Remove user roles ***************
  setUpRolesToRemove() {
    this.selectedRoles = [];
    this.availableRoles = Object.values(ROLES).filter(role => !this.selectedUserProfile?.roles?.includes(role));
    this.selectedUserProfile?.roles?.map(role => {
      this.selectedRoles?.push(role);
    })
  }
  openUpdateUserRolesModal() {
    this.setUpRolesToRemove();
    this.isUpdateUserRolesSignal.set(true);
  }

  closeUpdateUserRolesModal() {
    this.setUpRolesToRemove();
    this.isUpdateUserRolesSignal.set(false);
  }

  submitUpdateUserRolesModal() {

    if (this.selectedUserProfile) {
      this.adminService.updateRolesToUser(this.selectedUserProfile?.userId, this.selectedRoles).subscribe({
        next: (data) => {
          this.searchAndPageableUserProfile();
          this.toastSuccess("Update roles successfully!");
        },
        error: (error) => {
          this.toastFail("Can not Update roles to this user. Please try again!");
        },
      })
    }

    this.closeUpdateUserRolesModal();
  }

  //**************************** */
  dragStart(role: any) {
    this.draggedRole = role;
  }

  dropAdd() {
    if (this.draggedRole && !this.selectedRoles.includes(this.draggedRole)) {
      let newRoles = [...(this.selectedRoles as any[]), this.draggedRole];
      if (newRoles.includes(ROLES.ROLE_WAREHOUSE_MANAGER)
        && newRoles.includes(ROLES.ROLE_SHIPPER)) {
        this.toastWarning("Không thể có cả ROLE_WAREHOUSE_MANAGER và ROLE_SHIPPER");
        return;
      }
      this.selectedRoles = newRoles;
      this.availableRoles = this.availableRoles?.filter((val) => val != this.draggedRole);
      this.draggedRole = null;
    }
  }

  dropRemove() {
    if (this.selectedRoles?.filter((val) => val != this.draggedRole).length === 0) {
      this.toastFail("The user must have at least one role!")
      return;
    }
    if (this.draggedRole && !this.availableRoles.includes(this.draggedRole)) {
      this.availableRoles = [...(this.availableRoles as any[]), this.draggedRole];
      this.selectedRoles = this.selectedRoles?.filter((val) => val != this.draggedRole);
      this.draggedRole = null;
    }
  }

  dragEnd() {
    this.draggedRole = null;
  }

  // ****************************************

  onValueChange(event: any) {
    this.searchAndPageableUserProfile();
  }

  previousPage() {
    this.pageRequest.page = this.pageRequest.page! - 1;
    this.searchAndPageableUserProfile();
  }

  nextPage() {
    this.pageRequest.page = this.pageRequest.page! + 1;
    this.searchAndPageableUserProfile();
  }
  searchAndPageableUserProfile() {
    this.adminService.searchAndPageableUserProfile(this.pageRequest, this.selectedRole?.code).subscribe({
      next: (data: PaginatedResponse<UserProfile>) => {
        this.paginatedUserProfileSignal.set(data);
      },
      error: (error) => {
        this.toastFail("Can not load data. Please try again!");
      },
    });
  }

  searchUser(even: any) {
    // Avoid refreshing the page
    even.preventDefault();

    const userName = this.searchedUsername?.value?.trim();
    this.pageRequest.search = userName;
    this.pageRequest.page = 0;
    this.searchAndPageableUserProfile();
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
