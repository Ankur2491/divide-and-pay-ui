import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { Menubar } from './menubar/menubar';
import { MenubarModule } from 'primeng/menubar';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [ButtonModule, RouterOutlet, Menubar, MenubarModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('divide-and-pay');
}
