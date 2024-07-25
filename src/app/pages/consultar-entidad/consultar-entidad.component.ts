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
export class ConsultarEntidadComponent implements OnInit {
  private entityService = inject(EntidadService)
  displayedColumns: string[] = ['name', 'description', 'city', 'province', 'acciones']

  faEdit = faEdit
  faTrash = faTrash
  faSearch = faSearch
  entidades: any = []
  dataSource = []
  ngOnInit(): void {
    this.entityService.list().subscribe((response: any) => {
      this.entidades = []
      response.data.forEach((entidad: any) => {
        this.entidades.push(entidad)
      })
      this.dataSource = this.entidades
    })
  }
}
