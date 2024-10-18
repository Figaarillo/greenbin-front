import { Component, Inject, inject } from '@angular/core'
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { MatDividerModule } from '@angular/material/divider'
import { MatChipsModule } from '@angular/material/chips'
import { MatSelectModule } from '@angular/material/select'
import Swal from 'sweetalert2'
import { VecinoService } from '../../services/vecino/vecino.service'

@Component({
  selector: 'app-entrega-residuos',
  standalone: true,
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    NavbarComponent,
    ReactiveFormsModule,
    MatChipsModule,
    MatDividerModule,
    MatSelectModule
  ],
  templateUrl: './entrega-residuos.component.html',
  styleUrl: './entrega-residuos.component.scss'
})
export class EntregaResiduosComponent {
  dniValidated = false
  categorias: any[] = [
    {
      id: '1',
      name: 'carton',
      points: 500
    },
    {
      id: '2',
      name: 'vidrio',
      points: 3000
    },
    {
      id: '3',
      name: 'plástico',
      points: 1500
    },
    {
      id: '4',
      name: 'metal',
      points: 5000
    }
  ]
  form!: FormGroup
  dniValidator!: FormGroup

  constructor(
    private fb: FormBuilder,
    private vecinoService: VecinoService
  ) {
    this.dniValidator = this.fb.group({
      dni: ['', [Validators.required]]
    })
    this.form = this.fb.group({
      categoria: [{}],
      kilos: ['']
    })
  }

  onSubmit() {}

  validateDni() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ',
        cancelButton: 'btn btn-danger'
      }
    })
    if (this.dniValidator.valid) {
      const dni = this.dniValidator.value.dni
      Swal.fire({
        title: 'Cargando',
        showConfirmButton: false,
        allowOutsideClick: false,
        allowEscapeKey: false
      })

      Swal.showLoading()

      this.vecinoService.validateDni(dni).subscribe(
        res => {
          Swal.close()
          this.dniValidated = true
        },
        err => {
          Swal.close()
          swalWithBootstrapButtons.fire({
            title: 'Ha ocurrido un error al validar su cuit.',
            icon: 'error'
          })
        }
      )
    }
  }
}
