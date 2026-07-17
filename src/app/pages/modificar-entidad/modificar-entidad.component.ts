import { Component } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatSelectModule } from '@angular/material/select'
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
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    CommonModule,
    MatOptionModule,
    RouterModule
  ],
  templateUrl: './modificar-entidad.component.html',
  styleUrl: './modificar-entidad.component.scss'
})
export class ModificarEntidadComponent {
  province: String = ''
  form!: FormGroup
  id: string | null = null
  constructor(
    private fb: FormBuilder,
    private service: EntidadService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.id = this.route.snapshot.paramMap.get('id')
    this.service.get(this.id!).subscribe((obj: any) => {
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
              () => {
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
