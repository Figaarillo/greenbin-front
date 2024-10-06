import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatDividerModule } from '@angular/material/divider'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'

@Component({
  selector: 'app-responsible-home',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatListModule, MatDividerModule, MatSidenavModule, MatToolbarModule],

  templateUrl: './responsible-home.component.html',
  styleUrl: './responsible-home.component.scss'
})
export class ResponsibleHomeComponent {}
