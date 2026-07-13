import { Component, Input, OnInit } from '@angular/core'

export type SkeletonType = 'card' | 'table' | 'stat' | 'list' | 'block' | 'lines'

/**
 * Placeholder de carga reutilizable. Imita la silueta del contenido real
 * (cards, filas de tabla, KPIs, etc.) mientras los datos llegan. Es SSR-safe:
 * como las páginas arrancan con loading=true y difieren el fetch al navegador,
 * el servidor renderiza este skeleton en la pantalla correcta.
 */
@Component({
  selector: 'app-skeleton',
  standalone: true,
  templateUrl: './skeleton.component.html',
  styleUrl: './skeleton.component.scss'
})
export class SkeletonComponent implements OnInit {
  /** Silueta a imitar. */
  @Input() type: SkeletonType = 'card'
  /** Cuántos bloques repetir (filas / cards / KPIs). */
  @Input() count = 6

  items: number[] = []
  readonly cols = [0, 1, 2, 3]

  ngOnInit(): void {
    this.items = Array.from({ length: this.count }, (_, i) => i)
  }
}
