import { Component, ElementRef, ViewChild, viewChild } from '@angular/core'
import { PuntoVerde } from '../../services/interfaces/punto-verde'

//@ts-ignore
const $ = window['$']
@Component({
  selector: 'app-modal-pv',
  standalone: true,
  imports: [],
  templateUrl: './modal-pv.component.html',
  styleUrl: './modal-pv.component.scss'
})
export class ModalPvComponent {
  @ViewChild('modal') modal?: ElementRef
  data: any = {}
  openModal(data: PuntoVerde) {
    this.data = data
    $(this.modal?.nativeElement).modal('show')
  }

  closeModal() {
    $(this.modal?.nativeElement).modal('hide')
  }
}
