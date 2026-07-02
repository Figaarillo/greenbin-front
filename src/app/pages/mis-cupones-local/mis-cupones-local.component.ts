import { Component, viewChild } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { MatTableDataSource } from '@angular/material/table'
import { PageHeaderComponent } from '../../components/page-header/page-header.component'
import { BottomSheetComponent } from '../../components/bottom-sheet/bottom-sheet.component'
import { ModificarCuponComponent } from '../modificar-cupon/modificar-cupon.component'
import { Coupon } from '../../services/interfaces/coupon'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { SesionService } from '../../services/sesion/sesion.service'
import Swal from 'sweetalert2'

@Component({
  selector: 'app-mis-cupones-local',
  standalone: true,
  imports: [MatIconModule, PageHeaderComponent, BottomSheetComponent, ModificarCuponComponent],
  templateUrl: './mis-cupones-local.component.html',
  styleUrl: './mis-cupones-local.component.scss'
})
export class MisCuponesLocalComponent {
  private readonly editSheet = viewChild.required(BottomSheetComponent)

  dataSource: MatTableDataSource<any> = new MatTableDataSource()
  items: Coupon[] = []
  localId: string = ''
  titleFilter = ''
  cuponEnEdicion: Coupon | null = null

  constructor(
    private service: LocalAdheridoService,
    private sesionService: SesionService
  ) {
    this.localId = this.sesionService.getUserId()
    this.getItems()
  }

  onTitleFilter(event: Event) {
    this.titleFilter = (event.target as HTMLInputElement).value.trim().toLowerCase()
    this.applyFilters()
  }

  private applyFilters() {
    this.dataSource.data = this.items.filter(c => c.title.toLowerCase().includes(this.titleFilter))
  }

  edit(cupon: Coupon) {
    this.cuponEnEdicion = cupon
    this.editSheet().open()
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
    this.service.listCupon().subscribe(obj => {
      this.items = <Coupon[]>obj.data
      this.items = this.items.filter(c => c.rewardPartner == this.localId)
      this.dataSource = new MatTableDataSource(this.items)
      this.applyFilters()
    })
  }
}
