import { Component } from '@angular/core'
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatToolbarModule } from '@angular/material/toolbar'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { Responsable } from '../../services/interfaces/responsable'
import { ResponsableService } from '../../services/responsable/responsable.service'
import { ActivatedRoute, RouterModule, Router, Route } from '@angular/router'
import Swal from 'sweetalert2'
import { MatIconModule } from '@angular/material/icon'

@Component({
  selector: 'app-registrar-responsable',
  standalone: true,
  imports: [
    NavbarComponent,
    MatToolbarModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './registrar-responsable.component.html',
  styleUrl: './registrar-responsable.component.scss'
})
export class RegistrarResponsableComponent {
  form: FormGroup

  constructor(
    private fb: FormBuilder,
    private service: ResponsableService,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/~`])[A-Za-z\d!@#$%^&*()_+{}\[\]:;"'<>,.?/~`]{8,}$/
          )
        ]
      ],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8,12}$')]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
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
        title: '¿Estas seguro que desea crear este Responsable?',

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
            this.service.create(<Responsable>this.form.value).subscribe(
              () => {
                swalWithBootstrapButtons
                  .fire({
                    title: '¡Creado con éxito!',

                    icon: 'success'
                  })
                  .then(() => {
                    this.router.navigate(['/listar-responsables'])
                  })
              },
              error => {
                console.log(error)
                swalWithBootstrapButtons
                  .fire({
                    title: 'Ha ocurrido un error',

                    icon: 'error'
                  })
                  .then(result => {
                    if (result.isConfirmed) {
                      this.router.navigate(['/registrar-responsable']) // Navega al home si se cancela
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
                  this.router.navigate(['/registrar-responsable']) // Navega al home si se cancela
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
