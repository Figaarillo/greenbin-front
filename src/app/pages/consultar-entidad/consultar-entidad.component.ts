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
import e from 'express'
import Swal from 'sweetalert2'
import { TableComponent } from '../../components/table/table.component'
import { Column } from '../../services/interfaces/columns'
import { Router } from '@angular/router'
import { error } from 'console'

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
    EntitiesFilterPipe,
    TableComponent
  ],
  templateUrl: './consultar-entidad.component.html',
  styleUrl: './consultar-entidad.component.scss'
})
export class ConsultarEntidadComponent implements OnInit {
  private entityService = inject(EntidadService)
  columns: Column[] = []

  faEdit = faEdit
  faTrash = faTrash
  faSearch = faSearch
  entidades: Entidad[] = []
  dataSource: any = []
  page: number = 0
  nPage: number = 1
  cant: number = 5
  title = 'Entidades'
  constructor(private router: Router) {}
  ngOnInit(): void {
    this.columns = [
      {
        key: 'name',
        label: 'Razon Social'
      },
      {
        key: 'description',
        label: 'Descripción'
      },
      {
        key: 'city',
        label: 'Ciudad'
      },
      {
        key: 'province',
        label: 'Provincia'
      },
      {
        key: 'actions',
        label: 'Acciones'
      }
    ]
    this.listEntities()
  }
  listEntities() {
    this.entityService.list(0, 100).subscribe({
      next: (response: any) => {
        this.entidades = response
        this.dataSource = new MatTableDataSource(this.entidades)
      },
      error: err => {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            cancelButton: 'btn btn-danger'
          }
        })
        swalWithBootstrapButtons
          .fire({
            title: 'Ha ocurrido un error',
            icon: 'error'
          })
          .then(result => {
            if (result.isConfirmed) {
              this.router.navigate(['']) // Navega al home si se cancela
            }
          })
      }
    })
  }

  applyFilter(event: Event) {
    console.log('aka')
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  nextPage() {
    if (this.page <= this.entidades.length) {
      console.log('entra')
      this.nPage += 1
      this.page += this.cant
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
  }
  editEntity(id: string) {
    console.log('%$$')
    this.router.navigate(['/modificar-entidad', id])
  }

  deleteEntity(id: string) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ',
        cancelButton: 'btn btn-danger'
      }
    })
    swalWithBootstrapButtons
      .fire({
        title: '¿Estas seguro que desea eliminar esta Entidad?',
        text: 'No podras revertirlo.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
      })
      .then(result => {
        if (result.isConfirmed) {
          this.entityService.delete(id).subscribe(
            () => {
              swalWithBootstrapButtons
                .fire({
                  title: '¡Eliminada!',
                  text: 'La entidad ha sido eliminada.',
                  icon: 'success'
                })
                .then(() => {
                  console.log('eliminado')
                  this.listEntities()
                })
            },
            error => {
              console.error('Error al eliminar la entidad:', error)
            }
          )
        } else {
          swalWithBootstrapButtons.fire({
            title: 'Cancelado',
            text: 'La entidad no fue eliminada.',
            icon: 'error'
          })
        }
      })
    // this.entityService.delete(id).subscribe(
    //   () => {
    //     this.entityService.list(0, 100).subscribe((response: any) => {
    //       this.entidades = []
    //       response.data.forEach((entidad: Entidad) => {
    //         this.entidades.push(entidad)
    //       })
    //       this.dataSource = new MatTableDataSource(this.entidades)
    //     })
    //     console.log('eliminado');
    //   },
    //   (error) => {
    //     console.error('Error al eliminar la entidad:', error);
    //   }
    // );
  }
}
