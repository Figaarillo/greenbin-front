import { Component, inject, OnInit, ViewChild } from '@angular/core'
import { FormBuilder, FormGroup, FormsModule, NgForm, ReactiveFormsModule, Validators } from '@angular/forms'
import { MatButton, MatButtonModule } from '@angular/material/button'
import { MatCardModule } from '@angular/material/card'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIcon } from '@angular/material/icon'
import { MatInput } from '@angular/material/input'
import { MatToolbar } from '@angular/material/toolbar'
import { confirmPasswordValidator, PasswordStateMatcher } from './custom-validator'
import { LocalAdherido } from '../../services/interfaces/local-adherido'
import { LocalAdheridoService } from '../../services/local-adherido/local-adherido.service'
import Swal from 'sweetalert2'
import { ActivatedRoute, RouterModule, Router } from '@angular/router'
import jwt_decode from 'jwt-decode'
import { MapInputComponent } from '../../components/map-input/map-input.component'
import { EntidadService } from '../../services/entidad/entidad.service'
import { Entidad } from '../../services/interfaces/entidad'
import { MatSelectModule } from '@angular/material/select'
import { CommonModule } from '@angular/common'
@Component({
  selector: 'app-registrar-local',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIcon,
    MatInput,
    MatToolbar,
    MapInputComponent,
    MatSelectModule,
    RouterModule,
    CommonModule
  ],
  templateUrl: './registrar-local.component.html',
  styleUrl: './registrar-local.component.scss'
})
export class RegistrarLocalComponent implements OnInit {
  title: string = 'Registrarse'
  hidePassword = true
  token = ''
  sign = ''
  entitySelect = ''
  entities: Entidad[] = []
  disabled: boolean = true
  @ViewChild(MapInputComponent) mapCompnent!: MapInputComponent
  constructor(
    private localService: LocalAdheridoService,
    private router: Router,
    private entityServices: EntidadService
  ) {}

  ngOnInit(): void {
    this.localService.authenticateAfip().subscribe(resp => {
      this.token = resp.token
      this.sign = resp.sign
    })
    this.entityServices.list(0, 100).subscribe((resp: any) => {
      console.log('resp')
      console.log(resp)
      this.entities = resp
      console.log('%%%')
      console.log(this.entities)
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
      latitude: [-99999, [Validators.required, Validators.min(-999)]],
      longitude: [-99999, [Validators.required, Validators.min(-999)]],
      confirmPassword: ['', Validators.required]
    },
    { validators: confirmPasswordValidator }
  )

  coordsByAdress() {
    this.mapCompnent.getByAddress(this.formGroup.get('address')?.value!)
  }
  getCoordinates(coordinates: google.maps.LatLngLiteral) {
    console.log('$$')
    console.log(coordinates)
    console.log('$$$$$$')
    this.formGroup.get('latitude')?.setValue(coordinates.lat)
    this.formGroup.get('longitude')?.setValue(coordinates.lng)
  }

  register() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success ',
        cancelButton: 'btn btn-danger'
      }
    })

    if (this.formGroup.valid) {
      console.log(this.formGroup.value)
      let localToSave = <LocalAdherido>this.formGroup.value
      localToSave.coordinates = {
        latitude: this.formGroup.get('latitude')?.value!,
        longitude: this.formGroup.get('longitude')?.value!
      }
      localToSave.entityId = this.entitySelect
      this.localService.create(localToSave).subscribe(
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
  onSelectChange(value: string) {
    this.entitySelect = value
  }
}
