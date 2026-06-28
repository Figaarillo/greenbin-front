import { StorageService } from '../../services/storage/storage.service'
import { Component, inject, OnInit } from '@angular/core'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { Column } from '../../services/interfaces/columns'
import { VecinoService } from '../../services/vecino/vecino.service'
import { TableComponent } from '../../components/table/table.component'
import Swal from 'sweetalert2'
import { Router } from '@angular/router'

@Component({
  selector: 'app-consultar-vecinos',
  standalone: true,
  imports: [NavbarComponent, TableComponent],
  templateUrl: './consultar-vecinos.component.html',
  styleUrl: './consultar-vecinos.component.scss'
})
export class ConsultarVecinosComponent implements OnInit {
  private storage = inject(StorageService)
  private vecinoService = inject(VecinoService)
  columns: Column[] = []
  title: string = 'Listar Vecinos'
  vecinos: any[] = []
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.columns = [
      { key: 'firstname', label: 'Nombre' },
      { key: 'lastname', label: 'Apellido' },
      { key: 'dni', label: 'DNI' },
      { key: 'email', label: 'Email' },
      { key: 'isActive', label: 'Estado' }
    ]
    this.listVecinos()
  }

  listVecinos() {
    const entidadInfo = JSON.parse(this.storage.getItem('entidadInfo') || '{}')
    this.vecinoService.list(entidadInfo.id, true).subscribe({
      next: (response: any) => {
        this.vecinos = response.data.map((v: any) => ({
          ...v,
          isActive: v.isActive ? 'Habilitado' : 'Deshabilitado'
        }))
      },
      error: () => {
        Swal.fire({ title: 'Ha ocurrido un error', icon: 'error' }).then(() => {
          this.router.navigate(['/entidad'])
        })
      }
    })
  }

  editVecino(id: string) {
    this.router.navigate(['/modificar-vecino', id])
  }

  deleteVecino(id: string) {
    const swal = Swal.mixin({
      customClass: { confirmButton: 'btn btn-success', cancelButton: 'btn btn-danger' }
    })
    swal
      .fire({
        title: '¿Deshabilitar este vecino?',
        text: 'El vecino no podrá acceder a la aplicación.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
      })
      .then(result => {
        if (result.isConfirmed) {
          this.vecinoService.delete(id).subscribe(
            () => {
              swal
                .fire({ title: '¡Deshabilitado!', text: 'El vecino fue deshabilitado.', icon: 'success' })
                .then(() => this.listVecinos())
            },
            error => console.error(error)
          )
        }
      })
  }
}
