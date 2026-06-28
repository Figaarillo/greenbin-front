import { StorageService } from '../../services/storage/storage.service'
import { inject, Component, ViewChild } from '@angular/core'
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
import { VecinoService } from '../../services/vecino/vecino.service'
import { CouponTransaction } from '../../services/interfaces/coupon'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-mis-cupones-vecino',
  standalone: true,
  imports: [
    CommonModule,
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
  private storage = inject(StorageService)
  @ViewChild(ModalCuponComponent) modal?: ModalCuponComponent
  dataSource: MatTableDataSource<CouponTransaction> = new MatTableDataSource()
  puntos = 0
  transactions: CouponTransaction[] = []

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  constructor(
    private sesionService: SesionService,
    private vecinoService: VecinoService
  ) {
    const info = this.storage.getItem('usuarioInfo') || ''
    const usuarioInfo = JSON.parse(info)
    this.puntos = usuarioInfo.points
    this.getItems()
  }

  getItems() {
    const neighborId = this.sesionService.getUserId()
    this.vecinoService.getMyTransactions(neighborId).subscribe(obj => {
      this.transactions = <CouponTransaction[]>obj.data
      this.dataSource = new MatTableDataSource(this.transactions)
    })
  }

  abrirModal(transaction: CouponTransaction) {
    this.modal?.openModalTransactionMode(transaction.coupon, transaction)
  }
}
