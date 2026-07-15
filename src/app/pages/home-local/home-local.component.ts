import { StorageService } from '../../services/storage/storage.service'
import { inject, Component, OnInit, PLATFORM_ID } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatToolbarModule } from '@angular/material/toolbar'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { RouterModule } from '@angular/router'
import { MatCardModule } from '@angular/material/card'
import { MatTooltipModule } from '@angular/material/tooltip'
import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { SkeletonComponent } from '../../components/skeleton/skeleton.component'
import { NotificationBellComponent } from '../../components/notification-bell/notification-bell.component'
import { NotificationPanelComponent } from '../../components/notification-panel/notification-panel.component'
import { ScrollShadowDirective } from '../../directives/scroll-shadow.directive'

export type EstadoCuponFiltro = 'TODOS' | 'ADQUIRIDO' | 'USADO' | 'EXPIRADO'

@Component({
  selector: 'app-home-local',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatToolbarModule,
    SidenavComponent,
    RouterModule,
    MatCardModule,
    MatTooltipModule,
    CommonModule,
    DatePipe,
    SkeletonComponent,
    NotificationBellComponent,
    NotificationPanelComponent,
    ScrollShadowDirective
  ],
  templateUrl: './home-local.component.html',
  styleUrl: './home-local.component.scss'
})
export class HomeLocalComponent implements OnInit {
  private storage = inject(StorageService)
  private platformId = inject(PLATFORM_ID)
  loading = true
  name: string = ''
  transactions: any[] = []
  filtered: any[] = []
  historialVisible: any[] = []
  mostrarTodo: boolean = false
  LIMITE = 5
  expandedItems = new Set<number>()
  statusFilter: EstadoCuponFiltro = 'TODOS'
  sortDir: 'desc' | 'asc' = 'desc'

  private rewardPartnerId: string = ''

  constructor(private localService: LocalAdheridoService) {
    const info = this.storage.getItem('usuarioInfo')
    let usuarioInfo: any = {}
    try {
      usuarioInfo = info ? JSON.parse(info) : {}
    } catch {
      usuarioInfo = {}
    }
    this.name = usuarioInfo?.name ?? ''
    this.rewardPartnerId = usuarioInfo?.id ?? ''
  }

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return
    this.localService.getCouponTransactions(this.rewardPartnerId).subscribe({
      next: (resp: any) => {
        this.transactions = resp.data || []
        this.applyFiltersAndSort()
        this.loading = false
      },
      error: () => (this.loading = false)
    })
  }

  setStatusFilter(status: EstadoCuponFiltro): void {
    this.statusFilter = status
    this.applyFiltersAndSort()
  }

  toggleSortDir(): void {
    this.sortDir = this.sortDir === 'desc' ? 'asc' : 'desc'
    this.applyFiltersAndSort()
  }

  private applyFiltersAndSort(): void {
    let result = this.transactions
    if (this.statusFilter !== 'TODOS') {
      result = result.filter(t => t.status === this.statusFilter)
    }

    const dir = this.sortDir === 'desc' ? -1 : 1
    result = [...result].sort(
      (a, b) => (new Date(this.getFecha(a)).getTime() - new Date(this.getFecha(b)).getTime()) * dir
    )

    this.filtered = result
    this.mostrarTodo = false
    this.historialVisible = this.filtered.slice(0, this.LIMITE)
  }

  toggleHistorial(): void {
    this.mostrarTodo = !this.mostrarTodo
    this.historialVisible = this.mostrarTodo ? this.filtered : this.filtered.slice(0, this.LIMITE)
  }

  toggleItem(index: number): void {
    if (this.expandedItems.has(index)) {
      this.expandedItems.delete(index)
    } else {
      this.expandedItems.add(index)
    }
  }

  isExpanded(index: number): boolean {
    return this.expandedItems.has(index)
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'USADO':
        return '#4caf50'
      case 'ADQUIRIDO':
        return '#2196f3'
      case 'EXPIRADO':
        return '#f44336'
      default:
        return '#9e9e9e'
    }
  }

  getFecha(t: any): Date {
    return t.redeemDate ?? t.adquisitionDate ?? t.createdAt
  }
}
