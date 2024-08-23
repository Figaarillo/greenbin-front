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
    MatButtonModule
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
    private service: EntidadService
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
    if (this.form.valid) {
      this.service.create(<Entidad>this.form.value).subscribe({
        next(x) {
          console.log('response: ' + x)
        },
        error(err) {
          console.error('error')
          console.log(err)
        },
        complete() {
          alert('done')
        }
      })
    } else {
      console.log('Form is invalid')
    }
  }
}
