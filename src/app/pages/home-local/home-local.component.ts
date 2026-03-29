import { Component, OnInit } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatDividerModule } from '@angular/material/divider'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'
import { SidenavComponent } from '../../components/sidenav/sidenav.component'
import { RouterModule } from '@angular/router'
import { MatCardModule } from '@angular/material/card'
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
    CommonModule,
    DatePipe
  ],
  templateUrl: './home-local.component.html',
  styleUrl: './home-local.component.scss'
})
export class HomeLocalComponent implements OnInit {
  name: string = ''
  historial: any[] = []
  historialVisible: any[] = []
  mostrarTodo: boolean = false
  LIMITE = 5

  private rewardPartnerId: string = ''

  constructor(private localService: LocalAdheridoService) {
    const info = localStorage.getItem('usuarioInfo') || ''
    const usuarioInfo = JSON.parse(info)
    this.name = usuarioInfo.name
    this.rewardPartnerId = usuarioInfo.id
  }

  ngOnInit(): void {
    this.localService.getCouponTransactions(this.rewardPartnerId).subscribe((resp: any) => {
      this.historial = (resp.data || [])
        .map((t: any) => ({
          descripcion: `Cupón "${t.coupon?.title}" - ${t.neighbor?.firstname ?? ''} ${t.neighbor?.lastname ?? ''}`,
          puntos: t.costInPoints,
          estado: t.status,
          fecha: t.redeemDate ?? t.createdAt
        }))
        .sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      this.historialVisible = this.historial.slice(0, this.LIMITE)
    })
  }

  toggleHistorial() {
    this.mostrarTodo = !this.mostrarTodo
    this.historialVisible = this.mostrarTodo ? this.historial : this.historial.slice(0, this.LIMITE)
  }
}
