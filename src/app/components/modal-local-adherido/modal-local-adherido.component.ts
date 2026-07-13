import { Component, viewChild } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { BottomSheetComponent } from '../bottom-sheet/bottom-sheet.component'
import { LocalAdherido } from '../../services/interfaces/local-adherido'

@Component({
  selector: 'app-modal-local-adherido',
  standalone: true,
  imports: [MatIconModule, BottomSheetComponent],
  templateUrl: './modal-local-adherido.component.html',
  styleUrl: './modal-local-adherido.component.scss'
})
export class ModalLocalAdheridoComponent {
  private readonly sheet = viewChild.required(BottomSheetComponent)

  data: LocalAdherido | null = null
  copied = false

  openModal(data: LocalAdherido) {
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
