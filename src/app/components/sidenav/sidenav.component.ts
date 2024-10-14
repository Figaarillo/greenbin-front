import { CommonModule } from '@angular/common'
import { Component, signal } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'

export type MenuItem = {
  icon: string
  label: string
  route: string
}

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [MatListModule, MatIconModule, CommonModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
  menuItems = signal<MenuItem[]>([
    { icon: 'analytics', label: 'analytics', route: 'analitycs' },
    { icon: 'home', label: 'analitycs', route: 'analitycs' }
  ])
}
