import { StorageService } from '../../services/storage/storage.service'
import { isPlatformBrowser } from '@angular/common'
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core'
import { Column } from '../../services/interfaces/columns'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { TableComponent } from '../../components/table/table.component'
import Swal from 'sweetalert2'
import { Router } from '@angular/router'

@Component({
  selector: 'app-consultar-locales',
  standalone: true,
  imports: [TableComponent],
  templateUrl: './consultar-locales.component.html',
  styleUrl: './consultar-locales.component.scss'
})
export class ConsultarLocalesComponent implements OnInit {
  private storage = inject(StorageService)
  private localService = inject(LocalAdheridoService)
  private platformId = inject(PLATFORM_ID)
  loading = true
  columns: Column[] = []
  title: string = 'Locales adheridos'
  locales: any[] = []
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.columns = [
      { key: 'name', label: 'Nombre' },
      { key: 'address', label: 'Dirección' },
      { key: 'email', label: 'Email' },
      { key: 'phoneNumber', label: 'Teléfono' },
      { key: 'isActive', label: 'Estado' },
      { key: 'actions', label: 'Acciones' }
    ]
    if (isPlatformBrowser(this.platformId)) this.listLocales()
  }

  verRoi(id: string) {
    this.router.navigate(['/entidad/consultar-locales', id, 'roi'])
  }

  listLocales() {
    const entidadInfo = JSON.parse(this.storage.getItem('entidadInfo') || '{}')
    this.localService.list(entidadInfo.id, true).subscribe({
      next: (locales: any[]) => {
        this.locales = (locales ?? []).map((l: any) => ({
          ...l,
          isActive: l.isActive ? 'Habilitado' : 'Deshabilitado'
        }))
        this.loading = false
      },
      error: () => {
        this.loading = false
        Swal.fire({ title: 'Ha ocurrido un error', icon: 'error' }).then(() => {
          this.router.navigate(['/entidad'])
        })
      }
    })
  }
}
