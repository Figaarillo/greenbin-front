import { Component, computed, Input, input, signal, ViewChild } from '@angular/core'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { ActivatedRoute, RouterModule, Router, Route } from '@angular/router'
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav'
import { MatListModule } from '@angular/material/list'
import { CommonModule } from '@angular/common'

export type MenuItem = {
  icon: string
  label: string
  route: string
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    MatSidenav,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    RouterModule,
    MatSidenavModule,
    MatListModule
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  @Input() title: string = ''
  @ViewChild(MatSidenav, { static: true })
  sidenav!: MatSidenav
  menuItems = signal<MenuItem[]>([
    {
      icon: 'analytics',
      label: 'Analytics',
      route: 'analitycs'
    },
    {
      icon: 'analytics',
      label: 'Analytics',
      route: 'analitycs'
    }
  ])
}
