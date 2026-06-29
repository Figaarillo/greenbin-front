import { Component, EventEmitter, Output, viewChild } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MatIconModule } from '@angular/material/icon'
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component'
import { MapViewComponent } from '../map-view/map-view.component'
import { Coupon } from '../../services/interfaces/coupon'
import { LocalAdherido } from '../../services/interfaces/local-adherido'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { SesionService } from '../../services/sesion/sesion.service'
import { VecinoService } from '../../services/vecino/vecino.service'

/**
 * Detalle + canje de cupón en bottom-sheet (estilo "detalle limpio").
 * Reemplaza al viejo modal-cupon (Bootstrap/jQuery). Reutiliza app-bottom-sheet.
 *
 * Modos:
 *  - openCatalog(cupon)          → catálogo: muestra "Canjear cupón"
 *  - openOwned(cupon, transaction) → mis cupones: muestra "Ver código"
 */
@Component({
  selector: 'app-cupon-sheet',
  standalone: true,
  imports: [CommonModule, MatIconModule, BottomSheetComponent, MapViewComponent],
  templateUrl: './cupon-sheet.component.html',
  styleUrl: './cupon-sheet.component.scss'
})
export class CuponSheetComponent {
  private readonly sheet = viewChild.required(BottomSheetComponent)

  /** Emite los puntos restantes al canjear, para que el padre actualice el saldo. */
  @Output() cuponCanjeado = new EventEmitter<number>()

  cupon?: Coupon
  transaction?: any
  local?: LocalAdherido
  localAdherido: LocalAdherido[] = []
  mapCenter: google.maps.LatLngLiteral = { lat: 0, lng: 0 }

  misPuntos = 0
  codigoCanje = ''
  diaVto: Date = new Date()
  cargando = false
  recienCanjeado = false

  constructor(
    private service: LocalAdheridoService,
    private sesionService: SesionService,
    private neighborService: VecinoService
  ) {
    this.misPuntos = Number(this.sesionService.getPoints())
  }

  // ── Aperturas ──────────────────────────────────────────
  openCatalog(cupon: Coupon): void {
    this.reset(cupon)
    this.transaction = undefined
    this.misPuntos = Number(this.sesionService.getPoints())
    this.cargarLocal(cupon.rewardPartner || '')
    this.sheet().open()
  }

  openOwned(cupon: Coupon, transaction: any): void {
    this.reset(cupon)
    this.transaction = transaction

    if (transaction?.expirationDate) {
      this.diaVto = new Date(transaction.expirationDate)
    } else {
      const hoy = new Date()
      this.diaVto = new Date(hoy.setDate(hoy.getDate() + cupon.validDays))
    }

    this.cargarLocal(cupon.rewardPartner || '')
    this.sheet().open()
  }

  private reset(cupon: Coupon): void {
    this.cupon = cupon
    this.localAdherido = []
    this.local = undefined
    this.codigoCanje = ''
    this.cargando = false
    this.recienCanjeado = false
  }

  private cargarLocal(partnerId: string): void {
    this.service.get(partnerId).subscribe(obj => {
      this.local = obj.data
      this.localAdherido = [obj.data]
      this.mapCenter = {
        lat: obj.data.coordinates.latitude,
        lng: obj.data.coordinates.longitude
      }
    })
  }

  // ── Estado de saldo ────────────────────────────────────
  get puntosFaltantes(): number {
    if (!this.cupon) return 0
    return Math.max(0, this.cupon.costInPoints - this.misPuntos)
  }

  get puedeCanjear(): boolean {
    return !!this.cupon && this.misPuntos >= this.cupon.costInPoints && !this.cargando
  }

  // ── Acciones ───────────────────────────────────────────
  canjear(): void {
    if (!this.cupon || this.cargando) return
    this.cargando = true

    this.neighborService.buyCoupon(this.cupon.id, this.sesionService.getUserId()).subscribe({
      next: (response: any) => {
        this.cargando = false
        const transaction = response.data ?? response
        this.codigoCanje = transaction.code
        this.recienCanjeado = true

        if (transaction.expirationDate) {
          this.diaVto = new Date(transaction.expirationDate)
        } else {
          const hoy = new Date()
          this.diaVto = new Date(hoy.setDate(hoy.getDate() + this.cupon!.validDays))
        }

        const puntosRestantes = this.misPuntos - (this.cupon?.costInPoints ?? 0)
        this.sesionService.setPoints(puntosRestantes.toString())
        this.misPuntos = puntosRestantes
        this.cuponCanjeado.emit(puntosRestantes)

        this.sesionService.addCupon(this.cupon!.id)
      },
      error: (err: any) => {
        this.cargando = false
        console.error('Error al canjear cupón:', err)
        alert('No se pudo canjear el cupón. ' + (err?.error?.message ?? 'Intentá de nuevo.'))
      }
    })
  }

  verCodigo(): void {
    if (this.transaction?.code) {
      this.codigoCanje = this.transaction.code
    }
  }

  cerrar(): void {
    this.sheet().closeSheet()
  }
}
