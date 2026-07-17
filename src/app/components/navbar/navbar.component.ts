import { Component, Input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { RouterModule } from '@angular/router'
import { ScrollShadowDirective } from '../../directives/scroll-shadow.directive'

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, RouterModule, ScrollShadowDirective],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  @Input() title: string = ''
  @Input() route: string = ''
}
