import { StorageService } from '../../services/storage/storage.service'
import { inject, Component, DestroyRef, ViewChild, PLATFORM_ID } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { MatTableDataSource } from '@angular/material/table'
import { MatIconModule } from '@angular/material/icon'
import { CuponSheetComponent } from '../../components/cupon-sheet/cupon-sheet.component'
import { PageHeaderComponent } from '../../components/page-header/page-header.component'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { SesionService } from '../../services/sesion/sesion.service'
import { VecinoService } from '../../services/vecino/vecino.service'
import { RealtimeService } from '../../services/notification/realtime.service'
import { Coupon, CampoOrdenCupon } from '../../services/interfaces/coupon'
import { ordenarCupones } from '../../services/interfaces/coupon-sort.util'
import { forkJoin, filter } from 'rxjs'
import { isPlatformBrowser } from '@angular/common'
import { SkeletonComponent } from '../../components/skeleton/skeleton.component'
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell.component'
import { NotificationPanelComponent } from '../../components/notification-panel/notification-panel.component'

@Component({
  selector: 'app-catalogo-cupones',
  standalone: true,
  imports: [
    MatIconModule,
    CuponSheetComponent,
    PageHeaderComponent,
    SkeletonComponent,
    NotificationBellComponent,
    NotificationPanelComponent
  ],
  templateUrl: './catalogo-cupones.component.html',
  styleUrl: './catalogo-cupones.component.scss'
})
export class CatalogoCuponesComponent {
  private storage = inject(StorageService)
  private platformId = inject(PLATFORM_ID)
  private realtimeService = inject(RealtimeService)
  private destroyRef = inject(DestroyRef)
  @ViewChild(CuponSheetComponent) sheet?: CuponSheetComponent
  loading = true
  dataSource: MatTableDataSource<any> = new MatTableDataSource()
  puntos = 0
  items: Coupon[] = []
  redeemedCouponIds: Set<string> = new Set()
  titleFilter = ''
  sortField: CampoOrdenCupon = 'discount'
  sortDir: 'desc' | 'asc' = 'desc'

  private applyFilters() {
    const title = this.titleFilter.trim().toLowerCase()
    const filtered = this.items.filter(c => c.title.toLowerCase().includes(title))
    this.dataSource.data = ordenarCupones(filtered, this.sortField, this.sortDir)
  }

  onTitleFilter(event: Event) {
    this.titleFilter = (event.target as HTMLInputElement).value
    this.applyFilters()
  }

  setSortField(field: CampoOrdenCupon) {
    this.sortField = field
    this.applyFilters()
  }

  toggleSortDir() {
    this.sortDir = this.sortDir === 'desc' ? 'asc' : 'desc'
    this.applyFilters()
  }

  constructor(
    private service: LocalAdheridoService,
    private sesionService: SesionService,
    private vecinoService: VecinoService
  ) {
    this.puntos = Number(this.sesionService.getPoints())
    // El fetch corre solo en el navegador: en SSR loading queda true y el
    // servidor renderiza el skeleton en la pantalla correcta.
    if (isPlatformBrowser(this.platformId)) {
      this.getItems()

      // Cuando un local crea un cupón nuevo para esta entidad, refrescamos el
      // catálogo en vivo (sin que el vecino tenga que recargar la página).
      this.realtimeService.events$
        .pipe(
          filter(event => event.category === 'COUPON_CREATED'),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe(() => this.getItems())
    }
  }

  getItems() {
    this.loading = true
    const usuarioInfo = this.storage.getItem('usuarioInfo')
    const parsed = usuarioInfo ? JSON.parse(usuarioInfo) : null
    const entityId = parsed?.entity?.id
    const neighborId = this.sesionService.getUserId()

    const coupons$ = this.service.listCupon(entityId)
    const myTransactions$ = neighborId ? this.vecinoService.getMyTransactions(neighborId) : null

    if (myTransactions$) {
      forkJoin({ coupons: coupons$, transactions: myTransactions$ }).subscribe({
        next: ({ coupons, transactions }) => {
          this.redeemedCouponIds = new Set(
            (transactions.data ?? [])
              .filter((t: any) => t.status === 'ADQUIRIDO' || t.status === 'USADO' || t.status === 'EXPIRADO')
              .map((t: any) => t.coupon?.id ?? t.coupon)
          )
          this.items = (<Coupon[]>coupons.data).filter(c => !this.redeemedCouponIds.has((c as any).id))
          this.dataSource = new MatTableDataSource(this.items)
          this.applyFilters()
          this.loading = false
        },
        error: () => (this.loading = false)
      })
    } else {
      coupons$.subscribe({
        next: obj => {
          this.items = <Coupon[]>obj.data
          this.dataSource = new MatTableDataSource(this.items)
          this.applyFilters()
          this.loading = false
        },
        error: () => (this.loading = false)
      })
    }
  }

  abrirModal(cupon: Coupon) {
    this.sheet?.openCatalog(cupon)
  }

  /** Llamado por RoleLayoutComponent cuando se vuelve a tocar el tab "Cupones"
   *  estando ya en esta pantalla, para cerrar el detalle si quedó abierto. */
  closeOpenSheet(): void {
    this.sheet?.cerrar()
  }

  onCuponCanjeado(puntosRestantes: number) {
    this.puntos = puntosRestantes
    this.getItems()
  }
}
