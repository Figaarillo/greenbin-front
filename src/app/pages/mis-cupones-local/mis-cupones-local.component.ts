import { Component } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSortModule } from '@angular/material/sort'
import { MatTableModule, MatTableDataSource } from '@angular/material/table'
import { RouterModule } from '@angular/router'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { Coupon } from '../../services/interfaces/coupon'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import { SesionService } from '../../services/sesion/sesion.service'

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
    NavbarComponent
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
    private sesionService: SesionService
  ) {
    this.localId = this.sesionService.getUserId()
    this.getItems()
  }

  getItems() {
    this.service.listCupon().subscribe(obj => {
      this.items = <Coupon[]>obj.data
      this.dataSource = new MatTableDataSource(this.items.filter(c => c.rewardPartnerId != this.localId))
      console.log(this.items)
    })
  }

  edit(cupon: any) {
    alert('link a editar cupon')
  }
  delete(cupon: any) {
    alert('borrar cupon')
  }
}
