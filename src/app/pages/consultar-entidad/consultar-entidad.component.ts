import { Component } from '@angular/core'
import { faEdit, faTrash, faSearch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { MatTableDataSource, MatTableModule } from '@angular/material/table'
import { MatToolbarModule } from '@angular/material/toolbar'
import { MatIcon } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
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
    MatTooltipModule
  ],
  templateUrl: './consultar-entidad.component.html',
  styleUrl: './consultar-entidad.component.scss'
})
export class ConsultarEntidadComponent {
  displayedColumns: string[] = ['Id', 'razon_social', 'example', 'example2', 'acciones']

  faEdit = faEdit
  faTrash = faTrash
  faSearch = faSearch
  entidades = [
    {
      id: 1,
      razon_social: 'Huinca Renanco',
      example: 'example',
      example2: 'example',
      example3: 'example'
    },
    {
      id: 2,
      razon_social: 'Villa Maria',
      example: 'example',
      example2: 'example',
      example3: 'example'
    },
    {
      id: 3,
      razon_social: 'Campillo',
      example: 'example',
      example2: 'example',
      example3: 'example'
    }
  ]

  dataSource = new MatTableDataSource(this.entidades)
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }
}
