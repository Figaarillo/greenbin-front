import { Component, inject, OnInit } from '@angular/core'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { MatTableDataSource } from '@angular/material/table'
import { EntidadService } from '../../services/entidad/entidad.service'
import { Entidad } from '../../services/interfaces/entidad'
import Swal from 'sweetalert2'
import { TableComponent } from '../../components/table/table.component'
import { Column } from '../../services/interfaces/columns'
import { Router } from '@angular/router'

@Component({
  selector: 'app-consultar-entidad',
  standalone: true,
  imports: [NavbarComponent, TableComponent],
  templateUrl: './consultar-entidad.component.html',
  styleUrl: './consultar-entidad.component.scss'
})
export class ConsultarEntidadComponent implements OnInit {
  private entityService = inject(EntidadService)
  columns: Column[] = []

  entidades: Entidad[] = []
  dataSource: any = []
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
      error: () => {
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
    const filterValue = (event.target as HTMLInputElement).value
    this.dataSource.filter = filterValue.trim().toLowerCase()
  }

  editEntity(id: string) {
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
          this.entityService.delete(id).subscribe(() => {
            swalWithBootstrapButtons
              .fire({
                title: '¡Eliminada!',
                text: 'La entidad ha sido eliminada.',
                icon: 'success'
              })
              .then(() => this.listEntities())
          })
        } else {
          swalWithBootstrapButtons.fire({
            title: 'Cancelado',
            text: 'La entidad no fue eliminada.',
            icon: 'error'
          })
        }
      })
  }
}
