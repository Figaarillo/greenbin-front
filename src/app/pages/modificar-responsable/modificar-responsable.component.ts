import { Component } from '@angular/core'
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatToolbarModule } from '@angular/material/toolbar'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { ResponsableService } from '../../services/responsable/responsable.service'
import { ActivatedRoute, RouterModule, Router } from '@angular/router'
import { Responsable } from '../../services/interfaces/responsable'
import Swal from 'sweetalert2'
@Component({
  selector: 'app-modificar-responsable',
  standalone: true,
  imports: [
    NavbarComponent,
    MatToolbarModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './modificar-responsable.component.html',
  styleUrl: './modificar-responsable.component.scss'
})
export class ModificarResponsableComponent {
  form!: FormGroup
  id: string | null = null

  constructor(
    private fb: FormBuilder,
    private service: ResponsableService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.id = this.route.snapshot.paramMap.get('id')
    this.service.get(this.id!).subscribe((obj: any) => {
      this.form = this.fb.group({
        firstname: [obj.data.firstname, [Validators.required, Validators.minLength(2)]],
        lastname: [obj.data.lastname, [Validators.required, Validators.minLength(2)]],
        username: [obj.data.username, [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
        dni: [obj.data.dni, [Validators.required, Validators.pattern('^[0-9]{8,12}$')]],
        phoneNumber: [obj.data.phoneNumber, [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
      })
      this.form.get('dni')?.disable()
      this.form.get('lastname')?.disable()
      this.form.get('firstname')?.disable()
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
        title: '¿Estas seguro que desea modificar este Usuario?',
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
            this.service.update(<Responsable>this.form.value, this.id).subscribe(
              () => {
                swalWithBootstrapButtons
                  .fire({
                    title: '¡El Usuario ha sido modificado.!',

                    icon: 'success'
                  })
                  .then(() => {
                    this.router.navigate(['/listar-responsables'])
                  })
              },
              error => {
                console.error('Error al eliminar la entidad:', error)
              }
            )
          } else {
            console.log('Form is invalid')
          }
        } else {
          swalWithBootstrapButtons.fire({
            title: 'Cancelado',

            icon: 'error'
          })
        }
      })
  }
}
