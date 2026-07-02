import { Component, viewChild } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component'
import { PuntoVerde } from '../../services/interfaces/punto-verde'

@Component({
  selector: 'app-modal-pv',
  standalone: true,
  imports: [MatIconModule, BottomSheetComponent],
  templateUrl: './modal-pv.component.html',
  styleUrl: './modal-pv.component.scss'
})
export class ModalPvComponent {
  private readonly sheet = viewChild.required(BottomSheetComponent)

  data: PuntoVerde | null = null
  copied = false

  openModal(data: PuntoVerde) {
    this.data = data
    this.copied = false
    this.sheet().open()
  }

  closeModal() {
    this.sheet().closeSheet()
  }

  directionsUrl(): string {
    const c = this.data?.coordinates
    if (!c) return ''
    return `https://www.google.com/maps/dir/?api=1&destination=${c.latitude},${c.longitude}`
  }

  telHref(): string {
    return 'tel:' + (this.data?.phoneNumber ?? '').replace(/\s+/g, '')
  }

  copyAddress(): void {
    if (!this.data?.address) return
    navigator.clipboard.writeText(this.data.address).then(() => {
      this.copied = true
      setTimeout(() => (this.copied = false), 1600)
    })
  }
}
