import { StorageService } from '../../services/storage/storage.service'
import { inject, Component, OnInit } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { RouterModule } from '@angular/router'
import { MatCardModule } from '@angular/material/card'
import { MatTooltipModule } from '@angular/material/tooltip'
import { CommonModule, DatePipe } from '@angular/common'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'

@Component({
  selector: 'app-home-local',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatSidenavModule,
    MatToolbarModule,
    SidenavComponent,
    RouterModule,
    MatCardModule,
    MatTooltipModule,
    CommonModule,
    DatePipe
  ],
  templateUrl: './home-local.component.html',
  styleUrl: './home-local.component.scss'
})
export class HomeLocalComponent implements OnInit {
  private storage = inject(StorageService)
  name: string = ''
  transactions: any[] = []
  historialVisible: any[] = []
  mostrarTodo: boolean = false
  LIMITE = 5
  expandedItems = new Set<number>()

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
    this.localService.getCouponTransactions(this.rewardPartnerId).subscribe((resp: any) => {
      this.transactions = (resp.data || []).sort(
        (a: any, b: any) =>
          new Date(b.redeemDate ?? b.adquisitionDate ?? b.createdAt).getTime() -
          new Date(a.redeemDate ?? a.adquisitionDate ?? a.createdAt).getTime()
      )
      this.historialVisible = this.transactions.slice(0, this.LIMITE)
    })
  }

  toggleHistorial(): void {
    this.mostrarTodo = !this.mostrarTodo
    this.historialVisible = this.mostrarTodo ? this.transactions : this.transactions.slice(0, this.LIMITE)
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
      case 'UTILIZADO':
        return '#4caf50'
      case 'ADQUIRIDO':
        return '#2196f3'
      case 'VENCIDO':
        return '#f44336'
      default:
        return '#9e9e9e'
    }
  }

  getFecha(t: any): Date {
    return t.redeemDate ?? t.adquisitionDate ?? t.createdAt
  }
}
