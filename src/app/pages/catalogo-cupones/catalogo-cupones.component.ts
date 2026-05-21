import { Component, ViewChild } from '@angular/core'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
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
import { VecinoService } from '../../services/vecino/vecino.service'
import { Coupon } from '../../services/interfaces/coupon'
import { forkJoin } from 'rxjs'

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
  redeemedCouponIds: Set<string> = new Set()

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  constructor(
    private service: LocalAdheridoService,
    private sesionService: SesionService,
    private vecinoService: VecinoService
  ) {
    this.puntos = Number(this.sesionService.getPoints())
    this.getItems()
  }

  getItems() {
    const usuarioInfo = localStorage.getItem('usuarioInfo')
    const parsed = usuarioInfo ? JSON.parse(usuarioInfo) : null
    const entityId = parsed?.entity?.id
    const neighborId = this.sesionService.getUserId()

    const coupons$ = this.service.listCupon(entityId)
    const myTransactions$ = neighborId ? this.vecinoService.getMyTransactions(neighborId) : null

    if (myTransactions$) {
      forkJoin({ coupons: coupons$, transactions: myTransactions$ }).subscribe(({ coupons, transactions }) => {
        this.redeemedCouponIds = new Set(
          (transactions.data ?? [])
            .filter((t: any) => t.status === 'ADQUIRIDO' || t.status === 'UTILIZADO')
            .map((t: any) => t.coupon?.id ?? t.coupon)
        )
        this.items = (<Coupon[]>coupons.data).filter(c => !this.redeemedCouponIds.has((c as any).id))
        this.dataSource = new MatTableDataSource(this.items)
      })
    } else {
      coupons$.subscribe(obj => {
        this.items = <Coupon[]>obj.data
        this.dataSource = new MatTableDataSource(this.items)
      })
    }
  }

  abrirModal(cupon: Coupon) {
    this.modal?.openModal(cupon)
  }

  onCuponCanjeado(puntosRestantes: number) {
    this.puntos = puntosRestantes
    this.getItems()
  }
}
