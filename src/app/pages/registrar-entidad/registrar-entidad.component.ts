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
      password: ['', [Validators.required, Validators.minLength(8)]]
      //telefono: ['3514967254', [Validators.required, Validators.pattern(/^\d+$/)]],
      //email: ['munivm@gmail.com', [Validators.required, Validators.email]]
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
