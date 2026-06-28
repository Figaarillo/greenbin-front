import { Component } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
import { MatToolbarModule } from '@angular/material/toolbar'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { EntidadService } from '../../services/entidad/entidad.service'
import { ActivatedRoute, RouterModule, Router } from '@angular/router'
import { Entidad } from '../../services/interfaces/entidad'
import { CommonModule } from '@angular/common'
import { MatOptionModule } from '@angular/material/core'
import Swal from 'sweetalert2'

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
    MatOptionModule,
    RouterModule
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
  province: String = ''
  form!: FormGroup
  id: string | null = null
  entity: Entidad[] = []
  constructor(
    private fb: FormBuilder,
    private service: EntidadService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    const prov = ''
    this.id = this.route.snapshot.paramMap.get('id')
    this.service.get(this.id!).subscribe((obj: any) => {
      console.log(obj.data)
      this.province = obj.data.province
      this.form = this.fb.group({
        name: [obj.data.name, Validators.required],
        province: [obj.data.province, Validators.required],
        city: [obj.data.city, Validators.required],
        description: [obj.data.description]
      })
      this.form.get('province')?.disable()
      this.form.get('name')?.disable()
      this.form.get('province')?.setValue(obj.data.province)
      this.form.get('city')?.disable()
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
        title: '¿Estas seguro que desea modificar esta Entidad?',
        text: 'No podras revertirlo.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar'
      })
      .then(result => {
        if (result.isConfirmed) {
          if (this.form.valid && this.id) {
            console.log('entra')
            console.log(this.form.value)
            this.service.update(<Entidad>this.form.value, this.id).subscribe(
              () => {
                swalWithBootstrapButtons
                  .fire({
                    title: '¡Editado con éxito!',
                    text: 'La entidad ha sido modificada.',
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
                      this.router.navigate(['/modificar-entidad']) // Navega al home si se cancela
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
                  this.router.navigate(['/modificar-entidad']) // Navega al home si se cancela
                }
              })
          }
        } else {
          swalWithBootstrapButtons.fire({
            title: 'Cancelado',
            text: 'La entidad no fue modificada.',
            icon: 'error'
          })
        }
      })
  }
}
