import { Component, inject } from '@angular/core'
import { PuntoVerde } from '../../services/interfaces/punto-verde'
import { PuntoVerdeService } from '../../services/punto-verde/punto-verde.service'
import { Router } from '@angular/router'
import Swal from 'sweetalert2'
import { Column } from '../../services/interfaces/columns'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { TableComponent } from '../../components/table/table.component'

@Component({
  selector: 'app-consultar-puntos-verdes',
  standalone: true,
  imports: [NavbarComponent, TableComponent],
  templateUrl: './consultar-puntos-verdes.component.html',
  styleUrl: './consultar-puntos-verdes.component.scss'
})
export class ConsultarPuntosVerdesComponent {
  private service = inject(PuntoVerdeService)
  columns: Column[] = []
  title: string = 'Listar Puntos Verdes'
  puntosVerdes: PuntoVerde[] = []
  constructor(private router: Router) {}
  ngOnInit(): void {
    this.columns = [
      {
        key: 'name',
        label: 'Nombre'
      },
      {
        key: 'address',
        label: 'Dirección'
      },
      {
        key: 'email',
        label: 'Email'
      },
      {
        key: 'phoneNumber',
        label: 'N° de teléfono'
      },
      {
        key: 'actions',
        label: 'Acciones'
      }
    ]
    this.getItems()
  }
  getItems() {
    const entidadInfo = JSON.parse(localStorage.getItem('entidadInfo') || '{}')
    this.service.list(entidadInfo.id).subscribe({
      next: (response: any) => {
        this.puntosVerdes = response
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
              this.router.navigate(['/entidad']) // Navega al home si se cancela
            }
          })
      }
    })
  }

  edit(id: string) {
    this.router.navigate(['/modificar-punto-verde', id])
  }

  delete(id: string) {
    const swal = Swal.mixin({
      customClass: { confirmButton: 'btn btn-success', cancelButton: 'btn btn-danger' }
    })
    swal
      .fire({
        title: '¿Eliminar este Punto Verde?',
        text: 'No podrás revertirlo.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
      })
      .then(result => {
        if (result.isConfirmed) {
          this.service.delete(id).subscribe(
            () => {
              swal.fire('¡Eliminado!', 'El punto verde fue eliminado.', 'success').then(() => this.getItems())
            },
            error => console.error(error)
          )
        }
      })
  }
}
