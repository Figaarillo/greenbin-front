import { Component, inject, OnInit } from '@angular/core'
import { faEdit, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { MatTableDataSource, MatTableModule } from '@angular/material/table'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIcon } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { EntidadService } from '../../services/entidad/entidad.service'
import { runInThisContext } from 'vm'
import { PageEvent, MatPaginatorModule } from '@angular/material/paginator'
import { Entidad } from '../../services/interfaces/entidad'
import { EntitiesFilterPipe } from '../../pipes/entities-filter.pipe'
@Component({
  selector: 'app-consultar-entidad',
  standalone: true,
  imports: [
    FontAwesomeModule,
    MatInputModule,
    MatFormFieldModule,
    NavbarComponent,
    MatTableModule,
    MatToolbarModule,
    MatIcon,
    MatTooltipModule,
    MatPaginatorModule,
    EntitiesFilterPipe
  ],
  templateUrl: './consultar-entidad.component.html',
  styleUrl: './consultar-entidad.component.scss'
})
export class ConsultarEntidadComponent implements OnInit {
  private entityService = inject(EntidadService)
  displayedColumns: string[] = ['name', 'description', 'city', 'province', 'acciones']

  faEdit = faEdit
  faTrash = faTrash
  faSearch = faSearch
  entidades: Entidad[] = []
  dataSource: any = []
  page: number = 0
  nPage: number = 1
  cant: number = 5
  ngOnInit(): void {
    this.entityService.list(0, 100).subscribe((response: any) => {
      this.entidades = []
      response.data.forEach((entidad: Entidad) => {
        this.entidades.push(entidad)
      })
      this.dataSource = new MatTableDataSource(this.entidades)
    })
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  nextPage() {
    console.log(this.entidades.length)
    console.log(this.page)
    if (this.page <= this.entidades.length) {
      console.log('entra')
      this.nPage += 1
      this.page += this.cant
      console.log(this.page)
    }
  }

  prevPage() {
    if (this.page > 0) {
      this.nPage -= 1
      this.page -= this.cant
    }
  }

  onSelectChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement
    this.cant = Number(selectElement.value)
    console.log('Selected value:', this.cant)
  }
}
