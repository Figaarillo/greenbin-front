import { Component, inject, OnInit } from '@angular/core'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { Column } from '../../services/interfaces/columns'
import { ResponsablesService } from '../../services/responsables/responsables.service'
import { TableComponent } from '../../components/table/table.component'
import { Responsable } from '../../services/interfaces/responsaible'
import Swal from 'sweetalert2'
import { Router } from '@angular/router'
@Component({
  selector: 'app-consultar-responsables',
  standalone: true,
  imports: [NavbarComponent, TableComponent],
  templateUrl: './consultar-responsables.component.html',
  styleUrl: './consultar-responsables.component.scss'
})
export class ConsultarResponsablesComponent implements OnInit {
  private respService = inject(ResponsablesService)
  columns: Column[] = []
  title: string = 'Listar Responsables'
  responsibles: Responsable[] = []
  constructor(private router: Router) {}
  ngOnInit(): void {
    this.columns = [
      {
        key: 'firstname',
        label: 'Nombre'
      },
      {
        key: 'lastname',
        label: 'Apellido'
      },
      {
        key: 'username',
        label: 'Usuario'
      },
      {
        key: 'email',
        label: 'Email'
      },
      {
        key: 'dni',
        label: 'DNI'
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
    this.listRespo()
  }

  listRespo() {
    this.respService.list(0, 100).subscribe(resp => {
      this.responsibles = resp
    })
  }
  editResponsible(id: string) {
    this.router.navigate(['/modificar-responsable', id])
  }
  deleteResponsible(id: string) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ',
        cancelButton: 'btn btn-danger'
      }
    })
    swalWithBootstrapButtons
      .fire({
        title: '¿Estas seguro que desea eliminar este Responsable?',
        text: 'No podras revertirlo.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
      })
      .then(result => {
        if (result.isConfirmed) {
          this.respService.delete(id).subscribe(
            () => {
              swalWithBootstrapButtons
                .fire({
                  title: '¡Eliminada!',
                  text: 'El responsable ha sido eliminada.',
                  icon: 'success'
                })
                .then(() => {
                  console.log('eliminado')
                  this.listRespo()
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
      })
  }
}
