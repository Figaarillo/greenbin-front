import { Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core'
import { LocalAdherido } from '../../services/interfaces/local-adherido'
import { MapViewComponent } from '../map-view/map-view.component'
import { CommonModule } from '@angular/common'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { Coupon } from '../../services/interfaces/coupon'
import { SesionService } from '../../services/sesion/sesion.service'
import { VecinoService } from '../../services/vecino/vecino.service'

//@ts-ignore
const $ = window['$']

@Component({
  selector: 'app-modal-cupon',
  standalone: true,
  imports: [MapViewComponent, CommonModule],
  templateUrl: './modal-cupon.component.html',
  styleUrl: './modal-cupon.component.scss'
})
export class ModalCuponComponent {
  @ViewChild('modal') modal?: ElementRef

  // Emite evento al padre para que actualice los puntos mostrados en pantalla
  @Output() cuponCanjeado = new EventEmitter<number>()

  mapCenter: google.maps.LatLngLiteral = { lat: 0, lng: 0 }
  misPuntos: number = 0
  cupon?: Coupon
  transaction?: any
  localAdherido: LocalAdherido[] = []
  codigoCanje: string = '' // FIX: código de 6 dígitos que devuelve el backend
  cargando: boolean = false // FIX: estado de carga para deshabilitar el botón
  diaVto: Date = new Date()

  local: LocalAdherido = {
    id: '',
    name: '',
    address: '',
    cuit: '',
    email: '',
    password: '',
    username: '',
    phoneNumber: '',
    coordinates: { latitude: -32.414964, longitude: -63.242764 }
  }

  constructor(
    private service: LocalAdheridoService,
    private sesionService: SesionService,
    private neighborService: VecinoService
  ) {
    this.misPuntos = Number(this.sesionService.getPoints())
  }

  openModal(cupon: Coupon) {
    this.localAdherido = []
    this.cupon = cupon
    this.codigoCanje = '' // FIX: limpiar código al abrir nuevo cupón
    this.transaction = undefined
    this.cargando = false

    this.service.get(cupon.rewardPartner || '').subscribe(obj => {
      this.local = obj.data
      this.localAdherido.push(this.local)
      this.mapCenter = {
        lat: this.local.coordinates.latitude,
        lng: this.local.coordinates.longitude
      }
    })

    $(this.modal?.nativeElement).modal('show')
  }

  openModalTransactionMode(cupon: any, transaction: any) {
    this.localAdherido = []
    this.cupon = cupon
    this.transaction = transaction
    this.codigoCanje = '' // FIX: limpiar código al abrir
    this.cargando = false

    // Calcular vencimiento desde la fecha de expiración que viene del backend
    if (transaction?.expirationDate) {
      this.diaVto = new Date(transaction.expirationDate)
    } else {
      const hoy = new Date()
      this.diaVto = new Date(hoy.setDate(hoy.getDate() + this.cupon!.validDays))
    }

    this.service.get(cupon.rewardPartner).subscribe(obj => {
      this.local = obj.data
      this.localAdherido.push(this.local)
      this.mapCenter = {
        lat: this.local.coordinates.latitude,
        lng: this.local.coordinates.longitude
      }
    })

    $(this.modal?.nativeElement).modal('show')
  }

  closeModal() {
    $(this.modal?.nativeElement).modal('hide')
  }

  // FIX: mostrar el código que ya existe en la transacción (modo "mis cupones")
  mostrarCodigoExistente() {
    if (this.transaction?.code) {
      this.codigoCanje = this.transaction.code
    }
  }

  // FIX: getCoupon ahora muestra el código devuelto por el backend y actualiza puntos
  getCoupon() {
    if (!this.cupon || this.cargando) return

    this.cargando = true

    this.neighborService.buyCoupon(this.cupon.id, this.sesionService.getUserId()).subscribe({
      next: (response: any) => {
        this.cargando = false

        // El backend devuelve la transacción con: code, expirationDate, costInPoints
        const transaction = response.data ?? response
        this.codigoCanje = transaction.code // FIX: mostrar el código de 6 dígitos

        // Calcular fecha de vencimiento
        if (transaction.expirationDate) {
          this.diaVto = new Date(transaction.expirationDate)
        } else {
          const hoy = new Date()
          this.diaVto = new Date(hoy.setDate(hoy.getDate() + this.cupon!.validDays))
        }

        // FIX: actualizar puntos en sesión y emitir al componente padre
        const puntosRestantes = this.misPuntos - (this.cupon?.costInPoints ?? 0)
        this.sesionService.setPoints(puntosRestantes.toString())
        this.misPuntos = puntosRestantes
        this.cuponCanjeado.emit(puntosRestantes)

        // Guardar en sesión local (ya existía)
        this.sesionService.addCupon(this.cupon!.id)
      },
      error: (err: any) => {
        this.cargando = false
        alert('No se pudo canjear el cupón. ' + (err?.error?.message ?? 'Intentá de nuevo.'))
      }
    })
  }

  // FIX: al cerrar después de canjear, el padre puede reaccionar
  cerrarYActualizar() {
    this.codigoCanje = ''
    $(this.modal?.nativeElement).modal('hide')
  }
}
