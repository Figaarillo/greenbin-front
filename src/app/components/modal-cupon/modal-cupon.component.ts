import { Component, ElementRef, ViewChild } from '@angular/core'
import { LocalAdherido } from '../../services/interfaces/local-adherido'
import { MapViewComponent } from '../map-view/map-view.component'
import { CommonModule } from '@angular/common'

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
  cupon: any = {}
  localAdehrido: LocalAdherido[] = []
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

  openModal(cupon: any) {
    this.cupon = cupon
    this.setLocalAdherido()
    $(this.modal?.nativeElement).modal('show')
  }

  closeModal() {
    $(this.modal?.nativeElement).modal('hide')
  }

  setLocalAdherido() {
    this.localAdehrido = [this.local]
  }
}
