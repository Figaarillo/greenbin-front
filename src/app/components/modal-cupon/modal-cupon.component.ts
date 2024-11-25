import { Component, ElementRef, ViewChild } from '@angular/core'
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
  mapCenter: google.maps.LatLngLiteral = {
    lat: 0,
    lng: 0
  }
  misPuntos: number = 0
  cupon?: Coupon
  transaction?: any
  localAdherido: LocalAdherido[] = []
  local: LocalAdherido = {
    id: 'string',
    name: 'string',
    address: 'string',
    cuit: 'string',
    email: 'string',
    password: 'string',
    username: 'string',
    phoneNumber: 'string',
    coordinates: {
      latitude: -32.414964,
      longitude: -63.242764
    }
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
    this.service.get(cupon.rewardPartner || '').subscribe(obj => {
      this.local = obj.data
      this.localAdherido.push(this.local)
      this.mapCenter = {
        lat: this.local.coordinates.latitude,
        lng: this.local.coordinates.longitude
      }
    })
    this.transaction = undefined
    $(this.modal?.nativeElement).modal('show')
  }

  openModalTransactionMode(cupon: any, transaction: any) {
    this.localAdherido = []
    this.cupon = cupon
    this.transaction = transaction
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

  getCoupon() {
    if (this.cupon) {
      this.neighborService.buyCoupon(this.cupon?.id, this.sesionService.getUserId()).subscribe()
    }
  }
}
