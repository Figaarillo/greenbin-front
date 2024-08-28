import { Component } from '@angular/core'
import { MatToolbarModule } from '@angular/material/toolbar'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatButtonModule } from '@angular/material/button'
import { Entidad } from '../../services/interfaces/entidad'
import { EntidadService } from '../../services/entidad/entidad.service'
import { ActivatedRoute, RouterModule, Router, Route } from '@angular/router'
import { MatIconModule } from '@angular/material/icon'

import Swal from 'sweetalert2'

@Component({
  selector: 'app-registrar-entidad',
  standalone: true,
  imports: [
    NavbarComponent,
    MatToolbarModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './registrar-entidad.component.html',
  styleUrl: './registrar-entidad.component.scss'
})
export class RegistrarEntidadComponent {
  provincesList: { name: string }[] = [
    { name: 'Buenos Aires' },
    { name: 'Catamarca' },
    { name: 'Chaco' },
    { name: 'Chubut' },
    { name: 'Córdoba' },
    { name: 'Corrientes' },
    { name: 'Entre Ríos' },
    { name: 'Formosa' },
    { name: 'Jujuy' },
    { name: 'La Pampa' },
    { name: 'La Rioja' },
    { name: 'Mendoza' },
    { name: 'Misiones' },
    { name: 'Neuquén' },
    { name: 'Río Negro' },
    { name: 'Salta' },
    { name: 'San Juan' },
    { name: 'San Luis' },
    { name: 'Santa Cruz' },
    { name: 'Santa Fe' },
    { name: 'Santiago del Estero' },
    { name: 'Tierra del Fuego, Antártida e Islas del Atlántico Sur' },
    { name: 'Tucumán' }
  ]

  form: FormGroup

  constructor(
    private fb: FormBuilder,
    private service: EntidadService,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      province: [, Validators.required],
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
      //(?=.*[A-Z]) regla para al menos una mayuscula,
      //(?=.*[!@#$%^&*()_+{}\\[\\]:;"\'<>,.?/~`]) regla para al menos un caracter especial, cualquiera de estos: !@#$%^&*()_+{}[]:;"'<>,.?/~`
      //[A-Za-z\d!@#$%^&*()_+{}\[\]:;"'<>,.?/~]{8,}`: Asegura que la longitud de la cadena sea de al menos 8 caracteres y que contenga
      //solo letras, números y los caracteres especiales permitidos.
    })
  }
  onSubmit() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ',
        cancelButton: 'btn btn-danger'
      }
    })
    swalWithBootstrapButtons
      .fire({
        title: '¿Estas seguro que desea crear esta Entidad?',

        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
      })
      .then(result => {
        if (result.isConfirmed) {
          if (this.form.valid) {
            console.log('entra')
            console.log(this.form.value)
            this.service.create(<Entidad>this.form.value).subscribe(
              () => {
                swalWithBootstrapButtons
                  .fire({
                    title: '¡Creado con éxito!',

                    icon: 'success'
                  })
                  .then(() => {
                    this.router.navigate(['/listar-entidades'])
                  })
              },
              error => {
                swalWithBootstrapButtons
                  .fire({
                    title: 'Ha ocurrido un error',
                    icon: 'error'
                  })
                  .then(result => {
                    if (result.isConfirmed) {
                      this.router.navigate(['/registrar-entidad']) // Navega al home si se cancela
                    }
                  })
              }
            )
          } else {
            swalWithBootstrapButtons
              .fire({
                title: 'Ha ocurrido un error',
                icon: 'error'
              })
              .then(result => {
                if (result.isConfirmed) {
                  this.router.navigate(['/registrar-entidad']) // Navega al home si se cancela
                }
              })
          }
        } else {
          swalWithBootstrapButtons.fire({
            title: 'Cancelado',

            icon: 'error'
          })
        }
      })
  }
  hidePassword = true

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword
    const passwordField = document.querySelector('input[formControlName="password"]') as HTMLInputElement
    passwordField.type = this.hidePassword ? 'password' : 'text'
  }
}
