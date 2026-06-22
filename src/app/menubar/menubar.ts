import { Component, OnInit } from '@angular/core';
import {MenuItem} from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-menubar',
    imports: [MenubarModule, InputTextModule, ButtonModule, RouterModule],
    templateUrl: './menubar.html',
    styleUrls: ['./menubar.css'],
})
export class Menubar implements OnInit {
   items: MenuItem[] = [];
    ngOnInit() {
        this.items = [
            {
                label:'Divide-And-Pay',
                icon:'pi pi-fw pi-home',
                routerLink: ['']
            },
            {
              label: 'Create Group',
              icon: 'pi pi-fw pi-plus',
              routerLink: ['/create']
            }
        ];
    }    
}
