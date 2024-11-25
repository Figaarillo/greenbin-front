import { Component, ViewChild } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule, MatTableDataSource } from '@angular/material/table'
import { RouterModule } from '@angular/router'
import { ModalCuponComponent } from '../../components/modal-cupon/modal-cupon.component'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { SesionService } from '../../services/sesion/sesion.service'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { Coupon } from '../../services/interfaces/coupon'

@Component({
  selector: 'app-mis-cupones-vecino',
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
  templateUrl: './mis-cupones-vecino.component.html',
  styleUrl: './mis-cupones-vecino.component.scss'
})
export class MisCuponesVecinoComponent {
  @ViewChild(ModalCuponComponent) modal?: ModalCuponComponent
  dataSource: MatTableDataSource<any> = new MatTableDataSource()
  puntos = 0
  cuponesId: string[] = []
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }
  constructor(
    private sesionService: SesionService,
    private service: LocalAdheridoService
  ) {
    const info = localStorage.getItem('usuarioInfo') || ''
    const usuarioInfo = JSON.parse(info)
    this.puntos = usuarioInfo.points
    this.cuponesId = this.sesionService.getCupones()
    this.getItems()
  }

  cupones: Coupon[] = []
  getItems() {
    this.service.listCupon().subscribe(obj => {
      this.cupones = <Coupon[]>obj.data
      let filterCupones = this.cupones.filter(obj => this.cuponesId.includes(obj.id))
      this.dataSource = new MatTableDataSource(filterCupones)
      //this.dataSource.data.length
    })
  }

  abrirModal(cupon: any) {
    this.modal?.openModalTransactionMode(cupon, {})
  }
}
