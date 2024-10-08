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
import jwt_decode from 'jwt-decode'
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
  token = ''
  sign = ''
  disabled: boolean = true
  constructor(
    private localService: LocalAdheridoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.localService.authenticateAfip().subscribe(resp => {
      this.token = resp.token
      this.sign = resp.sign
    })
  }
  private readonly _formBuilder = inject(FormBuilder)
  passwordStateMatcher = new PasswordStateMatcher()
  formGroup = this._formBuilder.nonNullable.group(
    {
      name: [{ value: '', disabled: this.disabled }, Validators.required],
      address: [{ value: '', disabled: this.disabled }, Validators.required],
      cuit: ['', Validators.required],
      username: [{ value: '', disabled: this.disabled }, Validators.required],
      email: [{ value: '', disabled: this.disabled }, [Validators.required, Validators.email]],
      phoneNumber: [
        { value: '', disabled: this.disabled },
        [Validators.required, Validators.pattern('^[0-9]{10,15}$')]
      ],
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

  cuitAuth(cuit: any) {
    console.log(cuit)
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ',
        cancelButton: 'btn btn-danger'
      }
    })
    Swal.fire({
      title: 'Cargando',
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false
    })

    Swal.showLoading()

    this.localService.authenthicateCuit(cuit, this.token, this.sign).subscribe(
      () => {
        Swal.close()
        swalWithBootstrapButtons.fire({
          title: '¡Cuit validado con éxito!',

          icon: 'success'
        })
        this.disabled = false

        this.formGroup.get('name')?.enable()
        this.formGroup.get('address')?.enable()
        this.formGroup.get('username')?.enable()
        this.formGroup.get('email')?.enable()
        this.formGroup.get('phoneNumber')?.enable()
      },
      error => {
        console.log(error)
        swalWithBootstrapButtons.fire({
          title: 'Ha ocurrido un error al validar su cuit.',
          icon: 'error'
        })
      }
    )
  }
}
