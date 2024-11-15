import { Component, ViewChild } from '@angular/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule, MatTableDataSource } from '@angular/material/table'
import { RouterModule } from '@angular/router'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatIconModule } from '@angular/material/icon'
import { ModalCuponComponent } from '../../components/modal-cupon/modal-cupon.component'

const CUPONES: any[] = [
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
  selector: 'app-catalogo-cupones',
  standalone: true,
  imports: [
    MatFormFieldModule,
    ModalCuponComponent,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    RouterModule,
    NavbarComponent
  ],
  templateUrl: './catalogo-cupones.component.html',
  styleUrl: './catalogo-cupones.component.scss'
})
export class CatalogoCuponesComponent {
  @ViewChild(ModalCuponComponent) modal?: ModalCuponComponent
  dataSource: MatTableDataSource<any> = new MatTableDataSource(CUPONES)
  puntos = 0
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
    /*
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }*/
  }
  constructor() {
    const info = localStorage.getItem('usuarioInfo') || ''
    const usuarioInfo = JSON.parse(info)
    this.puntos = usuarioInfo.points
  }

  abrirModal(cupon: any) {
    this.modal?.openModal(cupon)
  }
}
