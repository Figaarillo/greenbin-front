import { Component } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatToolbarModule } from '@angular/material/toolbar'
import { NavbarComponent } from '../../components/navbar/navbar.component'

const DATA: any[] = [
  {
    category: 'vidrio',
    weight: 17.03
  },
  {
    category: 'papel',
    weight: 3.62
  },
  {
    category: 'carton',
    weight: 22.5
  },
  {
    category: 'lata',
    weight: 61.7
  },
  {
    category: 'plastico',
    weight: 40.2
  }
]

@Component({
  selector: 'app-mis-reciclados',
  standalone: true,
  imports: [MatListModule, MatToolbarModule, MatIconModule, NavbarComponent],
  templateUrl: './mis-reciclados.component.html',
  styleUrl: './mis-reciclados.component.scss'
})
export class MisRecicladosComponent {
  items: any[] = DATA
}
