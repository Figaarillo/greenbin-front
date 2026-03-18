import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule, MatTableDataSource } from '@angular/material/table'
import { MatTooltipModule } from '@angular/material/tooltip'
import { RouterModule, Router } from '@angular/router'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { Coupon } from '../../services/interfaces/coupon'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { SesionService } from '../../services/sesion/sesion.service'
import Swal from 'sweetalert2'

@Component({
  selector: 'app-mis-cupones-local',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    RouterModule,
    NavbarComponent,
    MatTooltipModule
  ],
  templateUrl: './mis-cupones-local.component.html',
  styleUrl: './mis-cupones-local.component.scss'
})
export class MisCuponesLocalComponent {
  dataSource: MatTableDataSource<any> = new MatTableDataSource()
  puntos = 0
  items: Coupon[] = []
  localId: string = ''
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }
  constructor(
    private service: LocalAdheridoService,
    private sesionService: SesionService,
    private router: Router
  ) {
    this.localId = this.sesionService.getUserId()
    this.getItems()
  }

  verMas(cupon: any) {
    Swal.fire({
      title: cupon.title,
      html: `
      <p><b>Descripción:</b> ${cupon.description}</p>
      <p><b>Descuento:</b> ${cupon.discount}%</p>
      <p><b>Costo:</b> ${cupon.costInPoints} puntos</p>
      <p><b>Días de vigencia:</b> ${cupon.validDays}</p>
      <p><b>Estado:</b> ${cupon.isAvailable ? 'Disponible' : 'No disponible'}</p>
    `,
      icon: 'info'
    })
  }

  edit(cupon: any) {
    this.router.navigate(['/modificar-cupon', cupon.id])
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
      console.log('mi id es ' + this.localId)
      this.dataSource = new MatTableDataSource(this.items.filter(c => c.rewardPartner == this.localId))
      console.log(this.items)
    })
  }
}
