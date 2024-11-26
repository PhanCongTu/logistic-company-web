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
import { ROUTES } from '../../../app.routes';
import { ROLES } from '../../constants/app-constants.constant';

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

    get isAdmin(): boolean {
        return this.userInfoSignal()?.roles?.includes(ROLES.ROLE_ADMIN) || false;
    }

    get isUser(): boolean {
        return this.userInfoSignal()?.roles?.includes(ROLES.ROLE_USER) || false;
    }

    initializeMenuItems() {
        this.items = [
            {
                label: 'Home',
                icon: 'pi pi-home',
                command: () => {
                    this.router.navigate(['/']);
                }
            },
            {
                label: 'Manage',
                visible: this.isAdmin,
                icon: 'fa-solid fa-list-check',
                items: [
                    {
                        label: 'Warehouse',
                        icon: 'fa-solid fa-warehouse',
                        command: () => this.router.navigate([this.routes.admin.adminWarehouse])
                    },
                    {
                        label: 'User',
                        icon: 'fa-solid fa-users',
                        command: () => this.router.navigate([this.routes.admin.adminUser])
                    },
                ]
            },
            {
                label: 'Feature',
                visible: this.isUser,
                icon: 'fa-regular fa-star',
                items: [
                    {
                        label: 'My shipment',
                        icon: 'fa-solid fa-truck',
                        command: () => this.router.navigate([this.routes.user.userShipment])

                    },
                ]
            }
        ];

        this.avatarItems = [
            { label: 'Profile', icon: 'pi pi-user', command: () => this.goToProfile() },
            { label: 'Settings', icon: 'pi pi-cog', command: () => this.goToSettings() },
            {
                label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout(),
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
