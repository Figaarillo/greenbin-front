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
import { MatTableModule } from '@angular/material/table'
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
    MatSelectModule,
    MatTableModule
  ],
  templateUrl: './entrega-residuos.component.html',
  styleUrl: './entrega-residuos.component.scss'
})
export class EntregaResiduosComponent {
  dniValidated = true
  totalPuntos = 0
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
  detalle: { puntos: number; cantidad: number; residuo: string }[] = []

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
            title: 'El usuario no existe.',
            icon: 'error'
          })
        }
      )
    }
  }

  aggResiduo() {
    const cantidad = this.form.value.kilos
    const residuoFiltrado = this.categorias.filter(resp => {
      return resp.id == this.form.value.categoria
    })
    const residuo = residuoFiltrado[0].name
    const puntos = residuoFiltrado[0].points
    this.totalPuntos = this.totalPuntos + residuoFiltrado[0].points * cantidad
    console.log(this.form)
    this.detalle.push({ puntos, cantidad, residuo })
  }

  delete(item: any) {
    this.detalle = this.detalle.filter(detalle => detalle.residuo !== item.residuo)
    this.totalPuntos = this.totalPuntos - item.cantidad * item.puntos
  }
}
