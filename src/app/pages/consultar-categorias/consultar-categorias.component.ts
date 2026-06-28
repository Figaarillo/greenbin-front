import { Component, inject, OnInit } from '@angular/core'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { Column } from '../../services/interfaces/columns'
import { WasteCategoryService } from '../../services/wasteCategory/waste-category.service'
import { TableComponent } from '../../components/table/table.component'
import Swal from 'sweetalert2'
import { Router } from '@angular/router'

@Component({
  selector: 'app-consultar-categorias',
  standalone: true,
  imports: [NavbarComponent, TableComponent],
  templateUrl: './consultar-categorias.component.html',
  styleUrl: './consultar-categorias.component.scss'
})
export class ConsultarCategoriasComponent implements OnInit {
  private service = inject(WasteCategoryService)
  columns: Column[] = []
  title: string = 'Categorías de Residuo'
  categorias: any[] = []
  constructor(private router: Router) {}

  ngOnInit(): void {
    this.columns = [
      { key: 'name', label: 'Nombre' },
      { key: 'description', label: 'Descripción' },
      { key: 'pointsPerWeight', label: 'Puntos/kg' },
      { key: 'co2', label: 'CO2 (kg)' },
      { key: 'isActive', label: 'Estado' },
      { key: 'actions', label: 'Acciones' }
    ]
    this.listCategorias()
  }

  listCategorias() {
    this.service.list(0, 100, true).subscribe({
      next: (response: any) => {
        console.log('response:', response)
        console.log('primer item:', response[0])
        this.categorias = response.map((c: any) => ({
          ...c,
          isActive: c.isActive ? 'Habilitado' : 'Deshabilitado'
        }))
      },
      error: () => {
        Swal.fire({ title: 'Ha ocurrido un error', icon: 'error' }).then(() => {
          this.router.navigate(['/entidad'])
        })
      }
    })
  }

  editCategoria(id: string) {
    this.router.navigate(['/modificar-categoria', id])
  }

  toggleCategoria(id: string) {
    const categoria = this.categorias.find(c => c.id === id)
    const habilitada = categoria?.isActive === 'Habilitado'
    const titulo = habilitada ? '¿Deshabilitar esta categoría?' : '¿Habilitar esta categoría?'
    const texto = habilitada
      ? 'La categoría no estará disponible para nuevas entregas.'
      : 'La categoría volverá a estar disponible.'
    const exito = habilitada ? 'Categoría deshabilitada.' : 'Categoría habilitada.'

    Swal.fire({
      title: titulo,
      text: texto,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed) {
        this.service.toggle(id, !habilitada).subscribe(() => {
          Swal.fire('¡Listo!', exito, 'success').then(() => this.listCategorias())
        })
      }
    })
  }
}
