import { StorageService } from '../../services/storage/storage.service'
import { inject, Component, ViewChild } from '@angular/core'
import { MatTableDataSource } from '@angular/material/table'
import { MatIconModule } from '@angular/material/icon'
import { CuponSheetComponent } from '../../components/cupon-sheet/cupon-sheet.component'
import { PageHeaderComponent } from '../../components/page-header/page-header.component'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { SesionService } from '../../services/sesion/sesion.service'
import { VecinoService } from '../../services/vecino/vecino.service'
import { Coupon } from '../../services/interfaces/coupon'
import { forkJoin } from 'rxjs'

@Component({
  selector: 'app-catalogo-cupones',
  standalone: true,
  imports: [MatIconModule, CuponSheetComponent, PageHeaderComponent],
  templateUrl: './catalogo-cupones.component.html',
  styleUrl: './catalogo-cupones.component.scss'
})
export class CatalogoCuponesComponent {
  private storage = inject(StorageService)
  @ViewChild(CuponSheetComponent) sheet?: CuponSheetComponent
  dataSource: MatTableDataSource<any> = new MatTableDataSource()
  puntos = 0
  items: Coupon[] = []
  redeemedCouponIds: Set<string> = new Set()
  titleFilter = ''
  minDiscount: number | null = null

  private applyFilters() {
    const title = this.titleFilter.trim().toLowerCase()
    const min = this.minDiscount ?? 0
    this.dataSource.data = this.items.filter(c => c.title.toLowerCase().includes(title) && c.discount >= min)
  }

  onTitleFilter(event: Event) {
    this.titleFilter = (event.target as HTMLInputElement).value
    this.applyFilters()
  }

  onDiscountFilter(event: Event) {
    const val = (event.target as HTMLInputElement).value
    this.minDiscount = val !== '' ? Number(val) : null
    this.applyFilters()
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
    const usuarioInfo = this.storage.getItem('usuarioInfo')
    const parsed = usuarioInfo ? JSON.parse(usuarioInfo) : null
    const entityId = parsed?.entity?.id
    const neighborId = this.sesionService.getUserId()

    const coupons$ = this.service.listCupon(entityId)
    const myTransactions$ = neighborId ? this.vecinoService.getMyTransactions(neighborId) : null

    if (myTransactions$) {
      forkJoin({ coupons: coupons$, transactions: myTransactions$ }).subscribe(({ coupons, transactions }) => {
        this.redeemedCouponIds = new Set(
          (transactions.data ?? [])
            .filter((t: any) => t.status === 'ADQUIRIDO' || t.status === 'USADO' || t.status === 'EXPIRADO')
            .map((t: any) => t.coupon?.id ?? t.coupon)
        )
        this.items = (<Coupon[]>coupons.data).filter(c => !this.redeemedCouponIds.has((c as any).id))
        this.dataSource = new MatTableDataSource(this.items)
        this.applyFilters()
      })
    } else {
      coupons$.subscribe(obj => {
        this.items = <Coupon[]>obj.data
        this.dataSource = new MatTableDataSource(this.items)
        this.applyFilters()
      })
    }
  }

  abrirModal(cupon: Coupon) {
    this.sheet?.openCatalog(cupon)
  }

  onCuponCanjeado(puntosRestantes: number) {
    this.puntos = puntosRestantes
    this.getItems()
  }
}
