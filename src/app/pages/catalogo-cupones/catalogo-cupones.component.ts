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
import { filter } from 'rxjs'
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
  titleFilter = ''
  sortField: CampoOrdenCupon = 'discount'
  sortDir: 'desc' | 'asc' = 'desc'
  hideAdquiridos = false

  private applyFilters() {
    const title = this.titleFilter.trim().toLowerCase()
    const filtered = this.items
      .filter(c => c.title.toLowerCase().includes(title))
      .filter(c => !this.hideAdquiridos || c.redeemable !== false)
    this.dataSource.data = ordenarCupones(filtered, this.sortField, this.sortDir)
  }

  onTitleFilter(event: Event) {
    this.titleFilter = (event.target as HTMLInputElement).value
    this.applyFilters()
  }

  toggleHideAdquiridos() {
    this.hideAdquiridos = !this.hideAdquiridos
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

    // El catálogo del vecino ya llega resuelto contra la regla de canje. Sin
    // vecino identificado no hay regla que aplicar, así que se cae al listado
    // crudo de cupones disponibles.
    const catalog$ = neighborId ? this.vecinoService.getCatalog(neighborId, entityId) : this.service.listCupon(entityId)

    catalog$.subscribe({
      next: obj => {
        // El fallback sin vecino no trae `redeemable`: se normaliza acá para que
        // la pantalla nunca tenga que preguntarse si el campo vino o no.
        this.items = (<Coupon[]>obj.data).map(c => ({ ...c, redeemable: c.redeemable ?? true }))
        this.dataSource = new MatTableDataSource(this.items)
        this.applyFilters()
        this.loading = false
      },
      error: () => (this.loading = false)
    })
  }

  abrirModal(cupon: Coupon) {
    if (cupon.redeemable === false) return
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

  /**
   * Race condition: el vecino tocó "Canjear" sobre un cupón que ya no podía
   * canjear. En vez de adivinar el motivo en el cliente, se vuelve a pedir el
   * estado al backend — que es la única fuente de verdad. El cupón queda en
   * gris si ya lo tenía, o desaparece si el local lo borró.
   */
  onCanjeRechazado() {
    this.getItems()
  }
}
