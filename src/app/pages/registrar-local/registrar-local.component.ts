import { Component, inject, OnInit } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButton } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIcon } from '@angular/material/icon'
import { MatInput } from '@angular/material/input'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { MatToolbar } from '@angular/material/toolbar'
import { confirmPasswordValidator, PasswordStateMatcher } from './custom-validator'
import { LocalAdherido } from '../../services/interfaces/local-adherido'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import Swal from 'sweetalert2'
import { ActivatedRoute, RouterModule, Router } from '@angular/router'

@Component({
  selector: 'app-registrar-local',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButton,
    MatFormFieldModule,
    MatIcon,
    MatInput,
    NavbarComponent,
    MatToolbar
  ],
  templateUrl: './registrar-local.component.html',
  styleUrl: './registrar-local.component.scss'
})
export class RegistrarLocalComponent implements OnInit {
  title: string = 'Registrarse'
  hidePassword = true
  constructor(
    private localService: LocalAdheridoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.localService.authenticateAfip().subscribe(resp => {
      console.log(resp)
    })
  }
  private readonly _formBuilder = inject(FormBuilder)
  passwordStateMatcher = new PasswordStateMatcher()
  formGroup = this._formBuilder.nonNullable.group(
    {
      name: ['', Validators.required],
      address: ['', Validators.required],
      cuit: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      password: [
        '',
        [
          Validators.required,
          Validators.pattern(
            /^(?=.*[A-Z])(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/~`])[A-Za-z\d!@#$%^&*()_+{}\[\]:;"'<>,.?/~`]{8,}$/
          )
        ]
      ],
      confirmPassword: ['', Validators.required]
    },
    { validators: confirmPasswordValidator }
  )

  register() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ',
        cancelButton: 'btn btn-danger'
      }
    })

    if (this.formGroup.valid) {
      console.log('entra')
      this.localService.create(<LocalAdherido>this.formGroup.value).subscribe(
        () => {
          swalWithBootstrapButtons
            .fire({
              title: '¡Creado con éxito!',

              icon: 'success'
            })
            .then(() => {
              this.router.navigate([''])
            })
        },
        error => {
          console.log(error.error.message)
          swalWithBootstrapButtons
            .fire({
              title: 'Ha ocurrido un error',
              icon: 'error'
            })
            .then(result => {
              if (result.isConfirmed) {
                this.router.navigate(['/registrar-local']) // Navega al home si se cancela
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
            this.router.navigate(['/registrar-local']) // Navega al home si se cancela
          }
        })
    }
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword
    const passwordField = document.querySelector('input[formControlName="password"]') as HTMLInputElement
    passwordField.type = this.hidePassword ? 'password' : 'text'
  }
}
