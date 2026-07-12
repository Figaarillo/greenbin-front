import { StorageService } from '../../services/storage/storage.service'
import { inject, Component, ViewChild, PLATFORM_ID } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule, MatTableDataSource } from '@angular/material/table'
import { RouterModule } from '@angular/router'
import { CuponSheetComponent } from '../../components/cupon-sheet/cupon-sheet.component'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { SesionService } from '../../services/sesion/sesion.service'
import { VecinoService } from '../../services/vecino/vecino.service'
import { CouponTransaction } from '../../services/interfaces/coupon'
import { CommonModule, isPlatformBrowser } from '@angular/common'
import { SkeletonComponent } from '../../components/skeleton/skeleton.component'

export type EstadoCuponFiltro = 'TODOS' | 'ADQUIRIDO' | 'USADO' | 'EXPIRADO'

@Component({
  selector: 'app-mis-cupones-vecino',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    CuponSheetComponent,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    RouterModule,
    NavbarComponent,
    SkeletonComponent
  ],
  templateUrl: './mis-cupones-vecino.component.html',
  styleUrl: './mis-cupones-vecino.component.scss'
})
export class MisCuponesVecinoComponent {
  private storage = inject(StorageService)
  private platformId = inject(PLATFORM_ID)
  @ViewChild(CuponSheetComponent) sheet?: CuponSheetComponent
  loading = true
  dataSource: MatTableDataSource<CouponTransaction> = new MatTableDataSource()
  puntos = 0
  transactions: CouponTransaction[] = []
  titleFilter = ''
  statusFilter: EstadoCuponFiltro = 'TODOS'
  sortDir: 'desc' | 'asc' = 'desc'

  applyFilter(event: Event) {
    this.titleFilter = (event.target as HTMLInputElement).value.trim().toLowerCase()
    this.applyFilters()
  }

  setStatusFilter(status: EstadoCuponFiltro) {
    this.statusFilter = status
    this.applyFilters()
  }

  toggleSortDir() {
    this.sortDir = this.sortDir === 'desc' ? 'asc' : 'desc'
    this.applyFilters()
  }

  private applyFilters() {
    let result = this.transactions.filter(t => t.coupon.title.toLowerCase().includes(this.titleFilter))

    if (this.statusFilter !== 'TODOS') {
      result = result.filter(t => t.status === this.statusFilter)
    }

    const dir = this.sortDir === 'desc' ? -1 : 1
    result = [...result].sort((a, b) => {
      const av = new Date(a.adquisitionDate ?? a.redeemDate ?? 0).getTime()
      const bv = new Date(b.adquisitionDate ?? b.redeemDate ?? 0).getTime()
      return (av - bv) * dir
    })

    this.dataSource.data = result
  }

  constructor(
    private sesionService: SesionService,
    private vecinoService: VecinoService
  ) {
    const info = this.storage.getItem('usuarioInfo') || '{}'
    const usuarioInfo = JSON.parse(info)
    this.puntos = usuarioInfo.points
    if (isPlatformBrowser(this.platformId)) this.getItems()
  }

  getItems() {
    this.loading = true
    const neighborId = this.sesionService.getUserId()
    this.vecinoService.getMyTransactions(neighborId).subscribe({
      next: obj => {
        this.transactions = <CouponTransaction[]>obj.data
        this.applyFilters()
        this.loading = false
      },
      error: () => (this.loading = false)
    })
  }

  abrirModal(transaction: CouponTransaction) {
    this.sheet?.openOwned(transaction.coupon, transaction)
  }
}
