import { Component, OnInit } from '@angular/core'
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatToolbarModule } from '@angular/material/toolbar'
import { Router, RouterModule } from '@angular/router'
import { Vecino } from '../../services/interfaces/vecino'
import { VecinoService } from '../../services/vecino/vecino.service'
import { EntidadService } from '../../services/entidad/entidad.service'
import { Entidad } from '../../services/interfaces/entidad'
import { MatSelectModule } from '@angular/material/select'
import { CommonModule } from '@angular/common'
import { StorageService } from '../../services/storage/storage.service'
import Swal from 'sweetalert2'

@Component({
  selector: 'app-registrar-vecino',
  standalone: true,
  imports: [
    MatToolbarModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    CommonModule
  ],
  templateUrl: './registrar-vecino.component.html',
  styleUrl: './registrar-vecino.component.scss'
})
export class RegistrarVecinoComponent implements OnInit {
  form: FormGroup
  hidePassword = true
  entities: Entidad[] = []
  constructor(
    private fb: FormBuilder,
    private vecinoService: VecinoService,
    private entityServices: EntidadService,
    private storage: StorageService,
    private router: Router
  ) {
    this.form = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      entityId: ['', [Validators.required]],
      password: ['', [Validators.required, this.passwordValidator]],
      birthdate: ['', [Validators.required, this.dateValidator]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8,9}$')]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
    })
  }
  entitySelect = ''
  ngOnInit(): void {
    this.entityServices.list(0, 100).subscribe((resp: any) => {
      this.entities = resp
      console.log('Se listan las entidades \n', this.entities)
    })
  }
  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || ''
    const errors: ValidationErrors = {}

    if (value.length < 8) {
      errors['minlength'] = true
    }
    if (!/[a-z]/.test(value)) {
      errors['missingLowercase'] = true
    }
    if (!/[A-Z]/.test(value)) {
      errors['missingUppercase'] = true
    }
    if (!/[!@#$%^&*()_+{}\[\]:;"'<>,.?/~`]/.test(value)) {
      errors['missingSpecial'] = true
    }

    return Object.keys(errors).length > 0 ? errors : null
  }

  // Validador para que la fecha de nacimiento sea menor a la actual
  dateValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const inputDate = new Date(control.value)
    const currentDate = new Date()
    // Comparar las fechas
    if (inputDate >= currentDate) {
      return { invalidDate: true } // Si la fecha es igual o mayor que la actual
    }
    return null // Si es válida
  }

  setDateFormat(): void {
    const currentDate = new Date()
    const day = ('0' + currentDate.getDate()).slice(-2)
    const month = ('0' + (currentDate.getMonth() + 1)).slice(-2)
    const year = currentDate.getFullYear()
    this.form.get('birthdate')?.setValue(`${day}/${month}/${year}`)
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword
    const passwordField = document.querySelector('input[formControlName="password"]') as HTMLInputElement
    passwordField.type = this.hidePassword ? 'password' : 'text'
  }

  onSelectChange(value: string) {
    this.entitySelect = value
  }
  onSubmit() {
    if (this.form.valid) {
      this.setDateFormat()
      this.vecinoService.create(<Vecino>this.form.value).subscribe({
        next: () => {
          // El alta no inicia sesión: descartamos cualquier sesión previa viva
          // en este dispositivo para no quedar navegando con otra identidad.
          this.storage.clear()
          Swal.fire({
            icon: 'success',
            title: 'Cuenta creada',
            text: 'Ya podés iniciar sesión con tu nueva cuenta'
          }).then(() => this.router.navigateByUrl('/login'))
        },
        error: () => {
          Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo crear la cuenta' })
        }
      })
    }
  }
}
