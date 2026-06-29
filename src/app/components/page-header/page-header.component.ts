import { Component, Input } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'

/**
 * Cabecera unificada (gradiente del rol) usada en todas las pantallas mobile.
 * El acento lo hereda de [data-role] del contenedor padre.
 *
 * Uso:
 *   <app-page-header title="Catálogo">
 *     <!-- extras opcionales: chips, acciones, etc. -->
 *   </app-page-header>
 */
@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss'
})
export class PageHeaderComponent {
  @Input() title = ''
}
