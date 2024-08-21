import { Component } from '@angular/core'
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { MatToolbarModule } from '@angular/material/toolbar'
import { NavbarComponent } from '../../components/navbar/navbar.component'
import { Responsable } from '../../services/interfaces/responsable'
import { ResponsableService } from '../../services/responsable/responsable.service'

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
    MatButtonModule
  ],
  templateUrl: './registrar-responsable.component.html',
  styleUrl: './registrar-responsable.component.scss'
})
export class RegistrarResponsableComponent {
  form: FormGroup

  constructor(
    private fb: FormBuilder,
    private service: ResponsableService
  ) {
    this.form = this.fb.group({
      firstname: ['', [Validators.required, Validators.minLength(2)]],
      lastname: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8,12}$')]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]]
    })
  }

  onSubmit(): void {
    if (this.form.valid) {
      this.service.create(<Responsable>this.form.value)
    } else {
      console.log('Form is invalid')
    }
  }
}
