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
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { SesionService } from '../../services/sesion/sesion.service'
import { Coupon } from '../../services/interfaces/coupon'

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
  dataSource: MatTableDataSource<any> = new MatTableDataSource()
  puntos = 0
  items: Coupon[] = []
  localId: string = ''

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
    /*
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }*/
  }
  constructor(
    private service: LocalAdheridoService,
    private sesionService: SesionService
  ) {
    this.puntos = Number(this.sesionService.getPoints())
    this.getItems()
  }

  getItems() {
    this.service.listCupon().subscribe(obj => {
      this.items = <Coupon[]>obj.data
      this.dataSource = new MatTableDataSource(this.items.filter(c => c.isAvailable))
      console.log(this.items)
    })
  }

  abrirModal(cupon: Coupon) {
    this.modal?.openModal(cupon)
  }
}
