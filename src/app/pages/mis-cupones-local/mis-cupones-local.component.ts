import { Component, viewChild, inject, PLATFORM_ID } from '@angular/core'
import { Router } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { MatTableDataSource } from '@angular/material/table'
import { PageHeaderComponent } from '../../components/page-header/page-header.component'
import { BottomSheetComponent } from '../../components/bottom-sheet/bottom-sheet.component'
import { ModificarCuponComponent } from '../modificar-cupon/modificar-cupon.component'
import { Coupon, CampoOrdenCupon } from '../../services/interfaces/coupon'
import { ordenarCupones } from '../../services/interfaces/coupon-sort.util'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { SesionService } from '../../services/sesion/sesion.service'
import Swal from 'sweetalert2'
import { isPlatformBrowser } from '@angular/common'
import { SkeletonComponent } from '../../components/skeleton/skeleton.component'

export type DisponibilidadFiltro = 'TODOS' | 'DISPONIBLE' | 'NO_DISPONIBLE'

@Component({
  selector: 'app-mis-cupones-local',
  standalone: true,
  imports: [MatIconModule, PageHeaderComponent, BottomSheetComponent, ModificarCuponComponent, SkeletonComponent],
  templateUrl: './mis-cupones-local.component.html',
  styleUrl: './mis-cupones-local.component.scss'
})
export class MisCuponesLocalComponent {
  private readonly editSheet = viewChild.required(BottomSheetComponent)
  private platformId = inject(PLATFORM_ID)
  loading = true

  dataSource: MatTableDataSource<any> = new MatTableDataSource()
  items: Coupon[] = []
  localId: string = ''
  titleFilter = ''
  statusFilter: DisponibilidadFiltro = 'TODOS'
  sortField: CampoOrdenCupon = 'discount'
  sortDir: 'desc' | 'asc' = 'desc'
  cuponEnEdicion: Coupon | null = null

  constructor(
    private service: LocalAdheridoService,
    private sesionService: SesionService,
    private router: Router
  ) {
    this.localId = this.sesionService.getUserId()
    if (isPlatformBrowser(this.platformId)) this.getItems()
  }

  onTitleFilter(event: Event) {
    this.titleFilter = (event.target as HTMLInputElement).value.trim().toLowerCase()
    this.applyFilters()
  }

  setStatusFilter(status: DisponibilidadFiltro) {
    this.statusFilter = status
    this.applyFilters()
  }

  setSortField(field: CampoOrdenCupon) {
    this.sortField = field
    this.applyFilters()
  }

  toggleSortDir() {
    this.sortDir = this.sortDir === 'desc' ? 'asc' : 'desc'
    this.applyFilters()
  }

  private applyFilters() {
    let result = this.items.filter(c => c.title.toLowerCase().includes(this.titleFilter))

    if (this.statusFilter !== 'TODOS') {
      const wantAvailable = this.statusFilter === 'DISPONIBLE'
      result = result.filter(c => c.isAvailable === wantAvailable)
    }

    this.dataSource.data = ordenarCupones(result, this.sortField, this.sortDir)
  }

  edit(cupon: Coupon) {
    this.cuponEnEdicion = cupon
    this.editSheet().open()
  }

  duplicar(cupon: Coupon) {
    this.router.navigate(['/local/registrar-cupon'], { state: { coupon: cupon } })
  }

  onCuponGuardado() {
    this.editSheet().closeSheet()
    this.getItems()
  }

  closeEdit() {
    this.editSheet().closeSheet()
  }

  toggleDisponible(cupon: any) {
    const deshabilitar = cupon.isAvailable
    const titulo = deshabilitar ? '¿Deshabilitar este cupón?' : '¿Habilitar este cupón?'
    const texto = deshabilitar
      ? 'El cupón no estará disponible para nuevos canjes.'
      : 'El cupón volverá a estar disponible para canjear.'
    const exito = deshabilitar ? 'El cupón fue deshabilitado.' : 'El cupón fue habilitado.'

    Swal.fire({
      title: titulo,
      text: texto,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.service.updateCupon({ isAvailable: !deshabilitar }, cupon.id).subscribe(() => {
          Swal.fire('¡Listo!', exito, 'success').then(() => this.getItems())
        })
      }
    })
  }

  getItems() {
    this.loading = true
    this.service.listCupon().subscribe({
      next: obj => {
        this.items = <Coupon[]>obj.data
        this.items = this.items.filter(c => c.rewardPartner == this.localId)
        this.dataSource = new MatTableDataSource(this.items)
        this.applyFilters()
        this.loading = false
      },
      error: () => (this.loading = false)
    })
  }
}
