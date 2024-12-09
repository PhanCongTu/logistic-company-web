import { Component, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { Router } from '@angular/router';
import { DropdownModule } from 'primeng/dropdown';
import { Menu } from 'primeng/menu';
import { MenuModule } from 'primeng/menu';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { User } from '../../models/responses/user.model';

import { ROLES } from '../../constants/app-constants.constant';
import { ROUTES } from '../../../app.routes';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [
        MenubarModule,
        BadgeModule,
        AvatarModule,
        InputTextModule,
        RippleModule,
        CommonModule,
        DropdownModule,
        MenuModule
    ],
    templateUrl: './header.component.html',
    styleUrl: './header.component.scss'
})
export class HeaderComponent {
    readonly routes = ROUTES;

    items: MenuItem[] | undefined;
    avatarItems: MenuItem[] | undefined;
    userInfoSignal: WritableSignal<User | undefined> = signal(undefined);

    @ViewChild('avatarMenu') avatarMenu!: Menu;

    constructor(
        private router: Router,
        private localStorageService: LocalStorageService
    ) {
    }

    ngOnInit() {
        // Get the user information from local storage
        this.localStorageService.userInfo$.subscribe(userInfo => {
            this.userInfoSignal.set(userInfo);
            this.initializeMenuItems();
        });
    }

    get isTransporter(): boolean {
        return this.userInfoSignal()?.roles?.includes(ROLES.ROLE_TRANSPORTER) || false;
    }

    get isShipper(): boolean {
        return this.userInfoSignal()?.roles?.includes(ROLES.ROLE_SHIPPER) || false;
    }

    get isWarehouseManager(): boolean {
        return this.userInfoSignal()?.roles?.includes(ROLES.ROLE_WAREHOUSE_MANAGER) || false;
    }

    get isAdmin(): boolean {
        return this.userInfoSignal()?.roles?.includes(ROLES.ROLE_ADMIN) || false;
    }

    get isUser(): boolean {
        return this.userInfoSignal()?.roles?.includes(ROLES.ROLE_USER) || false;
    }

    initializeMenuItems() {
        this.items = [
            {
                label: 'Trang chủ',
                icon: 'pi pi-home',
                command: () => {
                    this.router.navigate(['/']);
                }
            },
            {
                label: 'Người quản trị',
                visible: this.isAdmin,
                icon: 'fa-solid fa-list-check',
                items: [
                    {
                        label: 'Kho hàng',
                        icon: 'fa-solid fa-warehouse',
                        command: () => this.router.navigate([this.routes.admin.adminWarehouse])
                    },
                    {
                        label: 'Người dùng',
                        icon: 'fa-solid fa-users',
                        command: () => this.router.navigate([this.routes.admin.adminUser])
                    },
                ]
            },
            {
                label: 'Tính năng',
                visible: this.isUser,
                icon: 'fa-regular fa-star',
                items: [
                    {
                        label: 'Đơn hàng của tôi',
                        icon: 'fa-solid fa-truck',
                        command: () => this.router.navigate([this.routes.user.userShipment])

                    },
                ]
            },
            {
                label: 'Người quản lý kho',
                visible: this.isWarehouseManager,
                icon: 'fa-solid fa-list-check',
                items: [
                    {
                        label: 'Thông tin kho',
                        icon: 'fa-solid fa-house',
                        command: () => this.router.navigate([this.routes.warehouseManager.manageWarehouseInfo])
                    },
                    {
                        label: 'Quản lý đơn hàng',
                        icon: 'fa-solid fa-truck',
                        command: () => this.router.navigate([this.routes.warehouseManager.manageShipment])
                    }
                ]
            },
            {
                label: 'Giao hàng',
                visible: this.isShipper,
                icon: 'fa-solid fa-truck',
                items: [
                    {
                        label: 'Quản lý giao hàng',
                        icon: 'fa-solid fa-truck',
                        command: () => this.router.navigate([this.routes.shipper.deliveryShipment])
                    }
                ]
            },
            {
                label: 'Vận chuyển',
                visible: this.isTransporter,
                icon: 'fa-solid fa-truck-moving',
                items: [
                    {
                        label: 'Quản lý vận chuyển',
                        icon: 'fa-solid fa-truck',
                        command: () => this.router.navigate([this.routes.transporter.transportingShipment])
                    }
                ]
            },
        ];

        this.avatarItems = [
            { label: 'Hồ sơ của tôi', icon: 'pi pi-user', command: () => this.goToProfile() },
            {
                label: 'Đăng xuất', icon: 'pi pi-sign-out', command: () => this.logout(),
                styleClass: 'logoutItem'
            }
        ];
    }

    toggleMenu(event: MouseEvent) {
        this.avatarMenu.toggle(event); // Hiển thị dropdown
    }

    goToProfile() {
        this.router.navigate([this.routes.user.userInfo]);
    }

    goToSettings() {
        // Logic to navigate to settings
    }

    logout() {
        this.localStorageService.removeUser();
        this.router.navigate([this.routes.home]);
    }
}
