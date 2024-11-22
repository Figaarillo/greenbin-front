import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule, MatTableDataSource } from '@angular/material/table'
import { RouterModule } from '@angular/router'
import { NavbarComponent } from '../../components/navbar/navbar.component'

const CUPONES_LOCAL: any[] = [
  {
    titulo: 'gran cupon',
    descuento: '10%',
    descripcion: 'maximo de $3000'
  },
  {
    titulo: 'prueba cupon',
    descuento: '20%',
    descripcion: 'maximo de $300'
  },
  {
    titulo: 'corte de pelo',
    descuento: '100%',
    descripcion: 'solo rapada'
  },
  {
    titulo: 'descuento aniversario',
    descuento: '15%',
    descripcion: 'válido solo en el mes de aniversario'
  },
  {
    titulo: 'cupon navideño',
    descuento: '25%',
    descripcion: 'descuento especial para productos de Navidad'
  },
  {
    titulo: 'descuento de bienvenida',
    descuento: '5%',
    descripcion: 'solo para nuevos clientes'
  },
  {
    titulo: 'descuento de verano',
    descuento: '30%',
    descripcion: 'válido en todos los servicios de verano'
  },
  {
    titulo: 'oferta de viernes',
    descuento: '40%',
    descripcion: 'válido solo los viernes hasta las 6 pm'
  },
  {
    titulo: 'cupon fidelidad',
    descuento: '10%',
    descripcion: 'aplicable después de 5 compras'
  },
  {
    titulo: 'promoción 2x1',
    descuento: '50%',
    descripcion: 'válido en productos seleccionados al comprar dos'
  },
  {
    titulo: 'rebaja de fin de año',
    descuento: '20%',
    descripcion: 'válido solo en diciembre'
  },
  {
    titulo: 'cupon especial estudiante',
    descuento: '15%',
    descripcion: 'presentando credencial de estudiante'
  },
  {
    titulo: 'descuento express',
    descuento: '35%',
    descripcion: 'válido en compras antes de las 12 pm'
  },
  {
    titulo: 'cupon exclusivo',
    descuento: '25%',
    descripcion: 'solo para clientes VIP'
  }
]

@Component({
  selector: 'app-mis-cupones-local',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    RouterModule,
    NavbarComponent
  ],
  templateUrl: './mis-cupones-local.component.html',
  styleUrl: './mis-cupones-local.component.scss'
})
export class MisCuponesLocalComponent {
  dataSource: MatTableDataSource<any> = new MatTableDataSource(CUPONES_LOCAL)
  puntos = 0
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }
  constructor() {
    const info = localStorage.getItem('usuarioInfo') || ''
    const usuarioInfo = JSON.parse(info)
    this.puntos = usuarioInfo.points
  }
}
