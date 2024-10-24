import { Component, ElementRef, ViewChild, viewChild } from '@angular/core'

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

  openModal() {
    $(this.modal?.nativeElement).modal('show')
  }

  closeModal() {
    $(this.modal?.nativeElement).modal('hide')
  }
}
