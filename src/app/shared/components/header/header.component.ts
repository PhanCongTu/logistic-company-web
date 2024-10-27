import { Component, OnInit, ViewChild } from '@angular/core';
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

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenubarModule, BadgeModule, AvatarModule, InputTextModule, RippleModule, CommonModule, DropdownModule, MenuModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

    items: MenuItem[] | undefined;
    
    constructor(private router: Router) {}

    ngOnInit() {

        this.items = [
            { label: 'Home',
                icon: 'pi pi-home',
                command: () => {
                    this.router.navigate(['/']);
                }
            },
            {
                label: 'Features',
                icon: 'pi pi-star'
            },
            {
                label: 'Projects',
                icon: 'pi pi-search',
                items: [
                    {
                        label: 'Core',
                        icon: 'pi pi-bolt',
                        shortcut: '⌘+S'
                    },
                    {
                        label: 'Blocks',
                        icon: 'pi pi-server',
                        shortcut: '⌘+B'
                    },
                    {
                        label: 'UI Kit',
                        icon: 'pi pi-pencil',
                        shortcut: '⌘+U'
                    },
                    {
                        separator: true
                    },
                    {
                        label: 'Templates',
                        icon: 'pi pi-palette',
                        items: [
                            {
                                label: 'Apollo',
                                icon: 'pi pi-palette',
                                badge: '2'
                            },
                            {
                                label: 'Ultima',
                                icon: 'pi pi-palette',
                                badge: '3'
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Contact',
                icon: 'pi pi-envelope',
                badge: '3'
            }
        ];
    }

     @ViewChild('avatarMenu') avatarMenu!: Menu;

  avatarItems = [
    { label: 'Profile', icon: 'pi pi-user', command: () => this.goToProfile() },
    { label: 'Settings', icon: 'pi pi-cog', command: () => this.goToSettings() },
    { label: 'Logout', icon: 'pi pi-sign-out', command: () => this.logout() }
  ];

  toggleMenu(event: MouseEvent) {
    this.avatarMenu.toggle(event); // Hiển thị dropdown
  }

  goToProfile() {
    // Logic to navigate to profile
  }

  goToSettings() {
    // Logic to navigate to settings
  }

  logout() {
    // Logic to log out
  }
}
