import { Component } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { Router, RouterModule } from '@angular/router'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import Swal from 'sweetalert2'
import { EntidadService } from '../../services/entidad/entidad.service'
import { Entidad } from '../../services/interfaces/entidad'

@Component({
  selector: 'app-superadmin-registrar-entidad',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './superadmin-registrar-entidad.component.html',
  styleUrl: './superadmin-registrar-entidad.component.scss'
})
export class SuperadminRegistrarEntidadComponent {
  hidePassword = true

  provincesList = [
    'Buenos Aires',
    'Catamarca',
    'Chaco',
    'Chubut',
    'Córdoba',
    'Corrientes',
    'Entre Ríos',
    'Formosa',
    'Jujuy',
    'La Pampa',
    'La Rioja',
    'Mendoza',
    'Misiones',
    'Neuquén',
    'Río Negro',
    'Salta',
    'San Juan',
    'San Luis',
    'Santa Cruz',
    'Santa Fe',
    'Santiago del Estero',
    'Tierra del Fuego, Antártida e Islas del Atlántico Sur',
    'Tucumán'
  ]

  form: FormGroup

  constructor(
    private fb: FormBuilder,
    private service: EntidadService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      province: ['', Validators.required],
      city: ['', Validators.required],
      description: [''],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/~`])[A-Za-z\d!@#$%^&*()_+{}\[\]:;"'<>,.?/~`]{8,}$/
          )
        ]
      ]
    })
  }

  onSubmit(): void {
    if (this.form.invalid) return

    Swal.fire({
      title: '¿Confirmar creación?',
      text: 'Se registrará una nueva entidad en el sistema.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      background: '#161b22',
      color: '#e6edf3',
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#f85149'
    }).then(result => {
      if (!result.isConfirmed) return

      this.service.create(this.form.value as Entidad).subscribe({
        next: () => {
          Swal.fire({
            title: '¡Entidad creada!',
            icon: 'success',
            background: '#161b22',
            color: '#e6edf3',
            confirmButtonColor: '#4caf50'
          }).then(() => this.router.navigateByUrl('/superadmin/dashboard/listar-entidades'))
        },
        error: () => {
          Swal.fire({
            title: 'Error al crear la entidad',
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
