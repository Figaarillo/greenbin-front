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
    this.service.list().subscribe({
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
              this.router.navigate(['/admin']) // Navega al home si se cancela
            }
          })
      }
    })
  }

  edit(id: string) {
    alert('a editar punto verde')
    //this.router.navigate(['/modificar-responsable', id])
    //localStorage.setItem('respoEdit', 'true')
  }
  delete(id: string) {
    alert('a eliminar punto verde')
    /*
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ',
        cancelButton: 'btn btn-danger'
      }
    })
    swalWithBootstrapButtons
      .fire({
        title: '¿Estas seguro que desea eliminar este Punto Verde?',
        text: 'No podras revertirlo.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
      })
      .then(result => {
        if (result.isConfirmed) {
          this.service.delete(id).subscribe(
            () => {
              swalWithBootstrapButtons
                .fire({
                  title: '¡Eliminada!',
                  text: 'El responsable ha sido eliminada.',
                  icon: 'success'
                })
                .then(() => {
                  console.log('eliminado')
                  this.getItems()
                })
            },
            error => {
              console.error('Error al eliminar el responsable:', error)
            }
          )
        } else {
          swalWithBootstrapButtons.fire({
            title: 'Cancelado',
            text: 'El responsable no fue eliminado.',
            icon: 'error'
          })
        }
      })*/
  }
}
