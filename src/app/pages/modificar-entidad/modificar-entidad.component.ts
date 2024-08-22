import { Component } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatToolbarModule } from '@angular/material/toolbar'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { EntidadService } from '../../services/entidad/entidad.service'
import { ActivatedRoute } from '@angular/router'
import { Entidad } from '../../services/interfaces/entidad'
import { CommonModule } from '@angular/common'
import { MatOptionModule } from '@angular/material/core'

@Component({
  selector: 'app-modificar-entidad',
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
    CommonModule,
    MatOptionModule
  ],
  templateUrl: './modificar-entidad.component.html',
  styleUrl: './modificar-entidad.component.scss'
})
export class ModificarEntidadComponent {
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

  form!: FormGroup
  id: string | null = null
  entity: Entidad[] = []
  constructor(
    private fb: FormBuilder,
    private service: EntidadService,
    private route: ActivatedRoute
  ) {
    const prov = ''
    this.id = this.route.snapshot.paramMap.get('id')
    this.service.get(this.id!).subscribe((obj: any) => {
      console.log(obj.data)

      this.form = this.fb.group({
        name: [obj.data.name, Validators.required],
        province: [obj.data.province, Validators.required],
        city: [obj.data.city, Validators.required],
        description: [obj.data.description]
      })
      this.form.get('province')?.disable()
      this.form.get('province')?.setValue(obj.data.province)
      this.form.get('city')?.disable()
    })
  }

  onSubmit() {
    if (this.form.valid && this.id) {
      console.log('entra')
      console.log(this.form.value)
      this.service.update(<Entidad>this.form.value, this.id).subscribe({
        next: response => {
          console.log(response)
        },
        error: error => {
          console.error('Error al actualizar la entidad:', error)
        }
      })
    } else {
      console.log('Form is invalid')
    }
  }
}
