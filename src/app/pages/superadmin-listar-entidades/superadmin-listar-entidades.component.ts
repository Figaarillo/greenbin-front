import { Component, OnInit } from '@angular/core'
import { Router, RouterModule } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'
import { MatTooltipModule } from '@angular/material/tooltip'
import { MatRippleModule } from '@angular/material/core'
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'
import Swal from 'sweetalert2'
import { EntidadService } from '../../services/entidad/entidad.service'
import { Entidad } from '../../services/interfaces/entidad'

@Component({
  selector: 'app-superadmin-listar-entidades',
  standalone: true,
  imports: [MatIconModule, MatTooltipModule, MatRippleModule, FormsModule, CommonModule, RouterModule],
  templateUrl: './superadmin-listar-entidades.component.html',
  styleUrl: './superadmin-listar-entidades.component.scss'
})
export class SuperadminListarEntidadesComponent implements OnInit {
  entidades: Entidad[] = []
  filtered: Entidad[] = []
  search = ''
  loading = true

  constructor(
    private entidadService: EntidadService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.load()
  }

  load(): void {
    this.loading = true
    this.entidadService.list(0, 1000).subscribe({
      next: (data: any) => {
        this.entidades = data
        this.filtered = data
        this.loading = false
      },
      error: () => {
        this.loading = false
      }
    })
  }

  applyFilter(): void {
    const term = this.search.toLowerCase().trim()
    this.filtered = term
      ? this.entidades.filter(
          e =>
            e.name.toLowerCase().includes(term) ||
            e.city.toLowerCase().includes(term) ||
            e.province.toLowerCase().includes(term)
        )
      : [...this.entidades]
  }

  edit(id: string): void {
    this.router.navigate(['/modificar-entidad', id])
  }

  delete(id: string): void {
    Swal.fire({
      title: '¿Eliminar entidad?',
      text: 'Esta acción no se puede revertir.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      background: '#161b22',
      color: '#e6edf3',
      confirmButtonColor: '#f85149',
      cancelButtonColor: '#30363d'
    }).then(result => {
      if (!result.isConfirmed) return

      this.entidadService.delete(id).subscribe({
        next: () => {
          Swal.fire({
            title: 'Entidad eliminada',
            icon: 'success',
            background: '#161b22',
            color: '#e6edf3',
            confirmButtonColor: '#4caf50'
          })
          this.load()
        },
        error: () => {
          Swal.fire({
            title: 'Error al eliminar',
            icon: 'error',
            background: '#161b22',
            color: '#e6edf3',
            confirmButtonColor: '#4caf50'
          })
        }
      })
    })
  }
}
